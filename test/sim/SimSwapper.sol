// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {SwapParams} from "v4-core/src/types/PoolOperation.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {CurrencySettler} from "@openzeppelin/uniswap-hooks/src/utils/CurrencySettler.sol";

/// @notice Sim helper: moves a pool to a target sqrt price with a real, price-limited swap (the v4
/// router doesn't expose price limits), settling from its own token balance. Triggers afterSwap.
contract SimSwapper {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;
    using BalanceDeltaLibrary for BalanceDelta;
    using CurrencySettler for Currency;

    IPoolManager internal immutable pm;

    constructor(IPoolManager _pm) {
        pm = _pm;
    }

    /// @notice Swap the pool to `targetSqrtPriceX96` (exact-in, capped at the target price).
    function swapToPrice(PoolKey calldata key, uint160 targetSqrtPriceX96) external {
        pm.unlock(abi.encode(key, targetSqrtPriceX96));
    }

    function unlockCallback(bytes calldata data) external returns (bytes memory) {
        require(msg.sender == address(pm), "SimSwapper: only pool manager");
        (PoolKey memory key, uint160 target) = abi.decode(data, (PoolKey, uint160));

        (uint160 current,,,) = pm.getSlot0(key.toId());
        if (target == current) return "";

        bool zeroForOne = target < current;
        BalanceDelta delta = pm.swap(
            key, SwapParams({zeroForOne: zeroForOne, amountSpecified: -int256(1e30), sqrtPriceLimitX96: target}), ""
        );

        _settle(key.currency0, delta.amount0());
        _settle(key.currency1, delta.amount1());
        return "";
    }

    function _settle(Currency currency, int128 amount) internal {
        if (amount < 0) {
            currency.settle(pm, address(this), uint256(uint128(-amount)), false);
        } else if (amount > 0) {
            currency.take(pm, address(this), uint256(uint128(amount)), false);
        }
    }
}
