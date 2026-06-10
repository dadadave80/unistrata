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
import {UnistrataHook} from "src/UnistrataHook.sol";

/// @notice Phase-4 hook-side auth: the Reactive callback proxy may settle on schedule
/// (settleEpoch(address)) or fire the early circuit breaker (emergencySettle(address)); a
/// permissionless fallback settles only after epoch + grace. rvm-id and sender are enforced.
contract UnistrataReactiveAuthTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    UnistrataHook internal hook;

    address internal alice = makeAddr("alice");
    address internal constant CALLBACK_PROXY = address(0xCA11);
    address internal rvmId; // the hook's stored rvm id == tx.origin at deploy (the deploying EOA)

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5556 << 144)
    );

    function _cfg() internal pure returns (UnistrataHook.Config memory) {
        return UnistrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
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
    }

    function setUp() public {
        deployArtifactsAndLabel();
        (currency0, currency1) = deployCurrencyPair();
        deployCodeTo("UnistrataHook.sol:UnistrataHook", abi.encode(poolManager, _cfg(), CALLBACK_PROXY), HOOK_FLAGS);
        hook = UnistrataHook(payable(HOOK_FLAGS));
        rvmId = tx.origin; // the ctor sets rvm_id = tx.origin (the deploying EOA / default sender in tests)

        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        MockERC20(Currency.unwrap(currency0)).mint(alice, 100_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 100_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 500e18, 500e18);
        hook.deposit(true, 300e18, 300e18);
        vm.stopPrank();
    }

    // the callback proxy settles on the heartbeat once the epoch elapses — BEFORE the grace window
    function test_settleEpochCallback_byProxy_settles() public {
        vm.warp(block.timestamp + 1 days + 1); // past epoch, before epoch+grace
        uint256 e0 = hook.epochId();
        vm.prank(CALLBACK_PROXY);
        hook.settleEpoch(rvmId);
        assertEq(hook.epochId(), e0 + 1);
    }

    function test_settleEpochCallback_RevertWhen_notAuthorizedSender() public {
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(makeAddr("stranger"));
        vm.expectRevert("Authorized sender only");
        hook.settleEpoch(rvmId);
    }

    function test_settleEpochCallback_RevertWhen_wrongRvmId() public {
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(CALLBACK_PROXY);
        vm.expectRevert("Authorized RVM ID only");
        hook.settleEpoch(makeAddr("wrongRvm"));
    }

    // the volatility circuit breaker settles EARLY — no epoch-elapsed requirement
    function test_emergencySettle_byProxy_earlySettles() public {
        uint256 e0 = hook.epochId();
        vm.expectEmit(true, false, false, false, address(hook));
        emit UnistrataHook.EmergencySettled(e0);
        vm.prank(CALLBACK_PROXY);
        hook.emergencySettle(rvmId);
        assertEq(hook.epochId(), e0 + 1); // settled despite the epoch not having elapsed
    }

    function test_emergencySettle_RevertWhen_notAuthorizedSender() public {
        vm.prank(makeAddr("stranger"));
        vm.expectRevert("Authorized sender only");
        hook.emergencySettle(rvmId);
    }

    // permissionless fallback is gated on epoch + grace
    function test_permissionlessSettle_RevertWhen_beforeGrace() public {
        vm.warp(block.timestamp + 1 days + 1); // epoch elapsed but grace not yet
        vm.expectRevert(UnistrataHook.UnistrataHook__EpochNotElapsed.selector);
        hook.settleEpoch();
    }

    function test_permissionlessSettle_afterGrace() public {
        vm.warp(block.timestamp + 1 days + 1 hours + 1);
        uint256 e0 = hook.epochId();
        hook.settleEpoch(); // anyone can call
        assertEq(hook.epochId(), e0 + 1);
    }
}
