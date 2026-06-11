// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @title WaterfallLib
/// @notice Pure settlement math for the Unistrata bedrock/sediment tranche waterfall and the
///         variance-priced bedrock coupon (UNISTRATA_BUILD_BRIEF §3.4 + §3.5). No storage, no
///         external calls — unit-testable in isolation and the load-bearing math behind
///         invariants 1 (conservation), 2 (seniority) and 3 (coupon honesty).
/// @dev Units: rates are WAD (1e18) APR fractions; values are WAD numéraire amounts. The
///      σ²/8 loss-versus-rebalancing coefficient is folded into the bedrock coupon's IL reserve.
///      Rounding rule (§3.5): round in favor of the protocol / remaining LPs, against the actor —
///      the IL reserve rounds UP (lower coupon) and bedrock accrual rounds DOWN (no over-crediting).
library WaterfallLib {
    /// @notice Thrown when the coupon clamp bounds are misconfigured (rMin > rMax).
    error WaterfallLib__InvalidRateBounds();

    uint256 internal constant WAD = 1e18;
    /// @dev APR → per-epoch conversion base. 365 days = 31_536_000 seconds.
    uint256 internal constant SECONDS_PER_YEAR = 365 days;

    //*//////////////////////////////////////////////////////////////////////////
    //                                COUPON PRICING
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Variance-priced bedrock coupon: `r = clamp(feeYieldEwma − λ·σ²/8, rMin, rMax)`.
    /// @param feeYieldEwma  EWMA of annualized fee yield (WAD APR).
    /// @param sigma2Ewma    EWMA of annualized realized variance σ² (WAD).
    /// @param lambdaRisk    Risk loading λ (WAD; default 1.25e18 = 25% safety margin).
    /// @param rMin          Lower clamp (WAD APR; default 0).
    /// @param rMax          Upper clamp (WAD APR; default 0.5e18 = 50% APR).
    /// @return r            The bedrock tranche's fixed coupon for the epoch (WAD APR).
    function couponRate(uint256 feeYieldEwma, uint256 sigma2Ewma, uint256 lambdaRisk, uint256 rMin, uint256 rMax)
        internal
        pure
        returns (uint256 r)
    {
        if (rMin > rMax) revert WaterfallLib__InvalidRateBounds();

        // IL reserve = λ·σ²/8, rounded UP so the bedrock is never over-paid (favors protocol/sediment).
        uint256 reserve = Math.mulDiv(lambdaRisk, sigma2Ewma, 8 * WAD, Math.Rounding.Ceil);

        // Saturating subtraction before the clamp: a reserve exceeding fee yield floors at 0.
        uint256 net = feeYieldEwma > reserve ? feeYieldEwma - reserve : 0;

        r = net < rMin ? rMin : (net > rMax ? rMax : net);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              SETTLEMENT WATERFALL
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Bedrock target value after one epoch:
    ///         `sTarget = sPrev·(1 + r·Δt/year) + bedrockNetDeposits`, floored at 0.
    /// @dev Accrual uses a two-step FullMath chain (`floor(floor(sPrev·r/WAD)·Δt/year)`) — every
    ///      intermediate stays ≤ 2^256 with no precision loss, and the floor enforces coupon
    ///      honesty (invariant 3: bedrock growth ≤ r·Δt, never over-credited).
    /// @param sPrev              Bedrock value at the end of the previous epoch (WAD).
    /// @param rEpoch             Bedrock coupon for this epoch (WAD APR), from {couponRate}.
    /// @param dt                 Epoch length in seconds.
    /// @param bedrockNetDeposits  Net bedrock principal flow this epoch (signed WAD; >0 deposits, <0 withdrawals).
    function bedrockTarget(uint256 sPrev, uint256 rEpoch, uint256 dt, int256 bedrockNetDeposits)
        internal
        pure
        returns (uint256 sTarget)
    {
        uint256 accrual = Math.mulDiv(Math.mulDiv(sPrev, rEpoch, WAD), dt, SECONDS_PER_YEAR);
        uint256 base = sPrev + accrual;

        if (bedrockNetDeposits >= 0) {
            sTarget = base + uint256(bedrockNetDeposits);
        } else {
            uint256 outflow = uint256(-bedrockNetDeposits);
            sTarget = base > outflow ? base - outflow : 0;
        }
    }

    /// @notice Split total assets `A` between bedrock and sediment at the bedrock target.
    /// @dev Bedrock is paid first up to its target; sediment absorbs the residual (and the loss).
    ///      `sNew + jNew == A` exactly (invariant 1). `impaired` is the brief's literal §3.5 step-4
    ///      flag; callers holding `sPrev` should refine it to true principal loss (`A < sPrev`) for
    ///      event semantics.
    /// @param A        Total mark-to-market assets in numéraire (WAD).
    /// @param sTarget  Bedrock target from {bedrockTarget}.
    /// @return sNew    New bedrock value = min(A, sTarget).
    /// @return jNew    New sediment value = A − sNew.
    /// @return impaired True when sediment is exhausted and bedrock fell short of target.
    function settle(uint256 A, uint256 sTarget) internal pure returns (uint256 sNew, uint256 jNew, bool impaired) {
        sNew = A < sTarget ? A : sTarget;
        jNew = A - sNew;
        impaired = jNew == 0 && A < sTarget;
    }
}
