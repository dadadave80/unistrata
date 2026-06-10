// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {FullMath} from "v4-core/src/libraries/FullMath.sol";
import {Currency} from "v4-core/src/types/Currency.sol";

/// @title StrataDeploy
/// @notice Pure helpers shared by the deploy script and its test: derive the correct (currency0,
///         currency1, decimals0, decimals1, numeraireIsToken1) from a token pair (v4 sorts by
///         address), and encode an initial sqrt price. Closes the §7 decimals/ordering footguns by
///         computing them from the real addresses rather than hardcoding.
library StrataDeploy {
    /// @notice Sort `(tokenA, tokenB)` into v4's (token0, token1) order and map decimals + numéraire.
    /// @param numeraire The token to use as the numéraire (e.g. USDC); sets the `numeraireIsToken1` flag.
    function orderTokens(address tokenA, uint8 decA, address tokenB, uint8 decB, address numeraire)
        internal
        pure
        returns (Currency currency0, Currency currency1, uint8 decimals0, uint8 decimals1, bool numeraireIsToken1)
    {
        require(tokenA != tokenB, "StrataDeploy: identical tokens");
        (address t0, uint8 d0, address t1, uint8 d1) =
            tokenA < tokenB ? (tokenA, decA, tokenB, decB) : (tokenB, decB, tokenA, decA);
        currency0 = Currency.wrap(t0);
        currency1 = Currency.wrap(t1);
        decimals0 = d0;
        decimals1 = d1;
        numeraireIsToken1 = (numeraire == t1);
    }

    /// @notice Encode `sqrtPriceX96 = sqrt(amount1 / amount0) · 2^96` from the RAW reserve amounts at
    ///         the target price. For 1 WETH = 3000 USDC with WETH=token0: `(amount1, amount0)` =
    ///         `(3000e6, 1e18)`; flip the pair if the address sort makes USDC token0.
    function encodeSqrtPriceX96(uint256 amount1, uint256 amount0) internal pure returns (uint160) {
        return uint160(Math.sqrt(FullMath.mulDiv(amount1, 1 << 192, amount0)));
    }
}
