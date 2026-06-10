# UNISTRATA — Build Plan for Claude Code

> **Hand-off instructions:** This file is the single source of truth. Read it fully before writing code. Work phase by phase, in order. Do not start a phase until the previous phase's acceptance criteria pass. Keep a running `PROGRESS.md` noting what's done, what's blocked, and any deviations from this plan (with reasons).

---

## 1. What we are building

**Unistrata** — a Uniswap v4 hook that turns a liquidity pool into a capital structure.

One pool, two deposit classes:

- **Bedrock tranche (BEDR):** earns a fixed, variance-priced coupon per epoch. Protected from impermanent loss until the sediment tranche is exhausted.
- **Sediment tranche (SEDI):** absorbs IL first, in exchange for leveraged exposure to all residual fees and pool upside. The sediment tranche is, economically, a seller of realized variance — it underwrites the bedrock tranche's IL insurance and is paid for it.

The hook owns the pool liquidity, measures **realized variance directly from the pool's own tick path** (no external oracle), prices the bedrock coupon off that variance, and settles a bedrock/sediment waterfall every epoch.

**Reactive Network is a required, core component**, not a stretch goal: epoch settlement and volatility-spike emergency settlement are triggered by a Reactive Smart Contract (RSC) — no keepers, no bots, no Gelato/Chainlink Automation. The automation layer IS Reactive.

### Context: why this design (informs every tradeoff)

This is a submission for the Atrium UHI9 Hookathon (theme: Impermanent Loss & Yield Systems). Judging weights: Original Idea 30%, Unique Execution 25%, Impact 20%, Functionality 15%, Presentation 10%. The Reactive Network sponsor track rewards "the most innovative hooks that implement Reactive Smart Contracts correctly."

Implications:
- **Correctness of the core mechanism > feature count.** A tight, working bedrock/sediment waterfall with one pool beats a sprawling half-working system.
- **The demo is a first-class deliverable.** A simulation harness that produces the "money chart" (bedrock NAV flat through a 40% price swing while vanilla LP bleeds) is part of the build, not an afterthought.
- **The RSC integration must be idiomatic** (proper subscriptions, callback proxy auth, correct payment model) because the sponsor judges specifically for correct RSC implementation.

---

## 2. Verify before coding (do not trust memorized facts)

Your training data on these may be stale. Before Phase 0, confirm from live docs and record findings in `PROGRESS.md`:

1. **Reactive Network** (https://dev.reactive.network): current testnet name and chain ID, supported origin/destination chains, callback proxy addresses, the current `reactive-lib` package (AbstractReactive / AbstractCallback / AbstractPausableReactive patterns), CRON topic availability and topic IDs, callback payment/funding model (debt repayment, `depositTo`, minimum balances).
2. **Uniswap v4** (https://docs.uniswap.org): PoolManager + PositionManager + Universal Router addresses on the chosen testnet(s); compare the repo's existing v4-template scaffold (already in place — see Phase 0) against upstream (https://github.com/uniswapfoundation/v4-template) and note whether its pinned `v4-core` / `v4-periphery` versions are current enough to keep.
3. **Chain choice:** pick an origin chain that is BOTH a supported Reactive destination chain AND has a canonical v4 PoolManager deployment (Sepolia is the likely intersection; Unichain Sepolia preferred if Reactive supports it). The pool + hook live on the origin chain; the RSC lives on Reactive's network; callbacks fire back to the origin chain.
4. **Hookathon submission requirements** (ask the user for the Notion link if needed): deadline, repo visibility, video format.

If any doc contradicts this plan, the doc wins — note the deviation.

---

## 3. Mechanism specification (the math — implement exactly)

### 3.1 Pool & position
- One v4 pool (e.g., ETH/USDC, 0.30% fee tier or dynamic-fee flag if time allows), **full-range hook-owned liquidity** for v1. Concentrated ranges are out of scope (stretch only).
- Users never hold v4 positions. They deposit token0+token1 in pool ratio; the hook adds liquidity via the PoolManager `unlock` callback pattern and mints tranche shares.

### 3.2 Tranche shares
- Two ERC-20s: `BEDR`, `SEDI` (ERC-20 over ERC-6909 for frontend/wallet simplicity).
- Mint at deposit: `shares = depositValue / trancheNavPerShare` (value measured in the numéraire — token1, assumed USD-stable, or USD via pool price).
- **First-depositor inflation guard:** seed both tranches with dead shares (e.g., mint 1000 shares to address(0)) at initialization.

### 3.3 In-hook realized variance oracle (the novel primitive)
v4 ticks are log-price units: `tick = log_{1.0001}(price)`, so `Δlog p = Δtick × ln(1.0001)`.

- Store `(lastObservedBlock, lastObservedTick)`.
- In `afterSwap`: if `block.number > lastObservedBlock`, compute `d = currentTick − lastObservedTick`, then `varAcc += min(d², D_CAP²)` and update the stored pair. **Only one observation per block** — intra-block swap sequences contribute a single block-close-to-block-close delta. This is the manipulation guard: pumping variance requires moving the price across block boundaries, which costs real money through arbitrage.
- `D_CAP` (max per-block tick delta counted, e.g., 1000 ticks ≈ 10%) is a constructor parameter.
- Annualizable variance: `σ² = varAcc × ln(1.0001)² / elapsedTime`.
- Maintain an EWMA of per-epoch variance (`sigma2Ewma`) and of fee yield (`feeYieldEwma`) with configurable smoothing λ.
- Also track fee growth: snapshot the position's `feeGrowthInside` per epoch to attribute fees earned.

### 3.4 Bedrock coupon pricing (variance-priced fixed income)
The known result for full-range constant-product market making: loss-versus-rebalancing accrues at a rate of approximately **σ²/8 per unit time** (as a fraction of pool value). Use it:

```
r_epoch = clamp( feeYieldEwma − λ_risk × sigma2Ewma / 8 , r_min , r_max )
```

- `r_epoch` is fixed at the START of each epoch and displayed to depositors. It is the bedrock tranche's contractual coupon for that epoch.
- Interpretation (use this in comments and the README — it's the pitch): the bedrock tranche earns the pool's fee income **net of an actuarially-priced reserve for expected IL**; the sediment tranche keeps the excess and bears the realized risk.
- Defaults: `λ_risk = 1.25` (25% safety margin), `r_min = 0`, `r_max = 50% APR`.

### 3.5 Epoch settlement waterfall
On `settleEpoch()` (Reactive-triggered, see 3.7):

1. **Mark to market:** read current tick; compute total position value `A` in numéraire (token amounts from liquidity math at current sqrtPrice, plus uncollected fees, plus any idle balances). **Price guard:** require `|currentTick − blockSampledTick from our own observations over the epoch| ≤ GUARD_BAND`, else revert with `SettlementPriceOutOfBand` (the permissionless fallback can retry next block; this blunts settlement-block price manipulation).
2. **Bedrock target:** `S_target = S_prev × (1 + r_epoch × Δt) + bedrockNetDeposits`.
3. **Waterfall:** `S_new = min(A, S_target)`; `J_new = A − S_new`.
4. If `J_new == 0` and `A < S_target`, the bedrock tranche is impaired — emit `BedrockImpaired` (this should be nearly impossible at the default 75% cap; the invariant tests must cover it).
5. Roll the epoch: snapshot variance + fees, recompute `r_epoch+1`, emit `EpochSettled(epochId, A, S_new, J_new, realizedVar, feesEarned, newRate)` — the frontend's event feed is built from this.
6. Process the withdrawal queue (3.6) at the new NAVs.

Rounding: always round in favor of the protocol/remaining LPs (against the actor).

### 3.6 Deposits, withdrawals, caps
- **Attachment-point cap:** bedrock deposits revert if post-deposit `S/(S+J) > θ_max` (default 75%). This guarantees minimum sediment coverage. Expose `bedrockCapacityRemaining()` for the UI.
- **Withdrawals are epoch-settled:** users call `requestWithdraw(tranche, shares)`; requests queue and settle at the next epoch's NAV, claimable afterwards. (Instant withdrawal with a haircut is a stretch goal — do not build it in v1.)
- **Sediment lockup:** sediment withdrawal requests must be queued at least one full epoch before settlement (prevents exiting just before a volatility event that the underwriter is paid to absorb).

### 3.7 Reactive Network integration (required)
Two reactive triggers, one RSC:

- **Epoch heartbeat:** subscribe to Reactive's CRON topic (verify availability; if no suitable CRON granularity, fall back to counting origin-chain Swap events and using block timestamps from the event metadata). When `epochDuration` has elapsed → emit a callback to `UnistrataHook.settleEpoch()` on the origin chain.
- **Volatility circuit breaker:** the hook emits `UnistrataObservation(int24 blockTickDelta, uint256 varAcc)` from `afterSwap` (cheap, only on new-block observations). The RSC subscribes to this event; if cumulative |tick delta| within a sliding window exceeds `SPIKE_THRESHOLD` → fire `emergencySettle()` callback, which settles the epoch early (locking in the bedrock coupon pro-rata before further drawdown). This is the demo's wow moment AND the sponsor-track story: *cross-chain, event-driven risk management with zero off-chain infrastructure.*

Implementation requirements:
- `UnistrataReactive.sol` on Reactive Network extends the current `AbstractReactive`/`AbstractPausableReactive` from reactive-lib; subscriptions set in constructor (origin chain ID, hook address, event topic_0).
- Hook-side auth: `settleEpoch`/`emergencySettle` callable only by the Reactive callback proxy address (use the `AbstractCallback` pattern with the rvm-id check per current docs), **plus a permissionless fallback**: anyone may call `settleEpoch()` if `block.timestamp > epochEnd + GRACE_PERIOD` (e.g., 1 hour). The demo must never brick because a callback didn't land.
- Fund the callback contract per Reactive's current payment model; document the funding steps in the deploy script and README.

### 3.8 Hook permissions
`getHookPermissions()` → `afterInitialize` (set epoch 0 state), `afterSwap` (variance + observation event). Deposits/withdrawals go through the hook's own external functions using `unlock`, NOT through add/remove-liquidity hooks. Set `beforeAddLiquidity` to revert for any caller other than the hook itself (prevents outside LPs from free-riding the pool without entering the capital structure). Mine the hook address with the correct flag bits (HookMiner / CREATE2 salt search in the deploy script and in tests).

---

## 4. Repository layout

```
unistrata/
├── PROGRESS.md
├── README.md                  # written in Phase 7; includes architecture diagram
├── foundry.toml
├── src/
│   ├── UnistrataHook.sol         # the v4 hook: vault, variance oracle, waterfall, callbacks
│   ├── TrancheToken.sol       # minimal ERC20, mint/burn restricted to hook
│   ├── libraries/
│   │   ├── VarianceLib.sol    # tick-delta variance accounting, EWMA
│   │   ├── WaterfallLib.sol   # pure settlement math (unit-testable in isolation)
│   │   └── NavLib.sol         # position valuation from liquidity + sqrtPrice
│   └── reactive/
│       └── UnistrataReactive.sol # RSC deployed on Reactive Network
├── test/
│   ├── unit/                  # WaterfallLib, VarianceLib, NavLib pure-math tests
│   ├── hook/                  # deposit/withdraw/settle integration vs local PoolManager
│   ├── invariant/             # see §6
│   └── sim/                   # scenario replays (see Phase 5)
├── script/
│   ├── 00_DeployPool.s.sol    # PoolManager wiring or canonical address, pool init, hook mining
│   ├── 01_DeployReactive.s.sol
│   ├── 02_FundAndSubscribe.s.sol
│   └── 03_DemoSwaps.s.sol     # scripted volatile price path against the testnet pool
├── sim/
│   └── paths/                 # JSON price paths: calm.json, trend.json, crash.json
└── frontend/                  # Phase 6 — integrates the Claude Design build
```

Dependencies: `v4-core`, `v4-periphery`, `forge-std` (already present via the existing v4-template scaffold — verify versions, don't re-install), plus current `reactive-lib` (to add). Pin versions in `PROGRESS.md`.

---

## 5. Phases & acceptance criteria

### Phase 0 — Audit existing scaffold (1–2 hours)
**The v4-template scaffold already exists in this repo — do NOT clone or re-scaffold.** Instead: (a) run `forge test` to confirm the existing harness is green; (b) check the pinned `v4-core`/`v4-periphery` versions against current releases and upgrade only if the template's hook-mining or Deployers patterns require it; (c) add `reactive-lib` as a dependency; (d) restructure toward the §4 layout (rename/remove the template's example hook, keep its HookMiner usage and test utilities — they're the parts worth preserving); (e) add CI with `forge test` if absent. ✅ `forge test` green on the existing harness with `reactive-lib` installed and the §4 directory skeleton in place.

### Phase 1 — Vault core (2–3 days)
UnistrataHook with deposit (both tranches), share minting at NAV, hook-owned full-range liquidity via unlock callback, withdrawal queue, NAV view functions, attachment-point cap, dead-shares guard.
✅ Tests: deposit→shares math exact across decimals; cap enforced; queue lifecycle; only-hook liquidity enforced; NAV matches independent liquidity-math calculation to 1 wei tolerance.

### Phase 2 — Variance oracle (1–2 days)
VarianceLib + afterSwap wiring, per-block sampling, D_CAP, EWMA, UnistrataObservation event, fee-growth snapshots.
✅ Tests: multi-swap-single-block counts once; cap binds; fuzz: varAcc monotone, no overflow at extreme ticks; replayed deterministic path produces hand-computed σ².

### Phase 3 — Settlement waterfall (2–3 days)
WaterfallLib + settleEpoch + coupon pricing + price guard + epoch roll + withdrawal-queue settlement + BedrockImpaired path.
✅ Unit: waterfall truth table (fees > coupon, fees < coupon, IL partial sediment wipe, full sediment wipe, bedrock impairment). Invariants in §6 pass 10k runs.

### Phase 4 — Reactive integration (2–3 days)
UnistrataReactive RSC, callback auth on hook, grace-period fallback, deploy + funding + subscription scripts, end-to-end on testnets: scripted swaps on origin chain → RSC observes → callback settles epoch.
✅ A recorded end-to-end run: tx hashes for (origin swap) → (RSC reaction on Reactive explorer) → (settle callback on origin). Both heartbeat AND spike-triggered emergency settle demonstrated. This artifact goes in the README and the video.

### Phase 5 — Simulation harness (1–2 days)
Foundry script replaying JSON price paths (GBM calm / trending / 2021-style crash with vol spike) as swaps against a local pool; settles epochs on schedule; exports `sim/out/<scenario>.json` with per-epoch: price, HODL value, vanilla-LP value, bedrock NAV/share, sediment NAV/share, realized σ², fees, coupon rate, events.
✅ The crash scenario JSON shows: vanilla LP underperforms HODL (IL visible); bedrock NAV stays on its coupon line; sediment absorbs the gap. This file feeds the frontend's money chart — its schema is a contract with Phase 6, define it first.

### Phase 6 — Frontend integration (2–3 days)
The UI design comes from a separate Claude Design hand-off (the user will provide the exported design/code). Your job: wire it.
- Stack: Vite + React + TypeScript + wagmi v2 + viem + the design's styling system. Chart lib: whatever the design specifies (recharts or lightweight-charts).
- **Two data modes behind one interface:** `live` (testnet reads + EpochSettled/UnistrataObservation event subscriptions) and `replay` (sim JSON from Phase 5, with a play/scrub control). The demo defaults to replay mode with live mode shown briefly — never let testnet flakiness kill the demo.
- Screens (per the design): Landing (pitch + money chart), Deposit (tranche choice, live coupon rate, bedrock capacity, coverage ratio), Observatory (capital-structure visualization, variance gauge, Reactive event feed with explorer links), Simulator (scenario scrubber).
✅ Full deposit→settle→withdraw clickthrough on testnet; replay mode runs with zero network access.

### Phase 7 — Polish & pitch assets (1–2 days)
README with architecture diagram (mermaid), mechanism explainer with the σ²/8 derivation sketch, deployment addresses table, demo video storyboard (below), submission checklist.

### Stretch (only if all above is done): tradeable variance tokens (mint epoch-dated tokens paying realized σ² — completes the "variance swap" story), instant withdrawals with haircut, dynamic swap fee proportional to EWMA variance.

---

## 6. Invariants (encode as Foundry invariant tests)

1. **Conservation:** `S_nav + J_nav == totalAssets` after every settlement (± rounding dust, bounded).
2. **Seniority:** bedrock NAV/share never decreases between consecutive settlements while sediment NAV > 0.
3. **Coupon honesty:** bedrock growth per epoch ≤ `r_epoch × Δt` exactly (no over-crediting).
4. **Share fairness:** deposit immediately followed by withdrawal request settled next epoch never yields more value than deposited + accrued tranche return (no NAV arbitrage).
5. **Variance sanity:** varAcc per epoch ≤ blocks × D_CAP².
6. **Access:** settle callable only by callback proxy before `epochEnd + GRACE`, by anyone after.

---

## 7. Known pitfalls (read twice)

- **Hook address flags:** the deployed address must encode the permission bits. Mine the salt in scripts AND tests; assert `validateHookAddress`.
- **unlock/settle/take accounting:** all PoolManager interactions go through the unlock callback with exact BalanceDelta settlement. Off-by-one in deltas = locked funds.
- **Settlement price manipulation:** the GUARD_BAND check (3.5) is mandatory, not optional.
- **Token decimals:** ETH(18)/USDC(6) — normalize in NavLib; test both orderings of token0/token1.
- **Reactive callback gas:** callbacks carry a gas limit — settlement must fit; keep the withdrawal queue O(1) amortized (pull-based claims, not push loops).
- **Reentrancy:** unlock callback re-entry; use the v4-periphery patterns + a simple lock on external mutators.
- **Don't hand-roll liquidity math:** use v4-core's LiquidityAmounts/SqrtPriceMath.

---

## 8. Demo video storyboard (3 minutes — build the demo to serve this)

1. **0:00–0:25 — Problem:** "LPs are forced sellers of volatility with no buyer. IL is just the bill." One chart: vanilla LP vs HODL bleeding.
2. **0:25–1:00 — Idea:** the capital-structure framing. Show the Observatory's layered visualization: bedrock at the bottom, sediment on top.
3. **1:00–2:00 — Live mechanism:** replay the crash scenario. Price swings 40%; variance gauge climbs; the sediment layer visibly compresses; bedrock NAV line stays on its coupon track. Then the Reactive feed: a real spike event → RSC → emergencySettle callback, with explorer links on screen.
4. **2:00–2:40 — Why it matters:** sustainable on-chain fixed income sized off an honest, oracle-free risk measure; sediment as a new vol-selling asset class; zero keeper infrastructure.
5. **2:40–3:00 — Traction surface:** deposit flow on testnet, addresses, repo, "every parameter is a governance dial; every pool can have a capital structure."

---

## 9. Judging map (keep visible while building)

| Criterion (weight) | Where we earn it |
|---|---|
| Original Idea (30%) | Tranching IL + in-pool variance oracle + variance-priced coupon — a new primitive, not an integration |
| Unique Execution (25%) | Oracle-free σ² from tick deltas; σ²/8 actuarial pricing; keeper-less Reactive automation; epoch waterfall |
| Impact (20%) | Fixed income for passive LPs + a tradeable vol-underwriting asset; works for any v4 pool |
| Functionality (15%) | Invariant-tested waterfall; end-to-end testnet run with real RSC callbacks |
| Presentation (10%) | The money chart + the live layered visualization + the 3-min storyboard |
| Reactive sponsor track | Idiomatic RSC: subscriptions, callback proxy auth, funding, CRON + event-driven triggers, recorded cross-chain tx trail |