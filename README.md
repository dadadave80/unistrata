<p align="center">
  <img src="assets/banner.svg" alt="Unistrata — a Uniswap v4 pool, priced as a capital structure" width="100%">
</p>

**A Uniswap v4 pool, priced as a capital structure.**

> LPs are forced sellers of volatility with no buyer — impermanent loss is just the bill. **Unistrata builds the buyer.**

**Not an oracle integration or a vault wrapper** — the first v4 hook that measures its *own* realized variance from the pool's tick path and uses it to price a senior fixed-income tranche, with settlement triggered cross-chain by a Reactive Smart Contract and no keeper we run.

Unistrata is a Uniswap v4 hook that splits a single pool's impermanent loss into two tranches, the way a bond is split into senior and junior:

- **Bedrock** (senior) — protected principal, earns a **fixed coupon priced from the pool's own measured volatility**. The floor.
- **Sediment** (junior, first-loss) — underwrites the volatility, absorbs the impermanent loss, and **keeps all the excess fees**. The vol-underwriting asset.

Each epoch the structure settles through a seniority waterfall — Bedrock is paid its coupon first, Sediment takes the residual. Settlement is driven **cross-chain by a Reactive Network smart contract**: no keeper, no off-chain bot, and **no external price oracle** — the coupon is priced from realized variance the hook measures off its own tick path.

**The money shot (replayed on-chain from the real May 2021 ETH crash, `sim/out/crash.json`):** tWETH falls $3,191 → $1,603 (−50%) and recovers to $1,889. Vanilla LP bleeds below HODL to impermanent loss; **Bedrock's NAV holds flat — principal fully protected through the drawdown**; Sediment absorbs the loss first, then keeps the fees on the recovery.

