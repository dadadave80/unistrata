// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {UnistrataHook} from "src/UnistrataHook.sol";

/// @notice PoC for the stale-internal-NAV-vs-live-totalAssets divergence on the withdrawal path
///         (review finding: CRITICAL). Shares are priced off the internal bedrockNav/sedimentNav
///         accumulators, which only re-pin to totalAssets() at settlement and then DRIFT mid-epoch.
///         A junior (sediment) holder with a matured request that claims into a post-settlement
///         drawdown must NOT over-extract beyond its live, seniority-respecting first-loss slice, and a
///         deep drawdown must NOT brick the claim (lRemove > liquidity → SafeCastOverflow). Both of
///         these fail on the pre-fix contract and pass after pricing withdrawals off the live waterfall.
contract UnistrataStaleNavTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    UnistrataHook internal hook;

    address internal alice = makeAddr("alice"); // junior (sediment) — queues + claims into the drawdown
    address internal bob = makeAddr("bob"); // junior (sediment) — stays; must not be diluted by alice
    address internal carol = makeAddr("carol"); // senior (bedrock) — must stay protected

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x4444 << 144)
    );

    function _cfg() internal pure returns (UnistrataHook.Config memory) {
        return UnistrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272, // max range — never trips, so settlement is never blocked in the PoC
            lambdaRisk: 1.25e18,
            rMin: 0,
            rMax: 0.5e18,
            lambdaSmoothing: 0.3e18,
            thetaMax: 0.75e18
        });
    }

    function setUp() public {
        deployArtifactsAndLabel();
        (currency0, currency1) = deployCurrencyPair();
        deployCodeTo("UnistrataHook.sol:UnistrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = UnistrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        _fund(alice);
        _fund(bob);
        _fund(carol);
        // this contract is the swapper
        MockERC20(Currency.unwrap(currency0)).mint(address(this), 100_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(address(this), 100_000_000e18);
        MockERC20(Currency.unwrap(currency0)).approve(address(swapRouter), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(swapRouter), type(uint256).max);

        // Sediment must be seeded first (bedrock needs junior coverage). Two equal junior holders.
        vm.startPrank(alice);
        hook.deposit(false, 300e18, 300e18);
        hook.sediment().approve(address(hook), type(uint256).max);
        vm.stopPrank();
        vm.prank(bob);
        hook.deposit(false, 300e18, 300e18);
        // senior tranche to protect
        vm.startPrank(carol);
        hook.deposit(true, 300e18, 300e18);
        hook.bedrock().approve(address(hook), type(uint256).max);
        vm.stopPrank();
    }

    function _fund(address who) internal {
        MockERC20(Currency.unwrap(currency0)).mint(who, 1_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(who, 1_000_000e18);
        vm.startPrank(who);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        vm.stopPrank();
    }

    function _settle() internal {
        vm.warp(block.timestamp + 1 days + 1 hours + 1);
        hook.settleEpoch();
    }

    function _swap(uint256 amtIn, bool zeroForOne) internal {
        vm.roll(block.number + 1);
        swapRouter.swapExactTokensForTokens(amtIn, 0, zeroForOne, poolKey, "", address(this), block.timestamp + 1);
    }

    /// CRITICAL: a junior claiming into a drawdown must not be paid more than its live first-loss slice
    /// (= its pro-rata of max(0, totalAssets - seniorClaim)). On the buggy contract the payout is priced
    /// off the stale (pre-drawdown) sedimentNav and exceeds the fair slice, draining the senior + bob.
    function test_juniorCannotOverExtractIntoDrawdown() public {
        uint256 shares = hook.sediment().balanceOf(alice);
        vm.prank(alice);
        uint256 id = hook.requestWithdraw(false, shares);
        _settle();
        _settle(); // sediment eligible at epoch 2; both settles pin nav == totalAssets (no swaps yet)

        // post-settlement drawdown: one-way swap → impermanent loss drops totalAssets below tracked NAV
        _swap(500e18, true);

        uint256 A = hook.totalAssets();
        uint256 seniorClaim = hook.bedrockNav();
        uint256 navSum = seniorClaim + hook.sedimentNav();
        assertLt(A, navSum, "precondition: pool drifted below tracked NAV");

        // fair, seniority-respecting junior value: senior is made whole first, junior is the residual
        uint256 liveJunior = A > seniorClaim ? A - seniorClaim : 0;
        uint256 fair = liveJunior * shares / hook.sediment().totalSupply();

        vm.prank(alice);
        uint256 paid = hook.claim(id);

        assertLe(paid, fair + 1e12, "junior over-extracted beyond its live first-loss slice");
    }

    /// CRITICAL (DoS): in a deep drawdown a matured senior claim must still execute. On the buggy
    /// contract value = staleNav*shares/supply can exceed totalAssets so lRemove > position liquidity and
    /// modifyLiquidity reverts SafeCastOverflow, locking the matured withdrawal until price recovers.
    function test_deepDrawdownClaimDoesNotRevert() public {
        uint256 shares = hook.bedrock().balanceOf(carol);
        vm.prank(carol);
        uint256 id = hook.requestWithdraw(true, shares);
        _settle(); // bedrock eligible at epoch 1; nav pinned == totalAssets

        // deep drawdown: hammer one side until live assets fall well below the senior's stale claim
        for (uint256 i = 0; i < 8; i++) {
            _swap(1500e18, true);
        }
        assertLt(hook.totalAssets(), hook.bedrockNav(), "precondition: live assets below senior stale claim");

        // must not revert (SafeCastOverflow) — the matured claim has to be honorable
        vm.prank(carol);
        uint256 paid = hook.claim(id);
        assertGt(paid, 0, "claim paid nothing");
    }

    /// CRITICAL (deposit side): depositing into a drifted-down pool must price against LIVE assets, so a
    /// fresh depositor is not partially confiscated by minting too few shares at the stale-high NAV.
    function test_depositIntoDrawdownIsNotConfiscated() public {
        _settle(); // pin nav == totalAssets
        _swap(500e18, true); // post-settlement drawdown (impermanent loss)

        uint256 liveSedPre = hook.totalAssets() - _min(hook.totalAssets(), hook.bedrockNav());

        vm.prank(bob);
        uint256 got = hook.deposit(false, 200e18, 200e18);

        uint256 liveSedPost = hook.totalAssets() - _min(hook.totalAssets(), hook.bedrockNav());
        uint256 added = liveSedPost - liveSedPre; // numéraire bob actually contributed
        uint256 bobValue = liveSedPost * got / hook.sediment().totalSupply(); // bob's redeemable slice

        // bob owns ~exactly what he added — no value donated to incumbents at entry
        assertApproxEqRel(bobValue, added, 0.01e18);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
