# Strata × Reactive Network — runbook

Strata's epoch settlement and volatility circuit breaker run with **zero off-chain infrastructure**:
a single Reactive Smart Contract (`StrataReactive`) on Reactive Lasna drives the origin-chain
`StrataHook`. No keepers, no bots, no Gelato/Chainlink Automation.

```
  Unichain Sepolia (origin, 1301)                 Reactive Lasna (5318007)
  ┌───────────────────────────┐                   ┌──────────────────────────┐
  │  StrataHook               │  StrataObservation │  StrataReactive (RSC)    │
  │  (AbstractCallback)       │ ─────────────────► │  react():                │
  │                           │                    │   • CRON tick → heartbeat│
  │  settleEpoch(address) ◄───┼──── Callback ──────┤   • varAcc spike → emerg.│
  │  emergencySettle(address)◄┼──── Callback ──────┤                          │
  └───────────────────────────┘   (callback proxy) └──────────────────────────┘
```

## Verified addresses (re-confirm on-chain before deploying — `cast code <addr> --rpc-url <chain>`)

| Item | Value |
|---|---|
| Origin chain | Unichain Sepolia — chainId **1301** |
| v4 PoolManager (origin) | `0x00B036B58a818B1BC34d502D3fE730Db729e62AC` |
| Reactive callback proxy (origin) | `0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4` |
| Reactive testnet | Lasna — chainId **5318007**, RPC `https://lasna-rpc.rnk.dev/` |
| Reactive system contract | `0x…fffFfF` |
| reactive-lib | `Reactive-Network/reactive-lib@v0.2.0` |
| CRON topic (Cron100 ≈ 12 min) | `0xb49937fb8970e19fd46d48f7e3fb00d659deac0347f79cd7cb542f0fc1503c70` |

> ⚠️ A conflicting ETH Sepolia callback proxy surfaced in one search snippet; the values above are from
> the official docs table. CRON topic hashes are from the demos README — re-confirm against the live
> system contract on Lasna at deploy time.

## How the two triggers work

- **Heartbeat (routine settlement).** The RSC subscribes to the CRON event on Lasna and counts ticks;
  every `ticksPerEpoch` ticks it emits a `Callback` → `StrataHook.settleEpoch(address)`. The hook's
  callback path requires the epoch to have elapsed; a **permissionless `settleEpoch()`** fallback lets
  anyone settle after `epochEnd + gracePeriod`, so the demo never bricks on a missed callback.
- **Circuit breaker (the wow moment).** The hook emits `StrataObservation(blockTickDelta, varAcc)` from
  `afterSwap` on every new-block observation. The RSC subscribes to it; when cumulative `varAcc` jumps
  past `spikeThreshold` it emits a `Callback` → `StrataHook.emergencySettle(address)`, settling the
  epoch **early** (pro-rata) to lock in the senior coupon before further drawdown — and resets its CRON
  counter so the heartbeat stays in epoch-sync.

Callback authorization: `settleEpoch(address)` / `emergencySettle(address)` are `authorizedSenderOnly`
(the callback proxy) + `rvmIdOnly`. Deploy the hook and the RSC **from the same EOA** so the hook's
stored `rvm_id` matches the callbacks the RSC originates.

## Deploy sequence

```bash
# 0. Demo pool tokens — tWETH (18 dec) + tUSDC (6 dec), minted to your deployer.
forge script script/strata/00_DeployMockTokens.s.sol \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast
# → note TOKEN_WETH and TOKEN_USDC from the logs

# 1. Hook + pool on the origin chain. Mines the flag address; DERIVES decimals/numéraire/init-price
#    from the token addresses (v4 sorts by address) at 1 tWETH = TARGET_PRICE tUSDC (default 3000).
TOKEN_WETH=0x... TOKEN_USDC=0x... TARGET_PRICE=3000 \
forge script script/strata/01_DeployStrata.s.sol \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast
# → note STRATA_HOOK

# 2. RSC on Lasna (constructor registers both subscriptions = "deploy is subscribe").
STRATA_HOOK=0x... forge script script/strata/02_DeployReactive.s.sol \
  --rpc-url https://lasna-rpc.rnk.dev/ --account $ACCOUNT --sender $SENDER --broadcast
# → note STRATA_REACTIVE

# 3a. Fund the hook (destination callback contract) via the callback proxy on the origin chain.
STRATA_HOOK=0x... HOOK_FUNDING_WEI=50000000000000000 \
  forge script script/strata/03_FundAndSubscribe.s.sol --sig "fundHook()" \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast

# 3b. Top up the RSC on Lasna (covers reactive-tx / callback emission costs).
STRATA_REACTIVE=0x... RSC_FUNDING_WEI=... \
  forge script script/strata/03_FundAndSubscribe.s.sol --sig "fundReactive()" \
  --rpc-url https://lasna-rpc.rnk.dev/ --account $ACCOUNT --sender $SENDER --broadcast
```

Funding model: the callback proxy fronts gas on the origin chain and bills the hook as **debt** (min
callback gas limit 100,000); `depositTo(hook)` pre-funds and settles debt. Leave the hook funded with
native gas or it gets **blocklisted** until the debt clears. Determine the right pre-fund amount
empirically on testnet (no published minimum beyond the gas floor).

## Demo capture (Phase 4 acceptance — tx hashes for the README/video)

1. **Heartbeat:** deposit into both tranches → wait an epoch → capture (origin `StrataObservation`/swap)
   → (RSC reaction on the Reactive explorer) → (`settleEpoch` callback landing on origin, `EpochSettled`).
2. **Spike:** run a volatile swap path on the origin pool until `varAcc` crosses `spikeThreshold` →
   capture (origin `StrataObservation`) → (RSC `emergencySettle` callback emission) → (`emergencySettle`
   landing on origin, `EmergencySettled` + `EpochSettled`).

Record the three-hop tx trail for each. Use `keys` via Foundry's encrypted keystore (`--account`), never
plaintext private keys.

## Status / caveats (v1)

- Contracts (hook callback auth + RSC dispatch) are **unit-tested locally** (13 tests across
  `StrataReactiveAuth.t.sol` + `StrataReactive.t.sol`); the cross-chain end-to-end run is executed on
  testnet with the scripts above.
- `ticksPerEpoch` must match `epochDuration / cronPeriod`; an emergency settle resyncs the counter.
- The heartbeat fires once per epoch (counter-based) to avoid wasting callbacks on not-yet-due ticks.