| Artifact | Detail |
|---|---|
| **Live demo** | **[unistrata.vercel.app](https://unistrata.vercel.app)** |
| **Live hook** | [`0x1c92498828ef724e488877cb8df251a406611840`](https://sepolia.uniscan.xyz/address/0x1c92498828ef724e488877cb8df251a406611840) · Unichain Sepolia (1301) |
| **Reactive RSC** | [`0xac81c63d936b6a751ecdd412c7c956dc70f9313e`](https://lasna.reactscan.net/address/0xac81c63d936b6a751ecdd412c7c956dc70f9313e) · Reactive Lasna (5318007) |
| **Tests** | 150 passing (Foundry, TDD) incl. stateful invariants — `forge test` |
| **Cross-chain loop** | verified on-chain — spike → `emergencySettle` → `epochId 0→1` ([trail below](#verified-cross-chain-trail)) |
| **Frontend** | `frontend/` — Next.js + Reown AppKit + wagmi/viem, gasless EIP-2612 deposit, live Reactive feed |

---

## How it works

Unistrata's mechanism lives in one hook (`src/UnistrataHook.sol`) plus three pure libraries (`src/libraries/VarianceLib.sol`, `NavLib.sol`, `WaterfallLib.sol`). The hook owns 100% of the pool's full-range liquidity; depositors hold tranche shares (`BEDR` / `SEDI`) instead of v4 positions, and external LPs are gated out (`_beforeAddLiquidity` reverts unless `sender == address(this)`). Everything below derives from the pool's own state — no external oracle.

### 1. In-pool, oracle-free variance (`varAcc`)

The hook measures realized variance straight off the pool's tick path. `afterSwap` is a permission, and `_afterSwap` reads the live tick from `getSlot0` and folds it into the accumulator through `VarianceLib.observe`:

- **One observation per block.** `observe` advances only when `currentBlock > lastObservedBlock`; otherwise it does nothing. Intra-block multi-swap sequences therefore collapse to a single block-close-to-block-close delta — the manipulation guard — and reorgs/stale blocks are no-ops (never decrement, never double-count).
- **Capped squared tick-delta.** On a new block it computes the signed delta `d = currentTick − lastObservedTick`, squares it (sign drops out), and clamps the per-block contribution at `dCap²` before adding: `newVarAcc = varAcc + min(d², dCap²)`. `dCap` is deployed at 1000, so one block contributes at most `1000² = 1e6`. This bounds the accumulator (invariant 5) and caps the influence of any single jump.
- Only on a counted observation does the hook update `(lastObservedBlock, lastObservedTick, varAcc)` and emit `UnistrataObservation(blockTickDelta, varAcc)` — the event the Reactive circuit breaker subscribes to (the deployed RSC trips at a `varAcc` spike of 4,000,000).

At settlement the per-epoch delta `varAcc − varAccAtEpochStart` is annualized: `σ² = varAcc · ln(1.0001)² · year / Δt`, where `ln(1.0001)² = LN_BASE_SQ_WAD = 9_999_000_092` turns squared *ticks* into squared *log-returns*. It rounds **up** — a larger measured σ² means a larger IL reserve and thus a lower bedrock coupon, favoring the underwriter and protocol solvency — and feeds an exponentially-weighted moving average (**EWMA**) `sigma2Ewma` that smooths it epoch-to-epoch.

### 2. The variance-priced Bedrock coupon

Each epoch's fixed coupon `bedrockRate` is set in `_rollEpoch` from two EWMAs — realized variance `sigma2Ewma` and the annualized fee yield `feeYieldEwma` — via `WaterfallLib.couponRate`:

```
reserve = ceil(λ_risk · σ²_ewma / 8)        // IL reserve — σ²/8 (all terms WAD: ceil(λ·σ²/(8·WAD)))
net     = max(feeYieldEwma − reserve, 0)      // saturating subtraction
r_epoch = clamp(net, rMin, rMax)
```

The **`σ²/8`** term is the actuarial heart: a full-range LP's impermanent loss — *loss-versus-rebalancing* (LVR), the cost of the short-gamma payoff it implicitly sells — scales like `σ²/8` per unit time ([Milionis–Moallemi–Roughgarden–Zhang, 2022](https://arxiv.org/abs/2208.06046)). Bedrock is the *senior, protected* tranche, so its coupon is the fee yield **minus** the price of that volatility insurance (the IL reserve), marked up by the risk loading `lambdaRisk` (deployed 1.25e18 → a 25% safety margin) and rounded up; Sediment is paid, in retained excess fees, to underwrite it. The result is clamped to `[rMin, rMax]` (deployed `rMin = 0`, `rMax = 50% APR`).

> **Honest caveat on the coupon.** In *every* demonstrated scenario — the live epoch 0→1 and all three `sim/out` replays — measured σ² is high relative to fee yield (the demo deliberately spikes variance with synthetic swaps, not a calibrated steady-state vol), so the IL reserve saturates the fee yield and the priced coupon **floors at `rMin = 0`**. Bedrock's flat NAV/share is therefore *principal protection* (the waterfall pays Bedrock its target `sTarget = sPrev·(1 + 0)` before Sediment) — not a positive paying coupon. The variance-pricing mechanism is implemented and invariant-tested; a *paying* coupon simply requires calmer realized vol than the demo forces, so fee yield exceeds the IL reserve.

### 3. The epoch waterfall at settlement

Settlement (`_settle`) can be triggered three ways: the Reactive heartbeat `settleEpoch(rvm_id)` (callback-only, after the epoch elapses), the Reactive volatility circuit breaker `emergencySettle(rvm_id)` (callback-only, **no time gate** — settles early to lock in the coupon before further drawdown), or a permissionless `settleEpoch()` fallback after `epochDuration + gracePeriod` so a missed callback can't brick the vault.

- **Price guard first.** `_settle` rejects settlement if the live tick deviates from the hook's own last sampled tick by more than `guardBand` (`SettlementPriceOutOfBand`; deployed `guardBand = 5000` ticks, ≈ +65%/−39%). Settlement marks NAV to the pool's *own* live spot price, so this is a **coarse guard against settling mid-manipulation-spike — not a manipulation-proof oracle** (the sampled tick is itself swap-derived).
- **Mark to market.** The hook pokes the position to realize accrued fees into idle balance, then `totalAssets()` values position + idle in the *numéraire* (the unit of account — here tUSDC) via `NavLib.valueInNumeraire` (decimals normalized to WAD). This yields `A` and `feesValue`.
- **Seniority waterfall.** `_settleWaterfall` computes the Bedrock target `sTarget = sPrev·(1 + r·Δt/year)` (accrual floored — coupon honesty, invariant 3), then `settle(A, sTarget)` does `sNew = min(A, sTarget); jNew = A − sNew`. **Bedrock is paid its coupon target first; Sediment absorbs the entire residual** — it takes the loss when `A < sTarget` and keeps all the excess when `A > sTarget`. `sNew + jNew == A` exactly (conservation, invariant 1).
- **Impairment signals.** `BedrockImpaired` fires on a true principal loss (Sediment exhausted *and* Bedrock fell below where it started); `BedrockBelowCoupon` fires when Sediment is exhausted and Bedrock grew but missed its coupon (no principal loss). `_rollEpoch` then advances `epochId`, resets the variance baseline, re-prices the coupon, and emits `EpochSettled`.

### 4. Epoch-locked withdrawals + the gasless EIP-2612 deposit path

- **Queued, lockup'd exits.** `requestWithdraw(isBedrock, shares)` escrows the tranche tokens and records `eligibleEpoch = epochId + (isBedrock ? 1 : 2)`. Bedrock exits at the next settlement (+1); **Sediment is locked one epoch longer (+2)** so a junior holder cannot exit just before a volatility event it is being paid to absorb. `claim(id)` reverts until `epochId ≥ eligibleEpoch`, then pays a `value/totalAssets` slice of *all* hook assets and burns the escrowed shares — leaving remaining holders' NAV/share unchanged.
- **Deposits & shares.** `deposit` adds full-range liquidity and mints shares at the tranche's current NAV/share; the first deposit carves `DEAD_SHARES = 1000` to `0xdead` as an inflation guard. Bedrock deposits enforce the attachment cap `bedrockNav/(bedrockNav+sedimentNav) ≤ thetaMax` (deployed 0.75) — Bedrock can't grow past 75% of the structure without Sediment to back it.
- **Gasless EIP-2612 path.** `depositWithPermit` takes two ERC-2612 token signatures — one per leg — and grants the hook a just-in-time allowance on each via `permit()` (no separate `approve` tx, no standing allowance, no Permit2 dependency). It then reuses the plain deposit body with the caller as payer, so the PoolManager settles **only the amounts actually used, straight from the caller** — no idle pull to the hook and no refund. The permit gate is front-run-safe: a watcher who replays the signature first only sets the allowance the deposit already needs, so it still proceeds. Mints shares; reverts if below `minSharesOut`.

---

## Architecture

Unistrata is split across two chains. On **Unichain Sepolia (1301)** a single v4 hook owns all pool liquidity and tranches its impermanent loss into two ERC-20s. On **Reactive Lasna (5318007)** a Reactive Smart Contract (RSC) watches the hook and a CRON clock and drives settlement back through the Reactive callback proxy. No keeper, no off-chain bot, no external oracle.

### On-chain: the hook (Unichain Sepolia)

`UnistrataHook` is a `BaseHook` + `AbstractCallback` + `ReentrancyGuardTransient`. It is a **single-pool vault**: `_afterInitialize` binds it to the first pool that initializes it and reverts on any other. It deploys both `StratumToken` tranches in its constructor — **Bedrock** (`BEDR`) and **Sediment** (`SEDI`) — each owned by the hook so only it can mint/burn. It requests exactly three v4 permissions:

- `afterInitialize` — bind the pool, seed the epoch clock + variance state.
- `beforeAddLiquidity` — gate external LPs out; all liquidity flows through the hook's own `unlock` path.
- `afterSwap` — per-block realized-variance sampling; emits `UnistrataObservation` (the RSC circuit-breaker's trigger).

As an `AbstractCallback` it exposes the two Reactive entry points, both `authorizedSenderOnly` + `rvmIdOnly(rvm_id)`: `settleEpoch(rvm_id)` (heartbeat) and `emergencySettle(rvm_id)` (early spike settle). **rvm-id caveat:** the hook is CREATE2-deployed (HookMiner), so the constructor overrides `rvm_id = tx.origin` (the deploying EOA) — deploy hook and RSC from the same EOA.

### Off-chain logic, on-chain: the RSC (Reactive Lasna)

`UnistrataReactive` is an `AbstractReactive`. Its constructor registers two subscriptions (in try/catch, so one `forge script --broadcast` both deploys and subscribes):

1. **CRON heartbeat** → every `ticksPerEpoch` (120) ticks it emits a `Callback` to `settleEpoch`.
2. **`UnistrataObservation`** on the origin chain → when `varAcc − lastSpikeVarAcc ≥ spikeThreshold` (4,000,000) it emits a `Callback` to `emergencySettle`.

Each `Callback` is delivered by the **Reactive callback proxy** on Unichain Sepolia (`0x9299…7FC4`), which fronts gas and calls the hook as the authorized sender; the hook's `authorizedSenderOnly` + `rvmIdOnly` checks close the trust loop.

### Cross-chain flow

```mermaid
flowchart TB
    subgraph US["Unichain Sepolia — chainId 1301"]
        depositor["Depositor / Swapper (EOA)"]
        hook["UnistrataHook<br/>(BaseHook + AbstractCallback)<br/>0x1c92…1840<br/>owns Bedrock/Sediment tranches"]
        be["StratumToken Bedrock (BEDR)<br/>0x27b1…4c17"]
        se["StratumToken Sediment (SEDI)<br/>0xdec0…1c50"]
        pm["v4 PoolManager<br/>0x00B0…62AC"]
        proxy["Reactive callback proxy<br/>0x9299…7FC4<br/>(authorizedSender, fronts gas)"]

        depositor -- "deposit / depositWithPermit (EIP-2612)" --> hook
        hook -- "unlock: modifyLiquidity (full-range)" --> pm
        hook -- "mint shares" --> be
        hook -- "mint shares" --> se
        depositor -- "swap" --> pm
        pm -- "afterSwap" --> hook
        hook -. "emit UnistrataObservation(blockTickDelta, varAcc)" .-> rsc
    end

    subgraph LASNA["Reactive Lasna — chainId 5318007"]
        cron["CRON system contract<br/>(cronTopic 0xb499…3c70)"]
        rsc["UnistrataReactive (RSC)<br/>0xac81…313e<br/>rvm_id = deploying EOA"]

        cron -- "heartbeat tick" --> rsc
    end

    rsc -- "react(): every 120 ticks →<br/>Callback settleEpoch(address)" --> proxy
    rsc -- "react(): varAcc spike ≥ 4,000,000 →<br/>Callback emergencySettle(address)" --> proxy
    proxy -- "settleEpoch(rvm_id) / emergencySettle(rvm_id)<br/>(authorizedSenderOnly + rvmIdOnly)" --> hook
    hook -- "unlock: collect fees, mark-to-market,<br/>run waterfall, roll epoch" --> pm

    classDef chainUS fill:#eef6ff,stroke:#3b82f6,color:#0b3a66;
    classDef chainLA fill:#fff4e6,stroke:#f59e0b,color:#6b3d00;
    class depositor,hook,be,se,pm,proxy chainUS;
    class cron,rsc chainLA;
```

| Contract | Role | Chain |
| --- | --- | --- |
| `UnistrataHook` (`0x1c92…1840`) | Single-pool v4 hook + vault: owns full-range liquidity, prices variance from `afterSwap`, runs the waterfall, receives Reactive callbacks | Unichain Sepolia (1301) |
| `StratumToken` Bedrock / `BEDR` (`0x27b1…4c17`) | Senior tranche — protected principal + fixed variance-priced coupon | Unichain Sepolia (1301) |
| `StratumToken` Sediment / `SEDI` (`0xdec0…1c50`) | Junior/first-loss tranche — absorbs IL, keeps excess fees | Unichain Sepolia (1301) |
| v4 `PoolManager` (`0x00B0…62AC`) | Holds the pool; all liquidity/swap/settle goes through `unlock` | Unichain Sepolia (1301) |
| Reactive callback proxy (`0x9299…7FC4`) | Authorized sender that fronts gas and delivers RSC callbacks to the hook | Unichain Sepolia (1301) |
| `UnistrataReactive` (RSC) (`0xac81…313e`) | Subscribes to CRON + `UnistrataObservation`; emits the heartbeat + circuit-breaker callbacks | Reactive Lasna (5318007) |
| Demo tokens `tUSDC` / `tWETH` (`0x70c5…7d6e` / `0x7a49…7bb6`) | ERC-2612 test tokens with a permissionless faucet; the gasless deposit signs `permit()` against these | Unichain Sepolia (1301) |

---

## Live deployment

Deployed, subscribed, and funded on testnet — the volatility circuit breaker (`emergencySettle`) and CRON heartbeat (`settleEpoch`) are both wired; the cross-chain settlement trail is **regenerating on this deployment** (see below). Addresses are persisted in `.env`; receipts under `broadcast/`. v4 sorts tokens by address, so on this stack **token0 = tUSDC (6, numéraire), token1 = tWETH (18)**.

| Contract | Chain | Address |
|---|---|---|
| tUSDC (6, token0, numéraire) | Unichain Sepolia 1301 | `0x70c598941d7ced513dc01f3775a52cf0e5b47d6e` |
| tWETH (18, token1) | Unichain Sepolia 1301 | `0x7a498c34a8dc3b6502889c21218da0f8696b7bb6` |
| **UnistrataHook** | Unichain Sepolia 1301 | `0x1c92498828ef724e488877cb8df251a406611840` |
| Bedrock / `BEDR` | Unichain Sepolia 1301 | `0x27b1a8d9e5cfced9c765ef3c05fbd500834c4c17` |
| Sediment / `SEDI` | Unichain Sepolia 1301 | `0xdec08761743beef3a11ebd9f8c16c26f56cf1c50` |
| **UnistrataReactive** (RSC) | Reactive Lasna 5318007 | `0xac81c63d936b6a751ecdd412c7c956dc70f9313e` |

### Verified cross-chain trail

The "wow moment" — a real volatility spike, observed on-chain, routed cross-chain by the RSC, and settled back on the origin pool with **no keeper or bot of our own** (the RSC executes on-chain on Reactive; its relayers deliver the callback). Proven end-to-end on the prior deployment; the receipts below are **regenerating on the new EIP-2612 contracts** via a fresh `01_LiveMarket` run:

| Hop | Chain | Tx | What |
|---|---|---|---|
| 0. Deposit | Unichain 1301 | ⏳ _pending re-run_ | deposit into both tranches (Bedrock + Sediment) |
| 1. Build variance | Unichain 1301 | `--slow` swaps | `varAcc` climbs toward the 4,000,000 spike threshold |
| **1b. Trigger crossed** | Unichain 1301 | ⏳ _pending re-run_ | `UnistrataObservation` first reaches `varAcc = 4,000,000` — the RSC's spike threshold |
| 2. RSC reacts | Lasna 5318007 | RSC [`0xac81…313e`](https://lasna.reactscan.net/address/0xac81c63d936b6a751ecdd412c7c956dc70f9313e) | `react()` → `Callback(emergencySettle)` |
| **3. Callback lands** | Unichain 1301 | ⏳ _pending re-run_ | `emergencySettle` → `EmergencySettled` + `EpochSettled`, `epochId 0→1` |

The Portfolio screen reads this exact trail **live** from the chain via `getLogs`.

---

## Build, test & deploy

### Quickstart

```bash
git clone <repo> && cd uhi9
foundryup                    # forge 1.7.x
forge install                # submodules: forge-std, v4-core/periphery, uniswap-hooks, reactive-lib
cp .env.example .env         # RPC URLs + keystore account names (only needed for the deploy scripts)

forge build      # solc 0.8.34, optimizer 444 runs (hook + EIP-2612 path must fit the 24KB limit)
forge test       # 150 tests, 24 suites — all pass (incl. the v4-template baseline suites)
```

Toolchain is pinned in `foundry.toml`: `evm_version = "osaka"` (cosmetic — bytecode is byte-identical to cancun), `bytecode_hash = "none"` + `cbor_metadata = false` for deterministic CREATE2 bytecode, `ffi = true` (the `.env`-writing scripts need it). The invariant profile runs `256 runs × depth 30`; CI can crank it via `FOUNDRY_INVARIANT_RUNS=10000`.

Two RPC aliases are read from the environment (`foundry.toml [rpc_endpoints]`):

| alias | chain | env var |
|---|---|---|
| `unichain_sep` | Unichain Sepolia (1301) — origin / hook home | `UNICHAIN_SEPOLIA_URL` |
| `reactive_lasna` | Reactive Lasna (5318007) — RSC home | `REACTIVE_LASNA_URL` |

### Deploy runbook

All scripts live in `script/unistrata/`. Every broadcasting run uses a keystore account, not a raw key: `--account $ACCOUNT --sender $SENDER --broadcast`. Scripts persist outputs back to `.env` (`EnvWriter.upsert`) and forge auto-loads `.env`, so addresses chain forward.

The whole deployment is **one script with one entry point** — `00_SetupUnistrata`'s `run()` — because none of the deploy steps need `--slow`. It orchestrates the full cross-chain bring-up in a single invocation via in-script forks (so do **not** pass `--rpc-url`); the hook lives only on the origin chain (Unichain Sepolia), and Lasna gets the RSC only. It's one-shot, so fund the deployer on **both** chains first (a partial failure after the hook deploys isn't cleanly re-runnable — the hook's CREATE2 address is deterministic).

| # | script | what it does | target |
|---|---|---|---|
| 00 | `00_SetupUnistrata` (`run()`) | One-shot orchestration. **Origin (Unichain Sepolia):** deploys tWETH/tUSDC, HookMiner-mines + CREATE2-deploys **the hook** (decimals/ordering/numéraire/init-price derived from the real token addresses), `initialize`s the pool, funds the hook via the callback proxy, and seeds a deposit into both tranches (**Sediment first** for the attachment cap). **Lasna:** deploys the RSC (its constructor subscribes: CRON + `UnistrataObservation`; `TICKS_PER_EPOCH=120`, `SPIKE_THRESHOLD=4,000,000`) and funds it. Writes all addresses to `.env`. Needs `HOOK_FUNDING_WEI` + `RSC_FUNDING_WEI`. | both (forks) |
| **01** | **`01_LiveMarket`** | **The crash demo.** A realistic high-volume WETH/USDC session: Phase 1 normal trading (volume → fees, low variance), then Phase 2 a ~40% ETH crash that spikes `varAcc` past the trigger → cross-chain `emergencySettle` → **Bedrock NAV holds (protected), Sediment absorbs the drawdown**. Kept separate because it needs `--slow` (one observation per block). Verified by `test/sim/LiveMarketDemo.t.sol`. | `unichain_sep` |
| **02** | **`02_GreatMarket`** | **The good-market demo — the mirror of 01.** Phase 1 volume (fees), then Phase 2 a gentle ~65% ETH rally in *small* steps so realized variance stays LOW (no breaker fires), and the rally + fees grow the pool; a Phase 3 mark-to-market deposit then shows **Sediment banking the surplus (levered — ~+58% in the harness) while Bedrock stays protected**, and the low variance reprices the coupon HIGH at the next normal settlement. Needs `--slow`. Verified by `test/sim/GreatMarketDemo.t.sol`. | `unichain_sep` |

Once cumulative `varAcc ≥ 4,000,000`, the RSC's `react()` fires `emergencySettle` back to the hook cross-chain (~1–3 min), bumping `epochId`.

### Foundry invariants (brief §6)

- **Conservation (1):** `bedrockNav + sedimentNav ≈ totalAssets` post-settle (within dust).
- **Seniority (2):** Bedrock NAV/share is non-decreasing while Sediment retains coverage — Sediment is first-loss.
- **Coupon honesty (3):** `rMin ≤ bedrockRate() ≤ rMax` at all times.
- **Share fairness (4):** a deposit followed by a next-epoch withdrawal never extracts more than deposited + accrued tranche return — covered by the deposit/withdraw unit suites.
- **varAcc bound (5):** cumulative `varAcc ≤ (elapsed blocks)·dCap²`.
- **Access control (6):** `settleEpoch(rvm_id)`/`emergencySettle(rvm_id)` are gated by `authorizedSenderOnly` **and** `rvmIdOnly`; the permissionless fallback only succeeds after epoch + grace.

### Two gotchas (cost hours — read twice)

1. **`rvm_id` must equal the deploying EOA.** The hook is CREATE2-deployed, so `AbstractCallback`'s default `rvm_id = msg.sender` would be the factory. The constructor overrides it to `tx.origin`. Deploy hook and RSC from the **same EOA**, or every cross-chain callback reverts `"Authorized RVM ID only"`.
2. **Spike swaps need `--slow` (script 05).** The hook accumulates `varAcc` only when `block.number` advances; without `--slow`, forge lands all swaps in one block → one observation. `--slow` awaits each receipt so each swap gets its own block. (Script 06 sidesteps this.)

---

## Frontend

**Live at [unistrata.vercel.app](https://unistrata.vercel.app).** A single-page **Next.js 14 (App Router, TypeScript)** app in `frontend/`, wired to the live hook through **Reown AppKit + wagmi/viem**, with **bun** as the package manager. One network — Unichain Sepolia (1301); reads go through Reown's default blockchain-API proxy (it serves both `eth_call` and the chunked `getLogs` feed).

- **Thesis / Landing** — the pitch: hero, the live capital-structure `StrataCore` visual, four live metric tiles (`useHookState`), and the crash-scenario money chart from real `sim/out` data. An honest `live` / `verified snapshot` badge reflects whether the RPC reads actually succeeded.
- **Deposit** — *fully live, gasless EIP-2612.* A permissionless faucet mints test tokens; depositing signs two ERC-2612 token permits (one per leg — exact amount, hook as spender, deadline) → `depositWithPermit`, with no separate `approve` tx and no standing hook allowance. The hook takes a just-in-time allowance, settles only the amounts actually used straight from the caller, and mints shares. Legs are mapped to `currency0`/`currency1` by token identity so a re-sort can't mis-order them.
- **Withdraw** — *live, epoch-locked.* `requestWithdraw` / `claim` with the +1/+2 lockup; the queue is reconstructed live from `WithdrawRequested` − `WithdrawClaimed` logs.
- **Portfolio** — the live cockpit: hook reads every 30s, a `varAcc`-vs-trigger gauge, a real epoch countdown (`epochStart + epochDuration`), and a **live on-chain event feed** (`useHookEvents`, chunked tip-first `getLogs`) showing the real `EpochSettled` / `EmergencySettled` / `UnistrataObservation` / `Deposit` trail.
- **Simulator** — replays the real Phase-5 `sim/out` scenarios (calm / trend / crash): scrub the epochs and watch the money chart and capital structure move in sync.

```bash
cd frontend
bun install
bun run dev      # http://localhost:3000   (bun run build for production)
```

Env (`.env.example`): `NEXT_PUBLIC_REOWN_PROJECT_ID` (from dashboard.reown.com; wallet connect is off until set) and `NEXT_PUBLIC_UNICHAIN_RPC` (defaults to `https://sepolia.unichain.org`). All on-chain addresses are pinned in `lib/contracts.ts`. The in-app faucet mints test tWETH/tUSDC; you still need Unichain Sepolia ETH for gas.

---

## Security & trust assumptions

Hackathon code — **not audited, testnet only, do not use with real funds.** The trust model:

- **Settlement trigger.** The Reactive callback proxy (`0x9299…7FC4`) is the trusted party that delivers `settleEpoch`/`emergencySettle`; both are gated by `authorizedSenderOnly` (the proxy) **and** `rvmIdOnly` (the RSC's rvm-id, bound to the deploying EOA). A permissionless `settleEpoch()` fallback (after epoch + grace) means a missed callback can't brick the vault. The hook must stay gas-funded or the proxy blocklists it until its debt clears.
- **No external oracle.** Variance and settlement price come from the pool's own tick path — no third-party price to manipulate, but the on-chain price *is* manipulable within a block. Mitigated (not eliminated) by the one-observation-per-block rule, the `dCap` per-block clamp, and the settlement `guardBand` (a coarse spot-deviation guard, not a TWAP).
- **Inflation guard.** The first deposit burns `DEAD_SHARES = 1000` to `0xdead` — the standard first-depositor inflation defense.
- **Reentrancy.** All PoolManager interaction goes through the `unlock` callback with exact `BalanceDelta` settlement; external mutators carry a transient-storage reentrancy guard.

## Limitations & future work

v1 scope decisions (intentional, not bugs): one pool per hook; all liquidity is hook-owned and full-range; withdrawals are epoch-locked (no instant exit); a single numéraire; and the demonstrated coupon floors at 0 under the demo's forced high variance (see the coupon caveat above).

Roadmap: tradeable epoch-dated **variance tokens** (pay realized σ² — completes the variance-swap story), **instant withdrawals with a haircut**, a **dynamic swap fee** proportional to EWMA variance, and a **multi-pool factory** so any v4 pool can be given a capital structure.

---

## Repo layout

```
src/
  UnistrataHook.sol            # the hook: vault, variance, waterfall, Reactive callbacks
  StratumToken.sol             # the BEDR / SEDI tranche share token (ERC20Permit)
  libraries/{VarianceLib,NavLib,WaterfallLib}.sol
  reactive/UnistrataReactive.sol   # the RSC (CRON heartbeat + volatility circuit breaker)
script/unistrata/              # 00_SetupUnistrata (bring-up) + 01_LiveMarket / 02_GreatMarket (--slow demos)
test/                          # 150 tests incl. stateful invariants
sim/                           # Phase-5 scenario replays → sim/out/*.json (the money chart)
frontend/                      # Next.js + Reown AppKit + wagmi/viem (bun)
REACTIVE.md  PROGRESS.md        # Reactive integration notes + build log
```

---

## License

MIT — see [`LICENSE`](LICENSE). Built on the [Uniswap v4 Hook Template](https://github.com/Uniswap/v4-template) (also MIT). See `UNISTRATA_BUILD_BRIEF.md` for the full product spec, `REACTIVE.md` for the Reactive Network integration, and `PROGRESS.md` for the build log.
