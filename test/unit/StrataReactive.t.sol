// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {IReactive} from "reactive-lib/interfaces/IReactive.sol";
import {StrataReactive} from "src/reactive/StrataReactive.sol";

/// @notice Unit tests for the RSC's react() dispatch: CRON heartbeat → settleEpoch, variance spike →
/// emergencySettle. Deployed locally (no system contract ⇒ vm==true ⇒ subscriptions skipped, react callable).
contract StrataReactiveTest is Test {
    StrataReactive internal rsc;

    uint256 internal constant ORIGIN_CHAIN = 1301; // Unichain Sepolia
    address internal constant HOOK = address(0x57A7A);
    uint256 internal constant CRON_TOPIC = 0xb49937fb8970e19fd46d48f7e3fb00d659deac0347f79cd7cb542f0fc1503c70; // Cron100
    uint256 internal constant TICKS_PER_EPOCH = 3;
    uint256 internal constant SPIKE_THRESHOLD = 1e6;
    uint64 internal constant GAS_LIMIT = 1_000_000;

    bytes32 internal constant CALLBACK_SIG = keccak256("Callback(uint256,address,uint64,bytes)");

    function setUp() public {
        rsc = new StrataReactive(ORIGIN_CHAIN, HOOK, CRON_TOPIC, TICKS_PER_EPOCH, SPIKE_THRESHOLD, GAS_LIMIT);
    }

    function _cronLog() internal pure returns (IReactive.LogRecord memory log) {
        log.topic_0 = CRON_TOPIC;
    }

    function _obsLog(uint256 varAcc) internal view returns (IReactive.LogRecord memory log) {
        log.chain_id = ORIGIN_CHAIN;
        log._contract = HOOK;
        log.topic_0 = rsc.STRATA_OBSERVATION_TOPIC();
        log.data = abi.encode(int24(100), varAcc);
    }

    /// @dev Collect the payloads of all Callback events emitted in the recorded logs.
    function _callbackPayloads(Vm.Log[] memory logs) internal pure returns (bytes[] memory payloads) {
        uint256 n;
        for (uint256 i; i < logs.length; ++i) {
            if (logs[i].topics[0] == CALLBACK_SIG) n++;
        }
        payloads = new bytes[](n);
        uint256 k;
        for (uint256 i; i < logs.length; ++i) {
            if (logs[i].topics[0] == CALLBACK_SIG) payloads[k++] = abi.decode(logs[i].data, (bytes));
        }
    }

    function _react(IReactive.LogRecord memory log) internal returns (bytes[] memory) {
        vm.recordLogs();
        rsc.react(log);
        return _callbackPayloads(vm.getRecordedLogs());
    }

    // heartbeat fires settleEpoch only on the ticksPerEpoch-th CRON tick
    function test_heartbeat_firesOncePerEpoch() public {
        assertEq(_react(_cronLog()).length, 0); // tick 1
        assertEq(_react(_cronLog()).length, 0); // tick 2
        bytes[] memory cbs = _react(_cronLog()); // tick 3 → fire
        assertEq(cbs.length, 1);
        assertEq(cbs[0], abi.encodeWithSignature("settleEpoch(address)", address(0)));
        assertEq(rsc.cronTicks(), 0); // counter reset
    }

    // a variance spike past the threshold fires emergencySettle
    function test_spike_firesEmergencySettle() public {
        bytes[] memory cbs = _react(_obsLog(2 * SPIKE_THRESHOLD));
        assertEq(cbs.length, 1);
        assertEq(cbs[0], abi.encodeWithSignature("emergencySettle(address)", address(0)));
        assertEq(rsc.lastSpikeVarAcc(), 2 * SPIKE_THRESHOLD);
    }

    // an observation below the threshold does not fire
    function test_observation_belowThreshold_noCallback() public {
        assertEq(_react(_obsLog(SPIKE_THRESHOLD - 1)).length, 0);
    }

    // the spike trigger re-arms: a second spike requires another threshold of variance
    function test_spike_reArmsAfterFiring() public {
        _react(_obsLog(SPIKE_THRESHOLD)); // fires, lastSpikeVarAcc = 1e6
        assertEq(_react(_obsLog(SPIKE_THRESHOLD + 100)).length, 0); // only +100 since → no fire
        assertEq(_react(_obsLog(2 * SPIKE_THRESHOLD + 1)).length, 1); // crosses again → fire
    }

    // an emergency settle resets the CRON counter so the heartbeat stays in sync
    function test_spike_resetsCronCounter() public {
        _react(_cronLog()); // cronTicks = 1
        assertEq(rsc.cronTicks(), 1);
        _react(_obsLog(2 * SPIKE_THRESHOLD)); // emergency → reset
        assertEq(rsc.cronTicks(), 0);
    }

    // an unrelated topic is ignored
    function test_unknownTopic_ignored() public {
        IReactive.LogRecord memory log;
        log.topic_0 = uint256(keccak256("SomethingElse()"));
        assertEq(_react(log).length, 0);
    }

    // subscribeAll (the owner-only on-chain retry) rejects non-owners before touching the system contract
    function test_subscribeAll_revertsForNonOwner() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert(StrataReactive.StrataReactive__NotOwner.selector);
        rsc.subscribeAll();
    }

    // the owner may call subscribeAll; locally vm==true so it short-circuits to a no-op (no revert)
    function test_subscribeAll_ownerNoopInVm() public {
        rsc.subscribeAll(); // address(this) deployed rsc in setUp ⇒ owner; vm==true ⇒ early return
    }
}
