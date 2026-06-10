// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {AbstractReactive} from "reactive-lib/abstract-base/AbstractReactive.sol";

/// @title StrataReactive
/// @author David Dada (https://github.com/dadadave80)
/// @notice Reactive Smart Contract (deployed on Reactive Network / Lasna) that automates Strata's
///         epoch settlement with zero off-chain infrastructure (brief §3.7):
///         1. a CRON heartbeat → `settleEpoch(address)` once per epoch;
///         2. the hook's `StrataObservation` → `emergencySettle(address)` on a variance spike.
/// @dev The system contract resolves its implementation via the node-only precompile at `0x64`
///      (reactive-lib `SystemLib.getSystemContractImpl`), which does NOT exist in Foundry's local EVM —
///      so `service.subscribe()` reverts "Failure" during `forge script`'s local execution, yet works
///      on a real Lasna node. The constructor therefore wraps each subscription in try/catch (emitting
///      {SubscribeFailed} on a caught revert) so a single `forge script --broadcast` can deploy AND
///      subscribe: the catch only triggers in local simulation, while the broadcast tx subscribes
///      on-chain. {subscribeAll} is an owner-only retry that does NOT swallow reverts.
/// @custom:security-contact daveproxy80@gmail.com
/// @custom:security-contact Discord: daveproxy80
contract StrataReactive is AbstractReactive {
    error StrataReactive__NotOwner();

    /// @notice Emitted when a subscription reverts — always in local sim (no 0x64), on-chain only on real failure.
    event SubscribeFailed(uint256 chainId, address contractAddr, uint256 topic0);

    /// @dev topic_0 of `StrataHook.StrataObservation(int24,uint256)` (both args non-indexed → in data).
    uint256 public constant STRATA_OBSERVATION_TOPIC = uint256(keccak256("StrataObservation(int24,uint256)"));

    address public immutable owner;
    uint256 public immutable originChainId;
    address public immutable strataHook;
    uint256 public immutable cronTopic;
    uint256 public immutable ticksPerEpoch;
    uint256 public immutable spikeThreshold;
    uint64 public immutable callbackGasLimit;

    // --- ReactVM state ---
    uint256 public cronTicks;
    uint256 public lastSpikeVarAcc;

    constructor(
        uint256 _originChainId,
        address _strataHook,
        uint256 _cronTopic,
        uint256 _ticksPerEpoch,
        uint256 _spikeThreshold,
        uint64 _callbackGasLimit
    ) {
        owner = msg.sender;
        originChainId = _originChainId;
        strataHook = _strataHook;
        cronTopic = _cronTopic;
        ticksPerEpoch = _ticksPerEpoch;
        spikeThreshold = _spikeThreshold;
        callbackGasLimit = _callbackGasLimit;

        if (!vm) {
            // CRON heartbeat (on the Reactive chain) + StrataObservation (on the origin chain).
            // try/catch so forge-script's local sim (no 0x64 precompile) doesn't abort; both take
            // effect on-chain in the same deploy tx.
            _trySubscribe(block.chainid, address(service), _cronTopic);
            _trySubscribe(_originChainId, _strataHook, STRATA_OBSERVATION_TOPIC);
        }
    }

    /// @dev Subscribe, swallowing a revert (emitting {SubscribeFailed}) so constructor-time subscription
    ///      survives forge-script local simulation. A successful on-chain subscription emits no event.
    function _trySubscribe(uint256 chainId, address contractAddr, uint256 topic0) internal {
        try service.subscribe(chainId, contractAddr, topic0, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE) {}
        catch {
            emit SubscribeFailed(chainId, contractAddr, topic0);
        }
    }

    /// @notice Owner-only retry of both subscriptions WITHOUT swallowing reverts — call on-chain (e.g.
    ///         `cast send`) if a SubscribeFailed event fired on deploy and you need the real revert reason.
    function subscribeAll() external {
        if (msg.sender != owner) revert StrataReactive__NotOwner();
        if (vm) return;
        service.subscribe(block.chainid, address(service), cronTopic, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE);
        service.subscribe(
            originChainId, strataHook, STRATA_OBSERVATION_TOPIC, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE
        );
    }

    /// @notice ReactVM entry point: dispatch CRON heartbeats and StrataObservation events.
    function react(LogRecord calldata log) external vmOnly {
        if (log.topic_0 == cronTopic) {
            _onHeartbeat();
        } else if (log.topic_0 == STRATA_OBSERVATION_TOPIC) {
            _onObservation(log.data);
        }
    }

    /// @dev Fire a scheduled settlement once per `ticksPerEpoch` CRON ticks.
    function _onHeartbeat() internal {
        if (++cronTicks >= ticksPerEpoch) {
            cronTicks = 0;
            _emitCallback("settleEpoch(address)");
        }
    }

    /// @dev Fire an early settlement when cumulative realized variance jumps past the spike threshold.
    function _onObservation(bytes memory data) internal {
        (, uint256 varAcc) = abi.decode(data, (int24, uint256));
        if (varAcc - lastSpikeVarAcc >= spikeThreshold) {
            lastSpikeVarAcc = varAcc;
            cronTicks = 0; // the epoch rolls early → resync the heartbeat counter
            _emitCallback("emergencySettle(address)");
        }
    }

    /// @dev Emit the cross-chain callback request for the given hook entry point.
    function _emitCallback(string memory signature) internal {
        emit Callback(originChainId, strataHook, callbackGasLimit, abi.encodeWithSignature(signature, address(0)));
    }
}
