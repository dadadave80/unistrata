// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title DemoERC20
/// @notice Mintable ERC-20 with configurable decimals, for the Unistrata testnet demo (tWETH/tUSDC).
///         `mint` is intentionally permissionless so the demo pool can be funded without a faucet.
///         EIP-2612 (ERC20Permit) lets depositors approve the hook gaslessly, so a deposit needs only
///         two signatures (one per leg) and no standing allowance. Demo tooling only — not protocol.
contract DemoERC20 is ERC20, ERC20Permit {
    uint8 private immutable _decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) ERC20Permit(name_) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
