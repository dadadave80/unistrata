// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IUniswapV4Router04} from "hookmate/interfaces/router/IUniswapV4Router04.sol";

import {StrataHook} from "src/StrataHook.sol";

/// @notice Stateful-invariant handler: random deposits, swaps, and settlements. Conservation and
/// seniority are asserted as post-settle conditions here; stateless invariants live in the test.
contract StrataHandler is Test {
    StrataHook public hook;
    PoolKey internal poolKey;
    IUniswapV4Router04 internal swapRouter;
    Currency internal c0;
    Currency internal c1;

    uint256 public settleCount;
    uint256 public ghostLastSeniorNps; // senior NAV/share at the previous settlement

    constructor(StrataHook _hook, PoolKey memory _poolKey, IUniswapV4Router04 _router, Currency _c0, Currency _c1) {
        hook = _hook;
        poolKey = _poolKey;
        swapRouter = _router;
        c0 = _c0;
        c1 = _c1;

        MockERC20(Currency.unwrap(c0)).mint(address(this), 1_000_000e18);
        MockERC20(Currency.unwrap(c1)).mint(address(this), 1_000_000e18);
        MockERC20(Currency.unwrap(c0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(c1)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(c0)).approve(address(swapRouter), type(uint256).max);
        MockERC20(Currency.unwrap(c1)).approve(address(swapRouter), type(uint256).max);
    }

    function depositJunior(uint256 amt) public {
        amt = bound(amt, 1e18, 5_000e18);
        try hook.deposit(false, amt, amt) {} catch {}
    }

    function depositSenior(uint256 amt) public {
        if (hook.juniorNav() == 0) return; // senior needs junior coverage
        uint256 cap = hook.seniorCapacityRemaining();
        if (cap < 2e18) return;
        amt = bound(amt, 1e18, cap / 2 + 1e18); // stay under the attachment cap (value ≈ 2·amt)
        try hook.deposit(true, amt, amt) {} catch {}
    }

    function swap(uint256 amt, bool zeroForOne) public {
        vm.roll(block.number + 1);
        amt = bound(amt, 0.1e18, 50e18);
        try swapRouter.swapExactTokensForTokens(amt, 0, zeroForOne, poolKey, "", address(this), block.timestamp) {}
            catch {}
    }

    function settle(uint256 warpBy) public {
        // permissionless settleEpoch() requires epoch + grace to have elapsed
        uint256 floor = uint256(hook.epochDuration()) + uint256(hook.gracePeriod()) + 1;
        warpBy = bound(warpBy, floor, floor * 3);
        vm.warp(block.timestamp + warpBy);
        try hook.settleEpoch() {
            settleCount++;
            // post-settle conservation (inv. 1): tranche NAVs sum to marked assets within dust
            assertApproxEqAbs(hook.seniorNav() + hook.juniorNav(), hook.totalAssets(), 1e7, "conservation");
            // post-settle seniority (inv. 2): senior NAV/share non-decreasing while junior has coverage
            uint256 sSupply = hook.senior().totalSupply();
            if (sSupply > 0 && hook.juniorNav() > 0) {
                uint256 nps = hook.seniorNav() * 1e18 / sSupply;
                if (ghostLastSeniorNps != 0) {
                    assertGe(nps + 2, ghostLastSeniorNps, "seniority"); // ≤2 wei rounding slack
                }
                ghostLastSeniorNps = nps;
            }
        } catch {}
    }
}
