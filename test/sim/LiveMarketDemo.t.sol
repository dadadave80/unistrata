// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {SimSwapper} from "./SimSwapper.sol";
import {UnistrataHook} from "src/UnistrataHook.sol";

/// @notice Verifies the live demo script (script/unistrata/01_LiveMarket.s.sol): the same two-phase market
///         path (normal-volume chop → ~40% crash) must (a) drive realized variance past the 4,000,000 spike
///         trigger and (b) at emergency settlement, hold Bedrock's NAV (senior, protected) while Sediment
///         (junior, first-loss) absorbs the drawdown without being fully exhausted. If this stays green, the
///         on-chain demo behaves as narrated.
contract LiveMarketDemoTest is BaseTest {
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    UnistrataHook internal hook;
    SimSwapper internal swapper;

    address internal alice = makeAddr("alice");
    address internal constant CALLBACK_PROXY = address(0xCA11);
    address internal rvmId;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x555C << 144)
    );

    // mirror the 01_LiveMarket.s.sol calibration exactly
    uint256 internal constant VOL_SWAPS = 12;
    int24 internal constant VOL_BAND = 180;
    uint256 internal constant CRASH_STEPS = 5;
    int24 internal constant CRASH_STEP = 1150;

    function _cfg() internal pure returns (UnistrataHook.Config memory) {
        return UnistrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272,
            lambdaRisk: 1.25e18,
            rMin: 0,
            rMax: 0.5e18,
            lambdaSmoothing: 0.3e18,
            thetaMax: 0.75e18
        });
    }

    function setUp() public {
        deployArtifactsAndLabel();
        (currency0, currency1) = deployCurrencyPair();
        deployCodeTo("UnistrataHook.sol:UnistrataHook", abi.encode(poolManager, _cfg(), CALLBACK_PROXY), HOOK_FLAGS);
        hook = UnistrataHook(payable(HOOK_FLAGS));
        rvmId = tx.origin;

        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // Deposit into both tranches — Sediment (junior) first so the attachment cap holds.
        MockERC20(Currency.unwrap(currency0)).mint(alice, 1_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 1_000_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 100_000e18, 100_000e18); // Sediment
        hook.deposit(true, 100_000e18, 100_000e18); // Bedrock
        vm.stopPrank();

        // Funded SimSwapper to drive the price path (mirrors the script's permissionless mint + swapper).
        swapper = new SimSwapper(poolManager);
        MockERC20(Currency.unwrap(currency0)).mint(address(swapper), 100_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(address(swapper), 100_000_000e18);
    }

    /// @dev Replays the 01_LiveMarket path: VOL_SWAPS of ±VOL_BAND chop, then CRASH_STEPS down by CRASH_STEP. Each swap
    ///      lands in its own block (vm.roll) — the hook counts one variance observation per new block.
    function _runMarketPath() internal {
        (, int24 initTick,,) = poolManager.getSlot0(poolKey.toId());

        for (uint256 i = 0; i < VOL_SWAPS; ++i) {
            int24 off = (i % 2 == 0) ? VOL_BAND : -VOL_BAND;
            vm.roll(block.number + 1);
            swapper.swapToPrice(poolKey, TickMath.getSqrtPriceAtTick(initTick + off));
        }

        int24 tick = initTick;
        for (uint256 i = 0; i < CRASH_STEPS; ++i) {
            tick -= CRASH_STEP; // crash = tick down ⇒ the numéraire-valued position loses (IL)
            vm.roll(block.number + 1);
            swapper.swapToPrice(poolKey, TickMath.getSqrtPriceAtTick(tick));
        }
    }

    function test_liveMarket_spikesVariance_protectsBedrock_sedimentAbsorbs() public {
        uint256 bedrock0 = hook.bedrockNav();
        uint256 sediment0 = hook.sedimentNav();
        assertGt(bedrock0, 0, "bedrock funded");
        assertGt(sediment0, 0, "sediment funded");

        _runMarketPath();

        // (a) realized variance crossed the RSC's 4,000,000 spike trigger
        assertGe(hook.varAcc(), 4_000_000, "varAcc crosses the 4M spike trigger");

        // (b) the Reactive circuit breaker fires emergencySettle (proxy-only, no time gate)
        vm.prank(CALLBACK_PROXY);
        hook.emergencySettle(rvmId);

        uint256 bedrock1 = hook.bedrockNav();
        uint256 sediment1 = hook.sedimentNav();

        // Bedrock held (protected); Sediment absorbed the crash but survived (so Bedrock was untouched).
        assertGe(bedrock1, bedrock0, "Bedrock NAV protected through the crash");
        assertLt(sediment1, sediment0, "Sediment absorbed the drawdown");
        assertGt(sediment1, 0, "Sediment not fully exhausted");
        assertEq(hook.epochId(), 1, "epoch rolled on emergency settle");

        // magnitude (for demo drama) — logged, not asserted
        emit log_named_uint("varAcc", hook.varAcc());
        emit log_named_uint("bedrock before", bedrock0);
        emit log_named_uint("bedrock after ", bedrock1);
        emit log_named_uint("sediment before", sediment0);
        emit log_named_uint("sediment after ", sediment1);
        emit log_named_uint("sediment drawdown %", (sediment0 - sediment1) * 100 / sediment0);
    }
}
