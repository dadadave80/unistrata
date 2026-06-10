// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DemoERC20
/// @notice Mintable ERC-20 with configurable decimals, for the Strata testnet demo (tWETH/tUSDC).
///         `mint` is intentionally permissionless so the demo pool can be funded without a faucet.
///         Demo tooling only — not part of the protocol.
contract DemoERC20 is ERC20 {
    uint8 private immutable _decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
