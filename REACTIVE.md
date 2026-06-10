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

Each script **writes its deployed addresses to `.env`** (`TOKEN_WETH`/`TOKEN_USDC` → `STRATA_HOOK` →
`STRATA_REACTIVE`) via an idempotent upsert, and `forge` **auto-loads `.env`** at startup — so each
step reads what the previous one wrote. No manual address copy-paste. (`.env` is gitignored.)

```bash
# 0. Demo pool tokens — tWETH (18 dec) + tUSDC (6 dec), minted to your deployer.
#    → writes TOKEN_WETH, TOKEN_USDC to .env
forge script script/strata/00_DeployMockTokens.s.sol \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast

# 1. Hook + pool on the origin chain. Reads TOKEN_WETH/TOKEN_USDC from .env; mines the flag address;
#    DERIVES decimals/numéraire/init-price (v4 sorts by address) at 1 tWETH = TARGET_PRICE tUSDC
#    (default 3000). → writes STRATA_HOOK to .env
[TARGET_PRICE=3000] forge script script/strata/01_DeployStrata.s.sol \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast

# 2. RSC on Lasna (constructor registers both subscriptions = "deploy is subscribe"). Reads
#    STRATA_HOOK from .env. → writes STRATA_REACTIVE to .env
forge script script/strata/02_DeployReactive.s.sol \
  --rpc-url https://lasna-rpc.rnk.dev/ --account $ACCOUNT --sender $SENDER --broadcast

# 3. Fund BOTH chains in one multichain run (default run()): the hook on Unichain Sepolia via the
#    callback proxy AND the RSC on Lasna. The script selects each chain with its own fork, so pass
#    NO --rpc-url. Amounts are integer wei. Reads STRATA_HOOK/STRATA_REACTIVE from .env.
HOOK_FUNDING_WEI=50000000000000000 RSC_FUNDING_WEI=5000000000000000000 \
  forge script script/strata/03_FundAndSubscribe.s.sol \
  --account $ACCOUNT --sender $SENDER --broadcast
# (add --multi only when later doing --resume / --verify; broadcasts land under broadcast/multi/)

# 3 (alt). Single-chain top-ups — pass --sig + the matching --rpc-url:
#   forge script .. --sig "fundHook()"     --rpc-url unichain_sep   --broadcast --account $ACCOUNT ...
#   forge script .. --sig "fundReactive()" --rpc-url reactive_lasna --broadcast --account $ACCOUNT ...
```

Funding model: the callback proxy fronts gas on the origin chain and bills the hook as **debt** (min
callback gas limit 100,000); `depositTo(hook)` pre-funds and settles debt. Leave the hook funded with
native gas or it gets **blocklisted** until the debt clears. Determine the right pre-fund amount
empirically on testnet (no published minimum beyond the gas floor).

## Live testnet deployment (Phase 4 — verified on-chain)

Deployed and subscribed end-to-end (addresses also in `.env`, broadcast receipts under `broadcast/`):

| Contract | Chain | Address | Deploy tx |
|---|---|---|---|
| tWETH (18) | Unichain Sepolia 1301 | `0xf8075E9DE8E8D27F98D5C78Be26CEbceEd6f9A79` | — |
| tUSDC (6) | Unichain Sepolia 1301 | `0x72cfA7f9DfA38975f4ed4AcF86f67D6E490a52d8` | — |
| StrataHook | Unichain Sepolia 1301 | `0xBC0ca5604FBdb2d484A2169f3841e54F69649840` | `0xc3e27753…1bb65` (+ pool init `0xbbb4d48d…4bcb4`) |
| StrataReactive (RSC) | Lasna 5318007 | `0xdDB7921Eb8FA43bcdDD12597ED9068a795a418FF` | `0x9b83b0a5…71f5c` |

**Subscription proof:** the StrataReactive deploy tx emitted **two `Subscribe` events** from the system
contract `0x…ffffff` and **zero `SubscribeFailed`** — confirming the constructor's try/catch subscribed
on-chain in the same broadcast:
1. CRON heartbeat — subscriber `0xddb792…`, chainId `5318007`, contract `0x…ffffff` (the service);
2. StrataObservation — subscriber `0xddb792…`, chainId `1301`, contract `0xbc0ca5…` (the hook).

The accepted cross-chain subscription to chainId `1301` confirms **Unichain Sepolia is a supported origin
chain** for Lasna subscriptions.

**Funding (one multichain `03` run, both legs status `0x1`):**

| Leg | Chain | Tx | Amount |
|---|---|---|---|
| `depositTo(hook)` via callback proxy | Unichain Sepolia 1301 | `0x71a2ac47…4168d` | 0.05 ETH (debt prefund) |
| RSC top-up | Lasna 5318007 | `0x8b6040f3…6aa51` | 5 REACT |

Remaining for the demo: capture the heartbeat and spike tx trails below.

## Demo capture (Phase 4 acceptance — tx hashes for the README/video)

1. **Heartbeat:** deposit into both tranches → wait an epoch → capture (origin `StrataObservation`/swap)
   → (RSC reaction on the Reactive explorer) → (`settleEpoch` callback landing on origin, `EpochSettled`).
2. **Spike:** run a volatile swap path on the origin pool until `varAcc` crosses `spikeThreshold` →
   capture (origin `StrataObservation`) → (RSC `emergencySettle` callback emission) → (`emergencySettle`
   landing on origin, `EmergencySettled` + `EpochSettled`).

Record the three-hop tx trail for each. Use `keys` via Foundry's encrypted keystore (`--account`), never
plaintext private keys.

## "Deploy is subscribe" — and why `forge script` shows a failed subscribe locally

`StrataReactive`'s **constructor** registers both subscriptions, so the single `02_DeployReactive`
broadcast deploys AND subscribes — no separate `cast send`. Each `service.subscribe()` is wrapped in
try/catch: on a caught revert it emits `SubscribeFailed(chainId, contractAddr, topic0)`.

You **will** see `SubscribeFailed` in the local-simulation trace, and that is expected. reactive-lib's
`SystemLib.getSystemContractImpl()` calls the **node-only precompile at `0x64`**, which does not exist in
Foundry's local EVM, so `subscribe` reverts `"Failure"` during the script's local execution. On the real
Lasna node the precompile exists and both subscriptions take effect in the same broadcast tx.

**Verify on-chain after broadcast:** check the deploy tx receipt — if a `SubscribeFailed` event was emitted
*on-chain* (not just in the local sim), the real subscription failed; call the owner-only `subscribeAll()`
(which does NOT swallow reverts) via `cast send` to surface the actual reason.

## Status / caveats (v1)

- Contracts (hook callback auth + RSC dispatch) are **unit-tested locally** (15 tests across
  `StrataReactiveAuth.t.sol` + `StrataReactive.t.sol`, incl. the `subscribeAll` owner guard); the
  cross-chain end-to-end run is executed on testnet with the scripts above.
- `ticksPerEpoch` must match `epochDuration / cronPeriod`; an emergency settle resyncs the counter.
- The heartbeat fires once per epoch (counter-based) to avoid wasting callbacks on not-yet-due ticks.
