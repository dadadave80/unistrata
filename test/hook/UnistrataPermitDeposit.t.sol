// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {UnistrataHook} from "src/UnistrataHook.sol";
import {StratumToken} from "src/StratumToken.sol";
import {DemoERC20} from "../../script/unistrata/DemoERC20.sol";

/// @notice Phase-4 hardening, EIP-2612 edition: deposit via two ERC20Permit signatures (one per
///         underlying leg) — no standing ERC-20 allowance to the hook and no Permit2 dependency.
contract UnistrataPermitDepositTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    DemoERC20 internal token0;
    DemoERC20 internal token1;
    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    UnistrataHook internal hook;
    address internal user;
    uint256 internal userPk;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x555A << 144)
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

        // EIP-2612-capable underlying tokens (the demo tWETH/tUSDC), sorted so currency0 < currency1.
        DemoERC20 a = new DemoERC20("Demo Wrapped Ether", "tWETH", 18);
        DemoERC20 b = new DemoERC20("Demo USD Coin", "tUSDC", 18);
        (token0, token1) = address(a) < address(b) ? (a, b) : (b, a);
        currency0 = Currency.wrap(address(token0));
        currency1 = Currency.wrap(address(token1));

        deployCodeTo("UnistrataHook.sol:UnistrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = UnistrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        (user, userPk) = makeAddrAndKey("permitUser");
        token0.mint(user, 1_000_000e18);
        token1.mint(user, 1_000_000e18);
        // NOTE: no approvals — EIP-2612 grants the hook's allowance via signature at deposit time.
    }

    /// @dev Sign an EIP-2612 permit for `token` granting `spender` (the hook) `value`, using the owner's
    ///      current on-chain nonce.
    function _sign(DemoERC20 token, address spender, uint256 value, uint256 deadline)
        internal
        view
        returns (UnistrataHook.PermitSig memory sig)
    {
        uint256 nonce = token.nonces(user);
        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, user, spender, value, nonce, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash));
        (sig.v, sig.r, sig.s) = vm.sign(userPk, digest);
    }

    function test_depositWithPermit_mintsShares_noStandingAllowance() public {
        uint256 a0 = 5000e18;
        uint256 a1 = 5000e18;
        uint256 deadline = block.timestamp + 1 hours;

        // Precondition: the hook has NO allowance on either leg before the call.
        assertEq(token0.allowance(user, address(hook)), 0, "no pre-allowance t0");
        assertEq(token1.allowance(user, address(hook)), 0, "no pre-allowance t1");

        UnistrataHook.PermitSig memory sig0 = _sign(token0, address(hook), a0, deadline);
        UnistrataHook.PermitSig memory sig1 = _sign(token1, address(hook), a1, deadline);

        uint256 bal0Before = token0.balanceOf(user);
        uint256 bal1Before = token1.balanceOf(user);

        vm.prank(user);
        uint256 shares = hook.depositWithPermit(false, a0, a1, 0, deadline, sig0, sig1); // sediment (junior)

        StratumToken sed = hook.sediment();
        assertGt(shares, 0, "shares minted");
        assertEq(sed.balanceOf(user), shares, "shares minted to the caller");
        assertGt(hook.sedimentNav(), 0, "tranche NAV advanced");

        // The hook keeps nothing idle: it settled only the used amounts straight from the caller.
        assertEq(token0.balanceOf(address(hook)), 0, "hook holds no t0");
        assertEq(token1.balanceOf(address(hook)), 0, "hook holds no t1");

        // The caller spent only what was used (never more than the signed maxes).
        assertLe(bal0Before - token0.balanceOf(user), a0, "spent <= max t0");
        assertLe(bal1Before - token1.balanceOf(user), a1, "spent <= max t1");
    }

    /// @dev A genuinely bad signature (no front-run set the allowance) must surface a clear PermitFailed
    ///      error immediately, not an opaque downstream settle/transfer revert.
    function test_depositWithPermit_RevertWhen_badSignature() public {
        uint256 a0 = 5000e18;
        uint256 a1 = 5000e18;
        uint256 deadline = block.timestamp + 1 hours;

        // Sign token0's permit with the WRONG key → recovered signer != user → permit reverts, and no
        // allowance was ever set, so the hook must revert PermitFailed.
        (, uint256 wrongPk) = makeAddrAndKey("notTheUser");
        UnistrataHook.PermitSig memory bad0;
        {
            uint256 nonce = token0.nonces(user);
            bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, user, address(hook), a0, nonce, deadline));
            bytes32 digest = keccak256(abi.encodePacked("\x19\x01", token0.DOMAIN_SEPARATOR(), structHash));
            (bad0.v, bad0.r, bad0.s) = vm.sign(wrongPk, digest);
        }
        UnistrataHook.PermitSig memory sig1 = _sign(token1, address(hook), a1, deadline);

        vm.prank(user);
        vm.expectRevert(UnistrataHook.UnistrataHook__PermitFailed.selector);
        hook.depositWithPermit(false, a0, a1, 0, deadline, bad0, sig1);
    }

    function test_depositWithPermit_RevertWhen_belowMinSharesOut() public {
        uint256 a0 = 100e18;
        uint256 a1 = 100e18;
        uint256 deadline = block.timestamp + 1 hours;
        UnistrataHook.PermitSig memory sig0 = _sign(token0, address(hook), a0, deadline);
        UnistrataHook.PermitSig memory sig1 = _sign(token1, address(hook), a1, deadline);

        vm.prank(user);
        vm.expectRevert(UnistrataHook.UnistrataHook__InsufficientShares.selector);
        hook.depositWithPermit(false, a0, a1, type(uint256).max, deadline, sig0, sig1);
    }

    /// @dev Permit-griefing resistance: a watcher who front-runs the user by submitting the same signed
    ///      permit directly to the token (consuming the nonce) cannot DoS the deposit — the allowance they
    ///      set still stands, so the hook's try/permit-then-allowance path completes the deposit.
    function test_depositWithPermit_frontRunCannotDoS() public {
        uint256 a0 = 5000e18;
        uint256 a1 = 5000e18;
        uint256 deadline = block.timestamp + 1 hours;
        UnistrataHook.PermitSig memory sig0 = _sign(token0, address(hook), a0, deadline);
        UnistrataHook.PermitSig memory sig1 = _sign(token1, address(hook), a1, deadline);

        // A griefer submits the user's token0 permit first (sets the allowance, consumes the nonce).
        address griefer = makeAddr("griefer");
        vm.prank(griefer);
        IERC20Permit(address(token0)).permit(user, address(hook), a0, deadline, sig0.v, sig0.r, sig0.s);
        assertEq(token0.allowance(user, address(hook)), a0, "front-run set the allowance");

        // The deposit with the SAME signatures must still succeed (token0 permit would now revert, but the
        // allowance is already there; token1 permit runs normally).
        vm.prank(user);
        uint256 shares = hook.depositWithPermit(false, a0, a1, 0, deadline, sig0, sig1); // sediment
        assertGt(shares, 0, "deposit survived the front-run");
        assertEq(hook.sediment().balanceOf(user), shares, "sediment shares minted");
    }
}
