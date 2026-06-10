# Unistrata × Reactive Network — runbook

Unistrata's epoch settlement and volatility circuit breaker run with **zero off-chain infrastructure**:
a single Reactive Smart Contract (`UnistrataReactive`) on Reactive Lasna drives the origin-chain
`UnistrataHook`. No keepers, no bots, no Gelato/Chainlink Automation.

```mermaid
flowchart LR
    subgraph origin["Unichain Sepolia · origin (1301)"]
        hook["UnistrataHook<br/>(AbstractCallback)"]
        proxy["Reactive callback proxy"]
    end

    subgraph lasna["Reactive Lasna (5318007)"]
        cron(["CRON tick"])
        rsc["UnistrataReactive (RSC)<br/>react()"]
    end

    hook -- "UnistrataObservation(blockTickDelta, varAcc)" --> rsc
    cron -- "every tick" --> rsc
    rsc -- "heartbeat: every ticksPerEpoch → Callback" --> proxy
    rsc -- "varAcc spike → Callback" --> proxy
    proxy -- "settleEpoch(address)" --> hook
    proxy -- "emergencySettle(address)" --> hook
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
  every `ticksPerEpoch` ticks it emits a `Callback` → `UnistrataHook.settleEpoch(address)`. The hook's
  callback path requires the epoch to have elapsed; a **permissionless `settleEpoch()`** fallback lets
  anyone settle after `epochEnd + gracePeriod`, so the demo never bricks on a missed callback.
- **Circuit breaker (the wow moment).** The hook emits `UnistrataObservation(blockTickDelta, varAcc)` from
  `afterSwap` on every new-block observation. The RSC subscribes to it; when cumulative `varAcc` jumps
  past `spikeThreshold` it emits a `Callback` → `UnistrataHook.emergencySettle(address)`, settling the
  epoch **early** (pro-rata) to lock in the bedrock coupon before further drawdown — and resets its CRON
  counter so the heartbeat stays in epoch-sync.

Callback authorization: `settleEpoch(address)` / `emergencySettle(address)` are `authorizedSenderOnly`
(the callback proxy) + `rvmIdOnly`. Deploy the hook and the RSC **from the same EOA** so the hook's
stored `rvm_id` matches the callbacks the RSC originates.

## Deploy sequence

Each script **writes its deployed addresses to `.env`** (`TOKEN_WETH`/`TOKEN_USDC` → `UNISTRATA_HOOK` →
`UNISTRATA_REACTIVE`) via an idempotent upsert, and `forge` **auto-loads `.env`** at startup — so each
step reads what the previous one wrote. No manual address copy-paste. (`.env` is gitignored.)

```bash
# 0. Demo pool tokens — tWETH (18 dec) + tUSDC (6 dec), minted to your deployer.
#    → writes TOKEN_WETH, TOKEN_USDC to .env
forge script script/unistrata/00_DeployMockTokens.s.sol \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast

# 1. Hook + pool on the origin chain. Reads TOKEN_WETH/TOKEN_USDC from .env; mines the flag address;
#    DERIVES decimals/numéraire/init-price (v4 sorts by address) at 1 tWETH = TARGET_PRICE tUSDC
#    (default 3000). → writes UNISTRATA_HOOK to .env
[TARGET_PRICE=3000] forge script script/unistrata/01_DeployUnistrata.s.sol \
  --rpc-url $UNICHAIN_SEPOLIA_RPC --account $ACCOUNT --sender $SENDER --broadcast

# 2. RSC on Lasna (constructor registers both subscriptions = "deploy is subscribe"). Reads
#    UNISTRATA_HOOK from .env. → writes UNISTRATA_REACTIVE to .env
forge script script/unistrata/02_DeployReactive.s.sol \
  --rpc-url https://lasna-rpc.rnk.dev/ --account $ACCOUNT --sender $SENDER --broadcast

# 3. Fund BOTH chains in one multichain run (default run()): the hook on Unichain Sepolia via the
#    callback proxy AND the RSC on Lasna. The script selects each chain with its own fork, so pass
#    NO --rpc-url. Amounts are integer wei. Reads UNISTRATA_HOOK/UNISTRATA_REACTIVE from .env.
HOOK_FUNDING_WEI=50000000000000000 RSC_FUNDING_WEI=5000000000000000000 \
  forge script script/unistrata/03_FundAndSubscribe.s.sol \
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

## Live testnet deployment (Phase 4 — Permit2 redeploy, Jun 10 2026)

**Current stack** (Permit2 deposit path; addresses in `.env`, receipts under `broadcast/`) — deployed,
pool-initialized, subscribed, and funded. The cross-chain loop was **verified end-to-end on-chain on the
prior deployment** (identical logic — see the trail below) and is **pending a re-run against this fresh
hook** (`04`/`05`/`06`); the fresh hook is at `epochId 0` with no deposits/swaps yet. v4 sorts by address,
so on this stack **token0 = tWETH (18), token1 = tUSDC (6)** (the order flipped from the prior deploy).

