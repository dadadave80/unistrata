// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {AddressConstants} from "hookmate/constants/AddressConstants.sol";
import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {UnistrataHook} from "../../src/UnistrataHook.sol";
import {UnistrataReactive} from "../../src/reactive/UnistrataReactive.sol";
import {DemoERC20} from "./DemoERC20.sol";
import {EnvWriter} from "./EnvWriter.sol";
import {UnistrataDeploy} from "./UnistrataDeploy.sol";

/// @dev Minimal interface to the Reactive callback proxy's funding entry point.
interface ICallbackProxy {
    /// @notice Pre-fund a destination-chain callback contract (settles any outstanding debt too).
    function depositTo(address _contract) external payable;
}

/// @title SetupUnistrataScript — one-shot Unistrata setup
/// @notice Folds the former 00–04 deploy steps (none of which need `--slow`) into a single multichain
///         run: on the ORIGIN chain (Unichain Sepolia 1301) it deploys the demo tokens, mines + deploys
///         the hook, initializes the pool, funds the hook via the callback proxy, and seeds a deposit into
///         both tranches; on REACTIVE LASNA (5318007) it deploys the RSC (which subscribes in its
///         constructor) and funds it. The hook lives only on the origin chain — Lasna gets the RSC only —
///         so the PoolManager is resolved on the origin fork. The live-market demo (`01_LiveMarket`) stays
///         separate because it needs `--slow` (one variance observation per block).
///
///         `run()` orchestrates the whole bring-up in ONE invocation via in-script forks — do NOT pass
///         `--rpc-url`; it selects each chain itself. Amounts are integer wei:
///           HOOK_FUNDING_WEI=50000000000000000 RSC_FUNDING_WEI=5000000000000000000 [TARGET_PRICE=3000] \
///           [DEMO_RECIPIENT=0x..] \
///             forge script script/unistrata/00_SetupUnistrata.s.sol --account $ACCOUNT --sender $SENDER --broadcast
///         (Add `--multi` only when you later `--resume`/`--verify`; broadcasts land under `broadcast/multi/`.)
///
///         One-shot by design: fund the deployer on BOTH chains before running, since a partial failure
///         after the hook is deployed is not cleanly re-runnable (the hook sits at a deterministic CREATE2
///         address that can collide on a retry).
contract SetupUnistrataScript is Script {
    // --- networks (RPC aliases from foundry.toml [rpc_endpoints]) ---
    string internal constant ORIGIN_RPC = "unichain_sep"; // Unichain Sepolia (1301) — the hook's home
    string internal constant REACTIVE_RPC = "reactive_lasna"; // Reactive Lasna (5318007) — the RSC's home

    // Reactive callback proxy on Unichain Sepolia (1301) — re-confirm against live docs before deploy.
    address internal constant CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;

    // --- RSC params (former 02_DeployReactive) ---
    uint256 internal constant ORIGIN_CHAIN_ID = 1301;
    // Cron100 (~12 min) — fine enough to settle within the 1h grace window. Re-confirm on Lasna.
    uint256 internal constant CRON_TOPIC = 0xb49937fb8970e19fd46d48f7e3fb00d659deac0347f79cd7cb542f0fc1503c70;
    uint256 internal constant TICKS_PER_EPOCH = 120; // epochDuration (1d) / cron (~12 min) ≈ 120
    uint256 internal constant SPIKE_THRESHOLD = 4_000_000; // ~4 capped blocks (dCap=1000 ⇒ dCap²=1e6)
    uint64 internal constant CALLBACK_GAS_LIMIT = 1_000_000;

    // --- seed-deposit maxes (former 04_DepositDemo), balanced at 1 tWETH = 3000 tUSDC, ~$630k/leg ---
    uint256 internal constant SEED_WETH_MAX = 210e18; // tWETH (18 dec)
    uint256 internal constant SEED_USDC_MAX = 630_000e6; // tUSDC (6 dec)

    //*//////////////////////////////////////////////////////////////////////////
    //                                  FULL RUN
    //////////////////////////////////////////////////////////////////////////*//

    function run() public {
        uint256 targetPrice = vm.envOr("TARGET_PRICE", uint256(3000)); // tUSDC per tWETH
        // Read funding up front so a missing env fails fast — before any token/hook is deployed.
        uint256 hookFunding = vm.envUint("HOOK_FUNDING_WEI");
        uint256 rscFunding = vm.envUint("RSC_FUNDING_WEI");

        // --- ORIGIN: tokens → hook + pool → fund hook → seed both tranches ---
        vm.createSelectFork(vm.rpcUrl(ORIGIN_RPC));
        address recipient = vm.envOr("DEMO_RECIPIENT", _deployer());
        vm.startBroadcast();
        (address weth, address usdc) = _deployTokens(recipient);
        address hook = _deployHook(weth, usdc, targetPrice);
        _fundHook(hook, hookFunding);
        _seedDeposit(hook, weth, usdc);
        vm.stopBroadcast();

        // --- REACTIVE LASNA: RSC (subscribes in its constructor) → fund ---
        vm.createSelectFork(vm.rpcUrl(REACTIVE_RPC));
        vm.startBroadcast();
        address rsc = _deployReactive(hook);
        _fundReactive(rsc, rscFunding);
        vm.stopBroadcast();

        _persist(weth, usdc, hook, rsc);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                 INTERNALS
    //////////////////////////////////////////////////////////////////////////*//
    // Steps run() orchestrates. No fork/broadcast management here — run() selects each fork and wraps the
    // per-chain work in startBroadcast/stopBroadcast; these just do the work and pass addresses in memory.

    /// @dev Deploy the demo pool tokens (tWETH 18-dec, tUSDC 6-dec) and mint a starting balance.
    function _deployTokens(address recipient) internal returns (address weth, address usdc) {
        DemoERC20 tWETH = new DemoERC20("Demo Wrapped Ether", "tWETH", 18);
        DemoERC20 tUSDC = new DemoERC20("Demo USD Coin", "tUSDC", 6);
        tWETH.mint(recipient, 1_000e18); // 1,000 tWETH
        tUSDC.mint(recipient, 3_000_000e6); // 3,000,000 tUSDC
        (weth, usdc) = (address(tWETH), address(tUSDC));
        console2.log("TOKEN_WETH=%s", weth);
        console2.log("TOKEN_USDC=%s", usdc);
    }

    /// @dev Mine the hook address (afterInitialize|afterSwap|beforeAddLiquidity), CREATE2-deploy it against
    ///      the canonical PoolManager + the callback proxy, and initialize the pool. Decimals/ordering/
    ///      numéraire/init price are all DERIVED from the real token addresses (v4 sorts by address).
    ///      Locals are split across helpers / scoped to stay under the stack limit (no via_ir).
    function _deployHook(address weth, address usdc, uint256 targetPrice) internal returns (address) {
        (UnistrataHook.Config memory cfg, Currency currency0, Currency currency1) = _buildConfig(weth, usdc);
        uint160 sqrtPriceX96 = _initSqrtPrice(weth, usdc, targetPrice);
        IPoolManager pm = IPoolManager(AddressConstants.getPoolManagerAddress(block.chainid));

        address hookAddress;
        bytes32 salt;
        {
            uint160 flags =
                uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG);
            (hookAddress, salt) = HookMiner.find(
                CREATE2_FACTORY, flags, type(UnistrataHook).creationCode, abi.encode(pm, cfg, CALLBACK_PROXY)
            );
        }

        UnistrataHook hook = new UnistrataHook{salt: salt}(pm, cfg, CALLBACK_PROXY);
        require(address(hook) == hookAddress, "Deploy: hook address mismatch");
        pm.initialize(PoolKey(currency0, currency1, 3000, 60, IHooks(hookAddress)), sqrtPriceX96);

        console2.log("UNISTRATA_HOOK=%s", hookAddress);
        return hookAddress;
    }

    /// @dev Build the hook Config + (currency0, currency1) from the token pair (USDC = numéraire).
    function _buildConfig(address weth, address usdc)
        internal
        pure
        returns (UnistrataHook.Config memory cfg, Currency currency0, Currency currency1)
    {
        uint8 dec0;
        uint8 dec1;
        bool numeraireIsToken1;
        (currency0, currency1, dec0, dec1, numeraireIsToken1) = UnistrataDeploy.orderTokens(weth, 18, usdc, 6, usdc);
        cfg = UnistrataHook.Config({
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
    }

    /// @dev Init sqrt price for 1 tWETH = targetPrice tUSDC, in the pair's actual token0/token1 order.
    function _initSqrtPrice(address weth, address usdc, uint256 targetPrice) internal pure returns (uint160) {
        return weth < usdc
            ? UnistrataDeploy.encodeSqrtPriceX96(targetPrice * 1e6, 1e18) // (amount1=USDC, amount0=WETH)
            : UnistrataDeploy.encodeSqrtPriceX96(1e18, targetPrice * 1e6); // (amount1=WETH, amount0=USDC)
    }

    /// @dev Deploy the RSC on Lasna. Its constructor registers both subscriptions (CRON + the hook's
    ///      UnistrataObservation), so deploying IS subscribing — locally the 0x64 precompile is absent and
    ///      a SubscribeFailed event fires (harmless); on the real node both subscriptions take effect.
    function _deployReactive(address hook) internal returns (address) {
        UnistrataReactive rsc = new UnistrataReactive(
            ORIGIN_CHAIN_ID, hook, CRON_TOPIC, TICKS_PER_EPOCH, SPIKE_THRESHOLD, CALLBACK_GAS_LIMIT
        );
        console2.log("UNISTRATA_REACTIVE=%s", address(rsc));
        return address(rsc);
    }

    /// @dev Deposit HOOK_FUNDING_WEI to the hook via the callback proxy (covers callback gas / settles debt).
    function _fundHook(address hook, uint256 amount) internal {
        ICallbackProxy(CALLBACK_PROXY).depositTo{value: amount}(hook);
        console2.log("Funded hook %s with %s wei via callback proxy", hook, amount);
    }

    /// @dev Send RSC_FUNDING_WEI of native REACT to the RSC (its receive() settles reactive-tx debt).
    function _fundReactive(address rsc, uint256 amount) internal {
        (bool ok,) = payable(rsc).call{value: amount}("");
        require(ok, "RSC funding transfer failed");
        console2.log("Funded RSC %s with %s wei", rsc, amount);
    }

    /// @dev Mint + approve + deposit into BOTH tranches — Sediment (junior) first so the Bedrock
    ///      attachment cap (S/(S+J) ≤ thetaMax) holds — giving the pool liquidity and the depositor shares.
    function _seedDeposit(address hookAddr, address weth, address usdc) internal {
        UnistrataHook hook = UnistrataHook(payable(hookAddr));
        // v4 sorts by address → map the maxes to (amount0Max, amount1Max).
        (uint256 amount0Max, uint256 amount1Max) =
            weth < usdc ? (SEED_WETH_MAX, SEED_USDC_MAX) : (SEED_USDC_MAX, SEED_WETH_MAX);

        address me = _deployer();
        // DemoERC20.mint is permissionless — mint enough for both deposits (each pulls up to the maxes) + margin.
        DemoERC20(weth).mint(me, SEED_WETH_MAX * 3);
        DemoERC20(usdc).mint(me, SEED_USDC_MAX * 3);
        IERC20(weth).approve(hookAddr, type(uint256).max);
        IERC20(usdc).approve(hookAddr, type(uint256).max);
        uint256 sed = hook.deposit(false, amount0Max, amount1Max); // Sediment (junior) first
        uint256 bed = hook.deposit(true, amount0Max, amount1Max); // Bedrock (senior) within the cap
        console2.log("Sediment (junior) shares minted:", sed);
        console2.log("Bedrock  (senior) shares minted:", bed);
    }

    /// @dev The broadcasting EOA (keystore --account, else msg.sender). Used as mint recipient / depositor.
    function _deployer() internal returns (address) {
        address[] memory wallets = vm.getWallets();
        return wallets.length > 0 ? wallets[0] : msg.sender;
    }

    /// @dev Persist every deployed address to `.env` (forge auto-loads it for 01_LiveMarket + the frontend).
    function _persist(address weth, address usdc, address hook, address rsc) internal {
        EnvWriter.upsert(".env", "TOKEN_WETH", vm.toString(weth));
        EnvWriter.upsert(".env", "TOKEN_USDC", vm.toString(usdc));
        EnvWriter.upsert(".env", "UNISTRATA_HOOK", vm.toString(hook));
        EnvWriter.upsert(".env", "UNISTRATA_REACTIVE", vm.toString(rsc));
    }
}
