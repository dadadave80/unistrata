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

/// @notice Verifies the good-market demo script (script/unistrata/02_GreatMarket.s.sol): a long gentle bull
///         TREND on volume must (a) keep realized variance BELOW the 4,000,000 breaker (no emergency
///         settle), (b) grow the pool's numéraire totalAssets (price appreciation + fees), and (c) after the
///         mark-to-market deposit, leave Bedrock protected and Sediment HIGHER than it started — the
///         encouraging mirror of the crash demo. If green, the on-chain script behaves as narrated.
contract GreatMarketDemoTest is BaseTest {
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    UnistrataHook internal hook;
    SimSwapper internal swapper;

    address internal alice = makeAddr("alice");
    address internal constant CALLBACK_PROXY = address(0xCA11);

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x555D << 144)
    );

    // mirror the 02_GreatMarket.s.sol calibration exactly
    uint256 internal constant VOL_SWAPS = 8;
    int24 internal constant VOL_BAND = 120;
    uint256 internal constant TREND_STEPS = 20;
    int24 internal constant TREND_STEP = 250;

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

        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // Seed both tranches — Sediment (junior) first so the attachment cap holds.
        MockERC20(Currency.unwrap(currency0)).mint(alice, 5_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 5_000_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 100_000e18, 100_000e18); // Sediment
        hook.deposit(true, 100_000e18, 100_000e18); // Bedrock
        vm.stopPrank();

        swapper = new SimSwapper(poolManager);
        MockERC20(Currency.unwrap(currency0)).mint(address(swapper), 100_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(address(swapper), 100_000_000e18);
    }

    /// @dev Replays the 02_GreatMarket path: VOL_SWAPS of ±VOL_BAND chop, then TREND_STEPS UP by TREND_STEP.
    ///      Tick UP ⇒ the numéraire-valued position gains (the mirror of the crash's tick-down loss). One
    ///      observation per block (vm.roll).
    function _runTrendPath() internal {
        (, int24 initTick,,) = poolManager.getSlot0(poolKey.toId());

        for (uint256 i = 0; i < VOL_SWAPS; ++i) {
            int24 off = (i % 2 == 0) ? VOL_BAND : -VOL_BAND;
            vm.roll(block.number + 1);
            swapper.swapToPrice(poolKey, TickMath.getSqrtPriceAtTick(initTick + off));
        }

        int24 tick = initTick;
        for (uint256 i = 0; i < TREND_STEPS; ++i) {
            tick += TREND_STEP; // trend = tick up ⇒ numéraire position appreciates
            vm.roll(block.number + 1);
            swapper.swapToPrice(poolKey, TickMath.getSqrtPriceAtTick(tick));
        }
    }

    function test_greatMarket_lowVariance_growsPool_sedimentBanksGains() public {
        uint256 bedrock0 = hook.bedrockNav();
        uint256 sediment0 = hook.sedimentNav();
        uint256 assets0 = hook.totalAssets();
        assertGt(sediment0, 0, "sediment funded");

        _runTrendPath();

        // (a) realized variance stayed BELOW the 4,000,000 breaker — no emergency settle, a calm bull run.
        assertLt(hook.varAcc(), 4_000_000, "varAcc stays under the 4M breaker");

        // (b) the rally + fees grew the pool's numéraire value.
        uint256 assets1 = hook.totalAssets();
        assertGt(assets1, assets0, "totalAssets grew through the trend");

        // (c) mark to market: a small Sediment deposit re-syncs the stored NAVs to the live waterfall — the
        //     same sync the script's Phase 3 does. The surplus belongs to Sediment.
        vm.prank(alice);
        hook.deposit(false, 1_000e18, 1_000e18);

        uint256 bedrock1 = hook.bedrockNav();
        uint256 sediment1 = hook.sedimentNav();

        assertGe(bedrock1, bedrock0, "Bedrock principal protected");
        assertGt(sediment1, sediment0, "Sediment banked the trend's appreciation + fees");
        assertLt(hook.varAcc(), 4_000_000, "still no breaker after the path");

        emit log_named_uint("varAcc (under 4M)", hook.varAcc());
        emit log_named_uint("totalAssets before", assets0);
        emit log_named_uint("totalAssets after ", assets1);
        emit log_named_uint("sediment before", sediment0);
        emit log_named_uint("sediment after ", sediment1);
        emit log_named_uint("bedrock before", bedrock0);
        emit log_named_uint("bedrock after ", bedrock1);
    }
}
