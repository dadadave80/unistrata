# UNISTRATA — Progress Log

Running log per `UNISTRATA_BUILD_BRIEF.md` §0. Tracks what's done, what's blocked, and any
deviations from the plan (with reasons). Newest status at the top of each phase.

**Branch:** `feat/unistrata` (off `main`).
**Session scope (current):** Phases 0 → 3 (full on-chain core), orchestrated with workflows + subagents.

---

## Live testnet deployment (Phase 4 — verified on-chain, FULL LOOP CLOSED 2026-06-11)

Final Unistrata stack (**Permit2 redeploy, Jun 10 2026**) — deployed, pool-initialized, subscribed,
funded, and **demonstrated end-to-end on the fresh hook** (`04`/`05` re-run Jun 11 2026 → `epochId 0→1`,
trail below; addresses in `.env`; receipts under `broadcast/`). v4 address-sort flipped the order:
**token0 = tWETH (18), token1 = tUSDC (6)**:

| Contract | Chain | Address |
|---|---|---|
| tWETH (18, token0) | Unichain Sepolia 1301 | `0x34b4626268da509c69e4cf03b92164b048fb9f8d` |
| tUSDC (6, token1) | Unichain Sepolia 1301 | `0x5ffa4a8d379cb2471b1d4cdf2f5f2d3eca282dd6` |
| UnistrataHook | Unichain Sepolia 1301 | `0xfc4f1c6aecad1507dd0ec4af4d72f62378c25840` (deploy `0x4045c5ce…`, pool init `0xd160fc88…`) |
| UnistrataReactive | Lasna 5318007 | `0x3cad51414bbd94e19c47ef47fe2d65f89e467eea` (deploy `0x362deddd…`) |

Tranche tokens: Bedrock `0x3848b7ab…` (**beWETH**) / Sediment `0x953636fc…` (**seWETH**); rvm_id =
deploying EOA `0xDAdaDA4E…C751`. Subscribed (two `Subscribe` events, zero `SubscribeFailed`: CRON on
5318007 + UnistrataObservation on the hook at 1301). Funded via one multichain `03` run (both `0x1`):
hook `0xcb78de28…` + RSC `0x6436b176…`.

**Spike circuit-breaker — full 3-hop trail (fresh hook `0xfc4f…5840` / RSC `0x3cad51…`, Jun 11 2026):**
deposits (Bedrock `0xe34f6331…5eb1`, Sediment `0x256b1a8d…de2d`, blk 54296142, $12K each) → 6 `--slow`
swaps (blocks 54296191–197) drove `varAcc` 1e6→6e6; **threshold crossed** at `0xf096b8…e52d` (blk 54296197,
`varAcc=6,000,000` past the 4e6 trigger) → RSC reacted → **`emergencySettle` landed** `0x006a1a…5cd3`
(blk 54296205): `EmergencySettled` + `EpochSettled`, `epochId` 0→1. ✅ The Observatory reads this live.

Two fixes found via this run: hook `rvm_id` had to be `tx.origin` not the CREATE2 factory (callbacks
reverted "Authorized RVM ID only"); spike swaps must use `--slow` (one variance observation per block).

---

## Deviation notes

- **2026-06-10 — "Phase 0 done" memory was stale.** A prior session's memory claimed Phase 0
  complete (2026-06-09), but the working tree was at the bare v4-template (only `src/Counter.sol`,
  no `PROGRESS.md`, no Unistrata code, no `reactive-lib`, no §4 skeleton). Treating Phase 0 as
  **not started** and rebuilding from the verified scaffold. Memory will be corrected.

---

## Toolchain & dependency pins (verified 2026-06-10)

| Component | Version / ref | Notes |
|---|---|---|
| Foundry (`forge`) | 1.7.1 | EVM `cancun`, `via_ir = false` |
| solc | 0.8.34 (pinned) | bumped from 0.8.30; deployed contracts use strict `pragma 0.8.34` |
| `forge-std` | v1.10.0 | submodule |
| `uniswap-hooks` (OZ) | v1.1.0 | provides `BaseHook`; nests `v4-core` + `v4-periphery` under `lib/uniswap-hooks/lib/` |
| `hookmate` | 33408fb | v4 address constants / utilities |
| `reactive-lib` | _pending_ | install target being verified by preflight workflow (brief §2) |

**Remappings of note:** `v4-core/`, `v4-periphery/`, `@uniswap/v4-core/`, `@uniswap/v4-periphery/`
all resolve under `lib/uniswap-hooks/lib/`. `HookMiner` lives in v4-periphery (`src/utils/HookMiner.sol`).

