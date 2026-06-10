// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";
import {ISignatureTransfer} from "permit2/src/interfaces/ISignatureTransfer.sol";
import {IEIP712} from "permit2/src/interfaces/IEIP712.sol";
import {DeployPermit2} from "permit2/test/utils/DeployPermit2.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {UnistrataHook} from "src/UnistrataHook.sol";
import {StratumToken} from "src/StratumToken.sol";

/// @notice Phase-4 hardening: deposit via a Permit2 signature (no standing ERC-20 allowance to the hook).
contract UnistrataPermitDepositTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    address internal constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    bytes32 internal constant TOKEN_PERMISSIONS_TYPEHASH = keccak256("TokenPermissions(address token,uint256 amount)");
    bytes32 internal constant PERMIT_BATCH_TYPEHASH = keccak256(
        "PermitBatchTransferFrom(TokenPermissions[] permitted,address spender,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)"
    );

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
        (currency0, currency1) = deployCurrencyPair();
        // Permit2 pins solc =0.8.17 (can't recompile here) → etch the precompiled runtime bytecode
        // at the canonical address. It is built for chainid 0x7a69 (31337), so DOMAIN_SEPARATOR()
        // matches what both this test's signer and the hook will use.
        new DeployPermit2().deployPermit2();

        deployCodeTo("UnistrataHook.sol:UnistrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = UnistrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        (user, userPk) = makeAddrAndKey("permitUser");
        MockERC20(Currency.unwrap(currency0)).mint(user, 1_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(user, 1_000_000e18);
        // The ONLY standing approval is to the audited Permit2 — not the hook.
        vm.startPrank(user);
        MockERC20(Currency.unwrap(currency0)).approve(PERMIT2, type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(PERMIT2, type(uint256).max);
        vm.stopPrank();
    }

    function _permit(uint256 a0, uint256 a1, uint256 nonce)
        internal
        view
        returns (ISignatureTransfer.PermitBatchTransferFrom memory p)
    {
        p.permitted = new ISignatureTransfer.TokenPermissions[](2);
        p.permitted[0] = ISignatureTransfer.TokenPermissions({token: Currency.unwrap(currency0), amount: a0});
        p.permitted[1] = ISignatureTransfer.TokenPermissions({token: Currency.unwrap(currency1), amount: a1});
        p.nonce = nonce;
        p.deadline = block.timestamp + 1 hours;
    }

    /// @dev Sign the batch permit with `spender` (= the hook, which calls permitTransferFrom).
    function _sign(ISignatureTransfer.PermitBatchTransferFrom memory p, address spender)
        internal
        view
        returns (bytes memory)
    {
        bytes32[] memory tp = new bytes32[](p.permitted.length);
        for (uint256 i; i < p.permitted.length; ++i) {
            tp[i] = keccak256(abi.encode(TOKEN_PERMISSIONS_TYPEHASH, p.permitted[i]));
        }
        bytes32 structHash =
            keccak256(abi.encode(PERMIT_BATCH_TYPEHASH, keccak256(abi.encodePacked(tp)), spender, p.nonce, p.deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", IEIP712(PERMIT2).DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPk, digest);
        return bytes.concat(r, s, bytes1(v));
    }

    function test_depositWithPermit_mintsShares_refundsRemainder_noHookAllowance() public {
        uint256 a0 = 5000e18;
        uint256 a1 = 5000e18;
        ISignatureTransfer.PermitBatchTransferFrom memory p = _permit(a0, a1, 0);
        bytes memory sig = _sign(p, address(hook));

        uint256 bal0Before = MockERC20(Currency.unwrap(currency0)).balanceOf(user);
        uint256 bal1Before = MockERC20(Currency.unwrap(currency1)).balanceOf(user);

        vm.prank(user);
        uint256 shares = hook.depositWithPermit(false, p, sig); // sediment (junior)

        StratumToken sed = hook.sediment();
        assertGt(shares, 0, "shares minted");
        assertEq(sed.balanceOf(user), shares, "shares minted to the caller");
        assertGt(hook.sedimentNav(), 0, "tranche NAV advanced");

        // No unbounded allowance was ever granted to the hook.
        assertEq(MockERC20(Currency.unwrap(currency0)).allowance(user, address(hook)), 0, "no hook allowance t0");
        assertEq(MockERC20(Currency.unwrap(currency1)).allowance(user, address(hook)), 0, "no hook allowance t1");

        // The hook keeps nothing: it pulled the maxes, settled what was used, and refunded the rest.
        assertEq(MockERC20(Currency.unwrap(currency0)).balanceOf(address(hook)), 0, "hook holds no t0");
        assertEq(MockERC20(Currency.unwrap(currency1)).balanceOf(address(hook)), 0, "hook holds no t1");

        // The caller spent only what was used (never more than the signed maxes).
        assertLe(bal0Before - MockERC20(Currency.unwrap(currency0)).balanceOf(user), a0, "spent <= max t0");
        assertLe(bal1Before - MockERC20(Currency.unwrap(currency1)).balanceOf(user), a1, "spent <= max t1");
    }

    function test_depositWithPermit_RevertWhen_signedForWrongSpender() public {
        // Signature names a spender other than the hook → Permit2 recovers a mismatched signer and reverts.
        // Proves the on-chain Permit2 verification is live (not a no-op etch).
        ISignatureTransfer.PermitBatchTransferFrom memory p = _permit(5000e18, 5000e18, 0);
        bytes memory sig = _sign(p, makeAddr("notTheHook"));

        vm.prank(user);
        vm.expectRevert(); // InvalidSigner (recovered signer != user)
        hook.depositWithPermit(false, p, sig);
    }

    function test_depositWithPermit_RevertWhen_wrongTokenOrder() public {
        // permitted tokens reversed → fails the token-binding check before Permit2 is touched.
        ISignatureTransfer.PermitBatchTransferFrom memory p;
        p.permitted = new ISignatureTransfer.TokenPermissions[](2);
        p.permitted[0] = ISignatureTransfer.TokenPermissions({token: Currency.unwrap(currency1), amount: 1e18});
        p.permitted[1] = ISignatureTransfer.TokenPermissions({token: Currency.unwrap(currency0), amount: 1e18});
        p.nonce = 1;
        p.deadline = block.timestamp + 1 hours;

        vm.prank(user);
        vm.expectRevert(UnistrataHook.UnistrataHook__BadPermit.selector);
        hook.depositWithPermit(true, p, "");
    }
}
