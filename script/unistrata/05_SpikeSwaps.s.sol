// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";

import {SimSwapper} from "../../test/sim/SimSwapper.sol";
import {BaseScript} from "../base/BaseScript.sol";

/// @notice Demo step B — build realized variance on the live Unistrata pool to trip the Reactive circuit
///         breaker. Deploys a SimSwapper, funds it, then does N large ALTERNATING-direction swaps around
///         the init tick (±OFFSET, OFFSET > dCap so each block move hits the per-block cap).
///
///         MUST run with `--slow`: the hook records a new-block observation (and emits UnistrataObservation,
///         accumulating varAcc) only when `block.number` advances, so each swap must land in its own block.
///         Once cumulative `varAcc ≥ spikeThreshold` (4,000,000 = 4 capped blocks at dCap=1000) the RSC on
///         Lasna fires `emergencySettle` back to the hook (1–3 min cross-chain).
///           forge script script/unistrata/05_SpikeSwaps.s.sol \
///             --rpc-url unichain_sep --account $ACCOUNT --sender $SENDER --broadcast --slow
contract SpikeSwapsScript is BaseScript {
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    uint256 internal constant N_SWAPS = 6; // 4 cross 4e6; 6 for margin
    int24 internal constant OFFSET = 1200; // > dCap (1000) ⇒ each per-block move hits the cap

    function run() public {
        address hookAddr = vm.envAddress("UNISTRATA_HOOK");
        address weth = vm.envAddress("TOKEN_WETH");
        address usdc = vm.envAddress("TOKEN_USDC");

        (address t0, address t1) = weth < usdc ? (weth, usdc) : (usdc, weth);
        PoolKey memory key = PoolKey(Currency.wrap(t0), Currency.wrap(t1), 3000, 60, IHooks(hookAddr));

        (, int24 initTick,,) = poolManager.getSlot0(key.toId());
        int24 tickHi = initTick + OFFSET;
        int24 tickLo = initTick - OFFSET;

        vm.startBroadcast();
        SimSwapper swapper = new SimSwapper(poolManager);
        // Fund both sides generously so each price-limited swap can reach its target tick.
        IERC20(weth).transfer(address(swapper), 50e18);
        IERC20(usdc).transfer(address(swapper), 150_000e6);

        // Oscillate around the init tick: each swing is a ≥OFFSET tick move ⇒ a capped (dCap²) variance block.
        for (uint256 i = 0; i < N_SWAPS; ++i) {
            int24 target = (i % 2 == 0) ? tickHi : tickLo;
            swapper.swapToPrice(key, TickMath.getSqrtPriceAtTick(target));
        }
        vm.stopBroadcast();

        console2.log("Alternating swaps done:", N_SWAPS);
        console2.log("initTick:");
        console2.logInt(int256(initTick));
        console2.log("Watch the RSC on Lasna for the emergencySettle callback landing on the hook.");
    }
}
