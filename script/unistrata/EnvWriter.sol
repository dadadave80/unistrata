// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Vm} from "forge-std/Vm.sol";

/// @title EnvWriter
/// @notice Idempotent `.env` writer for deploy scripts: `upsert(path, KEY, value)` replaces the line
///         for KEY (or appends it) while preserving every other line. Because `forge` auto-loads
///         `.env` at startup, a later script reads what an earlier one wrote — no manual copy-paste.
/// @dev Requires `fs_permissions` write access to the target path. Re-running a script overwrites its
///      own key rather than appending a duplicate (which `dotenvy` would resolve ambiguously).
library EnvWriter {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function upsert(string memory path, string memory key, string memory value) internal {
        string memory prefix = string.concat(key, "=");
        string memory out = "";

        if (vm.exists(path)) {
            string[] memory lines = _split(vm.readFile(path));
            for (uint256 i; i < lines.length; ++i) {
                if (bytes(lines[i]).length == 0) continue; // drop blanks
                if (_startsWith(lines[i], prefix)) continue; // drop the stale key
                out = string.concat(out, lines[i], "\n");
            }
        }

        out = string.concat(out, prefix, value, "\n");
        vm.writeFile(path, out);
    }

    function _split(string memory s) private pure returns (string[] memory parts) {
        bytes memory b = bytes(s);
        uint256 count = 1;
        for (uint256 i; i < b.length; ++i) {
            if (b[i] == 0x0a) ++count; // '\n'
        }
        parts = new string[](count);
        uint256 p;
        uint256 start;
        for (uint256 i; i < b.length; ++i) {
            if (b[i] == 0x0a) {
                parts[p++] = _slice(b, start, i);
                start = i + 1;
            }
        }
        parts[p] = _slice(b, start, b.length);
    }

    function _slice(bytes memory b, uint256 start, uint256 end) private pure returns (string memory) {
        bytes memory out = new bytes(end - start);
        for (uint256 i; i < out.length; ++i) {
            out[i] = b[start + i];
        }
        return string(out);
    }

    function _startsWith(string memory s, string memory prefix) private pure returns (bool) {
        bytes memory b = bytes(s);
        bytes memory p = bytes(prefix);
        if (b.length < p.length) return false;
        for (uint256 i; i < p.length; ++i) {
            if (b[i] != p[i]) return false;
        }
        return true;
    }
}
