// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console2} from "forge-std/Script.sol";

/// @dev Minimal interface to the Reactive callback proxy's funding entry point.
interface ICallbackProxy {
    /// @notice Pre-fund a destination-chain callback contract (settles any outstanding debt too).
    function depositTo(address _contract) external payable;
}

/// @notice Funds both sides of the Strata × Reactive deployment. The RSC's subscriptions were already
///         registered in its constructor (02_DeployReactive); this script only moves native funds:
///           • the hook (destination callback contract) on the ORIGIN chain, via the callback proxy's
///             `depositTo` — covers callback gas / settles debt;
///           • the RSC itself on Lasna — covers reactive-tx / `Callback` emission costs.
///
///         MULTICHAIN (default `run()`) — funds BOTH chains in ONE invocation via Foundry in-script forks
///         (`vm.createSelectFork`). Do NOT pass `--rpc-url`; the script selects each chain itself. Amounts
///         are integer wei (e.g. HOOK_FUNDING_WEI=50000000000000000, RSC_FUNDING_WEI=5000000000000000000):
///           STRATA_HOOK=0x.. STRATA_REACTIVE=0x.. HOOK_FUNDING_WEI=.. RSC_FUNDING_WEI=.. \
///             forge script script/strata/03_FundAndSubscribe.s.sol \
///               --broadcast --account $ACCOUNT --sender $SENDER
///         Add `--multi` only when you later `--resume` or `--verify` the multichain run; broadcasts land
///         under `broadcast/multi/`.
///
///         SINGLE-CHAIN (targeted top-ups) — pass `--sig` + the matching `--rpc-url`:
///           forge script .. --sig "fundHook()"     --rpc-url unichain_sep   --broadcast --account ..
///           forge script .. --sig "fundReactive()" --rpc-url reactive_lasna --broadcast --account ..
contract FundAndSubscribeScript is Script {
    // Callback proxy on Unichain Sepolia (1301) — re-confirm against live docs before funding.
    address internal constant CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;

    // RPC aliases from foundry.toml [rpc_endpoints].
    string internal constant ORIGIN_RPC = "unichain_sep";
    string internal constant REACTIVE_RPC = "reactive_lasna";

    /// @notice Multichain entry point: fund the hook on the origin chain AND the RSC on Lasna in one run.
    ///         Selects each chain via its own fork, so run WITHOUT `--rpc-url`.
    function run() public {
        vm.createSelectFork(vm.rpcUrl(ORIGIN_RPC));
        _fundHook();

        vm.createSelectFork(vm.rpcUrl(REACTIVE_RPC));
        _fundReactive();
    }

    /// @notice Single-chain: fund only the hook. Run with `--rpc-url unichain_sep`.
    function fundHook() public {
        _fundHook();
    }

    /// @notice Single-chain: fund only the RSC. Run with `--rpc-url reactive_lasna`.
    function fundReactive() public {
        _fundReactive();
    }

    /// @dev Deposit HOOK_FUNDING_WEI to the hook via the callback proxy on the currently-selected chain.
    function _fundHook() internal {
        address hook = vm.envAddress("STRATA_HOOK");
        uint256 amount = vm.envUint("HOOK_FUNDING_WEI"); // integer wei, e.g. 50000000000000000 (0.05 ether)
        vm.startBroadcast();
        ICallbackProxy(CALLBACK_PROXY).depositTo{value: amount}(hook);
        vm.stopBroadcast();
        console2.log("Funded hook %s with %s wei via callback proxy", hook, amount);
    }

    /// @dev Send RSC_FUNDING_WEI of native REACT to the RSC on the currently-selected chain.
    function _fundReactive() internal {
        address payable rsc = payable(vm.envAddress("STRATA_REACTIVE"));
        uint256 amount = vm.envUint("RSC_FUNDING_WEI"); // integer wei of native REACT on Lasna
        vm.startBroadcast();
        (bool ok,) = rsc.call{value: amount}(""); // RSC.receive() accepts; coverDebt() settles debt
        require(ok, "RSC funding transfer failed");
        vm.stopBroadcast();
        console2.log("Funded RSC %s with %s wei", rsc, amount);
    }
}
