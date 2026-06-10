// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";

import {UnistrataHook} from "../../src/UnistrataHook.sol";
import {SimSwapper} from "../../test/sim/SimSwapper.sol";
import {BaseScript} from "../base/BaseScript.sol";

/// @notice Demo step B (--slow-independent) — ONE variance-building swap per invocation. A forge run
///         WITHOUT `--slow` lands all its txs in one block, collapsing them to a single observation
///         (`--slow` makes forge await each receipt before the next, which separates them into blocks).
///         Running one swap per invocation is a `--slow`-independent guarantee of a fresh block each time.
///
///         Self-synchronizing: reads the hook's on-chain `lastObservedTick` and swaps to the OPPOSITE
///         side of the init tick (±OFFSET, OFFSET > dCap), so every run is a real swap that moves the
///         tick by > dCap and adds a full capped 1,000,000 to varAcc. From a fresh epoch, run 3 more
///         times (varAcc is already ~1,000,000): 2e6 → 3e6 → 4e6 ⇒ the RSC fires emergencySettle.
///
///           for i in 1 2 3; do \
///             forge script script/unistrata/06_SpikeStep.s.sol \
///               --rpc-url unichain_sep --account $ACCOUNT --sender $SENDER --broadcast; \
///             sleep 5; done
///
///         CENTER_TICK defaults to the current pool's init tick (196256); override if redeployed.
contract SpikeStepScript is BaseScript {
    int24 internal constant OFFSET = 1500; // > dCap (1000) ⇒ each single-swap block hits the cap

    function run() public {
        address hookAddr = vm.envAddress("UNISTRATA_HOOK");
        address weth = vm.envAddress("TOKEN_WETH");
        address usdc = vm.envAddress("TOKEN_USDC");
        UnistrataHook hook = UnistrataHook(payable(hookAddr));

        (address t0, address t1) = weth < usdc ? (weth, usdc) : (usdc, weth);
        PoolKey memory key = PoolKey(Currency.wrap(t0), Currency.wrap(t1), 3000, 60, IHooks(hookAddr));

        int24 center = int24(vm.envOr("CENTER_TICK", int256(196256)));
        // Move to the opposite extreme from the last OBSERVED tick ⇒ |d| = ~2·OFFSET, always a real swap.
        int24 lot = hook.lastObservedTick();
        int24 target = lot >= center ? center - OFFSET : center + OFFSET;
        uint256 varAccBefore = hook.varAcc();

        vm.startBroadcast();
        SimSwapper swapper = new SimSwapper(poolManager);
        // Fund both sides (the swap may push either direction across runs).
        IERC20(weth).transfer(address(swapper), 20e18);
        IERC20(usdc).transfer(address(swapper), 60_000e6);
        swapper.swapToPrice(key, TickMath.getSqrtPriceAtTick(target));
        vm.stopBroadcast();

        console2.log("varAcc before this run:", varAccBefore);
        console2.log("(threshold = 4000000; one capped block adds ~1000000)");
        console2.log("swapped toward target tick:");
        console2.logInt(int256(target));
    }
}
