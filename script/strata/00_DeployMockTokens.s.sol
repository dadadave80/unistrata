// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {DemoERC20} from "./DemoERC20.sol";
import {Script, console2} from "forge-std/Script.sol";

/// @notice Deploys the demo pool tokens — tWETH (18 dec) + tUSDC (6 dec) — and mints a starting
///         balance to the recipient (DEMO_RECIPIENT, default: the broadcaster). Record the addresses
///         as TOKEN_WETH / TOKEN_USDC for 01_DeployStrata. Run:
///           forge script script/strata/00_DeployMockTokens.s.sol \
///             --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast
contract DeployMockTokensScript is Script {
    function run() public {
        address recipient = vm.envOr("DEMO_RECIPIENT", msg.sender);

        vm.startBroadcast();
        DemoERC20 tWETH = new DemoERC20("Demo Wrapped Ether", "tWETH", 18);
        DemoERC20 tUSDC = new DemoERC20("Demo USD Coin", "tUSDC", 6);
        tWETH.mint(recipient, 1_000e18); // 1,000 tWETH
        tUSDC.mint(recipient, 3_000_000e6); // 3,000,000 tUSDC
        vm.stopBroadcast();

        console2.log("TOKEN_WETH=%s", address(tWETH));
        console2.log("TOKEN_USDC=%s", address(tUSDC));
    }
}
