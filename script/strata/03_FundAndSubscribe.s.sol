// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";

/// @dev Minimal interface to the Reactive callback proxy's funding entry point.
interface ICallbackProxy {
    /// @notice Pre-fund a destination-chain callback contract (settles any outstanding debt too).
    function depositTo(address _contract) external payable;
}

/// @notice Funds the hook (the destination-chain callback contract) via the Reactive callback proxy's
///         `depositTo`, so callbacks can be paid; the RSC's subscriptions were already registered in
///         its constructor (02_DeployReactive). Also tops up the RSC itself on Lasna.
///
///         Step A — on the ORIGIN chain (Unichain Sepolia), fund the hook:
///           STRATA_HOOK=0x... HOOK_FUNDING_WEI=... forge script script/strata/03_FundAndSubscribe.s.sol \
///             --sig "fundHook()" --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast
///
///         Step B — on Lasna, top up the RSC (covers reactive-tx / callback emission costs):
///           STRATA_REACTIVE=0x... RSC_FUNDING_WEI=... forge script script/strata/03_FundAndSubscribe.s.sol \
///             --sig "fundReactive()" --rpc-url https://lasna-rpc.rnk.dev/ --account $ACCOUNT --sender $SENDER --broadcast
contract FundAndSubscribeScript is Script {
    // Callback proxy on Unichain Sepolia (1301) — re-confirm against live docs before funding.
    address internal constant CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;

    function fundHook() public {
        address hook = vm.envAddress("STRATA_HOOK");
        uint256 amount = vm.envUint("HOOK_FUNDING_WEI"); // e.g. 0.05 ether on Unichain Sepolia
        vm.startBroadcast();
        ICallbackProxy(CALLBACK_PROXY).depositTo{value: amount}(hook);
        vm.stopBroadcast();
    }

    function fundReactive() public {
        address payable rsc = payable(vm.envAddress("STRATA_REACTIVE"));
        uint256 amount = vm.envUint("RSC_FUNDING_WEI"); // native REACT on Lasna
        vm.startBroadcast();
        (bool ok,) = rsc.call{value: amount}(""); // RSC.receive() accepts; coverDebt() settles debt
        require(ok, "RSC funding transfer failed");
        vm.stopBroadcast();
    }
}
