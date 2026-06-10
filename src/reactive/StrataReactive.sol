// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {AbstractReactive} from "reactive-lib/abstract-base/AbstractReactive.sol";

/// @title StrataReactive
/// @notice Reactive Smart Contract (deployed on Reactive Network / Lasna) that automates Strata's
///         epoch settlement with zero off-chain infrastructure (brief §3.7). It subscribes to two
///         event streams and reacts by emitting cross-chain callbacks to the origin-chain hook:
///         1. a CRON heartbeat → `settleEpoch(address)` once per epoch;
///         2. the hook's `StrataObservation` → `emergencySettle(address)` when realized variance
///            spikes past a threshold (the volatility circuit breaker).
/// @dev `react()` runs inside the ReactVM and accumulates state there. Subscriptions are registered
///      in the constructor only on the real Reactive Network (`!vm`); in the ReactVM (or local tests)
///      they are skipped. Callback payloads carry a placeholder `address(0)` that the Reactive
///      callback proxy replaces with the originating rvm-id.
/// @custom:security-contact daveproxy80@gmail.com
/// @custom:security-contact Discord: daveproxy80
contract StrataReactive is AbstractReactive {
    /// @dev topic_0 of `StrataHook.StrataObservation(int24,uint256)` (both args non-indexed → in data).
    uint256 public constant STRATA_OBSERVATION_TOPIC = uint256(keccak256("StrataObservation(int24,uint256)"));

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
        originChainId = _originChainId;
        strataHook = _strataHook;
        cronTopic = _cronTopic;
        ticksPerEpoch = _ticksPerEpoch;
        spikeThreshold = _spikeThreshold;
        callbackGasLimit = _callbackGasLimit;

        if (!vm) {
            // heartbeat: CRON event emitted by the Reactive system contract on the Reactive chain
            service.subscribe(
                block.chainid, address(service), _cronTopic, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE
            );
            // volatility: StrataObservation emitted by the hook on the origin chain
            service.subscribe(
                _originChainId, _strataHook, STRATA_OBSERVATION_TOPIC, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE
            );
        }
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
