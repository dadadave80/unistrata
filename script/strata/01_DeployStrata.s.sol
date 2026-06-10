// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {BaseScript} from "../base/BaseScript.sol";
import {StrataHook} from "../../src/StrataHook.sol";

/// @notice Mines the StrataHook address (afterInitialize|afterSwap|beforeAddLiquidity flags), deploys
///         it on the ORIGIN chain (Unichain Sepolia 1301) with the canonical PoolManager + the
///         Reactive callback proxy, and initializes the pool. Run with:
///         forge script script/strata/01_DeployStrata.s.sol --rpc-url $UNICHAIN_SEPOLIA_RPC \
///             --account $ACCOUNT --sender $SENDER --broadcast
contract DeployStrataScript is BaseScript {
    // Reactive callback proxy on Unichain Sepolia (1301) — re-confirm against live docs before deploy.
    address internal constant CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;
    uint160 internal constant SQRT_PRICE_1_1 = 79228162514264337593543950336; // price 1:1

    function run() public {
        uint160 flags = uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG);

        StrataHook.Config memory cfg = StrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18, // set to the real token decimals (e.g. USDC = 6) before deploying
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 5000,
            lambdaRisk: 1.25e18,
            rMin: 0,
            rMax: 0.5e18,
            lambdaSmoothing: 0.3e18,
            thetaMax: 0.75e18
        });

        bytes memory constructorArgs = abi.encode(poolManager, cfg, CALLBACK_PROXY);
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_FACTORY, flags, type(StrataHook).creationCode, constructorArgs);

        (Currency currency0, Currency currency1) = getCurrencies();
        PoolKey memory poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hookAddress));

        vm.startBroadcast();
        StrataHook hook = new StrataHook{salt: salt}(poolManager, cfg, CALLBACK_PROXY);
        require(address(hook) == hookAddress, "DeployStrata: hook address mismatch");
        poolManager.initialize(poolKey, SQRT_PRICE_1_1);
        vm.stopBroadcast();

        // Record these for 02_DeployReactive and the submission:
        // STRATA_HOOK = address(hook)
    }
}
