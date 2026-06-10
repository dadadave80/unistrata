// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/console2.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";

import {DemoERC20} from "../../script/strata/DemoERC20.sol";
import {StrataDeploy} from "../../script/strata/StrataDeploy.sol";
import {BaseTest} from "../utils/BaseTest.sol";
import {SimSwapper} from "./SimSwapper.sol";
import {StrataHook} from "src/StrataHook.sol";
import {TrancheToken} from "src/TrancheToken.sol";
import {NavLib} from "src/libraries/NavLib.sol";

/// @notice Phase-5 simulation harness: replays a JSON price path (sim/paths/<scenario>.json) as real
/// swaps against a local Strata pool — on the demo token pair tWETH(18)/tUSDC(6) at 1 WETH = 3000 USDC,
/// matching the deploy setup — settles epochs on schedule, and exports per-epoch metrics to
/// sim/out/<scenario>.json (the "money chart" data, and the Phase-6 frontend contract).
///
/// Path ticks are interpreted as OFFSETS from the init (price-3000) tick, with a direction flip so a
/// negative path tick always means WETH crashes regardless of which token sorts as token0.
///
/// Output schema (sim/out/<scenario>.json):
///   { "scenario": string,
///     "epochs": [ {
///        "epoch": uint, "tick": int,
///        "priceWad": string,        // tUSDC per tWETH, WAD
///        "hodlValue": string,       // WAD numéraire (USDC) — initially-deposited tokens at current price
///        "vanillaLpValue": string,  // WAD — full-range position value (an untranched LP); the IL line
///        "seniorNav": string, "juniorNav": string,
///        "seniorNavPerShare": string, "juniorNavPerShare": string,
///        "realizedVarWad": string,  // WAD — sigma2Ewma
///        "couponRateWad": string    // WAD APR — seniorRate
///   } ] }
/// Economic values are WAD-integer strings (frontend parses) to avoid JSON number precision loss.
contract SimReplayTest is BaseTest {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    DemoERC20 internal weth;
    DemoERC20 internal usdc;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;
    SimSwapper internal swapper;

    address internal alice = makeAddr("alice");
    uint256 internal constant PRICE = 3000; // tUSDC per tWETH

    // derived in setUp from the deployed token addresses
    bool internal numeraireIsToken1;
    uint8 internal dec0;
    uint8 internal dec1;
    bool internal wethIsToken0;
    int24 internal initTick;
    int24 internal dir; // +1 if WETH is token0 (negative path tick = WETH down), else -1
    uint256 internal hodl0; // initial deposit basis, token0/token1 order
    uint256 internal hodl1;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5557 << 144)
    );

    function setUp() public {
        deployArtifactsAndLabel();
        weth = new DemoERC20("Demo Wrapped Ether", "tWETH", 18);
        usdc = new DemoERC20("Demo USD Coin", "tUSDC", 6);
        wethIsToken0 = address(weth) < address(usdc);
        dir = wethIsToken0 ? int24(1) : int24(-1);

        Currency c0;
        Currency c1;
        (c0, c1, dec0, dec1, numeraireIsToken1) =
            StrataDeploy.orderTokens(address(weth), 18, address(usdc), 6, address(usdc));

        StrataHook.Config memory cfg = StrataHook.Config({
            numeraireIsToken1: numeraireIsToken1,
            decimals0: dec0,
            decimals1: dec1,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272,
            lambdaRisk: 1.25e18,
            rMin: 0,
            rMax: 0.5e18,
            lambdaSmoothing: 0.3e18,
            thetaMax: 0.75e18
        });
        deployCodeTo("StrataHook.sol:StrataHook", abi.encode(poolManager, cfg, address(0xCA11)), HOOK_FLAGS);
        hook = StrataHook(payable(HOOK_FLAGS));

        poolKey = PoolKey(c0, c1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        uint160 initSqrtP = wethIsToken0
            ? StrataDeploy.encodeSqrtPriceX96(PRICE * 1e6, 1e18)
            : StrataDeploy.encodeSqrtPriceX96(1e18, PRICE * 1e6);
        poolManager.initialize(poolKey, initSqrtP);
        (, initTick,,) = poolManager.getSlot0(poolId);

        // fund alice and seed both tranches with balanced deposits at price 3000
        weth.mint(alice, 1_000e18);
        usdc.mint(alice, 3_000_000e6);
        vm.startPrank(alice);
        weth.approve(address(hook), type(uint256).max);
        usdc.approve(address(hook), type(uint256).max);
        _deposit(false, 2e18, 6000e6); // junior: 2 WETH + 6000 USDC ≈ $12k
        _deposit(true, 1e18, 3000e6); // senior: 1 WETH + 3000 USDC ≈ $6k (ratio 0.33 ≤ θ)
        vm.stopPrank();

        // HODL basis = total deposited (3 WETH + 9000 USDC), in token0/token1 order
        (hodl0, hodl1) = wethIsToken0 ? (uint256(3e18), uint256(9000e6)) : (uint256(9000e6), uint256(3e18));

        swapper = new SimSwapper(poolManager);
        weth.mint(address(swapper), 1_000_000e18);
        usdc.mint(address(swapper), 1_000_000_000e6);
    }

    function _deposit(bool isSenior, uint256 wethAmt, uint256 usdcAmt) internal {
        (uint256 a0, uint256 a1) = wethIsToken0 ? (wethAmt, usdcAmt) : (usdcAmt, wethAmt);
        hook.deposit(isSenior, a0, a1);
    }

    function test_sim_calm() public {
        _run("calm");
    }

    function test_sim_trend() public {
        _run("trend");
    }

    function test_sim_crash() public {
        _run("crash");
    }

    function _run(string memory scenario) internal {
        string memory json = vm.readFile(string.concat("sim/paths/", scenario, ".json"));
        int256[] memory ticks = vm.parseJsonIntArray(json, ".ticks");
        uint256 stepsPerEpoch = vm.parseJsonUint(json, ".stepsPerEpoch");

        console2.log("=== Strata sim:", scenario, "(tWETH/tUSDC @ 3000) ===");
        console2.log("epoch | hodl | vanillaLP | senior | junior  (USDC, WAD/1e18)");

        string memory epochs = "";
        uint256 epochCount;
        uint256 prevSenior = hook.seniorNav();
        for (uint256 i; i < ticks.length; ++i) {
            vm.roll(block.number + 1);
            // path tick = offset from the init (3000) tick; dir flips so negative = WETH crash
            int24 target = int24(int256(initTick) + int256(dir) * ticks[i]);
            swapper.swapToPrice(poolKey, TickMath.getSqrtPriceAtTick(target));

            if ((i + 1) % stepsPerEpoch == 0) {
                vm.warp(block.timestamp + 1 days + 1 hours + 1);
                hook.settleEpoch();

                uint256 s = hook.seniorNav();
                assertApproxEqAbs(s + hook.juniorNav(), hook.totalAssets(), 1e12, "conservation");
                if (hook.juniorNav() > 0) assertGe(s, prevSenior, "senior protected while junior has coverage");
                prevSenior = s;

                string memory e = _epochJson(epochCount, target);
                epochs = epochCount == 0 ? e : string.concat(epochs, ",", e);
                _printEpoch(epochCount);
                epochCount++;
            }
        }

        string memory out = string.concat('{"scenario":"', scenario, '","epochs":[', epochs, "]}");
        vm.writeFile(string.concat("sim/out/", scenario, ".json"), out);
        console2.log("wrote sim/out/%s.json (%d epochs)", scenario, epochCount);
    }

    function _sqrtPrice() internal view returns (uint160 sqrtP) {
        (sqrtP,,,) = poolManager.getSlot0(poolId);
    }

    /// @dev tUSDC per tWETH, WAD: value of 1 WETH in the numéraire.
    function _priceWad(uint160 sqrtP) internal view returns (uint256) {
        (uint256 a0, uint256 a1) = wethIsToken0 ? (uint256(1e18), uint256(0)) : (uint256(0), uint256(1e18));
        return NavLib.valueInNumeraire(a0, a1, sqrtP, numeraireIsToken1, dec0, dec1);
    }

    function _hodl(uint160 sqrtP) internal view returns (uint256) {
        return NavLib.valueInNumeraire(hodl0, hodl1, sqrtP, numeraireIsToken1, dec0, dec1);
    }

    function _nps(TrancheToken token, uint256 nav) internal view returns (uint256) {
        uint256 supply = token.totalSupply();
        return supply == 0 ? 0 : nav * 1e18 / supply;
    }

    function _epochJson(uint256 epochIdx, int24 tick) internal view returns (string memory) {
        uint160 sqrtP = _sqrtPrice();
        string memory a = string.concat(
            '{"epoch":',
            vm.toString(epochIdx),
            ',"tick":',
            vm.toString(int256(tick)),
            ',"priceWad":"',
            vm.toString(_priceWad(sqrtP)),
            '","hodlValue":"',
            vm.toString(_hodl(sqrtP)),
            '","vanillaLpValue":"',
            vm.toString(hook.totalAssets()),
            '"'
        );
        string memory b = string.concat(
            ',"seniorNav":"',
            vm.toString(hook.seniorNav()),
            '","juniorNav":"',
            vm.toString(hook.juniorNav()),
            '","seniorNavPerShare":"',
            vm.toString(_nps(hook.senior(), hook.seniorNav())),
            '","juniorNavPerShare":"',
            vm.toString(_nps(hook.junior(), hook.juniorNav())),
            '","realizedVarWad":"',
            vm.toString(hook.sigma2Ewma()),
            '","couponRateWad":"',
            vm.toString(hook.seniorRate()),
            '"}'
        );
        return string.concat(a, b);
    }

    function _printEpoch(uint256 epochIdx) internal view {
        console2.log(
            string.concat(
                vm.toString(epochIdx),
                " | ",
                vm.toString(_hodl(_sqrtPrice()) / 1e18),
                " | ",
                vm.toString(hook.totalAssets() / 1e18)
            ),
            string.concat(" | ", vm.toString(hook.seniorNav() / 1e18), " | ", vm.toString(hook.juniorNav() / 1e18))
        );
    }
}
