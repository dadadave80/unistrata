// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title StratumToken
/// @author David Dada (https://github.com/dadadave80)
/// @notice Minimal ERC-20 share token for a Unistrata tranche (BEDR / SEDI). Minting and burning
///         are restricted to the controlling hook, which is the sole authority over supply: shares
///         are minted on deposit at NAV and burned on settled withdrawal.
/// @dev 18 decimals (OZ default). One instance is deployed per tranche by the hook. EIP-2612
///      (ERC20Permit) lets holders approve the hook's withdraw escrow with a signature — the hook's
///      `requestWithdrawWithPermit` does the approval and the queue in one transaction.
/// @custom:security-contact daveproxy80@gmail.com
/// @custom:security-contact Discord: daveproxy80
contract StratumToken is ERC20, ERC20Permit {
    /// @notice Thrown when a non-hook address calls a supply-changing function.
    error StratumToken__OnlyHook();

    /// @notice The hook permitted to mint and burn shares. Set once at construction.
    address public immutable hook;

    modifier onlyHook() {
        if (msg.sender != hook) revert StratumToken__OnlyHook();
        _;
    }

    constructor(string memory name_, string memory symbol_, address hook_) ERC20(name_, symbol_) ERC20Permit(name_) {
        hook = hook_;
    }

    /// @notice Mint `amount` shares to `to`. Hook-only.
    function mint(address to, uint256 amount) external onlyHook {
        _mint(to, amount);
    }

    /// @notice Burn `amount` shares from `from`. Hook-only.
    function burn(address from, uint256 amount) external onlyHook {
        _burn(from, amount);
    }
}
