// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/console2.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";

import {DemoERC20} from "../../script/strata/DemoERC20.sol";
import {StrataDeploy} from "../../script/strata/StrataDeploy.sol";
import {BaseTest} from "../utils/BaseTest.sol";
import {StrataHook} from "src/StrataHook.sol";

/// @notice Proves the real demo token setup — tWETH (18 dec) + tUSDC (6 dec), USDC as numéraire,
/// pool initialized at 1 WETH = 3000 USDC — values correctly. If decimals or the numéraire flag
/// were mis-wired, NAV would be off by ~1e12; these assertions catch that.
contract StrataMixedDecimalsTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    DemoERC20 internal weth;
    DemoERC20 internal usdc;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;

    address internal alice = makeAddr("alice");
    uint256 internal constant PRICE = 3000; // tUSDC per tWETH

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5558 << 144)
    );

    function setUp() public {
        deployArtifactsAndLabel();
        weth = new DemoERC20("Demo Wrapped Ether", "tWETH", 18);
        usdc = new DemoERC20("Demo USD Coin", "tUSDC", 6);

        // Derive ordering / decimals / numéraire from the real addresses (USDC is the numéraire).
        (Currency c0, Currency c1, uint8 dec0, uint8 dec1, bool numeraireIsToken1) =
            StrataDeploy.orderTokens(address(weth), 18, address(usdc), 6, address(usdc));

        StrataHook.Config memory cfg = StrataHook.Config({
            numeraireIsToken1: numeraireIsToken1,
            decimals0: dec0,
            decimals1: dec1,
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

        deployCodeTo("StrataHook.sol:StrataHook", abi.encode(poolManager, cfg, address(0xCA11)), HOOK_FLAGS);
        hook = StrataHook(payable(HOOK_FLAGS));

        poolKey = PoolKey(c0, c1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();

        bool wethIsToken0 = address(weth) < address(usdc);
        uint160 sqrtPriceX96 = wethIsToken0
            ? StrataDeploy.encodeSqrtPriceX96(PRICE * 1e6, 1e18)
            : StrataDeploy.encodeSqrtPriceX96(1e18, PRICE * 1e6);
        poolManager.initialize(poolKey, sqrtPriceX96);

        weth.mint(alice, 1_000e18);
        usdc.mint(alice, 3_000_000e6);
        vm.startPrank(alice);
        weth.approve(address(hook), type(uint256).max);
        usdc.approve(address(hook), type(uint256).max);
        vm.stopPrank();
    }

    // deposit 2 WETH + 6000 USDC (≈ equal value at price 3000) → ~12,000 USDC of NAV, in WAD.
    function _depositBalanced(bool isSenior, uint256 wethAmt) internal returns (uint256) {
        uint256 usdcAmt = wethAmt * PRICE / 1e12; // scale 18-dec WETH amount to 6-dec USDC at price
        bool wethIsToken0 = address(weth) < address(usdc);
        (uint256 a0, uint256 a1) = wethIsToken0 ? (wethAmt, usdcAmt) : (usdcAmt, wethAmt);
        vm.prank(alice);
        return hook.deposit(isSenior, a0, a1);
    }

    // the 6-decimal numéraire is valued correctly: a ~$12k deposit reads as ~12,000e18 WAD, not
    // ~12e15 or ~12e30 (which is what a decimals/numéraire mis-wire would produce)
    function test_mixedDecimals_navIsSane() public {
        _depositBalanced(false, 2e18); // junior: 2 WETH + 6000 USDC
        uint256 jnav = hook.juniorNav();
        console2.log("juniorNav (WAD):", jnav);
        assertGt(jnav, 8_000e18); // decisively rules out a 1e12-low decimals bug
        assertLt(jnav, 20_000e18); // ...and a 1e12-high one; true value ≈ 12,000e18
    }

    // both tranches + a settlement keep conservation under mixed decimals
    function test_mixedDecimals_depositSettleConservation() public {
        _depositBalanced(false, 4e18); // junior coverage first
        _depositBalanced(true, 2e18); // senior within the cap

        uint256 ratio = hook.seniorNav() * 1e18 / (hook.seniorNav() + hook.juniorNav());
        assertLe(ratio, 0.75e18);

        vm.warp(block.timestamp + 1 days + 1 hours + 1);
        hook.settleEpoch();
        assertApproxEqAbs(hook.seniorNav() + hook.juniorNav(), hook.totalAssets(), 1e12);
    }
}
