// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {StrataHook} from "src/StrataHook.sol";

/// @notice Phase-2 afterSwap variance wiring: per-block sampling, once-per-block, cap binding, event.
contract StrataVarianceTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;

    address internal alice = makeAddr("alice");
    uint24 internal constant DCAP = 1000;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5552 << 144)
    );

    function _cfg() internal pure returns (StrataHook.Config memory) {
        return StrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: DCAP,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272,
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

        // alice seeds hook-owned liquidity
        MockERC20(Currency.unwrap(currency0)).mint(alice, 10_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 10_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 500e18, 500e18); // junior, seeds liquidity
        vm.stopPrank();
    }

    function _swap(uint256 amountIn, bool zeroForOne) internal {
        swapRouter.swapExactTokensForTokens(amountIn, 0, zeroForOne, poolKey, "", address(this), block.timestamp);
    }

    // a swap in the same block as the seed does not count (block == lastObservedBlock)
    function test_afterSwap_sameBlockAsSeed_noObservation() public {
        assertEq(hook.varAcc(), 0);
        _swap(10e18, true);
        assertEq(hook.varAcc(), 0);
    }

    // one observation per new block: a second same-block swap does not accumulate
    function test_afterSwap_accumulatesOncePerBlock() public {
        vm.roll(block.number + 1);
        _swap(10e18, true);
        uint256 v1 = hook.varAcc();
        assertGt(v1, 0);
        assertEq(hook.lastObservedBlock(), uint48(block.number));

        _swap(10e18, true); // same block → no-op
        assertEq(hook.varAcc(), v1);

        vm.roll(block.number + 1);
        _swap(10e18, false); // new block, opposite direction → accumulates
        assertGt(hook.varAcc(), v1);
    }

    // a large cross-block move is clamped to dCap² (manipulation ceiling)
    function test_afterSwap_capBinds_onLargeMove() public {
        vm.roll(block.number + 1);
        _swap(200e18, true); // ~40% of reserves → tick move ≫ 1000
        assertEq(hook.varAcc(), uint256(DCAP) * DCAP); // exactly the cap, 1e6
    }

    // StrataObservation is emitted on a new-block observation (the Reactive trigger)
    function test_afterSwap_emitsObservation() public {
        vm.roll(block.number + 1);
        vm.expectEmit(false, false, false, false, address(hook));
        emit StrataHook.StrataObservation(0, 0);
        _swap(10e18, true);
    }

    // varAcc never exceeds the per-block cap bound across a multi-block path (invariant 5 building block)
    function test_afterSwap_boundedAcrossBlocks() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.roll(block.number + 1);
            _swap(5e18, i % 2 == 0);
        }
        // 5 counted blocks, each ≤ dCap² → varAcc ≤ 5·dCap²
        assertLe(hook.varAcc(), 5 * uint256(DCAP) * DCAP);
    }
}
