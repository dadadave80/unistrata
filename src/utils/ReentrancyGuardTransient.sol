// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

/// @title ReentrancyGuardTransient
/// @notice Reentrancy guard backed by transient storage (TSTORE/TLOAD): the lock clears automatically
///         at the end of the transaction, so it is cheaper than the persistent SSTORE-based guard.
///         Follows the OpenZeppelin `ReentrancyGuardTransient` pattern.
/// @dev Requires a Cancun-or-later EVM. Pinned to Solidity 0.8.34 so the SOL-2026-1 transient-storage
///      codegen bug (which affects 0.8.28–0.8.33 under `--via-ir`) cannot apply.
abstract contract ReentrancyGuardTransient {
    error ReentrancyGuardReentrantCall();

    /// @dev Unique transient-storage slot holding the guard flag.
    bytes32 private constant _GUARD_SLOT = keccak256("strata.reentrancy.guard.transient");

    modifier nonReentrant() {
        bytes32 slot = _GUARD_SLOT;
        uint256 entered;
        assembly ("memory-safe") {
            entered := tload(slot)
        }
        if (entered != 0) revert ReentrancyGuardReentrantCall();
        assembly ("memory-safe") {
            tstore(slot, 1)
        }
        _;
        assembly ("memory-safe") {
            tstore(slot, 0)
        }
    }
}