**solc decision (resolved):** pinned to **0.8.34** + `optimizer_runs = 999_999`. Deployed contracts
(`UnistrataHook`, `TrancheToken`, `UnistrataReactive`, `ReentrancyGuardTransient`) use a **strict** pragma
`0.8.34`; libraries/tests/scripts stay floating `^0.8.30` (skill-correct). 0.8.34 is the SOL-2026-1
floor, which matters now that the hook uses transient storage (the reentrancy guard).

**Security hardening (solidity-skill gaps closed):** `@custom:security-contact` on all deployable
contracts; **transient `ReentrancyGuardTransient`** (`nonReentrant`, before other modifiers) on every
external mutator — `deposit`, `requestWithdraw`, `claim`, both `settleEpoch`, `emergencySettle`
(defense-in-depth atop v4's non-re-entrant `unlock`); **slither** job added to CI (report-only for now).
Still open (deferred per user): nothing material — BTT `.tree` artifacts and per-finding slither gating.

---

## Phase 0 — Audit existing scaffold  ·  status: 🟡 in progress

- [x] (a) `forge test` green on existing harness — **8 passed** (Counter ×2, EasyPosm ×6).
- [x] §4 directory skeleton created (`src/libraries`, `src/reactive`, `test/{unit,hook,invariant,sim}`, `sim/{paths,out}`).
- [x] `PROGRESS.md` created.
- [x] CI added (`.github/workflows/ci.yml`: `forge fmt --check`, `forge build --sizes`, `forge test`).
- [x] (b) Version-currency check vs upstream v4 — done via preflight workflow (see §2 / template-currency).
- [x] (c) Add `reactive-lib` — **installed** `Reactive-Network/reactive-lib@v0.2.0` (submodule; user
      ran the install after the classifier blocked the agent's `forge install`). Remap
      `reactive-lib/=lib/reactive-lib/src/`. Pragma `>=0.8.0` (compatible w/ 0.8.30). Confirmed layout:
      `abstract-base/{AbstractReactive,AbstractCallback,AbstractPayer,AbstractPausableReactive}.sol`,
      `interfaces/IReactive.sol` (`react(LogRecord)`, `topic_0`).
- [x] (d) Remove template example hook (`Counter.sol`/`Counter.t.sol`) — **done** (script consolidation, 2026-06-11):
      removed once `UnistrataHook` + its suite fully replaced them. `test/utils/` (BaseTest,
      Deployers, EasyPosm) and HookMiner usage are **kept** — the reusable parts.

**Phase 0 gate:** ✅ **PASS** — §4 skeleton + CI in place, `reactive-lib` installed + remapped,
suite green (14 tests: Counter ×2, EasyPosm ×6, TrancheToken ×6).

---

## §2 Verification findings (live-doc check)

_Verified 2026-06-10 against live Reactive Network + Uniswap docs and reactive-lib v0.2.0 source
(preflight workflow, 5 parallel researchers → synthesis). Re-confirm addresses on-chain before deploy._

### (1) Recommended ORIGIN chain
**Unichain Sepolia — chainId `1301`** (only candidate that is simultaneously a canonical Uniswap v4
deployment AND a Reactive origin+destination, and most production-representative). **Ethereum Sepolia
(`11155111`)** is a valid fallback meeting the same two criteria.

### (2) Uniswap v4 addresses — Unichain Sepolia (1301)
| Contract | Address |
|---|---|
| PoolManager | `0x00B036B58a818B1BC34d502D3fE730Db729e62AC` |
| PositionManager | `0xf969Aee60879C54bAAed9F3eD26147Db216Fd664` |
| UniversalRouter | `0xf70536B3bcC1bD1a972dc186A2cf84cC6da6Be5D` |
| StateView | `0xc199F1072a74D4e905ABa1A84d9a45E2546B6222` |

Fallback — ETH Sepolia (11155111): PoolManager `0xE03A1074c86CFeDd5C142C4F04F1a1536e203543` ·
PositionManager `0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4` · StateView `0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C`.

### (3) Reactive Network testnet + callback proxy
- **Reactive testnet:** Lasna, chainId `5318007` (RPC **`https://lasna-rpc.rnk.dev/`**; system contract
  `0x…fffFfF`). Kopli deprecated 2025-07-28 — do not use.
  **`subscribe()` "Failure" root cause (RESOLVED 2026-06-11):** `service.subscribe()` reverts `"Failure"`
  during `forge script`'s local execution because reactive-lib's `SystemLib.getSystemContractImpl()` calls
  the **node-only precompile at `0x64`**, which does NOT exist in Foundry's local EVM — so it returns empty
  and the `require(success && ret.length==0x20)` reverts. This is a Foundry-simulation limitation, **not** a
  contract bug or a stale node: the same call works on a real Lasna node. Fix: `UnistrataReactive`'s constructor
  wraps each `subscribe` in try/catch (emitting `SubscribeFailed`) so one `forge script --broadcast` both
  deploys AND subscribes — the catch only triggers in local sim; the broadcast tx subscribes on-chain.
- **Callback Proxy on Unichain Sepolia (1301):** `0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4` — pass to
  `AbstractCallback(_callback_sender)` and authorize for callbacks.
- Fallback callback proxy (ETH Sepolia): `0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA`.

### (4) reactive-lib install + imports (v0.2.0)
```
forge install Reactive-Network/reactive-lib@v0.2.0      # remap: reactive-lib/=lib/reactive-lib/src/
```
Use plain `reactive-lib`, **not** `reactive-lib-omni` (different AbstractCallback ABI). Imports:
`reactive-lib/abstract-base/{AbstractReactive,AbstractCallback,AbstractPausableReactive}.sol`.
Constructors: `AbstractReactive()` no-arg; `AbstractCallback(address _callback_sender)` **single-arg**;
`AbstractPausableReactive()` no-arg (override `getPausableSubscriptions()`). Handler:
`function react(IReactive.LogRecord calldata log) external`.

### (5) CRON availability
**CRON available** — no event-counting fallback needed. RSC subscribes via
`service.subscribe(block.chainid, address(service), CRON_TOPIC, IGNORE, IGNORE, IGNORE)` and detects
in `react()` via `log.topic_0 == CRON_TOPIC`. Cadences: Cron1 ~7s, Cron10 ~1min, Cron100 ~12min,
Cron1000 ~2h, Cron10000 ~28h (topic_0 hashes captured in workflow output — re-confirm on Lasna).

### (6) Callback funding model
Callback Proxy fronts gas and bills the callback contract as **debt**; min callback gas limit
**100,000**. Pre-fund via **`depositTo(callbackContract)`** (payable, native) on the destination chain's
Callback Proxy; `coverDebt()`/`pay()` settle debt. Uncovered debt → contract **blocklisted** until
cleared. Keep pre-funded with native gas on Unichain Sepolia.

### ⚠️ Unverified / needs user
- **Hackathon deadline: 2026-06-11 23:59 PDT** (~1.5 days from 06-10). Notion link still not provided.
- **On-chain address confirmation:** v4 + callback-proxy addresses are doc-sourced; verify bytecode
  (`cast code <addr> --rpc-url <chain>`) before wiring scripts. A conflicting ETH Sepolia proxy
  (`0x9b9BB25f…Cf434`) surfaced in a snippet — official table value used here; confirm before auth.
- **Lasna RPC:** use `https://lasna-rpc.rnk.dev/`. (An earlier note wrongly flagged it stale in favor of
  `lasna-omni-rpc.rnk.dev`; the real cause of the `subscribe` "Failure" was the absent `0x64` precompile in
  Foundry's local EVM — see §(3). The try/catch constructor lets a single broadcast deploy+subscribe.)
- **Local script drift:** `script/01_*`/`02_*` are modified vs v4-template baseline — confirm intentional.

---

## Phase 1 — Vault core · ✅ complete
- [x] `TrancheToken` — minimal ERC-20 (OZ 5.0.2 base), 18 dec, mint/burn restricted to hook via
      `onlyHook`. TDD: 6 unit tests (constructor/metadata, hook-gated mint+burn, non-hook reverts,
      fuzzed mint). One instance per tranche (BEDR / SEDI).
- [x] `NavLib` — pure mark-to-market valuation primitives (TDD, **14 tests**). `fullRangeBounds`
      (tickSpacing-aligned, returns ticks + sqrtPrices); `getPositionTokenAmounts` (delegates to
      canonical v4-core `LiquidityAmounts`, imported in place); `valueInNumeraire` (cross-token pricing
      via two-step mulDiv, **numéraire decimals chosen internally** → anti ETH/USDC ordering bug §7);
      `toWad` (USDC6 ×1e12 exact). Stateful `totalAssets(manager,…)` orchestrator **deferred to hook
      integration** (reads live PoolManager slot0/position/fee-growth; critic's fee/idle double-count
      concerns resolve there with a real pool).
- [~] `UnistrataHook` — **foundation done** (TDD, **6 hook tests** vs local PoolManager): construction +
      tranche tokens (BEDR/SEDI), `getHookPermissions` (afterInitialize|afterSwap|beforeAddLiquidity),
      **single-pool binding** + variance seeding in `afterInitialize`, **external-LP guard** in
      `beforeAddLiquidity`. `Config` struct exposes all governance dials.
  - [x] **deposit** (both tranches) → `unlock` → `modifyLiquidity` (full-range add) → settle from
        depositor (`CurrencySettler`) → mint at NAV. TDD, **7 hook tests** vs local PoolManager.
  - [x] attachment-point cap (θ_max), dead-shares guard (1000 to 0xdead), `totalAssets()` view
        (matches tracked NAV ≤5 wei), `bedrockCapacityRemaining()`.
  - [x] **withdrawal queue** — `requestWithdraw` escrows shares; epoch lockup (bedrock +1, sediment +2);
        `claim` removes the withdrawer's share-proportional slice of position + idle, burns shares,
        reduces NAV (NAV/share preserved). TDD, **6 tests**. ✅
  - [x] **`afterSwap` variance wiring** — per-block `VarianceLib.observe` + `UnistrataObservation` event.
        TDD, **5 hook tests** (once-per-block, cap binds at dCap²=1e6, same-block no-op, bounded). ✅
        Fee-growth snapshot folds in with `settleEpoch`.

> **Milestone — pure-math foundation complete.** All 3 §4 libraries done & TDD-covered (Waterfall 21,
> Variance 20, Nav 14) + TrancheToken (6). 69 tests green. Next: the `UnistrataHook` that composes them
> (Phase 1 vault + Phase 2 afterSwap + Phase 3 settleEpoch), integration-tested vs a local PoolManager.

## Phase 2 — Variance oracle · ✅ complete
- [x] `VarianceLib` — pure variance accounting (TDD, **20 tests**). `observe` (per-block once,
      reorg/stale no-op, **unsigned `dCap`**, cap binds at dCap², widen-before-subtract, signed
      `blockTickDelta` for the event); `annualizedVariance` (`LN_BASE_SQ_WAD = 9_999_000_092`, **true**
      annualization ×SECONDS_PER_YEAR, **round-UP** protocol-safe, zero-elapsed revert); `ewma`
      (two-term overflow-safe, λ∈[0,1e18]). Critique's 3 HIGH fixes folded in before impl.
- [ ] `afterSwap` wiring in UnistrataHook: per-block `observe`, `UnistrataObservation` event, fee-growth snapshots.

**Hook contract (from critique):** `varAcc` is cumulative; `UnistrataHook` must snapshot it at epoch start
and pass the per-epoch delta to `annualizedVariance`, and must seed `(block, tick)` in `afterInitialize`.
## Phase 3 — Settlement waterfall · ✅ complete
- [x] `WaterfallLib` — pure coupon pricing + settlement math (TDD, **21 tests**). `couponRate`
      (clamp, ceil-rounded reserve λ·σ²/8, `InvalidRateBounds` guard); `bedrockTarget` (two-step
      FullMath accrual, signed net deposits, floor-at-0, coupon-honesty floor); `settle` (min-split,
      exact conservation, literal impairment flag). Design cross-checked by lib-design workflow's
      adversarial critic (reconciled before impl: single-step ceil reserve, two-step accrual, bounds guard).
- [x] **`settleEpoch`** in UnistrataHook — mark-to-market, waterfall split, price guard (GUARD_BAND),
      fee collection via poke, epoch roll + coupon reprice, **two impairment events** (`BedrockImpaired`
      on principal loss `A<sPrev`, else `BedrockBelowCoupon`), `EpochSettled`. TDD, **6 integration tests**
      (conservation, coupon honesty, sediment-absorbs-IL/bedrock-protected, reprice, guard revert, not-elapsed). ✅
- [x] withdrawal-queue settlement — done (epoch-locked request/claim, see Phase 1 above).
- [x] **Formal stateful-invariant harness** (`test/invariant/`): handler does random deposit/swap/settle;
      ~7.7k calls/invariant, ~1.9k settlements, 0 reverts. Asserts **inv. 1 (conservation)** + **inv. 2
      (seniority)** post-settle, plus stateless **inv. 5 (varAcc ≤ blocks·dCap²)** and rate-clamp.
      `[invariant]` config added (runs=256/depth=30; CI cranks to ~10k). ✅

**Open design note (Phase 3 gate review):** the brief's literal impairment flag fires for both
full-sediment-wipe-without-loss and true bedrock principal loss. `WaterfallLib.settle` returns the literal
flag; `UnistrataHook` (holds `sPrev`) will distinguish `A < sPrev` for `BedrockImpaired` event semantics.
Confirm desired event taxonomy at Phase 3 review.

## Phase 4 — Reactive integration · ✅ complete (full cross-chain loop verified on testnet)
- [x] **Hook-side callback auth** — `UnistrataHook` is an `AbstractCallback`; `settleEpoch(address)`
      (heartbeat) + `emergencySettle(address)` (early) are proxy-only (`authorizedSenderOnly` +
      `rvmIdOnly`); permissionless `settleEpoch()` fallback after epoch + grace. TDD, **7 tests**.
- [x] **`UnistrataReactive` RSC** — CRON heartbeat (counter, once per epoch) + variance-spike circuit
      breaker (`emergencySettle`), emits cross-chain `Callback`s; subscriptions in constructor.
      TDD, **6 react() tests** (local via vm-detection).
- [x] **Deploy/fund/subscribe scripts** (`script/unistrata/{00_DeployMockTokens,01_DeployUnistrata,
      02_DeployReactive,03_FundAndSubscribe}`) + **`REACTIVE.md` runbook** (verified addresses, sequence,
      funding, demo capture).
- [x] **Pool tokens decided: demo mocks tWETH (18) + tUSDC (6)**, USDC = numéraire. `DemoERC20`
      (mintable) + `UnistrataDeploy` lib derives token0/token1 ordering, decimals, numéraire flag and
      init sqrt-price (1 WETH = 3000 USDC) from the real addresses — closes the §7 decimals/ordering
      footguns. Proven by `UnistrataMixedDecimals.t.sol`: a ~$12k deposit reads as ~12,000e18 WAD (a
      decimals mis-wire would be off by ~1e12). **124 tests.**
- [x] **End-to-end testnet run** — **spike path verified on-chain**: 6 `--slow` swaps drove `varAcc`
      past the 4e6 threshold (`0xe07d6c49…`) → RSC reacted on Lasna (`CALLBACKS=1`) → `emergencySettle`
      landed on the hook `0x4faab03f…` ~12 blocks later, `epochId` 0→1. Full 3-hop trail in `REACTIVE.md`.
      (Heartbeat path needs ~120 CRON ticks ≈ 24h, so the spike is the demonstrated trigger.)

## Phase 5 — Simulation harness · ✅ complete
- [x] **`SimSwapper`** — moves the pool to a target sqrt price with a real, price-limited
      `PoolManager.swap` (the v4 router doesn't expose price limits), triggering `afterSwap` variance.
- [x] **`SimReplay.t.sol`** — replays `sim/paths/<scenario>.json` (calm / trend / crash, deterministic
      GBM) as swaps, settles epochs on schedule, exports `sim/out/<scenario>.json` per-epoch metrics,
      and asserts conservation + bedrock-protection under the path. 3 scenarios, 119 tests total.
- [x] **The money chart** (crash): bedrock NAV flat at 600 through a ~44% swing; sediment absorbs the
      gap (970 → 595 → 715); vanillaLP < HODL (IL visible). ✅ brief §5 acceptance met.
- [x] Output schema defined (the Phase-6 contract) — documented atop `SimReplay.t.sol`; WAD-integer
      strings. Outputs committed (un-ignored) so the frontend's replay mode needs zero tooling.

## Phases 6–7 — remaining (frontend wiring to the sim JSON + live reads; README/architecture/video).

---

## Invariants to encode (brief §6) — tracking

1. Conservation: `S_nav + J_nav == totalAssets` post-settlement (± bounded dust).
2. Seniority: bedrock NAV/share non-decreasing between settlements while sediment NAV > 0.
3. Coupon honesty: bedrock growth/epoch ≤ `r_epoch × Δt` exactly.
4. Share fairness: deposit→next-epoch withdraw never yields > deposited + accrued.
5. Variance sanity: `varAcc` per epoch ≤ `blocks × D_CAP²`.
6. Access: settle callable only by callback proxy before `epochEnd + GRACE`, by anyone after.
