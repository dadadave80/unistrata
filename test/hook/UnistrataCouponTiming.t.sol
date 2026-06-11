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

/// @notice PoC for review finding H-3: the bedrock coupon must accrue on TIME-WEIGHTED principal, not on
///         the full end-of-epoch base for the full epoch. Principal deposited late in an epoch must earn
///         only the coupon for the time it was actually underwriting — otherwise late bedrock depositors
///         skim a full-epoch coupon from sediment. rMin == rMax pins the rate so the math is deterministic.
contract UnistrataCouponTimingTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    UnistrataHook internal hook;

    address internal alice = makeAddr("alice");

    uint256 internal constant RATE = 0.5e18; // pinned coupon rate (rMin == rMax)

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x4443 << 144)
    );

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
            rMin: RATE,
            rMax: RATE, // pin the coupon rate at RATE regardless of variance/fees
            lambdaSmoothing: 0.3e18,
            thetaMax: 0.75e18
        });
    }

    function setUp() public {
        deployArtifactsAndLabel();
        (currency0, currency1) = deployCurrencyPair();
        deployCodeTo("UnistrataHook.sol:UnistrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = UnistrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        MockERC20(Currency.unwrap(currency0)).mint(alice, 1_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 1_000_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 1000e18, 1000e18); // sediment coverage, at epoch start
        vm.stopPrank();
    }

    /// A bedrock deposit made ~a full epoch after the epoch started must earn only a small fraction of the
    /// full-epoch coupon (the time it was actually present), not the whole-epoch coupon on its principal.
    function test_lateBedrockDepositDoesNotEarnFullEpochCoupon() public {
        uint256 start = hook.epochStart();

        // No bedrock for almost the whole epoch, then a late bedrock deposit (the only bedrock).
        vm.warp(start + 1 days);
        vm.prank(alice);
        hook.deposit(true, 100e18, 100e18);
        uint256 principal = hook.bedrockNav(); // first bedrock ⇒ claim == deposit value, no prior accrual
        assertGt(principal, 0);

        // Settle once the epoch + grace has elapsed (permissionless path).
        vm.warp(start + 1 days + 1 hours + 1);
        uint256 dtEpoch = block.timestamp - hook.epochStart();
        hook.settleEpoch();

        uint256 grew = hook.bedrockNav() > principal ? hook.bedrockNav() - principal : 0;
        // The full-base, full-epoch coupon the buggy accrual credits (principal present the whole epoch):
        uint256 fullEpochCoupon = principal * RATE / 1e18 * dtEpoch / 365 days;
        assertGt(fullEpochCoupon, 0);

        // Bedrock was present for only the ~1h grace window of a ~25h epoch, so its coupon must be a small
        // fraction of the full-epoch coupon. On the buggy contract grew == fullEpochCoupon (fails).
        assertLt(grew, fullEpochCoupon / 2, "late bedrock earned a full-epoch coupon it did not underwrite");
    }
}
