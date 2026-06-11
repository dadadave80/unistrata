// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Test} from "forge-std/Test.sol";
import {ReentrancyGuardTransient} from "src/utils/ReentrancyGuardTransient.sol";

/// @dev Mock exercising the guard: `outer` re-enters `inner` (both guarded) → must revert.
contract ReentrantMock is ReentrancyGuardTransient {
    uint256 public calls;

    function single() external nonReentrant {
        calls++;
    }

    function inner() external nonReentrant {
        calls++;
    }

    function outer() external nonReentrant {
        this.inner(); // re-entry into a guarded function in the same call → blocked
    }
}

contract ReentrancyGuardTransientTest is Test {
    ReentrantMock internal mock;

    function setUp() public {
        mock = new ReentrantMock();
    }

    function test_singleCall_succeeds() public {
        mock.single();
        assertEq(mock.calls(), 1);
    }

    // the lock clears on exit, so independent calls in the same tx still work
    function test_sequentialCalls_succeed() public {
        mock.single();
        mock.single();
        assertEq(mock.calls(), 2);
    }

    function test_reentrantCall_reverts() public {
        vm.expectRevert(ReentrancyGuardTransient.ReentrancyGuardReentrantCall.selector);
        mock.outer();
        assertEq(mock.calls(), 0); // nothing committed
    }
}
