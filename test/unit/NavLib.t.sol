// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {NavLib} from "src/libraries/NavLib.sol";
import {FixedPoint96} from "v4-core/src/libraries/FixedPoint96.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

/// @notice Pure-valuation unit tests for NavLib (brief §3.5 step-1 mark-to-market primitives).
/// The stateful `totalAssets(manager,…)` orchestrator is covered in Phase-1 hook integration tests.
contract NavLibTest is Test {
    uint160 internal constant Q96 = uint160(FixedPoint96.Q96); // 2^96 = sqrtPrice of price 1

    //*//////////////////////////////////////////////////////////////////////////
    //                              FULL-RANGE BOUNDS
    //////////////////////////////////////////////////////////////////////////*//

    // tickSpacing 60 (0.30% fee tier) → usable bounds are tickSpacing-aligned, not raw MIN/MAX
    function test_fullRangeBounds_tickSpacing60() public pure {
        (int24 tl, int24 tu, uint160 sl, uint160 su) = NavLib.fullRangeBounds(60);
        assertEq(tl, -887220);
        assertEq(tu, 887220);
        assertEq(sl, TickMath.getSqrtPriceAtTick(-887220));
        assertEq(su, TickMath.getSqrtPriceAtTick(887220));
    }

    // tickSpacing 1 → bounds equal raw MIN/MAX tick
    function test_fullRangeBounds_tickSpacing1() public pure {
        (int24 tl, int24 tu,,) = NavLib.fullRangeBounds(1);
        assertEq(tl, TickMath.MIN_TICK);
        assertEq(tu, TickMath.MAX_TICK);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                          DECIMAL NORMALIZATION
    //////////////////////////////////////////////////////////////////////////*//

    function test_toWad_18decimals_identity() public pure {
        assertEq(NavLib.toWad(123e18, 18), 123e18);
    }

    function test_toWad_6decimals_upscaleExact() public pure {
        assertEq(NavLib.toWad(123e6, 6), 123e18); // USDC ×1e12, no wei loss
    }

    function test_toWad_24decimals_downscaleFloors() public pure {
        assertEq(NavLib.toWad(1e24 + 7, 24), 1e18); // 7 sub-units floored away
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                          VALUE IN NUMERAIRE
    //////////////////////////////////////////////////////////////////////////*//

    // price 1:1, token1 numeraire → A = amount0 + amount1
    function test_value_price1_token1Numeraire() public pure {
        assertEq(NavLib.valueInNumeraire(1e18, 1e18, Q96, true, 18, 18), 2e18);
    }

    // price 1:1, token0 numeraire → symmetric, A = amount0 + amount1
    function test_value_price1_token0Numeraire() public pure {
        assertEq(NavLib.valueInNumeraire(1e18, 1e18, Q96, false, 18, 18), 2e18);
    }

    // price 4 (sqrtP = 2·Q96): token0 worth 4 token1 each
    function test_value_price4_token1Numeraire() public pure {
        uint160 sqrtP = 2 * Q96;
        // 4·amount0 (in token1) + amount1 = 4e18 + 1e18
        assertEq(NavLib.valueInNumeraire(1e18, 1e18, sqrtP, true, 18, 18), 5e18);
    }

    // price 4, token0 numeraire: token1 worth 1/4 token0
    function test_value_price4_token0Numeraire() public pure {
        uint160 sqrtP = 2 * Q96;
        // amount0 + amount1/4 = 1e18 + 0.25e18
        assertEq(NavLib.valueInNumeraire(1e18, 1e18, sqrtP, false, 18, 18), 1.25e18);
    }

    // numeraire decimals are chosen INTERNALLY from the flag (anti ETH/USDC ordering bug, §7):
    // token1 numeraire → uses decimals1
    function test_value_picksNumeraireDecimals1() public pure {
        // only token1 (USDC 6dec) present → 5e6 raw → WAD 5e18
        assertEq(NavLib.valueInNumeraire(0, 5e6, Q96, true, 18, 6), 5e18);
    }

    // token0 numeraire → uses decimals0
    function test_value_picksNumeraireDecimals0() public pure {
        // only token0 (USDC 6dec) present → 5e6 raw → WAD 5e18
        assertEq(NavLib.valueInNumeraire(5e6, 0, Q96, false, 6, 18), 5e18);
    }

    // monotonic: with token1 as numeraire, a higher price raises A (token0 worth more)
    function testFuzz_value_priceUpRaisesNav_token1Numeraire(uint256 amount0) public pure {
        amount0 = bound(amount0, 1, 1e30);
        uint256 low = NavLib.valueInNumeraire(amount0, 0, Q96, true, 18, 18);
        uint256 high = NavLib.valueInNumeraire(amount0, 0, 2 * Q96, true, 18, 18);
        assertGe(high, low);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                       LIQUIDITY → TOKEN AMOUNTS
    //////////////////////////////////////////////////////////////////////////*//

    // zero liquidity → (0,0): a position with no liquidity is valued purely by fees + idle
    function test_getPositionTokenAmounts_zeroLiquidity() public pure {
        (,, uint160 sl, uint160 su) = NavLib.fullRangeBounds(60);
        uint160 mid = TickMath.getSqrtPriceAtTick(0);
        (uint256 a0, uint256 a1) = NavLib.getPositionTokenAmounts(mid, sl, su, 0);
        assertEq(a0, 0);
        assertEq(a1, 0);
    }

    // in-range full-range position at price 1 holds both tokens
    function test_getPositionTokenAmounts_inRange_holdsBoth() public pure {
        (,, uint160 sl, uint160 su) = NavLib.fullRangeBounds(60);
        uint160 mid = TickMath.getSqrtPriceAtTick(0); // price 1
        (uint256 a0, uint256 a1) = NavLib.getPositionTokenAmounts(mid, sl, su, 1e18);
        assertGt(a0, 0);
        assertGt(a1, 0);
    }
}
