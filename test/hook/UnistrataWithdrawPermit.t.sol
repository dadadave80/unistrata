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
import {StratumToken} from "src/StratumToken.sol";

/// @notice Withdraw via an EIP-2612 signature on the tranche share token — queue an epoch-locked
///         withdrawal in ONE tx, no standing share-token approval to the hook.
contract UnistrataWithdrawPermitTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    UnistrataHook internal hook;

    address internal alice;
    uint256 internal alicePk;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x555B << 144)
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
            rMin: 0,
            rMax: 0.5e18,
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
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        (alice, alicePk) = makeAddrAndKey("alice");
        MockERC20(Currency.unwrap(currency0)).mint(alice, 100_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 100_000e18);
        vm.startPrank(alice);
        // Approve only the UNDERLYING tokens (to seed shares via a plain deposit). Crucially, alice never
        // approves the hook for the SHARE tokens — the EIP-2612 permit is what authorizes the escrow.
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 500e18, 500e18); // sediment
        hook.deposit(true, 300e18, 300e18); // bedrock
        vm.stopPrank();
    }

    function _signShare(StratumToken token, uint256 value, uint256 deadline)
        internal
        view
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        uint256 nonce = token.nonces(alice);
        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, alice, address(hook), value, nonce, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash));
        (v, r, s) = vm.sign(alicePk, digest);
    }

    function test_requestWithdrawWithPermit_escrowsWithoutPriorApproval() public {
        StratumToken sed = hook.sediment();
        uint256 bal = sed.balanceOf(alice);
        uint256 shares = bal / 2;
        uint256 deadline = block.timestamp + 1 hours;

        // No standing share-token approval to the hook.
        assertEq(sed.allowance(alice, address(hook)), 0, "no pre-approval");

        (uint8 v, bytes32 r, bytes32 s) = _signShare(sed, shares, deadline);

        vm.prank(alice);
        uint256 id = hook.requestWithdrawWithPermit(false, shares, deadline, v, r, s);

        assertEq(sed.balanceOf(address(hook)), shares, "shares escrowed via permit");
        assertEq(sed.balanceOf(alice), bal - shares, "alice debited");
        (uint128 reqShares,, bool isBedrock, bool claimed) = hook.withdrawRequests(alice, id);
        assertEq(reqShares, uint128(shares), "request recorded");
        assertEq(isBedrock, false);
        assertEq(claimed, false);
    }

    /// @dev A withdrawal request larger than uint128 reverts even via the permit path (review #21).
    function test_requestWithdrawWithPermit_RevertWhen_sharesOverflowUint128() public {
        uint256 shares = uint256(type(uint128).max) + 1;
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = _signShare(hook.sediment(), shares, deadline);
        vm.prank(alice);
        vm.expectRevert(UnistrataHook.UnistrataHook__SharesOverflow.selector);
        hook.requestWithdrawWithPermit(false, shares, deadline, v, r, s);
    }

    /// @dev A genuinely bad signature surfaces a clear PermitFailed error, not an opaque escrow revert.
    function test_requestWithdrawWithPermit_RevertWhen_badSignature() public {
        StratumToken sed = hook.sediment();
        uint256 shares = sed.balanceOf(alice) / 2;
        uint256 deadline = block.timestamp + 1 hours;

        (, uint256 wrongPk) = makeAddrAndKey("notAlice");
        uint256 nonce = sed.nonces(alice);
        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, alice, address(hook), shares, nonce, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", sed.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPk, digest);

        vm.prank(alice);
        vm.expectRevert(UnistrataHook.UnistrataHook__PermitFailed.selector);
        hook.requestWithdrawWithPermit(false, shares, deadline, v, r, s);
    }

    /// @dev Permit-griefing resistance: a watcher who front-runs alice by submitting her share-token
    ///      permit first cannot DoS the request — the allowance is already set, escrow proceeds.
    function test_requestWithdrawWithPermit_frontRunCannotDoS() public {
        StratumToken sed = hook.sediment();
        uint256 shares = sed.balanceOf(alice) / 2;
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = _signShare(sed, shares, deadline);

        // Griefer front-runs by submitting alice's share-token permit directly.
        vm.prank(makeAddr("griefer"));
        sed.permit(alice, address(hook), shares, deadline, v, r, s);
        assertEq(sed.allowance(alice, address(hook)), shares, "front-run set the allowance");

        // The permit-request with the SAME signature still succeeds.
        vm.prank(alice);
        uint256 id = hook.requestWithdrawWithPermit(false, shares, deadline, v, r, s);
        assertEq(sed.balanceOf(address(hook)), shares, "escrow survived the front-run");
        (uint128 reqShares,,,) = hook.withdrawRequests(alice, id);
        assertEq(reqShares, uint128(shares));
    }
}
