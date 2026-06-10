// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {StrataHook} from "src/StrataHook.sol";

/// @notice Phase-3 settlement: the senior/junior waterfall, epoch roll, coupon reprice, conservation
/// (invariant 1), coupon honesty (invariant 3), and the settlement price guard.
contract StrataSettleTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;

    address internal alice = makeAddr("alice");
    uint256 internal constant GUARD_BAND = 5000;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5553 << 144)
    );

    function _cfg() internal pure returns (StrataHook.Config memory) {
        return StrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: GUARD_BAND,
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
        deployCodeTo("StrataHook.sol:StrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = StrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        MockERC20(Currency.unwrap(currency0)).mint(alice, 100_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 100_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 500e18, 500e18); // junior coverage first
        hook.deposit(true, 300e18, 300e18); // senior within cap (~0.375)
        vm.stopPrank();
    }

    function _swap(uint256 amountIn, bool zeroForOne) internal {
        swapRouter.swapExactTokensForTokens(amountIn, 0, zeroForOne, poolKey, "", address(this), block.timestamp);
    }

    function _elapseEpoch() internal {
        vm.warp(block.timestamp + 1 days + 1 hours + 1); // past epoch + grace for the permissionless path
    }

    function test_settleEpoch_RevertWhen_notElapsed() public {
        vm.expectRevert(StrataHook.StrataHook__EpochNotElapsed.selector);
        hook.settleEpoch();
    }

    // calm epoch (no swaps): conservation holds and the epoch rolls
    function test_settleEpoch_calm_conservationAndRoll() public {
        uint256 e0 = hook.epochId();
        _elapseEpoch();
        hook.settleEpoch();
        assertApproxEqAbs(hook.seniorNav() + hook.juniorNav(), hook.totalAssets(), 3);
        assertEq(hook.epochId(), e0 + 1);
        assertEq(hook.epochStart(), block.timestamp);
    }

    // coupon honesty (inv. 3) + seniority: with the first-epoch rate = 0, senior never grows
    function test_settleEpoch_couponHonesty_seniorDoesNotGrow() public {
        uint256 sBefore = hook.seniorNav();
        // some cross-block volatility (each swap a new block → lastObservedTick tracks)
        vm.roll(block.number + 1);
        _swap(30e18, true);
        vm.roll(block.number + 1);
        _swap(20e18, false);
        _elapseEpoch();
        hook.settleEpoch();
        // rate was 0 ⇒ senior target = sPrev ⇒ sNew = min(A, sPrev) ≤ sPrev
        assertLe(hook.seniorNav(), sBefore);
    }

    // volatile epoch: junior absorbs the IL while senior is protected; conservation holds
    function test_settleEpoch_juniorAbsorbsIL_seniorProtected() public {
        uint256 sBefore = hook.seniorNav();
        uint256 jBefore = hook.juniorNav();
        // a moderate one-way move creates impermanent loss
        vm.roll(block.number + 1);
        _swap(60e18, true);
        vm.roll(block.number + 1);
        _swap(20e18, false);
        _elapseEpoch();
        hook.settleEpoch();

        assertApproxEqAbs(hook.seniorNav() + hook.juniorNav(), hook.totalAssets(), 3); // conservation
        assertLe(hook.seniorNav(), sBefore); // senior not over-credited (rate 0)
        assertGt(hook.juniorNav(), 0); // junior still has coverage
        // junior bore the variance: its NAV moved more than senior's (which is pinned to target)
        assertTrue(hook.juniorNav() != jBefore);
    }

    // the epoch reprices the coupon from the realized-variance EWMA
    function test_settleEpoch_repricesCoupon() public {
        vm.roll(block.number + 1);
        _swap(40e18, true);
        vm.roll(block.number + 1);
        _swap(40e18, false);
        _elapseEpoch();
        hook.settleEpoch();
        // sigma2Ewma now reflects realized variance; rate stays within [rMin, rMax]
        assertGt(hook.sigma2Ewma(), 0);
        assertLe(hook.seniorRate(), 0.5e18);
    }

    // settlement price guard: an intra-block move away from the last observation reverts
    function test_settleEpoch_RevertWhen_priceOutOfBand() public {
        vm.roll(block.number + 1);
        _swap(1e18, true); // observes lastObservedTick at this block
        _swap(400e18, true); // SAME block: big move, not re-observed → currentTick far from sampled
        _elapseEpoch();
        vm.expectRevert(StrataHook.StrataHook__SettlementPriceOutOfBand.selector);
        hook.settleEpoch();
    }
}
