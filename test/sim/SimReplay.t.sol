// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/console2.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {SimSwapper} from "./SimSwapper.sol";
import {StrataHook} from "src/StrataHook.sol";
import {TrancheToken} from "src/TrancheToken.sol";
import {NavLib} from "src/libraries/NavLib.sol";

/// @notice Phase-5 simulation harness: replays a JSON price path (sim/paths/<scenario>.json) as real
/// swaps against a local Strata pool, settles epochs on schedule, and exports per-epoch metrics to
/// sim/out/<scenario>.json — the "money chart" data, and the Phase-6 frontend contract.
///
/// Output schema (sim/out/<scenario>.json):
///   { "scenario": string,
///     "epochs": [ {
///        "epoch": uint,             // epoch index
///        "tick": int,               // pool tick at epoch end
///        "priceWad": string,        // token1-per-token0 price, WAD
///        "hodlValue": string,       // WAD — initially-deposited tokens marked at current price
///        "vanillaLpValue": string,  // WAD — full-range position value (an untranched LP); the IL line
///        "seniorNav": string,       // WAD — protected tranche total
///        "juniorNav": string,       // WAD — vol-underwriting tranche total (= vanillaLp − senior)
///        "seniorNavPerShare": string, "juniorNavPerShare": string,
///        "realizedVarWad": string,  // WAD — sigma2Ewma
///        "couponRateWad": string    // WAD APR — seniorRate
///   } ] }
/// All economic values are WAD-integer strings (frontend parses) to avoid JSON number precision loss.
contract SimReplayTest is BaseTest {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;
    SimSwapper internal swapper;

    address internal alice = makeAddr("alice");
    uint256 internal constant HODL0 = 800e18; // alice's total deposit basis (junior 500 + senior 300)
    uint256 internal constant HODL1 = 800e18;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5557 << 144)
    );

    function _cfg() internal pure returns (StrataHook.Config memory) {
        return StrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272, // wide: the sim isn't testing the guard
            lambdaRisk: 1.25e18,
            rMin: 0,
            rMax: 0.5e18,
            lambdaSmoothing: 0.3e18,
            thetaMax: 0.75e18
        });
    }

    function setUp() public {
        deployArtifactsAndLabel();
        (currency0, currency1) = deployCurrencyPair();
        deployCodeTo("StrataHook.sol:StrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = StrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        MockERC20(Currency.unwrap(currency0)).mint(alice, 100_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 100_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 500e18, 500e18); // junior coverage
        hook.deposit(true, 300e18, 300e18); // senior within cap
        vm.stopPrank();

        swapper = new SimSwapper(poolManager);
        MockERC20(Currency.unwrap(currency0)).mint(address(swapper), 10_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(address(swapper), 10_000_000e18);
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

        console2.log("=== Strata sim:", scenario, "===");
        console2.log("epoch | hodl | vanillaLP | senior | junior  (WAD/1e18)");

        string memory epochs = "";
        uint256 epochCount;
        uint256 prevSenior = hook.seniorNav();
        for (uint256 i; i < ticks.length; ++i) {
            vm.roll(block.number + 1);
            swapper.swapToPrice(poolKey, TickMath.getSqrtPriceAtTick(int24(ticks[i])));

            if ((i + 1) % stepsPerEpoch == 0) {
                vm.warp(block.timestamp + 1 days + 1 hours + 1);
                hook.settleEpoch();

                // the mechanism's guarantees hold under a realistic replayed path:
                uint256 s = hook.seniorNav();
                assertApproxEqAbs(s + hook.juniorNav(), hook.totalAssets(), 1e12, "conservation");
                if (hook.juniorNav() > 0) assertGe(s, prevSenior, "senior protected while junior has coverage");
                prevSenior = s;

                string memory e = _epochJson(epochCount, ticks[i]);
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

    function _priceWad(uint160 sqrtP) internal pure returns (uint256) {
        return NavLib.valueInNumeraire(1e18, 0, sqrtP, true, 18, 18);
    }

    function _hodl(uint160 sqrtP) internal pure returns (uint256) {
        return NavLib.valueInNumeraire(HODL0, HODL1, sqrtP, true, 18, 18);
    }

    function _nps(TrancheToken token, uint256 nav) internal view returns (uint256) {
        uint256 supply = token.totalSupply();
        return supply == 0 ? 0 : nav * 1e18 / supply;
    }

    function _epochJson(uint256 epochIdx, int256 tick) internal view returns (string memory) {
        uint160 sqrtP = _sqrtPrice();
        string memory a = string.concat(
            '{"epoch":',
            vm.toString(epochIdx),
            ',"tick":',
            vm.toString(tick),
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
