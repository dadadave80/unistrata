// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Test} from "forge-std/Test.sol";
import {VarianceLib} from "src/libraries/VarianceLib.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

/// @dev External wrapper so reverts in the inlined `internal pure` library surface at a lower
///      call depth, where `vm.expectRevert` can catch them.
contract VarianceLibHarness {
    function annualizedVariance(uint256 varAcc, uint256 elapsedTime) external pure returns (uint256) {
        return VarianceLib.annualizedVariance(varAcc, elapsedTime);
    }

    function ewma(uint256 oldValue, uint256 sample, uint256 lambdaWad) external pure returns (uint256) {
        return VarianceLib.ewma(oldValue, sample, lambdaWad);
    }
}

/// @notice Pure-math unit tests for the in-hook realized-variance oracle (brief §3.3).
contract VarianceLibTest is Test {
    uint256 internal constant WAD = 1e18;
    uint256 internal constant YEAR = 365 days;
    uint256 internal constant LN_SQ_WAD = 9_999_000_092; // ln(1.0001)^2 * 1e18

    uint24 internal constant DCAP = 1000; // default max per-block tick delta counted (~10%)

    VarianceLibHarness internal harness = new VarianceLibHarness();

    //*//////////////////////////////////////////////////////////////////////////
    //                            PER-BLOCK SAMPLING
    //////////////////////////////////////////////////////////////////////////*//

    // new block, +100 tick move → varAcc += 100² = 10000; pair advances; counted
    function test_observe_newBlock_accumulatesSquaredDelta() public pure {
        (uint48 b, int24 t, uint256 v, int24 d, bool counted) = VarianceLib.observe(1, 0, 0, 2, 100, DCAP);
        assertEq(v, 10_000);
        assertEq(b, 2);
        assertEq(t, 100);
        assertEq(d, 100);
        assertTrue(counted);
    }

    // negative move contributes the squared magnitude (sign removed)
    function test_observe_negativeDelta_accumulatesMagnitudeSquared() public pure {
        (,, uint256 v, int24 d, bool counted) = VarianceLib.observe(1, 100, 0, 2, -100, DCAP);
        assertEq(v, 40_000); // (-100 - 100)² = (-200)² = 40000
        assertEq(d, -200);
        assertTrue(counted);
    }

    // same block (intra-block multi-swap) → NO-OP, counts at most once per block
    function test_observe_sameBlock_noOp() public pure {
        (uint48 b, int24 t, uint256 v, int24 d, bool counted) = VarianceLib.observe(2, 50, 12_345, 2, 999, DCAP);
        assertEq(v, 12_345); // unchanged
        assertEq(b, 2);
        assertEq(t, 50); // stored pair NOT advanced
        assertEq(d, 0);
        assertFalse(counted);
    }

    // stale / reorg block (current < last) → NO-OP, never decrements
    function test_observe_staleBlock_noOp() public pure {
        (uint48 b, int24 t, uint256 v,, bool counted) = VarianceLib.observe(10, 50, 999, 9, 100, DCAP);
        assertEq(v, 999);
        assertEq(b, 10);
        assertEq(t, 50);
        assertFalse(counted);
    }

    // delta exceeding D_CAP contributes exactly D_CAP² (manipulation ceiling)
    function test_observe_capBinds() public pure {
        (,, uint256 v,, bool counted) = VarianceLib.observe(1, 0, 0, 2, 2000, DCAP);
        assertEq(v, uint256(DCAP) * DCAP); // 1_000_000, not 4_000_000
        assertTrue(counted);
    }

    // flat close (d == 0) still advances the pair and counts the block
    function test_observe_zeroDelta_advancesPairAndCounts() public pure {
        (uint48 b, int24 t, uint256 v, int24 d, bool counted) = VarianceLib.observe(1, 77, 500, 2, 77, DCAP);
        assertEq(v, 500); // +0
        assertEq(b, 2);
        assertEq(t, 77);
        assertEq(d, 0);
        assertTrue(counted);
    }

    // extreme MIN→MAX tick span: widen-before-subtract, no int24 overflow; large cap counts full d²
    function test_observe_extremeTickSpan_noOverflow() public pure {
        int24 lo = TickMath.MIN_TICK; // -887272
        int24 hi = TickMath.MAX_TICK; // 887272
        uint24 bigCap = type(uint24).max; // 16_777_215 > |d|
        (,, uint256 v, int24 d, bool counted) = VarianceLib.observe(1, lo, 0, 2, hi, bigCap);
        uint256 expected = uint256(int256(hi) - int256(lo)) ** 2; // 1_774_544²
        assertEq(v, expected);
        assertEq(int256(d), int256(hi) - int256(lo)); // 1_774_544 fits int24
        assertTrue(counted);
    }

    // two swaps across two blocks each count once; a second swap in the same block does not
    function test_observe_multiSwapSingleBlock_countsOnce() public pure {
        uint48 b;
        int24 t;
        uint256 v;
        bool counted;
        // block 2: first swap counts
        (b, t, v,, counted) = VarianceLib.observe(1, 0, 0, 2, 100, DCAP);
        assertEq(v, 10_000);
        assertTrue(counted);
        // block 2: second swap, same block → no-op
        (b, t, v,, counted) = VarianceLib.observe(b, t, v, 2, 5000, DCAP);
        assertEq(v, 10_000);
        assertFalse(counted);
        // block 3: counts again, delta measured from the block-2 close (100)
        (b, t, v,, counted) = VarianceLib.observe(b, t, v, 3, 150, DCAP);
        assertEq(v, 10_000 + 2500); // (150-100)² = 2500
        assertTrue(counted);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                          ANNUALIZED VARIANCE σ²
    //////////////////////////////////////////////////////////////////////////*//

    // hand-computed: varAcc=52500 over a full year → σ² = 52500·ln(1.0001)² (annualization factor 1)
    function test_annualizedVariance_handComputed() public pure {
        uint256 s = VarianceLib.annualizedVariance(52_500, YEAR);
        assertEq(s, 524_947_504_830_000);
    }

    function test_annualizedVariance_zeroVarAcc_isZero() public pure {
        assertEq(VarianceLib.annualizedVariance(0, YEAR), 0);
    }

    // shorter window → larger annualized σ² (time-scaling): half the elapsed ⇒ ~2× σ²
    function test_annualizedVariance_shorterWindowScalesUp() public pure {
        uint256 full = VarianceLib.annualizedVariance(52_500, YEAR);
        uint256 half = VarianceLib.annualizedVariance(52_500, YEAR / 2);
        assertEq(half, full * 2);
    }

    // rounds UP (protocol-safe): a remainder bumps σ² by 1 wei
    function test_annualizedVariance_roundsUp() public pure {
        // choose elapsed that does not divide the numerator
        uint256 s = VarianceLib.annualizedVariance(1, 7);
        uint256 num = LN_SQ_WAD * YEAR; // 315_328_466_901_312_000
        assertEq(s, Math.ceilDiv(num, 7));
    }

    function test_annualizedVariance_RevertWhen_ZeroElapsed() public {
        vm.expectRevert(VarianceLib.VarianceLib__ZeroElapsed.selector);
        harness.annualizedVariance(52_500, 0);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                  EWMA
    //////////////////////////////////////////////////////////////////////////*//

    function test_ewma_lambdaOne_returnsSample() public pure {
        assertEq(VarianceLib.ewma(100e18, 200e18, WAD), 200e18);
    }

    function test_ewma_lambdaZero_returnsOld() public pure {
        assertEq(VarianceLib.ewma(100e18, 200e18, 0), 100e18);
    }

    function test_ewma_halfLambda_isMidpoint() public pure {
        assertEq(VarianceLib.ewma(100e18, 200e18, 0.5e18), 150e18);
    }

    function test_ewma_RevertWhen_InvalidLambda() public {
        vm.expectRevert(VarianceLib.VarianceLib__InvalidLambda.selector);
        harness.ewma(1e18, 2e18, WAD + 1);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                               PROPERTIES
    //////////////////////////////////////////////////////////////////////////*//

    // per-call contribution is bounded by D_CAP² (building block of invariant 5)
    function testFuzz_observe_contributionBoundedByCapSquared(int24 lastTick, int24 curTick, uint24 dCap) public pure {
        dCap = uint24(bound(dCap, 1, type(uint24).max));
        (,, uint256 v,, bool counted) = VarianceLib.observe(1, lastTick, 0, 2, curTick, dCap);
        assertTrue(counted);
        assertLe(v, uint256(dCap) * dCap);
    }

    // varAcc is monotonic non-decreasing; never counts the same block twice
    function testFuzz_observe_monotoneAndOncePerBlock(uint48 last, uint48 cur, int24 curTick, uint256 v0) public pure {
        v0 = bound(v0, 0, 1e30);
        (uint48 nb,, uint256 v1,, bool counted) = VarianceLib.observe(last, 0, v0, cur, curTick, DCAP);
        assertGe(v1, v0);
        if (cur > last) {
            assertTrue(counted);
            assertEq(nb, cur);
        } else {
            assertFalse(counted);
            assertEq(v1, v0);
        }
    }

    // EWMA stays within [min−2, max] of its two inputs (convex combination, ≤2 wei floor slack)
    function testFuzz_ewma_convexBound(uint256 oldV, uint256 sample, uint256 lambda) public pure {
        oldV = bound(oldV, 0, 1e30);
        sample = bound(sample, 0, 1e30);
        lambda = bound(lambda, 0, WAD);
        uint256 newV = VarianceLib.ewma(oldV, sample, lambda);
        uint256 lo = oldV < sample ? oldV : sample;
        uint256 hi = oldV > sample ? oldV : sample;
        assertLe(newV, hi);
        assertGe(newV + 2, lo);
    }
}
