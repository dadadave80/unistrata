// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {UnistrataHook} from "src/UnistrataHook.sol";

/// @notice PoC for review finding H-1: emergencySettle has no time gate, so it can run with a tiny
///         elapsed dt. The variance/fee EWMAs annualize by dividing by that dt; an unbounded 1/dt blows
///         sigma2Ewma up to absurd values that pin the bedrock coupon to rMin for dozens of future
///         epochs. The fix floors the annualization window so a short emergency cannot corrupt the EWMAs.
contract UnistrataEmergencyTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    UnistrataHook internal hook;

    address internal alice = makeAddr("alice");
    address internal constant CALLBACK_PROXY = address(0xCA11);
    address internal rvmId;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x4442 << 144)
    );

    function _cfg() internal pure returns (UnistrataHook.Config memory) {
        return UnistrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272, // max — the price guard never trips in this PoC
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
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        MockERC20(Currency.unwrap(currency0)).mint(alice, 1_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 1_000_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 500e18, 500e18);
        hook.deposit(true, 300e18, 300e18);
        vm.stopPrank();

        MockERC20(Currency.unwrap(currency0)).mint(address(this), 100_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(address(this), 100_000_000e18);
        MockERC20(Currency.unwrap(currency0)).approve(address(swapRouter), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(swapRouter), type(uint256).max);
    }

    function _swap(uint256 amtIn, bool zeroForOne) internal {
        vm.roll(block.number + 1);
        swapRouter.swapExactTokensForTokens(amtIn, 0, zeroForOne, poolKey, "", address(this), block.timestamp + 1);
    }

    function test_emergencySettleShortDt_doesNotCorruptVarianceEwma() public {
        // realized variance via cross-block swaps (one observation per new block, capped at dCap²)
        for (uint256 i = 0; i < 6; i++) {
            _swap(700e18, i % 2 == 0);
        }
        assertGt(hook.varAcc(), 3_000_000, "variance accrued past the spike threshold");

        // the circuit breaker fires a short time into the epoch (the real spike case)
        vm.warp(hook.epochStart() + 5 minutes);
        vm.prank(CALLBACK_PROXY);
        hook.emergencySettle(rvmId);

        // sigma² annualized over a 5-minute window would be astronomically large without a floor; the EWMA
        // must stay within a sane bound so the coupon isn't pinned to rMin for dozens of epochs.
        assertLt(hook.sigma2Ewma(), 100e18, "sigma2Ewma exploded from tiny-dt annualization");
    }
}
