// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {ModifyLiquidityParams} from "v4-core/src/types/PoolOperation.sol";

import {TrancheToken} from "src/TrancheToken.sol";

/// @title StrataHook
/// @notice Uniswap v4 hook that turns one pool into a senior/junior capital structure (Strata).
///         The hook owns all pool liquidity; depositors hold tranche shares (sSTR / jSTR) instead of
///         v4 positions. It measures realized variance from the pool's own tick path, prices a senior
///         coupon off that variance, and settles a senior/junior waterfall each epoch.
/// @dev Single-pool vault: the hook binds to the first pool that initializes it and rejects others.
///      This slice establishes construction, permissions, pool binding + variance seeding, and the
///      external-LP guard. Deposit (unlock/settle/take), afterSwap variance, and settleEpoch follow.
contract StrataHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    /// @notice Construction-time configuration. Mirrors the brief's governance dials.
    struct Config {
        bool numeraireIsToken1; // §3.2 numéraire (token1 assumed USD-stable)
        uint8 decimals0;
        uint8 decimals1;
        uint24 dCap; // §3.3 max per-block tick delta counted
        uint64 epochDuration; // §3.5 epoch length (seconds)
        uint64 gracePeriod; // §3.7 permissionless-settle grace after epoch end
        uint256 lambdaRisk; // §3.4 coupon risk loading (WAD)
        uint256 rMin; // §3.4 coupon clamp low (WAD APR)
        uint256 rMax; // §3.4 coupon clamp high (WAD APR)
        uint256 lambdaSmoothing; // §3.3 EWMA smoothing λ (WAD)
        uint256 thetaMax; // §3.6 senior attachment-point cap (WAD fraction)
    }

    error StrataHook__OnlyHookLiquidity();
    error StrataHook__AlreadyInitialized();

    /// @notice Emitted once per new-block observation; the Reactive circuit breaker subscribes to this.
    event StrataObservation(int24 blockTickDelta, uint256 varAcc);

    // --- tranche share tokens (one each, deployed at construction) ---
    TrancheToken public immutable senior; // sSTR
    TrancheToken public immutable junior; // jSTR

    // --- immutable config ---
    bool public immutable numeraireIsToken1;
    uint8 public immutable decimals0;
    uint8 public immutable decimals1;
    uint24 public immutable dCap;
    uint64 public immutable epochDuration;
    uint64 public immutable gracePeriod;
    uint256 public immutable lambdaRisk;
    uint256 public immutable rMin;
    uint256 public immutable rMax;
    uint256 public immutable lambdaSmoothing;
    uint256 public immutable thetaMax;

    // --- bound pool ---
    bool public poolInitialized;
    PoolKey public boundKey;
    PoolId public boundId;

    // --- variance oracle state (brief §3.3) ---
    uint48 public lastObservedBlock;
    int24 public lastObservedTick;
    uint256 public varAcc;

    constructor(IPoolManager _poolManager, Config memory cfg) BaseHook(_poolManager) {
        senior = new TrancheToken("Strata Senior", "sSTR", address(this));
        junior = new TrancheToken("Strata Junior", "jSTR", address(this));

        numeraireIsToken1 = cfg.numeraireIsToken1;
        decimals0 = cfg.decimals0;
        decimals1 = cfg.decimals1;
        dCap = cfg.dCap;
        epochDuration = cfg.epochDuration;
        gracePeriod = cfg.gracePeriod;
        lambdaRisk = cfg.lambdaRisk;
        rMin = cfg.rMin;
        rMax = cfg.rMax;
        lambdaSmoothing = cfg.lambdaSmoothing;
        thetaMax = cfg.thetaMax;
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              HOOK PERMISSIONS
    //////////////////////////////////////////////////////////////////////////*//

    /// @inheritdoc BaseHook
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true, // bind pool + seed epoch/variance state
            beforeAddLiquidity: true, // gate external LPs out of the capital structure
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true, // per-block variance observation
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              HOOK CALLBACKS
    //////////////////////////////////////////////////////////////////////////*//

    /// @dev Bind to the first pool only; seed the variance observation pair to (block, tick).
    function _afterInitialize(address, PoolKey calldata key, uint160, int24 tick) internal override returns (bytes4) {
        if (poolInitialized) revert StrataHook__AlreadyInitialized();
        poolInitialized = true;
        boundKey = key;
        boundId = key.toId();

        lastObservedBlock = uint48(block.number);
        lastObservedTick = tick;

        return BaseHook.afterInitialize.selector;
    }

    /// @dev External LPs may not add liquidity; only the hook's own unlock flow (sender == this).
    function _beforeAddLiquidity(address sender, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        internal
        view
        override
        returns (bytes4)
    {
        if (sender != address(this)) revert StrataHook__OnlyHookLiquidity();
        return BaseHook.beforeAddLiquidity.selector;
    }
}
