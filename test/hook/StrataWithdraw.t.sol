// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {StrataHook} from "src/StrataHook.sol";

/// @notice Phase-1/3 withdrawal queue: epoch-locked requests, share-proportional claim, navPerShare
/// preservation, junior lockup.
contract StrataWithdrawTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;

    address internal alice = makeAddr("alice");

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5555 << 144)
    );

    function _cfg() internal pure returns (StrataHook.Config memory) {
        return StrataHook.Config({
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
        hook.deposit(false, 500e18, 500e18); // junior
        hook.deposit(true, 300e18, 300e18); // senior
        hook.senior().approve(address(hook), type(uint256).max);
        hook.junior().approve(address(hook), type(uint256).max);
        vm.stopPrank();
    }

    function _settle() internal {
        vm.warp(block.timestamp + 1 days + 1 hours + 1); // past epoch + grace for the permissionless path
        hook.settleEpoch();
    }

    // requesting a withdrawal escrows the tranche shares into the hook
    function test_requestWithdraw_escrowsShares() public {
        uint256 bal = hook.junior().balanceOf(alice);
        uint256 shares = bal / 2;
        vm.prank(alice);
        hook.requestWithdraw(false, shares);
        assertEq(hook.junior().balanceOf(alice), bal - shares);
        assertEq(hook.junior().balanceOf(address(hook)), shares);
    }

    // claim before the lockup elapses reverts
    function test_claim_RevertWhen_lockupNotElapsed() public {
        uint256 shares = hook.junior().balanceOf(alice) / 2;
        vm.startPrank(alice);
        uint256 id = hook.requestWithdraw(false, shares);
        vm.expectRevert(StrataHook.StrataHook__WithdrawNotEligible.selector);
        hook.claim(id);
        vm.stopPrank();
    }

    // senior request is claimable after one settlement; tokens returned, shares burned, NAV reduced
    function test_claim_seniorAfterOneEpoch() public {
        uint256 shares = hook.senior().balanceOf(alice) / 2;
        uint256 navBefore = hook.seniorNav();
        uint256 supplyBefore = hook.senior().totalSupply();
        uint256 t0Before = MockERC20(Currency.unwrap(currency0)).balanceOf(alice);
        uint256 t1Before = MockERC20(Currency.unwrap(currency1)).balanceOf(alice);

        vm.prank(alice);
        uint256 id = hook.requestWithdraw(true, shares);
        _settle(); // epochId 0 → 1, senior eligible at 1
        vm.prank(alice);
        hook.claim(id);

        assertEq(hook.senior().totalSupply(), supplyBefore - shares); // burned
        assertLt(hook.seniorNav(), navBefore); // NAV reduced by the withdrawn slice
        // alice got tokens back (both legs of the full-range slice)
        assertGt(MockERC20(Currency.unwrap(currency0)).balanceOf(alice), t0Before);
        assertGt(MockERC20(Currency.unwrap(currency1)).balanceOf(alice), t1Before);
    }

    // junior requires TWO settlements (one extra epoch of lockup)
    function test_claim_juniorRequiresTwoEpochs() public {
        uint256 shares = hook.junior().balanceOf(alice) / 2;
        vm.prank(alice);
        uint256 id = hook.requestWithdraw(false, shares);

        _settle(); // epoch 1 — not yet eligible (junior eligible at 2)
        vm.prank(alice);
        vm.expectRevert(StrataHook.StrataHook__WithdrawNotEligible.selector);
        hook.claim(id);

        _settle(); // epoch 2 — now eligible
        vm.prank(alice);
        hook.claim(id);
        assertEq(hook.junior().balanceOf(address(hook)), 0); // escrow released
    }

    // a claim leaves the tranche's NAV/share unchanged for remaining holders (conservation + seniority)
    function test_claim_preservesNavPerShare() public {
        uint256 shares = hook.junior().balanceOf(alice) / 3;
        uint256 npsBefore = hook.juniorNav() * 1e18 / hook.junior().totalSupply();

        vm.prank(alice);
        uint256 id = hook.requestWithdraw(false, shares);
        _settle();
        _settle();
        vm.prank(alice);
        hook.claim(id);

        uint256 npsAfter = hook.juniorNav() * 1e18 / hook.junior().totalSupply();
        assertApproxEqRel(npsAfter, npsBefore, 0.001e18); // within 0.1%
        assertApproxEqAbs(hook.seniorNav() + hook.juniorNav(), hook.totalAssets(), 1e7);
    }

    function test_claim_RevertWhen_alreadyClaimed() public {
        uint256 shares = hook.senior().balanceOf(alice) / 2;
        vm.prank(alice);
        uint256 id = hook.requestWithdraw(true, shares);
        _settle();
        vm.startPrank(alice);
        hook.claim(id);
        vm.expectRevert(StrataHook.StrataHook__WithdrawAlreadyClaimed.selector);
        hook.claim(id);
        vm.stopPrank();
    }
}
