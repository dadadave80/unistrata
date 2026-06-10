// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {UnistrataHook} from "../../src/UnistrataHook.sol";
import {BaseScript} from "../base/BaseScript.sol";

/// @notice Demo step A — deposit into BOTH tranches of the live UnistrataHook so the pool has liquidity
///         and the depositor holds Bedrock + Sediment shares (the setup for the spike demo, 05_SpikeSwaps).
///         Sediment (junior) is deposited first so the Bedrock attachment cap (S/(S+J) ≤ thetaMax) holds.
///         `deposit(isBedrock, amount0Max, amount1Max)` takes maxes in v4 token0/token1 order (token0 =
///         lower address); the hook pulls the balanced full-range amount via the depositor's approval.
///           forge script script/unistrata/04_DepositDemo.s.sol \
///             --rpc-url unichain_sep --account $ACCOUNT --sender $SENDER --broadcast
contract DepositDemoScript is BaseScript {
    function run() public {
        address hookAddr = vm.envAddress("UNISTRATA_HOOK");
        address weth = vm.envAddress("TOKEN_WETH");
        address usdc = vm.envAddress("TOKEN_USDC");
        UnistrataHook hook = UnistrataHook(payable(hookAddr));

        // Generous maxes (≈ balanced at 1 tWETH = 3000 tUSDC); the hook pulls what full-range liquidity needs.
        uint256 wethMax = 2e18; // tWETH (18 dec)
        uint256 usdcMax = 6000e6; // tUSDC (6 dec)
        // v4 sorts by address → map the maxes to (amount0Max, amount1Max).
        (uint256 amount0Max, uint256 amount1Max) = weth < usdc ? (wethMax, usdcMax) : (usdcMax, wethMax);

        vm.startBroadcast();
        IERC20(weth).approve(hookAddr, type(uint256).max);
        IERC20(usdc).approve(hookAddr, type(uint256).max);
        uint256 sed = hook.deposit(false, amount0Max, amount1Max); // Sediment (junior) first
        uint256 bed = hook.deposit(true, amount0Max, amount1Max); // Bedrock (senior) within the cap
        vm.stopBroadcast();

        console2.log("Sediment (junior) shares minted:", sed);
        console2.log("Bedrock  (senior) shares minted:", bed);
        console2.log("bedrockNav:", hook.bedrockNav());
        console2.log("sedimentNav:", hook.sedimentNav());
    }
}
