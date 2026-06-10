// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {console2} from "forge-std/Script.sol";

import {UnistrataHook} from "../../src/UnistrataHook.sol";
import {BaseScript} from "../base/BaseScript.sol";
import {EnvWriter} from "./EnvWriter.sol";
import {UnistrataDeploy} from "./UnistrataDeploy.sol";

/// @notice Mines the UnistrataHook address (afterInitialize|afterSwap|beforeAddLiquidity flags), deploys
///         it on the ORIGIN chain (Unichain Sepolia 1301) with the canonical PoolManager + the
///         Reactive callback proxy, and initializes the pool at a realistic price. The pool tokens
///         come from 00_DeployMockTokens (tWETH 18-dec, tUSDC 6-dec); decimals, the numéraire flag,
///         and the init price are all DERIVED from the real addresses (v4 sorts by address), so the
///         §7 decimals/ordering footguns can't bite. Run with:
///           TOKEN_WETH=0x... TOKEN_USDC=0x... [TARGET_PRICE=3000] \
///           forge script script/unistrata/01_DeployUnistrata.s.sol \
///             --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast
contract DeployUnistrataScript is BaseScript {
    // Reactive callback proxy on Unichain Sepolia (1301) — re-confirm against live docs before deploy.
    address internal constant CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;

    function run() public {
        address weth = vm.envAddress("TOKEN_WETH");
        address usdc = vm.envAddress("TOKEN_USDC");
        uint256 targetPrice = vm.envOr("TARGET_PRICE", uint256(3000)); // tUSDC per tWETH

        // Derive ordering + decimals + numéraire from the real addresses; USDC is the numéraire.
        (Currency currency0, Currency currency1, uint8 dec0, uint8 dec1, bool numeraireIsToken1) =
            UnistrataDeploy.orderTokens(weth, 18, usdc, 6, usdc);

        // Init sqrt price for 1 tWETH = targetPrice tUSDC, in the pair's actual token0/token1 order.
        bool wethIsToken0 = weth < usdc;
        uint160 sqrtPriceX96 = wethIsToken0
            ? UnistrataDeploy.encodeSqrtPriceX96(targetPrice * 1e6, 1e18)  // (amount1=USDC, amount0=WETH)
            : UnistrataDeploy.encodeSqrtPriceX96(1e18, targetPrice * 1e6); // (amount1=WETH, amount0=USDC)

        UnistrataHook.Config memory cfg = UnistrataHook.Config({
            numeraireIsToken1: numeraireIsToken1,
            decimals0: dec0,
            decimals1: dec1,
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

        uint160 flags = uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG);
        bytes memory constructorArgs = abi.encode(poolManager, cfg, CALLBACK_PROXY);
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_FACTORY, flags, type(UnistrataHook).creationCode, constructorArgs);

        PoolKey memory poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hookAddress));

        vm.startBroadcast();
        UnistrataHook hook = new UnistrataHook{salt: salt}(poolManager, cfg, CALLBACK_PROXY);
        require(address(hook) == hookAddress, "DeployUnistrata: hook address mismatch");
        poolManager.initialize(poolKey, sqrtPriceX96);
        vm.stopBroadcast();

        console2.log("UNISTRATA_HOOK=%s", address(hook));
        console2.log("numeraireIsToken1=%s sqrtPriceX96=%s", numeraireIsToken1, uint256(sqrtPriceX96));

        // persist for 02_DeployReactive / 03_FundAndSubscribe
        EnvWriter.upsert(".env", "UNISTRATA_HOOK", vm.toString(address(hook)));
    }
}
