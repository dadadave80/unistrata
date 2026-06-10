// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {BaseTest} from "../utils/BaseTest.sol";
import {UnistrataHook} from "src/UnistrataHook.sol";

/// @notice Phase-1 deposit tests: hook-owned full-range liquidity via unlock, NAV share minting,
/// dead-shares guard, attachment-point cap, and totalAssets vs liquidity math.
contract UnistrataDepositTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    UnistrataHook internal hook;

    address internal alice = makeAddr("alice");

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5551 << 144)
    );

    uint256 internal constant DEAD_SHARES = 1000;
    address internal constant DEAD_ADDRESS = address(0xdead);

    function _cfg() internal pure returns (UnistrataHook.Config memory) {
        return UnistrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: 1000,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272,
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

        MockERC20(Currency.unwrap(currency0)).mint(alice, 1_000_000e18);
        MockERC20(Currency.unwrap(currency1)).mint(alice, 1_000_000e18);
        vm.startPrank(alice);
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        vm.stopPrank();
    }

    function _depositSediment(uint256 a0, uint256 a1) internal returns (uint256 shares) {
        vm.prank(alice);
        shares = hook.deposit(false, a0, a1);
    }

    function _depositBedrock(uint256 a0, uint256 a1) internal returns (uint256 shares) {
        vm.prank(alice);
        shares = hook.deposit(true, a0, a1);
    }

    // first (sediment) deposit: pool gets hook-owned liquidity; dead shares carved; rest to depositor
    function test_firstSedimentDeposit_mintsAndCarvesDeadShares() public {
        uint256 shares = _depositSediment(100e18, 100e18);
        uint256 jnav = hook.sedimentNav();
        assertGt(jnav, 0);
        assertEq(hook.sediment().totalSupply(), jnav);
        assertEq(hook.sediment().balanceOf(DEAD_ADDRESS), DEAD_SHARES);
        assertEq(hook.sediment().balanceOf(alice), jnav - DEAD_SHARES);
        assertEq(shares, jnav - DEAD_SHARES);
    }

    // totalAssets (read from the live position) matches the tracked tranche NAVs to within a few wei
    function test_totalAssets_matchesTrackedNav() public {
        _depositSediment(100e18, 100e18);
        _depositBedrock(100e18, 100e18);
        assertApproxEqAbs(hook.totalAssets(), hook.bedrockNav() + hook.sedimentNav(), 5);
    }

    // bedrock deposit after sediment, within the 75% cap, mints proportional shares
    function test_bedrockDeposit_withinCap() public {
        _depositSediment(100e18, 100e18);
        uint256 shares = _depositBedrock(100e18, 100e18);
        assertGt(hook.bedrockNav(), 0);
        assertEq(hook.bedrock().balanceOf(alice), shares);
        // S/(S+J) ≈ 0.5 ≤ 0.75
        uint256 ratio = hook.bedrockNav() * 1e18 / (hook.bedrockNav() + hook.sedimentNav());
        assertLe(ratio, 0.75e18);
    }

    // pure bedrock deposit (no sediment) breaches the cap: S/(S+J) = 1 > 0.75
    function test_bedrockDeposit_RevertWhen_noSedimentCoverage() public {
        vm.prank(alice);
        vm.expectRevert(UnistrataHook.UnistrataHook__AttachmentCapExceeded.selector);
        hook.deposit(true, 100e18, 100e18);
    }

    // bedrock deposit that pushes the ratio past θ_max reverts
    function test_bedrockDeposit_RevertWhen_exceedsCap() public {
        _depositSediment(100e18, 100e18); // J ≈ 200e18
        vm.prank(alice);
        vm.expectRevert(UnistrataHook.UnistrataHook__AttachmentCapExceeded.selector);
        hook.deposit(true, 400e18, 400e18); // S ≈ 800e18 → 800/1000 = 0.8 > 0.75
    }

    // second sediment deposit at navPerShare ≈ 1 mints proportional shares
    function test_secondSedimentDeposit_proportional() public {
        _depositSediment(100e18, 100e18);
        uint256 supply1 = hook.sediment().totalSupply();
        uint256 nav1 = hook.sedimentNav();
        uint256 shares2 = _depositSediment(50e18, 50e18);
        // shares2 ≈ depositValue2 * supply1 / nav1; navPerShare≈1 so shares2 ≈ ~half of nav1
        assertApproxEqRel(shares2, nav1 / 2, 0.02e18);
        assertGt(hook.sediment().totalSupply(), supply1);
    }

    // only the hook holds the v4 position; depositor holds tranche shares, not a v4 position
    function test_deposit_givesSharesNotPosition() public {
        uint256 shares = _depositSediment(100e18, 100e18);
        assertEq(hook.sediment().balanceOf(alice), shares);
        assertGt(hook.totalAssets(), 0);
    }
}
