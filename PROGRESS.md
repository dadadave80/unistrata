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
- [ ] (b) Version-currency check vs upstream v4 — **delegated to preflight workflow** (brief §2).
- [ ] (c) Add `reactive-lib` — **blocked on install target verification** (preflight workflow).
- [ ] (d) Remove template example hook (`Counter.sol`/`Counter.t.sol`) — **deferred** to end of Phase 1
      so the suite stays green until `StrataHook` + tests replace them. `test/utils/` (BaseTest,
      Deployers, EasyPosm) and HookMiner usage are **kept** — the reusable parts.

**Phase 0 gate:** `forge test` green with `reactive-lib` installed and §4 skeleton in place → reactive-lib install still pending.

---

## §2 Verification findings (live-doc check)

> _Preflight workflow `strata-preflight-verification` running (5 parallel researchers → synthesis).
> Synthesis report will be pasted here on completion: Reactive testnet/chainId/callback-proxy,
> reactive-lib install target + API, v4 addresses, recommended origin chain, CRON availability,
> funding model._

**⚠️ Needs user:** Hookathon submission specifics (deadline, repo visibility, video format) — provide
the Atrium UHI9 Notion link when convenient.

---

## Phase 1 — Vault core · ⬜ not started
## Phase 2 — Variance oracle · ⬜ not started
## Phase 3 — Settlement waterfall · ⬜ not started

(Phases 4–7 out of current session scope.)

---

## Invariants to encode (brief §6) — tracking

1. Conservation: `S_nav + J_nav == totalAssets` post-settlement (± bounded dust).
2. Seniority: senior NAV/share non-decreasing between settlements while junior NAV > 0.
3. Coupon honesty: senior growth/epoch ≤ `r_epoch × Δt` exactly.
4. Share fairness: deposit→next-epoch withdraw never yields > deposited + accrued.
5. Variance sanity: `varAcc` per epoch ≤ `blocks × D_CAP²`.
6. Access: settle callable only by callback proxy before `epochEnd + GRACE`, by anyone after.
