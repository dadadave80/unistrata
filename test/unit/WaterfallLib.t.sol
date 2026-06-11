// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Test} from "forge-std/Test.sol";
import {WaterfallLib} from "src/libraries/WaterfallLib.sol";

/// @dev External wrapper so reverts in the inlined `internal pure` library surface at a
///      lower call depth, where `vm.expectRevert` can catch them.
contract WaterfallLibHarness {
    function couponRate(uint256 feeYieldEwma, uint256 sigma2Ewma, uint256 lambdaRisk, uint256 rMin, uint256 rMax)
        external
        pure
        returns (uint256)
    {
        return WaterfallLib.couponRate(feeYieldEwma, sigma2Ewma, lambdaRisk, rMin, rMax);
    }
}

/// @notice Pure-math unit tests for the bedrock/sediment settlement waterfall + coupon pricing.
/// Units: all rates are WAD (1e18) APR fractions; values are WAD numéraire amounts.
contract WaterfallLibTest is Test {
    uint256 internal constant WAD = 1e18;
    uint256 internal constant YEAR = 365 days;

    uint256 internal constant LAMBDA = 1.25e18; // λ_risk default
    uint256 internal constant R_MIN = 0;
    uint256 internal constant R_MAX = 0.5e18; // 50% APR default

    WaterfallLibHarness internal harness = new WaterfallLibHarness();

    //*//////////////////////////////////////////////////////////////////////////
    //                              COUPON PRICING
    //////////////////////////////////////////////////////////////////////////*//

    // r = clamp(feeYieldEwma − λ·σ²/8, rMin, rMax). λ=1.25, σ²=0.16, fee=0.10:
    // reserve = 1.25·0.16/8 = 0.025 → r = 0.10 − 0.025 = 0.075 (7.5% APR)
    function test_couponRate_feesExceedReserve() public pure {
        uint256 r = WaterfallLib.couponRate(0.1e18, 0.16e18, LAMBDA, R_MIN, R_MAX);
        assertEq(r, 0.075e18);
    }

    // reserve exceeds fee yield → raw negative → clamps to rMin (0)
    function test_couponRate_reserveExceedsFees_clampsToRMin() public pure {
        uint256 r = WaterfallLib.couponRate(0.01e18, 1.0e18, LAMBDA, R_MIN, R_MAX);
        assertEq(r, R_MIN);
    }

    // high fee yield, low variance → clamps to rMax
    function test_couponRate_clampsToRMax() public pure {
        uint256 r = WaterfallLib.couponRate(10e18, 0, LAMBDA, R_MIN, R_MAX);
        assertEq(r, R_MAX);
    }

    // when raw < rMin (>0), clamps up to rMin
    function test_couponRate_clampsUpToPositiveRMin() public pure {
        uint256 r = WaterfallLib.couponRate(0.005e18, 1.0e18, LAMBDA, 0.01e18, R_MAX);
        assertEq(r, 0.01e18);
    }

    // misconfigured bounds (rMin > rMax) revert — clamp would be ill-defined
    function test_couponRate_RevertWhen_InvalidRateBounds() public {
        vm.expectRevert(WaterfallLib.WaterfallLib__InvalidRateBounds.selector);
        harness.couponRate(0.1e18, 0, LAMBDA, 0.5e18, 0.1e18);
    }

    // σ² == 0 → no reserve → coupon is just the (clamped) fee yield
    function test_couponRate_zeroVariance_isClampedFeeYield() public pure {
        uint256 r = WaterfallLib.couponRate(0.2e18, 0, LAMBDA, R_MIN, R_MAX);
        assertEq(r, 0.2e18);
    }

    // reserve rounds UP (conservative coupon): pick values with a remainder.
    // λ·σ² with remainder in /8 → reserve rounds up by 1 wei → coupon 1 wei lower.
    function test_couponRate_reserveRoundsUp() public pure {
        // λ=1e18, σ²=1 (wei): λ·σ²/WAD = 1 (wei) via Ceil; /8 → ceil(1/8)=1.
        uint256 r = WaterfallLib.couponRate(10, 1, 1e18, R_MIN, R_MAX);
        // raw = 10 − 1 = 9
        assertEq(r, 9);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              BEDROCK TARGET
    //////////////////////////////////////////////////////////////////////////*//

    // sTarget = sPrev·(1 + r·Δt/yr) + deposits. 1000 @ 10% APR for a full year, no deposits.
    function test_bedrockTarget_fullYearAccrual() public pure {
        uint256 s = WaterfallLib.bedrockTarget(1000e18, 0.1e18, YEAR, 0);
        assertEq(s, 1100e18);
    }

    function test_bedrockTarget_halfYearAccrual() public pure {
        uint256 s = WaterfallLib.bedrockTarget(1000e18, 0.1e18, YEAR / 2, 0);
        assertEq(s, 1050e18);
    }

    // first epoch: sPrev == 0, growth 0, target = net bedrock deposits
    function test_bedrockTarget_firstEpoch_depositsOnly() public pure {
        uint256 s = WaterfallLib.bedrockTarget(0, 0.1e18, YEAR, 500e18);
        assertEq(s, 500e18);
    }

    function test_bedrockTarget_positiveNetDeposits() public pure {
        uint256 s = WaterfallLib.bedrockTarget(1000e18, 0.1e18, YEAR, 200e18);
        assertEq(s, 1300e18); // 1100 + 200
    }

    function test_bedrockTarget_negativeNetDeposits() public pure {
        uint256 s = WaterfallLib.bedrockTarget(1000e18, 0.1e18, YEAR, -200e18);
        assertEq(s, 900e18); // 1100 − 200
    }

    // net outflow larger than base floors at 0 (cannot go negative)
    function test_bedrockTarget_netDepositsBelowZero_floorsAtZero() public pure {
        uint256 s = WaterfallLib.bedrockTarget(100e18, 0, YEAR, -1000e18);
        assertEq(s, 0);
    }

    // coupon honesty: tiny accrual rounds DOWN to 0 — never over-credits the bedrock
    function test_bedrockTarget_subWeiAccrual_roundsDown() public pure {
        uint256 s = WaterfallLib.bedrockTarget(1e18, 1, 1, 0); // 1e18·1·1/(1e18·yr) = 0
        assertEq(s, 1e18);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                            WATERFALL SPLIT
    //////////////////////////////////////////////////////////////////////////*//

    // fees > coupon: bedrock gets target, sediment keeps the surplus
    function test_settle_feesExceedCoupon_sedimentGains() public pure {
        (uint256 sNew, uint256 jNew, bool impaired) = WaterfallLib.settle(1200e18, 1100e18);
        assertEq(sNew, 1100e18);
        assertEq(jNew, 100e18);
        assertFalse(impaired);
    }

    // IL partial sediment wipe: bedrock whole, sediment shrinks
    function test_settle_partialSedimentWipe() public pure {
        (uint256 sNew, uint256 jNew, bool impaired) = WaterfallLib.settle(1050e18, 1000e18);
        assertEq(sNew, 1000e18);
        assertEq(jNew, 50e18);
        assertFalse(impaired);
    }

    // full sediment wipe exactly at target: sediment 0, bedrock NOT impaired (A == target)
    function test_settle_fullSedimentWipe_notImpaired() public pure {
        (uint256 sNew, uint256 jNew, bool impaired) = WaterfallLib.settle(1000e18, 1000e18);
        assertEq(sNew, 1000e18);
        assertEq(jNew, 0);
        assertFalse(impaired);
    }

    // bedrock impairment: A < target, sediment fully gone, bedrock takes the shortfall
    function test_settle_bedrockImpaired() public pure {
        (uint256 sNew, uint256 jNew, bool impaired) = WaterfallLib.settle(900e18, 1000e18);
        assertEq(sNew, 900e18);
        assertEq(jNew, 0);
        assertTrue(impaired);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              PROPERTIES
    //////////////////////////////////////////////////////////////////////////*//

    // Invariant 1 (conservation): sNew + jNew == A, always.
    function testFuzz_settle_conservation(uint256 a, uint256 sTarget) public pure {
        (uint256 sNew, uint256 jNew,) = WaterfallLib.settle(a, sTarget);
        assertEq(sNew + jNew, a);
        assertLe(sNew, a);
    }

    // settle returns the min and never impairs while A >= target
    function testFuzz_settle_minAndImpairment(uint256 a, uint256 sTarget) public pure {
        (uint256 sNew, uint256 jNew, bool impaired) = WaterfallLib.settle(a, sTarget);
        assertEq(sNew, a < sTarget ? a : sTarget);
        if (a >= sTarget) assertFalse(impaired);
        if (impaired) assertEq(jNew, 0);
    }

    // Invariant 3 (coupon honesty): growth never exceeds the exact floored accrual.
    function testFuzz_bedrockTarget_noOverCredit(uint256 sPrev, uint256 r, uint256 dt) public pure {
        sPrev = bound(sPrev, 0, 1e30);
        r = bound(r, 0, R_MAX);
        dt = bound(dt, 0, 10 * YEAR);
        uint256 sTarget = WaterfallLib.bedrockTarget(sPrev, r, dt, 0);
        // two-step FullMath accrual (overflow-robust): floor(floor(sPrev·r/WAD)·dt/YEAR)
        uint256 exactFloored = Math.mulDiv(Math.mulDiv(sPrev, r, WAD), dt, YEAR);
        assertEq(sTarget, sPrev + exactFloored);
        assertGe(sTarget, sPrev); // non-decreasing with no withdrawals
    }
}
