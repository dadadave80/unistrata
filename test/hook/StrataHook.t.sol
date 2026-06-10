// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {ModifyLiquidityParams} from "v4-core/src/types/PoolOperation.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {StrataHook} from "src/StrataHook.sol";

/// @notice Phase-1 foundation tests for StrataHook: construction, permissions, pool binding,
/// variance seeding, and the external-LP guard. Deposit/settlement come in later slices.
contract StrataHookFoundationTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;

    // flag bits this hook needs: afterInitialize, afterSwap, beforeAddLiquidity
    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5550 << 144)
    );

    function _defaultConfig() internal pure returns (StrataHook.Config memory) {
        return StrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
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

        bytes memory args = abi.encode(poolManager, _defaultConfig());
        deployCodeTo("StrataHook.sol:StrataHook", args, HOOK_FLAGS);
        hook = StrataHook(HOOK_FLAGS);

        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
    }

    function test_construction_deploysTrancheTokens() public view {
        assertEq(hook.senior().symbol(), "sSTR");
        assertEq(hook.junior().symbol(), "jSTR");
        assertEq(hook.senior().hook(), address(hook));
        assertEq(hook.junior().hook(), address(hook));
        assertEq(hook.senior().decimals(), 18);
    }

    function test_getHookPermissions_correctFlags() public view {
        Hooks.Permissions memory p = hook.getHookPermissions();
        assertTrue(p.afterInitialize);
        assertTrue(p.afterSwap);
        assertTrue(p.beforeAddLiquidity);
        assertFalse(p.beforeSwap);
        assertFalse(p.afterAddLiquidity);
        assertFalse(p.beforeInitialize);
    }

    function test_afterInitialize_bindsPoolAndSeedsVariance() public {
        assertFalse(hook.poolInitialized());
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);
        assertTrue(hook.poolInitialized());
        // SQRT_PRICE_1_1 → tick 0; variance pair seeded to (current block, tick 0)
        assertEq(hook.lastObservedTick(), int24(0));
        assertEq(hook.lastObservedBlock(), uint48(block.number));
        assertEq(hook.varAcc(), 0);
    }

    function test_afterInitialize_RevertWhen_secondPool() public {
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);
        // a second pool keyed to the same hook must be rejected (single-pool vault)
        PoolKey memory other = PoolKey(currency0, currency1, 500, 10, IHooks(hook));
        vm.expectRevert();
        poolManager.initialize(other, Constants.SQRT_PRICE_1_1);
    }

    // the external-LP guard: only the hook itself may add liquidity (called via the PoolManager)
    function test_beforeAddLiquidity_RevertWhen_externalCaller() public {
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);
        ModifyLiquidityParams memory params =
            ModifyLiquidityParams({tickLower: -887220, tickUpper: 887220, liquidityDelta: 1e18, salt: 0});
        vm.prank(address(poolManager));
        vm.expectRevert(StrataHook.StrataHook__OnlyHookLiquidity.selector);
        hook.beforeAddLiquidity(address(0xBEEF), poolKey, params, "");
    }

    // the hook itself adding liquidity passes the guard
    function test_beforeAddLiquidity_allowsHookItself() public {
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);
        ModifyLiquidityParams memory params =
            ModifyLiquidityParams({tickLower: -887220, tickUpper: 887220, liquidityDelta: 1e18, salt: 0});
        vm.prank(address(poolManager));
        bytes4 sel = hook.beforeAddLiquidity(address(hook), poolKey, params, "");
        assertEq(sel, hook.beforeAddLiquidity.selector);
    }
}
