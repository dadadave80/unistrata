// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {EnvWriter} from "../../script/unistrata/EnvWriter.sol";
import {Test} from "forge-std/Test.sol";

/// @notice Validates the deploy scripts' `.env` upsert: create, append, idempotent replace, and
/// preservation of unrelated lines (comments, RPC config). Each test uses its own temp file under
/// sim/ (writable) — Foundry runs tests in parallel, so a shared path would race.
contract EnvWriterTest is Test {
    function _fresh(string memory path) internal {
        if (vm.exists(path)) vm.removeFile(path);
    }

    function test_upsert_createAppendReplace() public {
        string memory path = "sim/out/_envtest_a";
        _fresh(path);

        EnvWriter.upsert(path, "FOO", "1");
        assertEq(vm.readFile(path), "FOO=1\n");

        EnvWriter.upsert(path, "BAR", "0xabc");
        assertEq(vm.readFile(path), "FOO=1\nBAR=0xabc\n");

        // re-upsert FOO: stale line dropped, others kept, new value appended (no duplicate)
        EnvWriter.upsert(path, "FOO", "2");
        assertEq(vm.readFile(path), "BAR=0xabc\nFOO=2\n");

        vm.removeFile(path);
    }

    function test_upsert_preservesCommentsAndOtherKeys() public {
        string memory path = "sim/out/_envtest_b";
        _fresh(path);

        vm.writeFile(path, "# rpc config\nUNICHAIN_SEPOLIA_URL=https://example\n");
        EnvWriter.upsert(path, "UNISTRATA_HOOK", "0xHOOK");
        assertEq(vm.readFile(path), "# rpc config\nUNICHAIN_SEPOLIA_URL=https://example\nUNISTRATA_HOOK=0xHOOK\n");

        vm.removeFile(path);
    }
}
