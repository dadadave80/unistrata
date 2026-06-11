// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {StratumToken} from "src/StratumToken.sol";

/// @notice Unit tests for the minimal tranche share token.
/// The test contract itself plays the role of the controlling hook.
contract StratumTokenTest is Test {
    StratumToken internal token;
    address internal hook = address(this);
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    function setUp() public {
        token = new StratumToken("Unistrata Bedrock", "BEDR", hook);
    }

    function test_constructor_setsMetadataAndHook() public view {
        assertEq(token.name(), "Unistrata Bedrock");
        assertEq(token.symbol(), "BEDR");
        assertEq(token.decimals(), 18);
        assertEq(token.hook(), hook);
        assertEq(token.totalSupply(), 0);
    }

    function test_mint_byHook_increasesBalanceAndSupply() public {
        token.mint(alice, 1_000e18);
        assertEq(token.balanceOf(alice), 1_000e18);
        assertEq(token.totalSupply(), 1_000e18);
    }

    function test_RevertWhen_MintCalledByNonHook() public {
        vm.prank(alice);
        vm.expectRevert(StratumToken.StratumToken__OnlyHook.selector);
        token.mint(alice, 1e18);
    }

    function test_burn_byHook_decreasesBalanceAndSupply() public {
        token.mint(alice, 1_000e18);
        token.burn(alice, 400e18);
        assertEq(token.balanceOf(alice), 600e18);
        assertEq(token.totalSupply(), 600e18);
    }

    function test_RevertWhen_BurnCalledByNonHook() public {
        token.mint(alice, 1e18);
        vm.prank(bob);
        vm.expectRevert(StratumToken.StratumToken__OnlyHook.selector);
        token.burn(alice, 1e18);
    }

    function testFuzz_mint_setsExactBalance(uint256 amount) public {
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.totalSupply(), amount);
    }

    // --- EIP-2612 (gasless approval) ---

    /// @dev A valid EIP-2612 signature sets the allowance and consumes exactly one nonce, so the share
    /// token can be approved gaslessly for the hook's withdraw escrow (requestWithdrawWithPermit).
    function test_permit_setsAllowanceAndConsumesNonce() public {
        (address owner, uint256 ownerPk) = makeAddrAndKey("permitOwner");
        address spender = makeAddr("hookSpender");
        uint256 value = 1_000e18;
        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = token.nonces(owner);

        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonce, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPk, digest);

        token.permit(owner, spender, value, deadline, v, r, s);

        assertEq(token.allowance(owner, spender), value, "allowance granted via signature");
        assertEq(token.nonces(owner), nonce + 1, "nonce consumed");
    }

    /// @dev The EIP-712 domain name must equal the token name passed to ERC20Permit(name_) — otherwise
    /// off-chain signers (frontend) cannot reconstruct a digest the contract will accept.
    function test_permit_domainNameMatchesTokenName() public view {
        // DOMAIN_SEPARATOR = keccak256(abi.encode(TYPE_HASH, keccak256(name), keccak256("1"), chainid, token))
        bytes32 expected = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(token.name())),
                keccak256(bytes("1")),
                block.chainid,
                address(token)
            )
        );
        assertEq(token.DOMAIN_SEPARATOR(), expected, "domain pinned to token name/version 1/chainid/token");
    }
}
