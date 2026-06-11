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
}
