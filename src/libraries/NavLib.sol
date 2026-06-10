// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {FixedPoint96} from "v4-core/src/libraries/FixedPoint96.sol";
import {FullMath} from "v4-core/src/libraries/FullMath.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";

/// @title NavLib
/// @notice Pure mark-to-market valuation primitives for the full-range, hook-owned Strata position
///         (brief §3.5 step-1). Values the position in the numéraire (token1 assumed USD-stable per
///         §3.2), normalized to 1e18 WAD, deriving entirely from the pool's own `sqrtPriceX96` — no
///         external oracle.
/// @dev `getPositionTokenAmounts` delegates to v4-core's canonical `LiquidityAmounts` (brief §7: do
///      not hand-roll liquidity math). That inverse function ships only in v4-core's `test/utils`, so
///      it is imported in place (not vendored) to avoid drift and the copy's UNLICENSED header.
///      All conversions use `FullMath.mulDiv` (floor); for the §3.5 mark-to-market into the waterfall
///      (`S_new = min(A, S_target)`) flooring A down is the protocol-safe direction. The stateful
///      `totalAssets(manager,…)` orchestrator (reads PoolManager slot0/position/fee-growth) lives in
///      the hook layer where it is integration-tested against a real PoolManager.
library NavLib {
    uint256 internal constant WAD = 1e18;

    //*//////////////////////////////////////////////////////////////////////////
    //                              FULL-RANGE BOUNDS
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice The tickSpacing-aligned full-range bounds and their sqrt prices.
    /// @dev The hook MUST add liquidity at exactly these ticks so valuation and minting share one
    ///      range. Returns the ticks too — the hook needs them for `getPositionInfo` / `getFeeGrowthInside`.
    function fullRangeBounds(int24 tickSpacing)
        internal
        pure
        returns (int24 tickLower, int24 tickUpper, uint160 sqrtLowerX96, uint160 sqrtUpperX96)
    {
        tickLower = TickMath.minUsableTick(tickSpacing);
        tickUpper = TickMath.maxUsableTick(tickSpacing);
        sqrtLowerX96 = TickMath.getSqrtPriceAtTick(tickLower);
        sqrtUpperX96 = TickMath.getSqrtPriceAtTick(tickUpper);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                          LIQUIDITY → TOKEN AMOUNTS
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Token amounts held by `liquidity` over `[sqrtLower, sqrtUpper]` at the current price.
    /// @dev Thin delegate to v4-core `LiquidityAmounts.getAmountsForLiquidity` (floors each leg).
    function getPositionTokenAmounts(
        uint160 sqrtPriceX96,
        uint160 sqrtLowerX96,
        uint160 sqrtUpperX96,
        uint128 liquidity
    ) internal pure returns (uint256 amount0, uint256 amount1) {
        return LiquidityAmounts.getAmountsForLiquidity(sqrtPriceX96, sqrtLowerX96, sqrtUpperX96, liquidity);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              VALUE IN NUMÉRAIRE
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Value (amount0, amount1) as a single WAD scalar in the numéraire token.
    /// @dev The numéraire token's decimals are selected INTERNALLY from `numeraireIsToken1` so a
    ///      caller cannot mis-wire decimals0/decimals1 (the classic ETH/USDC ordering bug, §7).
    ///      Cross-token conversion squares the price via two `mulDiv`s to avoid Q192 overflow.
    /// @param amount0           Token0 amount (raw units).
    /// @param amount1           Token1 amount (raw units).
    /// @param sqrtPriceX96      Current pool sqrt price (Q64.96).
    /// @param numeraireIsToken1 True if token1 is the numéraire (the §3.2 default).
    /// @param decimals0         Token0 decimals.
    /// @param decimals1         Token1 decimals.
    /// @return valueWad         Total value in the numéraire, scaled to 1e18 WAD.
    function valueInNumeraire(
        uint256 amount0,
        uint256 amount1,
        uint160 sqrtPriceX96,
        bool numeraireIsToken1,
        uint8 decimals0,
        uint8 decimals1
    ) internal pure returns (uint256 valueWad) {
        if (numeraireIsToken1) {
            // token0 → token1 raw units: amount0 · (sqrtP/Q96)²
            uint256 value0in1 = FullMath.mulDiv(
                FullMath.mulDiv(amount0, sqrtPriceX96, FixedPoint96.Q96), sqrtPriceX96, FixedPoint96.Q96
            );
            valueWad = toWad(value0in1 + amount1, decimals1);
        } else {
            // token1 → token0 raw units: amount1 · (Q96/sqrtP)²
            uint256 value1in0 = FullMath.mulDiv(
                FullMath.mulDiv(amount1, FixedPoint96.Q96, sqrtPriceX96), FixedPoint96.Q96, sqrtPriceX96
            );
            valueWad = toWad(amount0 + value1in0, decimals0);
        }
    }

    /// @notice Normalize a raw token amount to 1e18 WAD given its decimals.
    /// @dev <18 decimals upscales exactly (USDC 6 → ×1e12); >18 decimals downscales (floors).
    function toWad(uint256 amount, uint8 decimals) internal pure returns (uint256) {
        if (decimals == 18) return amount;
        if (decimals < 18) return amount * (10 ** (18 - decimals));
        return amount / (10 ** (decimals - 18));
    }
}
