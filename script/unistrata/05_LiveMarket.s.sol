// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/Script.sol";

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";

import {UnistrataHook} from "../../src/UnistrataHook.sol";
import {SimSwapper} from "../../test/sim/SimSwapper.sol";
import {DemoERC20} from "./DemoERC20.sol";
import {BaseScript} from "../base/BaseScript.sol";

/// @notice THE DEMO — a real-world high-volume WETH/USDC trading session on the live Unistrata pool.
///
/// Two phases, run as one continuous stream of `--slow` swaps (one per block, because the hook records
/// one realized-variance observation per new block):
///
///   Phase 1 — NORMAL TRADING: many small swaps either side of spot. This is *volume*: it accrues real
///             0.3% LP fees to the pool while keeping per-block tick moves small, so realized variance
///             stays low — the regime in which Bedrock would earn a positive variance-priced coupon.
///   Phase 2 — VOLATILITY EVENT: ETH crashes ~40% in a handful of blocks. Each block's tick move exceeds
///             dCap, so the variance accumulator climbs by the per-block cap (~1e6) each block and crosses
///             the RSC's 4,000,000 spike threshold. The crash also drives the pool into impermanent loss.
///
/// When `varAcc` crosses the trigger, the UnistrataReactive RSC on Lasna fires `emergencySettle` back to
/// this hook cross-chain (no keeper). At settlement the waterfall pays Bedrock its protected target FIRST,
/// so **Bedrock's NAV holds while Sediment absorbs the entire crash drawdown** — IL, tranched and
/// transferred, automatically. A vanilla full-range LP would simply have eaten the loss.
///
///   forge script script/unistrata/05_LiveMarket.s.sol \
///     --rpc-url unichain_sep --account $ACCOUNT --sender $SENDER --broadcast --slow
///
/// Watch the Observatory (live event feed + the Bedrock/Sediment NAV tiles) while it runs.
contract LiveMarketScript is BaseScript {
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    // --- calibration (see test/sim/LiveMarketDemo.t.sol, which verifies these trigger + protect Bedrock) ---
    uint256 internal constant VOL_SWAPS = 12; // normal-trading volume (fees, low variance)
    int24 internal constant VOL_BAND = 180; // small chop band ⇒ per-block deltas stay well under dCap
    uint256 internal constant CRASH_STEPS = 5; // crash blocks; each ≥ dCap ⇒ caps variance (~1e6/block)
    int24 internal constant CRASH_STEP = 1150; // > dCap (1000); 5 × 1150 ≈ −44% over the crash

    function run() public {
        address hookAddr = vm.envAddress("UNISTRATA_HOOK");
        address weth = vm.envAddress("TOKEN_WETH");
        address usdc = vm.envAddress("TOKEN_USDC");
        UnistrataHook hook = UnistrataHook(payable(hookAddr));

        (address t0, address t1) = weth < usdc ? (weth, usdc) : (usdc, weth);
        PoolKey memory key = PoolKey(Currency.wrap(t0), Currency.wrap(t1), 3000, 60, IHooks(hookAddr));
        (, int24 initTick,,) = poolManager.getSlot0(key.toId());
        // ETH price = USDC-per-WETH = token1/token0; if WETH is token0, a crash (ETH down) is a tick DOWN.
        int24 crashDir = weth < usdc ? -CRASH_STEP : CRASH_STEP;

        _log("init", initTick, hook);

        vm.startBroadcast();
        SimSwapper swapper = new SimSwapper(poolManager);
        // DemoERC20.mint is permissionless — fund the swapper far beyond what moving a ~$2M pool needs.
        DemoERC20(weth).mint(address(swapper), 1_000_000e18);
        DemoERC20(usdc).mint(address(swapper), 3_000_000_000e6);

        // Phase 1 — normal high-volume trading: fees accrue, realized variance stays low.
        console2.log(unicode"── Phase 1: normal trading (volume + fees, low variance) ──");
        for (uint256 i = 0; i < VOL_SWAPS; ++i) {
            int24 off = (i % 2 == 0) ? VOL_BAND : -VOL_BAND;
            swapper.swapToPrice(key, TickMath.getSqrtPriceAtTick(initTick + off));
        }
        _log("after volume", initTick, hook);

        // Phase 2 — volatility event: ETH crashes; variance spikes, IL accrues (Sediment will absorb it).
        console2.log(unicode"── Phase 2: VOLATILITY EVENT — ETH crashing ──");
        int24 tick = initTick;
        for (uint256 i = 0; i < CRASH_STEPS; ++i) {
            tick += crashDir;
            swapper.swapToPrice(key, TickMath.getSqrtPriceAtTick(tick));
            _log("  crash", tick, hook);
        }
        vm.stopBroadcast();

        console2.log(unicode"── done ──");
        console2.log("final varAcc (crosses the 4,000,000 trigger):", hook.varAcc());
        console2.log("The RSC on Lasna will now fire emergencySettle (~1-3 min, cross-chain, no keeper).");
        console2.log("Observatory: Bedrock NAV holds (protected); Sediment NAV drops (absorbs the crash).");
    }

    function _log(string memory tag, int24 tick, UnistrataHook hook) internal view {
        console2.log(tag);
        console2.log("  tick:");
        console2.logInt(int256(tick));
        console2.log("  varAcc:", hook.varAcc());
        console2.log("  bedrockNav / sedimentNav:", hook.bedrockNav(), hook.sedimentNav());
    }
}
