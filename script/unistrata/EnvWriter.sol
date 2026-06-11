// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Vm} from "forge-std/Vm.sol";

/// @title EnvWriter
/// @notice Idempotent `.env` writer for deploy scripts: `upsert(path, KEY, value)` replaces the line
///         for KEY (or appends it) while preserving every other line. Because `forge` auto-loads
///         `.env` at startup, a later script reads what an earlier one wrote — no manual copy-paste.
/// @dev Requires `fs_permissions` write access to the target path. Re-running a script overwrites its
///      own key rather than appending a duplicate (which `dotenvy` would resolve ambiguously). String
///      handling uses the forge `vm` string cheatcodes (`split`, `indexOf`) instead of hand-rolled bytes.
library EnvWriter {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function upsert(string memory path, string memory key, string memory value) internal {
        string memory prefix = string.concat(key, "=");
        string memory out = "";

        if (vm.exists(path)) {
            string[] memory lines = vm.split(vm.readFile(path), "\n");
            for (uint256 i; i < lines.length; ++i) {
                if (bytes(lines[i]).length == 0) continue; // drop blanks
                if (vm.indexOf(lines[i], prefix) == 0) continue; // drop the stale "KEY=" line (prefix at index 0)
                out = string.concat(out, lines[i], "\n");
            }
        }

        out = string.concat(out, prefix, value, "\n");
        vm.writeFile(path, out);
    }
}
