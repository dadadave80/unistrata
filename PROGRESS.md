# STRATA — Progress Log

Running log per `STRATA_BUILD_BRIEF.md` §0. Tracks what's done, what's blocked, and any
deviations from the plan (with reasons). Newest status at the top of each phase.

**Branch:** `feat/strata` (off `main`).
**Session scope (current):** Phases 0 → 3 (full on-chain core), orchestrated with workflows + subagents.

---

## Deviation notes

- **2026-06-10 — "Phase 0 done" memory was stale.** A prior session's memory claimed Phase 0
  complete (2026-06-09), but the working tree was at the bare v4-template (only `src/Counter.sol`,
  no `PROGRESS.md`, no Strata code, no `reactive-lib`, no §4 skeleton). Treating Phase 0 as
  **not started** and rebuilding from the verified scaffold. Memory will be corrected.

---

## Toolchain & dependency pins (verified 2026-06-10)

| Component | Version / ref | Notes |
|---|---|---|
| Foundry (`forge`) | 1.7.1 | EVM `cancun`, `via_ir = false` |
| solc | 0.8.30 | See **solc decision** below |
| `forge-std` | v1.10.0 | submodule |
| `uniswap-hooks` (OZ) | v1.1.0 | provides `BaseHook`; nests `v4-core` + `v4-periphery` under `lib/uniswap-hooks/lib/` |
| `hookmate` | 33408fb | v4 address constants / utilities |
| `reactive-lib` | _pending_ | install target being verified by preflight workflow (brief §2) |

**Remappings of note:** `v4-core/`, `v4-periphery/`, `@uniswap/v4-core/`, `@uniswap/v4-periphery/`
all resolve under `lib/uniswap-hooks/lib/`. `HookMiner` lives in v4-periphery (`src/utils/HookMiner.sol`).

**solc decision:** Scaffold pins **0.8.30** with `via_ir = false`. The installed `solidity` skill
recommends **0.8.34+** to dodge the SOL-2026-1 IR-codegen bug (SOL-2026-1) — but that bug **only**
affects `via_ir = true` on Cancun+ when a contract `delete`s a *transient* storage var alongside a
persistent one. With `via_ir = false` it does not apply. **Conditional rule:** if we later enable
`via_ir` (likely needed once `StrataHook` grows past the size limit) *and* use transient storage
(e.g. `ReentrancyGuardTransient`), bump solc to **0.8.34+** at that time.

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
- [ ] (d) Remove template example hook (`Counter.sol`/`Counter.t.sol`) — **deferred** to end of Phase 1
      so the suite stays green until `StrataHook` + tests replace them. `test/utils/` (BaseTest,
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
- **Reactive testnet:** Lasna, chainId `5318007` (RPC `https://lasna-rpc.rnk.dev/`, system contract
  `0x…fffFfF`). Kopli deprecated 2025-07-28 — do not use.
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
- **Hackathon deadline / submission (Notion link, judging date) — UNKNOWN.** User must supply.
- **On-chain address confirmation:** v4 + callback-proxy addresses are doc-sourced; verify bytecode
  (`cast code <addr> --rpc-url <chain>`) before wiring scripts. A conflicting ETH Sepolia proxy
  (`0x9b9BB25f…Cf434`) surfaced in a snippet — official table value used here; confirm before auth.
- **Lasna RPC / system-contract** address has doc ambiguity (`fffFfF` in-contract vs `0x8888…8888`
  network-level; `lasna-rpc` vs `lasna-omni-rpc`) — confirm live at deploy time.
- **Local script drift:** `script/01_*`/`02_*` are modified vs v4-template baseline — confirm intentional.

---

## Phase 1 — Vault core · 🟡 in progress
- [x] `TrancheToken` — minimal ERC-20 (OZ 5.0.2 base), 18 dec, mint/burn restricted to hook via
      `onlyHook`. TDD: 6 unit tests (constructor/metadata, hook-gated mint+burn, non-hook reverts,
      fuzzed mint). One instance per tranche (sSTR / jSTR).
- [ ] StrataHook vault: deposit (both tranches), share mint at NAV, hook-owned full-range liquidity
      via `unlock`, withdrawal queue, NAV views, attachment-point cap, dead-shares guard.

## Phase 2 — Variance oracle · 🟡 in progress
- [x] `VarianceLib` — pure variance accounting (TDD, **20 tests**). `observe` (per-block once,
      reorg/stale no-op, **unsigned `dCap`**, cap binds at dCap², widen-before-subtract, signed
      `blockTickDelta` for the event); `annualizedVariance` (`LN_BASE_SQ_WAD = 9_999_000_092`, **true**
      annualization ×SECONDS_PER_YEAR, **round-UP** protocol-safe, zero-elapsed revert); `ewma`
      (two-term overflow-safe, λ∈[0,1e18]). Critique's 3 HIGH fixes folded in before impl.
- [ ] `afterSwap` wiring in StrataHook: per-block `observe`, `StrataObservation` event, fee-growth snapshots.

**Hook contract (from critique):** `varAcc` is cumulative; `StrataHook` must snapshot it at epoch start
and pass the per-epoch delta to `annualizedVariance`, and must seed `(block, tick)` in `afterInitialize`.
## Phase 3 — Settlement waterfall · 🟡 in progress
- [x] `WaterfallLib` — pure coupon pricing + settlement math (TDD, **21 tests**). `couponRate`
      (clamp, ceil-rounded reserve λ·σ²/8, `InvalidRateBounds` guard); `seniorTarget` (two-step
      FullMath accrual, signed net deposits, floor-at-0, coupon-honesty floor); `settle` (min-split,
      exact conservation, literal impairment flag). Design cross-checked by lib-design workflow's
      adversarial critic (reconciled before impl: single-step ceil reserve, two-step accrual, bounds guard).
- [ ] `settleEpoch` in StrataHook: price guard (GUARD_BAND), epoch roll, withdrawal-queue settlement,
      `SeniorImpaired` (refine literal flag → principal loss `A < sPrev`), `EpochSettled` event.
- [ ] §6 invariant tests (1–4) on the integrated hook.

**Open design note (Phase 3 gate review):** the brief's literal impairment flag fires for both
full-junior-wipe-without-loss and true senior principal loss. `WaterfallLib.settle` returns the literal
flag; `StrataHook` (holds `sPrev`) will distinguish `A < sPrev` for `SeniorImpaired` event semantics.
Confirm desired event taxonomy at Phase 3 review.

(Phases 4–7 out of current session scope.)

---

## Invariants to encode (brief §6) — tracking

1. Conservation: `S_nav + J_nav == totalAssets` post-settlement (± bounded dust).
2. Seniority: senior NAV/share non-decreasing between settlements while junior NAV > 0.
3. Coupon honesty: senior growth/epoch ≤ `r_epoch × Δt` exactly.
4. Share fairness: deposit→next-epoch withdraw never yields > deposited + accrued.
5. Variance sanity: `varAcc` per epoch ≤ `blocks × D_CAP²`.
6. Access: settle callable only by callback proxy before `epochEnd + GRACE`, by anyone after.
