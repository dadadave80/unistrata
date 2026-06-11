// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @title VarianceLib
/// @notice Pure math for Unistrata's in-hook, oracle-free realized-variance measure (brief §3.3).
///         (1) {observe} samples the pool's own tick path once per block, accumulating capped
///         squared tick-deltas into `varAcc`; (2) {annualizedVariance} converts `varAcc` into an
///         annualized σ² (WAD) via the constant ln(1.0001)²; (3) {ewma} is the shared WAD EWMA for
///         `sigma2Ewma` and `feeYieldEwma`. Stateless — the hook holds the state and passes it in/out.
/// @dev `varAcc` is a running accumulator. **The hook must pass the per-epoch delta**
///      (`varAcc_now − varAcc_atEpochStart`) to {annualizedVariance}; the lib cannot enforce this.
///      {observe} must only be called after the hook has seeded `(lastObservedBlock, lastObservedTick)`
///      in `afterInitialize` — an unseeded zero-default pair would inject a spurious first delta.
///      Backs invariant 5: per-block contribution ≤ D_CAP², so varAcc per epoch ≤ blocks × D_CAP².
library VarianceLib {
    error VarianceLib__ZeroElapsed();
    error VarianceLib__InvalidLambda();

    uint256 internal constant WAD = 1e18;
    uint256 internal constant SECONDS_PER_YEAR = 365 days;

    /// @dev ln(1.0001)² scaled to WAD: ln(1.0001)=9.999500033e-5, squared=9.999000092e-9 → ×1e18.
    uint256 internal constant LN_BASE_SQ_WAD = 9_999_000_092;

    //*//////////////////////////////////////////////////////////////////////////
    //                            PER-BLOCK SAMPLING
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Fold one tick observation into the variance accumulator, at most once per block.
    /// @dev Only advances when `currentBlock` strictly exceeds `lastObservedBlock`, so intra-block
    ///      multi-swap sequences collapse to a single block-close-to-block-close delta (the
    ///      manipulation guard) and reorgs/stale blocks are no-ops (never decrement, never double-count).
    /// @param lastObservedBlock  Block of the last counted observation (hook state).
    /// @param lastObservedTick   Tick at that block close (hook state).
    /// @param varAcc             Running variance accumulator (hook state).
    /// @param currentBlock       Current block number.
    /// @param currentTick        Current pool tick.
    /// @param dCap               Max per-block tick delta counted; contribution capped at dCap² (unsigned).
    /// @return newBlock          Updated last-observed block.
    /// @return newTick           Updated last-observed tick.
    /// @return newVarAcc         Updated accumulator (`varAcc + min(d², dCap²)`).
    /// @return blockTickDelta    Signed block-to-block tick delta `d` (for the UnistrataObservation event).
    /// @return counted           True iff a new block advanced the pair.
    function observe(
        uint48 lastObservedBlock,
        int24 lastObservedTick,
        uint256 varAcc,
        uint48 currentBlock,
        int24 currentTick,
        uint24 dCap
    ) internal pure returns (uint48 newBlock, int24 newTick, uint256 newVarAcc, int24 blockTickDelta, bool counted) {
        if (currentBlock <= lastObservedBlock) {
            return (lastObservedBlock, lastObservedTick, varAcc, int24(0), false);
        }

        // Widen to int256 before subtracting so the difference cannot overflow int24.
        int256 d = int256(currentTick) - int256(lastObservedTick);
        uint256 d2 = uint256(d * d); // squaring removes the sign; result is always non-negative

        uint256 cap2 = uint256(dCap) * uint256(dCap);
        if (d2 > cap2) d2 = cap2;

        newVarAcc = varAcc + d2;
        newBlock = currentBlock;
        newTick = currentTick;
        // |d| ≤ MAX_TICK − MIN_TICK = 1_774_544 < int24 max, so the narrowing is exact.
        blockTickDelta = int24(d);
        counted = true;
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                          ANNUALIZED VARIANCE σ²
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Annualized realized variance σ² (WAD) from a per-epoch `varAcc` over `elapsedTime`.
    /// @dev σ² = varAcc · ln(1.0001)² · SECONDS_PER_YEAR / elapsedTime. Rounds **up** (protocol-safe):
    ///      a larger measured σ² yields a larger IL reserve and thus a lower bedrock coupon, favoring
    ///      the sediment underwriter and protocol solvency.
    /// @param varAcc       Per-epoch variance accumulator (delta over the epoch).
    /// @param elapsedTime  Epoch length in seconds (must be > 0).
    function annualizedVariance(uint256 varAcc, uint256 elapsedTime) internal pure returns (uint256 sigma2Wad) {
        if (elapsedTime == 0) revert VarianceLib__ZeroElapsed();
        sigma2Wad = Math.mulDiv(varAcc, LN_BASE_SQ_WAD * SECONDS_PER_YEAR, elapsedTime, Math.Rounding.Ceil);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                  EWMA
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Exponentially-weighted moving average: `λ·sample + (1−λ)·oldValue`, λ in WAD [0, 1e18].
    /// @dev Overflow-safe two-term form; each term floors (≤ 2 wei below the exact convex combination).
    ///      λ = 1e18 → fully reactive (returns `sample`); λ = 0 → pure inertia (returns `oldValue`).
    function ewma(uint256 oldValue, uint256 sample, uint256 lambdaWad) internal pure returns (uint256 newValue) {
        if (lambdaWad > WAD) revert VarianceLib__InvalidLambda();
        newValue = Math.mulDiv(sample, lambdaWad, WAD) + Math.mulDiv(oldValue, WAD - lambdaWad, WAD);
    }
}