| Contract | Chain | Address | Deploy tx |
|---|---|---|---|
| tWETH (18, token0) | Unichain Sepolia 1301 | `0x34b4626268da509c69e4cf03b92164b048fb9f8d` | `0xd24f298e…` |
| tUSDC (6, token1) | Unichain Sepolia 1301 | `0x5ffa4a8d379cb2471b1d4cdf2f5f2d3eca282dd6` | `0xe08a11f9…` |
| UnistrataHook | Unichain Sepolia 1301 | `0xfc4f1c6aecad1507dd0ec4af4d72f62378c25840` | `0x4045c5ce…` (+ pool init `0xd160fc88…`) |
| UnistrataReactive (RSC) | Lasna 5318007 | `0x3cad51414bbd94e19c47ef47fe2d65f89e467eea` | `0x362deddd…` |

Tranche tokens (deployed by the hook constructor): Bedrock `0x3848b7ab…` (**beWETH**), Sediment
`0x953636fc…` (**seWETH**). rvm_id = the deploying EOA `0xDAdaDA4E…C751` (the `tx.origin` fix).

**Subscription proof:** the RSC deploy tx emitted **two `Subscribe` events** (system contract `0x…ffffff`,
zero `SubscribeFailed`): CRON on `5318007` + UnistrataObservation on the hook at `1301`.
**Funding (one multichain `03` run, both legs `0x1`):** hook prefund `0xcb78de28…` (1301, 0.05 ETH) + RSC
top-up `0x6436b176…` (5318007, 5 REACT).

### Spike circuit-breaker — full 3-hop trail (the "wow moment")

> **Trail from the _prior_ deployment** (hook `0x721480…d840`, RSC `0x3d156B…1d34`) — the mechanism is
> proven on-chain below. Re-run `04`/`05`/`06` against the fresh hook `0xfc4f…5840` to regenerate this
> trail on the current stack before recording the video.

| Hop | Chain | Tx | What |
|---|---|---|---|
| 0. Deposit | Unichain 1301 | `0xb5552794…`, `0x2a8f2a23…` | into Sediment + Bedrock |
| 1. Build variance | Unichain 1301 | 6 `--slow` swaps, blocks 54247937–944 | `varAcc` → 6,000,000 |
| **1b. Threshold crossing** | Unichain 1301 | **`0xe07d6c49…`** (block 54247942) | `UnistrataObservation` `varAcc = 4,000,000` |
| 2. RSC reacts | Lasna 5318007 | (Reactscan, RSC `0x3d156B…`, `CALLBACKS = 1`) | `react()` → `Callback` (`emergencySettle`) |
| **3. Callback lands** | Unichain 1301 | **`0x4faab03f…b14d56b0`** (block 54247954) | `emergencySettle` → `EmergencySettled` + `EpochSettled`, `epochId` 0→1 |

The callback executed **~12 blocks (~12s)** after the threshold crossing — zero off-chain infrastructure,
fully on-chain cross-chain automation. ✅ Phase 4 acceptance met.

> **Gotcha fixed along the way:** the hook is deployed via CREATE2 (HookMiner), so `AbstractCallback` set
> `rvm_id = msg.sender = the CREATE2 factory`; callbacks carry the EOA's rvm id, so `emergencySettle`
> reverted "Authorized RVM ID only" until the hook constructor was changed to `rvm_id = tx.origin`
> (the deploying EOA). Also: the spike swaps **must** use `--slow` so each lands in its own block (the
> hook counts one variance observation per new block).

## Demo capture (Phase 4 acceptance — tx hashes for the README/video)

1. **Heartbeat:** deposit into both tranches → wait an epoch → capture (origin `UnistrataObservation`/swap)
   → (RSC reaction on the Reactive explorer) → (`settleEpoch` callback landing on origin, `EpochSettled`).
2. **Spike:** run a volatile swap path on the origin pool until `varAcc` crosses `spikeThreshold` →
   capture (origin `UnistrataObservation`) → (RSC `emergencySettle` callback emission) → (`emergencySettle`
   landing on origin, `EmergencySettled` + `EpochSettled`).

Record the three-hop tx trail for each. Use `keys` via Foundry's encrypted keystore (`--account`), never
plaintext private keys.

## "Deploy is subscribe" — and why `forge script` shows a failed subscribe locally

`UnistrataReactive`'s **constructor** registers both subscriptions, so the single `02_DeployReactive`
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
  `UnistrataReactiveAuth.t.sol` + `UnistrataReactive.t.sol`, incl. the `subscribeAll` owner guard); the
  cross-chain end-to-end run is executed on testnet with the scripts above.
- `ticksPerEpoch` must match `epochDuration / cronPeriod`; an emergency settle resyncs the counter.
- The heartbeat fires once per epoch (counter-based) to avoid wasting callbacks on not-yet-due ticks.
