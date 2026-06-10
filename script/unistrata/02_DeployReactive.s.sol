// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {UnistrataReactive} from "../../src/reactive/UnistrataReactive.sol";
import {EnvWriter} from "./EnvWriter.sol";
import {Script, console2} from "forge-std/Script.sol";

/// @notice Deploys the UnistrataReactive RSC on the Reactive Network (Lasna, chainId 5318007). The
///         constructor registers both subscriptions (CRON heartbeat + the hook's UnistrataObservation),
///         so deploying IS subscribing. Run with:
///         UNISTRATA_HOOK=0x... forge script script/unistrata/02_DeployReactive.s.sol \
///             --rpc-url https://lasna-rpc.rnk.dev/ --account $ACCOUNT --sender $SENDER --broadcast
contract DeployReactiveScript is Script {
    uint256 internal constant ORIGIN_CHAIN_ID = 1301; // Unichain Sepolia (the hook's home)

    // Cron100 (~12 min) — fine enough to settle within the 1h grace window. Re-confirm on Lasna.
    uint256 internal constant CRON_TOPIC = 0xb49937fb8970e19fd46d48f7e3fb00d659deac0347f79cd7cb542f0fc1503c70;

    // epochDuration (1 day) / cron period (~12 min) ≈ 120 ticks per epoch.
    uint256 internal constant TICKS_PER_EPOCH = 120;

    // Fire emergencySettle once cumulative varAcc rises this much within an epoch (tune for the demo).
    uint256 internal constant SPIKE_THRESHOLD = 4_000_000; // ~4 capped blocks (dCap=1000 ⇒ dCap²=1e6)

    uint64 internal constant CALLBACK_GAS_LIMIT = 1_000_000;

    function run() public {
        address unistrataHook = vm.envAddress("UNISTRATA_HOOK");

        // The constructor subscribes (try/catch) — one deploy tx deploys AND subscribes on-chain.
        // Locally the 0x64 precompile is absent so a SubscribeFailed event fires here (harmless);
        // on the real node both subscriptions take effect.
        vm.startBroadcast();
        UnistrataReactive rsc = new UnistrataReactive(
            ORIGIN_CHAIN_ID, unistrataHook, CRON_TOPIC, TICKS_PER_EPOCH, SPIKE_THRESHOLD, CALLBACK_GAS_LIMIT
        );
        vm.stopBroadcast();

        console2.log("UNISTRATA_REACTIVE=%s", address(rsc));
        EnvWriter.upsert(".env", "UNISTRATA_REACTIVE", vm.toString(address(rsc)));
    }
}
