// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";
import {CurrencySettler} from "@openzeppelin/uniswap-hooks/src/utils/CurrencySettler.sol";
import {AbstractCallback} from "reactive-lib/abstract-base/AbstractCallback.sol";
import {ReentrancyGuardTransient} from "src/utils/ReentrancyGuardTransient.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {ModifyLiquidityParams, SwapParams} from "v4-core/src/types/PoolOperation.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";

import {TrancheToken} from "src/TrancheToken.sol";
import {NavLib} from "src/libraries/NavLib.sol";
import {VarianceLib} from "src/libraries/VarianceLib.sol";
import {WaterfallLib} from "src/libraries/WaterfallLib.sol";

/// @title UnistrataHook
/// @author David Dada (https://github.com/dadadave80)
/// @notice Uniswap v4 hook that turns one pool into a bedrock/sediment capital structure (Unistrata).
///         The hook owns all pool liquidity; depositors hold tranche shares (BEDR / SEDI) instead of
///         v4 positions. It measures realized variance from the pool's own tick path, prices a bedrock
///         coupon off that variance, and settles a bedrock/sediment waterfall each epoch.
/// @dev Single-pool vault: the hook binds to the first pool that initializes it and rejects others.
///      It is also a Reactive callback receiver — `settleEpoch(address)` and `emergencySettle(address)`
///      are callable only by the Reactive callback proxy (rvm-id checked), with a permissionless
///      `settleEpoch()` fallback after the grace period so the demo never bricks on a missed callback.
/// @custom:security-contact daveproxy80@gmail.com
/// @custom:security-contact Discord: daveproxy80
contract UnistrataHook is BaseHook, AbstractCallback, ReentrancyGuardTransient {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;
    using CurrencyLibrary for Currency;
    using CurrencySettler for Currency;
    using BalanceDeltaLibrary for BalanceDelta;

    /// @notice Construction-time configuration. Mirrors the brief's governance dials.
    struct Config {
        bool numeraireIsToken1; // §3.2 numéraire (token1 assumed USD-stable)
        uint8 decimals0;
        uint8 decimals1;
        uint24 dCap; // §3.3 max per-block tick delta counted
        uint64 epochDuration; // §3.5 epoch length (seconds)
        uint64 gracePeriod; // §3.7 permissionless-settle grace after epoch end
        uint256 guardBand; // §3.5 max |currentTick − sampledTick| allowed at settlement
        uint256 lambdaRisk; // §3.4 coupon risk loading (WAD)
        uint256 rMin; // §3.4 coupon clamp low (WAD APR)
        uint256 rMax; // §3.4 coupon clamp high (WAD APR)
        uint256 lambdaSmoothing; // §3.3 EWMA smoothing λ (WAD)
        uint256 thetaMax; // §3.6 bedrock attachment-point cap (WAD fraction)
    }

    enum Action {
        Deposit,
        Settle,
        Withdraw
    }

    /// @notice A queued, epoch-locked withdrawal of tranche shares.
    struct WithdrawRequest {
        uint128 shares;
        uint64 eligibleEpoch;
        bool isBedrock;
        bool claimed;
    }

    error UnistrataHook__OnlyHookLiquidity();
    error UnistrataHook__AlreadyInitialized();
    error UnistrataHook__NotInitialized();
    error UnistrataHook__ZeroLiquidity();
    error UnistrataHook__DepositTooSmall();
    error UnistrataHook__AttachmentCapExceeded();
    error UnistrataHook__EpochNotElapsed();
    error UnistrataHook__SettlementPriceOutOfBand();
    error UnistrataHook__WithdrawNotEligible();
    error UnistrataHook__WithdrawAlreadyClaimed();

    /// @notice Emitted once per new-block observation; the Reactive circuit breaker subscribes to this.
    event UnistrataObservation(int24 blockTickDelta, uint256 varAcc);
    event Deposit(
        address indexed user, bool isBedrock, uint256 amount0, uint256 amount1, uint256 value, uint256 shares
    );
    event EpochSettled(
        uint256 indexed epochId,
        uint256 totalAssets,
        uint256 bedrockNav,
        uint256 sedimentNav,
        uint256 realizedVar,
        uint256 feesEarned,
        uint256 newRate
    );
    /// @notice Bedrock took a principal loss (A < S_prev): sediment fully exhausted.
    event BedrockImpaired(uint256 indexed epochId, uint256 bedrockPrev, uint256 bedrockNew);
    /// @notice Sediment exhausted and bedrock grew but fell short of its coupon (no principal loss).
    event BedrockBelowCoupon(uint256 indexed epochId, uint256 bedrockTarget, uint256 bedrockNew);
    event WithdrawRequested(
        address indexed user, uint256 indexed id, bool isBedrock, uint256 shares, uint256 eligibleEpoch
    );
    event WithdrawClaimed(address indexed user, uint256 indexed id, uint256 value);
    /// @notice Emitted when the Reactive volatility circuit breaker forces an early settlement.
    event EmergencySettled(uint256 indexed epochId);

    uint256 internal constant WAD = 1e18;
    uint256 internal constant SECONDS_PER_YEAR = 365 days;
    uint256 internal constant DEAD_SHARES = 1000;
    address internal constant DEAD_ADDRESS = address(0xdead);
    bytes32 internal constant POSITION_SALT = bytes32(0);

    // --- tranche share tokens (one each, deployed at construction) ---
    TrancheToken public immutable bedrock; // BEDR
    TrancheToken public immutable sediment; // SEDI

    // --- immutable config ---
    bool public immutable numeraireIsToken1;
    uint8 public immutable decimals0;
    uint8 public immutable decimals1;
    uint24 public immutable dCap;
    uint64 public immutable epochDuration;
    uint64 public immutable gracePeriod;
    uint256 public immutable guardBand;
    uint256 public immutable lambdaRisk;
    uint256 public immutable rMin;
    uint256 public immutable rMax;
    uint256 public immutable lambdaSmoothing;
    uint256 public immutable thetaMax;

    // --- bound pool ---
    bool public poolInitialized;
    PoolKey public boundKey;
    PoolId public boundId;
    int24 public tickLower;
    int24 public tickUpper;

    // --- tranche NAVs (numéraire WAD), updated on deposit and at settlement ---
    uint256 public bedrockNav;
    uint256 public sedimentNav;

    // --- epoch state (brief §3.4/§3.5) ---
    uint256 public epochId;
    uint256 public epochStart;
    uint256 public bedrockRate; // r_epoch, fixed at the start of the current epoch (WAD APR)
    uint256 public sigma2Ewma;
    uint256 public feeYieldEwma;

    // --- variance oracle state (brief §3.3) ---
    uint48 public lastObservedBlock;
    int24 public lastObservedTick;
    uint256 public varAcc;
    uint256 public varAccAtEpochStart;

    // --- withdrawal queue (brief §3.6) ---
    mapping(address => WithdrawRequest[]) public withdrawRequests;

    constructor(IPoolManager _poolManager, Config memory cfg, address callbackSender)
        BaseHook(_poolManager)
        AbstractCallback(callbackSender)
    {
        bedrock = new TrancheToken("Unistrata Bedrock", "BEDR", address(this));
        sediment = new TrancheToken("Unistrata Sediment", "SEDI", address(this));

        numeraireIsToken1 = cfg.numeraireIsToken1;
        decimals0 = cfg.decimals0;
        decimals1 = cfg.decimals1;
        dCap = cfg.dCap;
        epochDuration = cfg.epochDuration;
        gracePeriod = cfg.gracePeriod;
        guardBand = cfg.guardBand;
        lambdaRisk = cfg.lambdaRisk;
        rMin = cfg.rMin;
        rMax = cfg.rMax;
        lambdaSmoothing = cfg.lambdaSmoothing;
        thetaMax = cfg.thetaMax;
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                  DEPOSITS
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Deposit token0+token1 into a tranche; the hook adds full-range liquidity and mints
    ///         shares at the tranche's current NAV/share. Caller must approve this hook for both tokens.
    /// @param isBedrock   True to mint bedrock (BEDR), false for sediment (SEDI).
    /// @param amount0Max Max token0 to pull from the caller.
    /// @param amount1Max Max token1 to pull from the caller.
    /// @return shares    Tranche shares minted to the caller.
    function deposit(bool isBedrock, uint256 amount0Max, uint256 amount1Max)
        external
        nonReentrant
        returns (uint256 shares)
    {
        if (!poolInitialized) revert UnistrataHook__NotInitialized();

        bytes memory res =
            poolManager.unlock(abi.encode(Action.Deposit, abi.encode(msg.sender, isBedrock, amount0Max, amount1Max)));
        (uint256 depositValue, uint256 used0, uint256 used1) = abi.decode(res, (uint256, uint256, uint256));

        uint256 nav = isBedrock ? bedrockNav : sedimentNav;
        shares = _mintShares(isBedrock, nav, depositValue, msg.sender);

        if (isBedrock) {
            bedrockNav = nav + depositValue;
            _enforceAttachmentCap();
        } else {
            sedimentNav = nav + depositValue;
        }

        emit Deposit(msg.sender, isBedrock, used0, used1, depositValue, shares);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                WITHDRAWALS
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Queue a withdrawal of tranche shares. Shares are escrowed and become claimable after an
    ///         epoch lockup — bedrock at the next settlement (+1 epoch), sediment one epoch later (+2,
    ///         so a sediment cannot exit just before a volatility event it is paid to absorb). Caller
    ///         must approve this hook for the tranche token.
    /// @return id The request id, used in {claim}.
    function requestWithdraw(bool isBedrock, uint256 shares) external nonReentrant returns (uint256 id) {
        TrancheToken token = isBedrock ? bedrock : sediment;
        token.transferFrom(msg.sender, address(this), shares); // escrow

        uint256 eligible = epochId + (isBedrock ? 1 : 2);
        id = withdrawRequests[msg.sender].length;
        withdrawRequests[msg.sender].push(
            WithdrawRequest({
                shares: uint128(shares), eligibleEpoch: uint64(eligible), isBedrock: isBedrock, claimed: false
            })
        );
        emit WithdrawRequested(msg.sender, id, isBedrock, shares, eligible);
    }

    /// @notice Claim a previously-queued withdrawal once its lockup has elapsed. Pays out the
    ///         withdrawer's share-proportional slice of the hook's assets and burns the escrowed shares.
    function claim(uint256 id) external nonReentrant returns (uint256 value) {
        WithdrawRequest storage req = withdrawRequests[msg.sender][id];
        if (req.claimed) revert UnistrataHook__WithdrawAlreadyClaimed();
        if (epochId < req.eligibleEpoch) revert UnistrataHook__WithdrawNotEligible();
        req.claimed = true;

        bytes memory res =
            poolManager.unlock(abi.encode(Action.Withdraw, abi.encode(msg.sender, req.isBedrock, uint256(req.shares))));
        value = abi.decode(res, (uint256));
        emit WithdrawClaimed(msg.sender, id, value);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                SETTLEMENT
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Permissionless settlement fallback — anyone may settle once the epoch has elapsed AND
    ///         the grace period has passed, so the demo never bricks if a Reactive callback is missed.
    function settleEpoch() external nonReentrant {
        if (block.timestamp < epochStart + epochDuration + gracePeriod) revert UnistrataHook__EpochNotElapsed();
        _settle();
    }

    /// @notice Reactive heartbeat callback: the Reactive callback proxy settles the epoch on schedule
    ///         (once the epoch has elapsed). Callable only by the authorized proxy for our rvm id.
    function settleEpoch(address rvm_id) external nonReentrant authorizedSenderOnly rvmIdOnly(rvm_id) {
        if (block.timestamp < epochStart + epochDuration) revert UnistrataHook__EpochNotElapsed();
        _settle();
    }

    /// @notice Reactive volatility circuit breaker: settle the epoch EARLY (pro-rata) on a vol spike,
    ///         locking in the bedrock coupon before further drawdown. Callback-only; no time gate.
    function emergencySettle(address rvm_id) external nonReentrant authorizedSenderOnly rvmIdOnly(rvm_id) {
        emit EmergencySettled(epochId);
        _settle();
    }

    /// @dev Mark to market, run the bedrock/sediment waterfall, roll the epoch and re-price the coupon.
    function _settle() internal {
        if (!poolInitialized) revert UnistrataHook__NotInitialized();

        // §3.5 price guard: reject settlement if the current price is far from our own sampled tick.
        (, int24 tick,,) = poolManager.getSlot0(boundId);
        int256 dev = int256(tick) - int256(lastObservedTick);
        if (dev < 0) dev = -dev;
        if (uint256(dev) > guardBand) revert UnistrataHook__SettlementPriceOutOfBand();

        // Collect fees into idle and mark to market through the unlock callback.
        bytes memory res = poolManager.unlock(abi.encode(Action.Settle, bytes("")));
        (uint256 A, uint256 feesValue) = abi.decode(res, (uint256, uint256));

        _settleWaterfall(A, feesValue);
    }

    /// @dev The waterfall split + impairment signals; defers the epoch roll to keep the stack shallow.
    function _settleWaterfall(uint256 A, uint256 feesValue) internal {
        uint256 dt = block.timestamp - epochStart;
        uint256 sPrev = bedrockNav;

        uint256 sTarget = WaterfallLib.bedrockTarget(sPrev, bedrockRate, dt, 0);
        (uint256 sNew, uint256 jNew, bool impaired) = WaterfallLib.settle(A, sTarget);

        // Two distinct impairment signals (the literal §3.5 flag, refined by principal loss).
        if (sNew < sPrev) {
            emit BedrockImpaired(epochId, sPrev, sNew);
        } else if (impaired) {
            emit BedrockBelowCoupon(epochId, sTarget, sNew);
        }

        bedrockNav = sNew;
        sedimentNav = jNew;

        _rollEpoch(A, feesValue, dt);
    }

    /// @dev Roll the epoch clock, update the variance + fee EWMAs, and re-price the bedrock coupon.
    function _rollEpoch(uint256 A, uint256 feesValue, uint256 dt) internal {
        uint256 varDelta = varAcc - varAccAtEpochStart;
        uint256 sigma2 = dt == 0 ? 0 : VarianceLib.annualizedVariance(varDelta, dt);
        sigma2Ewma = VarianceLib.ewma(sigma2Ewma, sigma2, lambdaSmoothing);

        // Annualized fee yield (WAD) = (feesValue / A) · (year / dt), relative to pool value.
        uint256 feeYield = (A == 0 || dt == 0) ? 0 : Math.mulDiv(feesValue, WAD * SECONDS_PER_YEAR, A * dt);
        feeYieldEwma = VarianceLib.ewma(feeYieldEwma, feeYield, lambdaSmoothing);

        bedrockRate = WaterfallLib.couponRate(feeYieldEwma, sigma2Ewma, lambdaRisk, rMin, rMax);

        uint256 settledId = epochId;
        epochId = settledId + 1;
        epochStart = block.timestamp;
        varAccAtEpochStart = varAcc;

        emit EpochSettled(settledId, A, bedrockNav, sedimentNav, varDelta, feesValue, bedrockRate);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                              UNLOCK CALLBACK
    //////////////////////////////////////////////////////////////////////////*//

    /// @dev PoolManager unlock callback dispatcher for deposit and settlement actions.
    function unlockCallback(bytes calldata data) external onlyPoolManager returns (bytes memory) {
        (Action action, bytes memory payload) = abi.decode(data, (Action, bytes));
        if (action == Action.Deposit) {
            return _unlockDeposit(payload);
        }
        if (action == Action.Withdraw) {
            return _unlockWithdraw(payload);
        }
        return _unlockSettle();
    }

    /// @dev Add the hook-owned full-range liquidity and settle the owed tokens from the depositor.
    function _unlockDeposit(bytes memory payload) internal returns (bytes memory) {
        (address user,, uint256 amount0Max, uint256 amount1Max) = abi.decode(payload, (address, bool, uint256, uint256));

        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(boundId);
        (,, uint160 sqrtLower, uint160 sqrtUpper) = NavLib.fullRangeBounds(boundKey.tickSpacing);

        uint128 liquidity =
            LiquidityAmounts.getLiquidityForAmounts(sqrtPriceX96, sqrtLower, sqrtUpper, amount0Max, amount1Max);
        if (liquidity == 0) revert UnistrataHook__ZeroLiquidity();

        (BalanceDelta delta,) = poolManager.modifyLiquidity(
            boundKey,
            ModifyLiquidityParams({
                tickLower: tickLower,
                tickUpper: tickUpper,
                liquidityDelta: int256(uint256(liquidity)),
                salt: POSITION_SALT
            }),
            ""
        );

        uint256 used0 = _settleLeg(boundKey.currency0, delta.amount0(), user);
        uint256 used1 = _settleLeg(boundKey.currency1, delta.amount1(), user);

        uint256 depositValue =
            NavLib.valueInNumeraire(used0, used1, sqrtPriceX96, numeraireIsToken1, decimals0, decimals1);
        return abi.encode(depositValue, used0, used1);
    }

    /// @dev Remove the withdrawer's share-proportional slice of ALL hook assets (position + idle) and
    ///      pay it out, then burn the escrowed shares and reduce the tranche NAV. Because both NAV and
    ///      the removed value are `nav·shares/supply`, the remaining holders' NAV/share is unchanged.
    function _unlockWithdraw(bytes memory payload) internal returns (bytes memory) {
        (address user, bool isBedrock, uint256 shares) = abi.decode(payload, (address, bool, uint256));
        TrancheToken token = isBedrock ? bedrock : sediment;
        uint256 supply = token.totalSupply();
        uint256 nav = isBedrock ? bedrockNav : sedimentNav;
        uint256 value = Math.mulDiv(nav, shares, supply);

        uint256 totalA = totalAssets();
        if (totalA != 0) {
            (uint128 liquidity,,) =
                poolManager.getPositionInfo(boundId, address(this), tickLower, tickUpper, POSITION_SALT);
            uint128 lRemove = uint128(Math.mulDiv(liquidity, value, totalA));
            if (lRemove != 0) {
                (BalanceDelta delta,) = poolManager.modifyLiquidity(
                    boundKey,
                    ModifyLiquidityParams({
                        tickLower: tickLower,
                        tickUpper: tickUpper,
                        liquidityDelta: -int256(uint256(lRemove)),
                        salt: POSITION_SALT
                    }),
                    ""
                );
                _takeLeg(boundKey.currency0, delta.amount0(), user);
                _takeLeg(boundKey.currency1, delta.amount1(), user);
            }
            // pay the withdrawer's proportional share of idle (collected fees / residual) too
            _payIdle(boundKey.currency0, value, totalA, user);
            _payIdle(boundKey.currency1, value, totalA, user);
        }

        token.burn(address(this), shares);
        if (isBedrock) {
            bedrockNav = nav - value;
        } else {
            sedimentNav = nav - value;
        }

        return abi.encode(value);
    }

    /// @dev Take a credited (positive) delta leg from the PoolManager to `to`.
    function _takeLeg(Currency currency, int128 amount, address to) internal {
        if (amount > 0) currency.take(poolManager, to, uint256(uint128(amount)), false);
    }

    /// @dev Transfer the withdrawer's `value/totalA` share of an idle balance directly to `to`.
    function _payIdle(Currency currency, uint256 value, uint256 totalA, address to) internal {
        uint256 out = Math.mulDiv(currency.balanceOfSelf(), value, totalA);
        if (out != 0) currency.transfer(to, out);
    }

    /// @dev Poke the position to realize fees into the hook's idle balance, then mark to market.
    function _unlockSettle() internal returns (bytes memory) {
        (, BalanceDelta feesAccrued) = poolManager.modifyLiquidity(
            boundKey,
            ModifyLiquidityParams({tickLower: tickLower, tickUpper: tickUpper, liquidityDelta: 0, salt: POSITION_SALT}),
            ""
        );

        int128 f0 = feesAccrued.amount0();
        int128 f1 = feesAccrued.amount1();
        uint256 fee0 = f0 > 0 ? uint256(uint128(f0)) : 0;
        uint256 fee1 = f1 > 0 ? uint256(uint128(f1)) : 0;
        if (fee0 > 0) boundKey.currency0.take(poolManager, address(this), fee0, false);
        if (fee1 > 0) boundKey.currency1.take(poolManager, address(this), fee1, false);

        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(boundId);
        uint256 feesValue = NavLib.valueInNumeraire(fee0, fee1, sqrtPriceX96, numeraireIsToken1, decimals0, decimals1);
        return abi.encode(totalAssets(), feesValue);
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                                  VIEWS
    //////////////////////////////////////////////////////////////////////////*//

    /// @notice Mark-to-market value of all hook-owned assets in the numéraire (WAD): position + idle.
    /// @dev Uncollected fees sit in the live position until {settleEpoch} pokes them into idle.
    function totalAssets() public view returns (uint256) {
        if (!poolInitialized) return 0;
        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(boundId);
        (,, uint160 sqrtLower, uint160 sqrtUpper) = NavLib.fullRangeBounds(boundKey.tickSpacing);
        (uint128 liquidity,,) = poolManager.getPositionInfo(boundId, address(this), tickLower, tickUpper, POSITION_SALT);
        (uint256 amt0, uint256 amt1) = NavLib.getPositionTokenAmounts(sqrtPriceX96, sqrtLower, sqrtUpper, liquidity);
        uint256 idle0 = boundKey.currency0.balanceOfSelf();
        uint256 idle1 = boundKey.currency1.balanceOfSelf();
        return
            NavLib.valueInNumeraire(amt0 + idle0, amt1 + idle1, sqrtPriceX96, numeraireIsToken1, decimals0, decimals1);
    }

    /// @notice Remaining bedrock capacity (numéraire WAD) before the attachment-point cap binds.
    function bedrockCapacityRemaining() external view returns (uint256) {
        if (thetaMax >= WAD) return type(uint256).max;
        uint256 sMax = Math.mulDiv(thetaMax, sedimentNav, WAD - thetaMax);
        return sMax > bedrockNav ? sMax - bedrockNav : 0;
    }

    //*//////////////////////////////////////////////////////////////////////////
    //                          INTERNAL: SHARES & CAP
    //////////////////////////////////////////////////////////////////////////*//

    /// @dev Mint tranche shares at the current NAV/share. First deposit carves dead shares to a burn
    ///      address (inflation guard) and mints 1:1; later deposits mint `value·supply/nav`.
    function _mintShares(bool isBedrock, uint256 nav, uint256 depositValue, address to)
        internal
        returns (uint256 minted)
    {
        TrancheToken token = isBedrock ? bedrock : sediment;
        uint256 supply = token.totalSupply();
        if (supply == 0) {
            if (depositValue <= DEAD_SHARES) revert UnistrataHook__DepositTooSmall();
            token.mint(DEAD_ADDRESS, DEAD_SHARES);
            minted = depositValue - DEAD_SHARES;
            token.mint(to, minted);
        } else {
            minted = Math.mulDiv(depositValue, supply, nav);
            if (minted == 0) revert UnistrataHook__DepositTooSmall();
            token.mint(to, minted);
        }
    }

    /// @dev Revert if a bedrock deposit pushes S/(S+J) above the attachment-point cap θ_max.
    function _enforceAttachmentCap() internal view {
        uint256 total = bedrockNav + sedimentNav;
        if (total != 0 && Math.mulDiv(bedrockNav, WAD, total) > thetaMax) {
            revert UnistrataHook__AttachmentCapExceeded();
        }
    }

    /// @dev Settle one liquidity-delta leg: pay the owed token (negative delta) from `payer`, or take
    ///      any credit (positive delta) to the hook. Returns the amount paid (the deposited leg).
    function _settleLeg(Currency currency, int128 amount, address payer) internal returns (uint256 paid) {
        if (amount < 0) {
            paid = uint256(uint128(-amount));
            currency.settle(poolManager, payer, paid, false);
        } else if (amount > 0) {
            currency.take(poolManager, address(this), uint256(uint128(amount)), false);
        }
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

    /// @dev Bind to the first pool only; seed the variance pair, epoch clock, and full-range ticks.
    function _afterInitialize(address, PoolKey calldata key, uint160, int24 tick) internal override returns (bytes4) {
        if (poolInitialized) revert UnistrataHook__AlreadyInitialized();
        poolInitialized = true;
        boundKey = key;
        boundId = key.toId();

        lastObservedBlock = uint48(block.number);
        lastObservedTick = tick;
        (tickLower, tickUpper,,) = NavLib.fullRangeBounds(key.tickSpacing);

        epochStart = block.timestamp;
        bedrockRate = rMin; // no history yet → coupon floored

        return BaseHook.afterInitialize.selector;
    }

    /// @dev External LPs may not add liquidity; only the hook's own unlock flow (sender == this).
    function _beforeAddLiquidity(address sender, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        internal
        view
        override
        returns (bytes4)
    {
        if (sender != address(this)) revert UnistrataHook__OnlyHookLiquidity();
        return BaseHook.beforeAddLiquidity.selector;
    }

    /// @dev Per-block realized-variance sampling from the pool's own tick (brief §3.3). Emits
    ///      UnistrataObservation only on a new-block observation — the Reactive circuit breaker watches it.
    function _afterSwap(address, PoolKey calldata, SwapParams calldata, BalanceDelta, bytes calldata)
        internal
        override
        returns (bytes4, int128)
    {
        (, int24 tick,,) = poolManager.getSlot0(boundId);
        (uint48 nb, int24 nt, uint256 nv, int24 blockTickDelta, bool counted) =
            VarianceLib.observe(lastObservedBlock, lastObservedTick, varAcc, uint48(block.number), tick, dCap);
        if (counted) {
            lastObservedBlock = nb;
            lastObservedTick = nt;
            varAcc = nv;
            emit UnistrataObservation(blockTickDelta, nv);
        }
        return (BaseHook.afterSwap.selector, 0);
    }
}
