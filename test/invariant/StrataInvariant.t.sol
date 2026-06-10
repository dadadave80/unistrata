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
import {StrataHandler} from "./StrataHandler.sol";
import {StrataHook} from "src/StrataHook.sol";

/// @notice Stateful invariant suite (brief §6). Conservation (1) and seniority (2) are checked
/// post-settle in the handler; the always-true invariants live here.
contract StrataInvariantTest is BaseTest {
    using PoolIdLibrary for PoolKey;

    Currency internal currency0;
    Currency internal currency1;
    PoolKey internal poolKey;
    PoolId internal poolId;
    StrataHook internal hook;
    StrataHandler internal handler;

    uint256 internal startBlock;
    uint24 internal constant DCAP = 1000;

    address internal constant HOOK_FLAGS = address(
        uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG) ^ (0x5554 << 144)
    );

    function _cfg() internal pure returns (StrataHook.Config memory) {
        return StrataHook.Config({
            numeraireIsToken1: true,
            decimals0: 18,
            decimals1: 18,
            dCap: DCAP,
            epochDuration: 1 days,
            gracePeriod: 1 hours,
            guardBand: 887272, // wide: the handler swaps across blocks so the guard tracks
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
        deployCodeTo("StrataHook.sol:StrataHook", abi.encode(poolManager, _cfg(), address(0xCA11)), HOOK_FLAGS);
        hook = StrataHook(payable(HOOK_FLAGS));
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // seed initial junior coverage so the pool has liquidity to swap against
        MockERC20(Currency.unwrap(currency0)).approve(address(hook), type(uint256).max);
        MockERC20(Currency.unwrap(currency1)).approve(address(hook), type(uint256).max);
        hook.deposit(false, 1000e18, 1000e18);

        startBlock = block.number;
        handler = new StrataHandler(hook, poolKey, swapRouter, currency0, currency1);
        targetContract(address(handler));
    }

    /// @dev inv. 3 corollary: the coupon is always within its governance clamp.
    function invariant_seniorRateWithinBounds() public view {
        assertLe(hook.seniorRate(), hook.rMax());
        assertGe(hook.seniorRate(), hook.rMin());
    }

    /// @dev inv. 5: cumulative varAcc never exceeds (elapsed blocks)·dCap².
    function invariant_varAccBounded() public view {
        uint256 blocksElapsed = block.number - startBlock + 1; // +1 block of slack
        assertLe(hook.varAcc(), blocksElapsed * uint256(DCAP) * DCAP);
    }

    /// @dev a tranche with no shares has no NAV (NAV only arises from minted deposits).
    function invariant_navRequiresShares() public view {
        if (hook.senior().totalSupply() == 0) assertEq(hook.seniorNav(), 0);
        if (hook.junior().totalSupply() == 0) assertEq(hook.juniorNav(), 0);
    }

    function invariant_callSummary() public view {
        assertGe(handler.settleCount(), 0); // touch the handler so it is linked
    }
}
