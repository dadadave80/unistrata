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

import {UnistrataHook} from "../../src/UnistrataHook.sol";
import {SimSwapper} from "../../test/sim/SimSwapper.sol";
import {BaseScript} from "../base/BaseScript.sol";
import {DemoERC20} from "./DemoERC20.sol";
import {EnvWriter} from "./EnvWriter.sol";

/// @notice THE GOOD-MARKET DEMO — the mirror image of 01_LiveMarket. Where 01 crashes ETH (high variance →
/// emergency settle → Sediment absorbs the drawdown, coupon floored), this runs a *great* market: a long,
/// gentle bull TREND on big volume.
///
/// Two phases, run as one continuous stream of `--slow` swaps (one per block = one variance observation):
///
///   Phase 1 — VOLUME: many small two-sided swaps. Pure 0.3% LP fee accrual; per-block tick moves stay tiny,
///             so realized variance stays low.
///   Phase 2 — THE TREND: ETH grinds up ~65% in many SMALL steps (each well under dCap, so no single block
///             caps variance and the 4,000,000 breaker never trips). The rising price + the fees lift the
///             pool's numéraire value (totalAssets), and the whole surplus is the residual that belongs to
///             Sediment. Low realized σ² also means the *next* coupon reprices HIGH (variance-priced), so
///             Bedrock's fixed coupon recovers.
///
///   Phase 3 — MARK TO MARKET: a small deposit. A deposit (like any deposit/withdrawal) re-syncs the stored
///             tranche NAVs to the LIVE waterfall slice of totalAssets — so the appreciation immediately
///             shows as a higher Sediment NAV in the UI, without waiting for the epoch to settle. (The
///             coupon RATE itself only reprices at settlement — the RSC heartbeat at the epoch boundary, or
///             a permissionless `settleEpoch()` once the epoch has elapsed; a normal market never trips the
///             instant emergency path the way a crash does.)
///
///   forge script script/unistrata/02_GreatMarket.s.sol \
///     --rpc-url unichain_sep --account $ACCOUNT --sender $SENDER --broadcast --slow
///
/// Re-runnable: reuses the persisted SimSwapper (SIM_SWAPPER in .env), same as 01_LiveMarket.
contract GreatMarketScript is BaseScript {
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    // --- calibration: a massive trend on LOW realized variance (stays well under the 4,000,000 breaker) ---
    uint256 internal constant VOL_SWAPS = 8; // warm-up volume (fees), tiny per-block deltas
    int24 internal constant VOL_BAND = 120; // small chop band ⇒ ~120² per block, low variance
    uint256 internal constant TREND_STEPS = 20; // gentle bull steps; each < dCap ⇒ ~250²=62,500/block
    int24 internal constant TREND_STEP = 250; // 20 × 250 = 5,000 ticks ≈ +65% over the trend (no breaker)
    // ⇒ total varAcc ≈ 8·240² + 20·250² ≈ 1.7M — comfortably below the 4,000,000 emergency trigger.

    // Phase-3 mark-to-market deposit — small; the SYNC reveals the full appreciated Sediment residual
    // regardless of size, so keep the added capital modest and let the surplus be the story.
    uint256 internal constant MTM_WETH = 2e18; // tWETH (18 dec)
    uint256 internal constant MTM_USDC = 14_000e6; // tUSDC (6 dec) — covers the WETH leg at the risen price

    function run() public {
        address hookAddr = vm.envAddress("UNISTRATA_HOOK");
        address weth = vm.envAddress("TOKEN_WETH");
        address usdc = vm.envAddress("TOKEN_USDC");
        UnistrataHook hook = UnistrataHook(payable(hookAddr));

        (address t0, address t1) = weth < usdc ? (weth, usdc) : (usdc, weth);
        PoolKey memory key = PoolKey(Currency.wrap(t0), Currency.wrap(t1), 3000, 60, IHooks(hookAddr));
        (, int24 initTick,,) = poolManager.getSlot0(key.toId());
        // ETH price = USDC-per-WETH = token1/token0. A rally (ETH UP) is a tick UP when WETH is token0, a
        // tick DOWN when WETH is token1 — the exact mirror of 01_LiveMarket's crashDir.
        int24 trendDir = weth < usdc ? TREND_STEP : -TREND_STEP;

        _log("init", initTick, hook);

        // Reuse the persisted SimSwapper (SIM_SWAPPER in .env); deploy + persist one on the first run.
        address swapperAddr = vm.envOr("SIM_SWAPPER", address(0));

        vm.startBroadcast();
        SimSwapper swapper;
        if (swapperAddr.code.length == 0) {
            swapper = new SimSwapper(poolManager);
            swapperAddr = address(swapper);
        } else {
            swapper = SimSwapper(swapperAddr);
        }
        // Permissionless DemoERC20.mint — top up only when the swapper has run low (idempotent across runs).
        if (DemoERC20(weth).balanceOf(swapperAddr) < 100_000e18) DemoERC20(weth).mint(swapperAddr, 1_000_000e18);
        if (DemoERC20(usdc).balanceOf(swapperAddr) < 300_000_000e6) DemoERC20(usdc).mint(swapperAddr, 3_000_000_000e6);

        // Phase 1 — high-volume two-sided trading: fees accrue, realized variance stays low.
        console2.log(unicode"── Phase 1: high-volume trading (fees, low variance) ──");
        for (uint256 i = 0; i < VOL_SWAPS; ++i) {
            int24 off = (i % 2 == 0) ? VOL_BAND : -VOL_BAND;
            swapper.swapToPrice(key, TickMath.getSqrtPriceAtTick(initTick + off));
        }
        _log("after volume", initTick, hook);

        // Phase 2 — the trend: ETH grinds UP in small steps. Low per-block variance, big cumulative move.
        console2.log(unicode"── Phase 2: THE TREND — ETH rallying (low variance, no breaker) ──");
        int24 tick = initTick;
        for (uint256 i = 0; i < TREND_STEPS; ++i) {
            tick += trendDir;
            swapper.swapToPrice(key, TickMath.getSqrtPriceAtTick(tick));
            _log("  trend", tick, hook);
        }

        // Phase 3 — mark to market: a small deposit re-syncs the stored NAVs to the live, appreciated
        // waterfall (sedimentNav = totalAssets − bedrock claim), so the surplus shows now, not at settlement.
        console2.log(unicode"── Phase 3: mark to market (small deposit syncs the appreciated NAVs) ──");
        DemoERC20(weth).mint(deployerAddress, MTM_WETH * 3);
        DemoERC20(usdc).mint(deployerAddress, MTM_USDC * 3);
        IERC20(weth).approve(hookAddr, type(uint256).max);
        IERC20(usdc).approve(hookAddr, type(uint256).max);
        (uint256 a0, uint256 a1) = weth < usdc ? (MTM_WETH, MTM_USDC) : (MTM_USDC, MTM_WETH);
        hook.deposit(false, a0, a1); // Sediment (junior) — keeps the upside it just earned
        vm.stopBroadcast();

        // Persist the swapper so the next run reuses it instead of redeploying (idempotent upsert).
        EnvWriter.upsert(".env", "SIM_SWAPPER", vm.toString(swapperAddr));

        console2.log(unicode"── done ──");
        console2.log("final varAcc (stays under the 4,000,000 trigger - no emergency settle):", hook.varAcc());
        console2.log("bedrockNav / sedimentNav:", hook.bedrockNav(), hook.sedimentNav());
        console2.log("Sediment banked the trend's appreciation + fees; Bedrock principal is protected.");
        console2.log("Coupon RATE reprices HIGH off the low variance at the NEXT settlement (RSC heartbeat /");
        console2.log("epoch boundary) - a great market settles normally, not via the instant crash breaker.");
    }

    function _log(string memory tag, int24 tick, UnistrataHook hook) internal view {
        console2.log(tag);
        console2.log("  tick:");
        console2.logInt(int256(tick));
        console2.log("  varAcc:", hook.varAcc());
        console2.log("  bedrockNav / sedimentNav:", hook.bedrockNav(), hook.sedimentNav());
    }
}
