# Unistrata — Design System

**Unistrata** is a Uniswap v4 protocol that turns a liquidity pool into a **capital structure**. A pool's deposits are split into two layers, like geological strata:

- **Bedrock** (senior tranche) — the floor. Earns a fixed coupon each epoch, priced from the pool's own measured volatility. Protected from impermanent loss until the Sediment layer is exhausted.
- **Sediment** (junior / first-loss tranche) — the topsoil. Absorbs impermanent loss first; in exchange keeps all excess fees and the volatility risk premium. Sediment depositors are underwriters selling volatility.

Realized volatility is measured directly from the pool's price ticks (no external oracle). A **Reactive Network** contract on another chain watches the pool and triggers settlements automatically — no bots, no keepers. Every epoch a **waterfall** runs: assets flow to Bedrock first up to its coupon, Sediment takes the rest.

> **The thesis:** "LPs are forced sellers of volatility with no buyer. Unistrata built the buyer."

**Audience for the product:** DeFi-literate hackathon judges and crypto VCs watching a 3-minute demo. The single job of the interface: make a viewer understand the Bedrock/Sediment waterfall within ten seconds, and feel they're looking at an institution-grade financial instrument.

### Sources
This system was authored from the Unistrata product brief (no external codebase or Figma was provided). It is a from-scratch brand and product system. Mock protocol data lives in `ui_kits/strata-app/data.js` (ETH/USDC pool, TVL $2.4M, epoch 47, σ² 0.41%/day, Calm/Trend/Crash scenarios).

---

## The signature element — the Unistrata Core

The brand is one idea rendered three ways. The **Strata Core** is a living cross-section of the pool's capital structure, drawn as horizontal sedimentary layers: senior is the deep, dense layer at the bottom; junior sits above it; overburden/impairment is the void on top. Layers are sized by real NAV against a fixed scale, so when impermanent loss hits, **the junior layer visibly compresses while the senior layer holds its line.** Epoch settlements ripple through it as a single orchestrated ~1s sweep.

It appears: **large** in the Observatory and Simulator (`StrataCore`), **miniaturized** as a live glyph in the navigation (`StrataCore glyph`), and **abstracted** as the logo mark (`assets/strata-mark.svg` — a geological core sample). Nail this one element and everything else can stay quiet and disciplined.

---

## CONTENT FUNDAMENTALS — how Unistrata writes

The interface reads like it was written by someone who prices risk for a living. Precise, declarative, financial. **Zero hype.**

- **Voice:** plain verbs, sentence case, declarative. Say what things *do*: "Deposit to Bedrock", "Request withdrawal — settles at epoch 48", "Coupon priced from realized volatility: σ² = 0.41%/day".
- **Casing:** sentence case for all prose and most UI. UPPERCASE only for mono eyebrow/overline labels (tracked +0.08em). Never Title Case Headlines.
- **Person:** second person for the depositor's own actions and risk ("your principal is covered by $1.84M of Sediment capital", "you absorb losses first"). Third-person/impersonal for protocol mechanics ("the waterfall runs Bedrock-first").
- **Banned words:** supercharge, unleash, next-gen, revolutionary, seamless. **No exclamation marks.** No emoji.
- **Numbers are the protagonists.** Quote them precisely and with units: "7.2% fixed this epoch", "23.4% trailing", "σ² = 0.41%/day", "≈ 3.1× leverage". Tranche names are capitalized as proper nouns: Bedrock, Sediment.
- **Tranche naming:** **Bedrock** = senior (shielded, fixed variance-priced coupon). **Sediment** = junior / first-loss (underwrites volatility, absorbs IL, keeps the upside). If the UI must surface "senior/junior", gloss once (e.g. "Bedrock (senior)") and use the new terms everywhere else. Share tokens: **BEDR** (Bedrock), **SEDI** (Sediment).
- **Tone exemplars:**
  - Hero: *"LPs are forced sellers of volatility with no buyer. Unistrata built the buyer."*
  - Risk line (Bedrock): *"Protected from impermanent loss until the Sediment layer is exhausted."*
  - Risk line (Sediment): *"You absorb losses first. In exchange you keep all excess fees."*
  - System proof: *"Vol spike detected on Reactive Network → emergencySettle() executed, epoch 47 closed early."*
  - Footers carry the unglamorous truth: *"Withdrawals are requested, then settle at the next epoch boundary."*

---

## VISUAL FOUNDATIONS

**Mood:** structured credit meets instrument panel — the restraint of a beautifully set bond prospectus with the legibility of a flight instrument. Precision-engineered, quiet confidence. The Core is the only thing that's alive; the chrome stays still.

**The one aesthetic risk:** an **editorial serif (Newsreader)** for the few large moments — gravitas in a category full of geometric-sans hacker toys. It signals institution, not toy. Defensible because Unistrata *is* structured credit.

### Color
- **Dark mineral instrument-panel.** The canvas is a cool graphite "bedrock" (`--ink-*`, hue ≈ 200, near-zero chroma) — never pure black, never a neon-on-black hacker default. This makes the luminous Core the hero.
- **Two-tranche identity anchors every accent.** **Bedrock (senior) = mineral teal-blue** (`--senior-*`, calm/dense/stable). **Sediment (junior) = ember amber-copper** (`--junior-*`, warm/kinetic). The CSS token names keep the senior/junior stems; the brand labels are Bedrock/Sediment. These are the only chromatic accents; used sparingly and always meaningfully.
- **No cliché green/red.** Positive borrows Bedrock teal; impairment uses a muted **clay-rose** (`--loss-*`), never a neon red.
- **Text** is a faintly warm off-white (`--paper-100`) so it reads as ink-on-paper against the cool ground.
- **Data-viz roles** are fixed: HODL = neutral dashed, vanilla LP = clay, Bedrock = teal, Sediment = amber.
- **Avoided on purpose:** purple-gradient glassmorphism, neon-green-on-black, warm-cream-with-terracotta templates, 3D blobs.

### Type
- **Display:** Newsreader (serif) — thesis lines, page titles, tranche names. Tracked tight (-0.02em), used large and rarely.
- **Body / UI:** Spline Sans (neutral grotesque) — body copy, buttons, labels.
- **Data / mono:** IBM Plex Mono — *every number, every ledger row, every timestamp.* Tabular + lining figures by default (`--data-feature-settings`) so columns stay aligned and numbers can tick in place without reflow.

### Spacing, radii, borders, cards
- **4px base grid.** Tight, regular rhythm — instrument-panel density (gutter = 32px).
- **Crisp engineered radii:** controls/cards 7px, large panels 11px. Nothing pill-soft except gauges and dots.
- **Elevation is stroke-first.** Cards are a `--surface-card` fill + 1px hairline (`--border-subtle`) + a faint lift shadow — not big soft drop shadows. Glows (`--glow-senior/junior`) are reserved for selected/live states.
- **Cards:** dark surface, hairline border, slight inner top-glint, 7–11px radius. Selected tranche cards bloom their tranche glow; panels can carry a 2px inset accent rail.
- **Backgrounds:** flat mineral fills + subtle sediment striations *inside the Core only* (repeating 1px lines). No full-bleed photography, no ambient gradients on chrome, no texture noise on surfaces.

### Motion
- **One orchestrated moment:** the epoch-settlement sweep in the Core — slow, cinematic, ~1s, `--ease-settle`. It is the explanation; let it breathe.
- **Everything else is fast and crisp:** UI transitions ≤ 240ms, `--ease-out`. Press feedback is immediate (scale 0.98). **Numbers tick, never fade** (`NumberTicker`, ~520ms ease-out).
- **Hover:** brightness lift (+8%) or a quiet surface fill; tranche actions bloom their glow. **Press:** scale-down. **Focus:** a crisp 2px senior ring, not a glow.
- **`prefers-reduced-motion`:** all durations collapse to ~1ms — opacity/end-states remain, movement drops. The Core shows its final equilibrium instead of sweeping.

---

## ICONOGRAPHY

- **Icon set:** [**Lucide**](https://lucide.dev) (CDN-pinned `lucide@0.460.0`). Chosen for its even ~1.75px stroke and geometric, instrument-panel restraint — it sits quietly next to the mono data. Used via `<i data-lucide="name"></i>` + `lucide.createIcons()`. *(Substitution note: no bespoke icon set was provided, so Lucide is the closest-in-spirit CDN match. Swap to a custom set if the brand later commissions one.)*
- **Usage:** sparse and functional — nav items, button affordances (`arrow-down-to-line`, `shield-check`, `flame`, `radio-tower`, `sliders-horizontal`, `layers`). Icons never decorate; if a number can say it, the number says it.
- **The brand mark is not an icon** — it's the Core abstraction (`assets/strata-mark.svg`, plus `strata-mark-mono.svg` for single-color contexts).
- **No emoji. No unicode pictographs.** The only non-text glyphs are arrows (▲ ▼ ↗) in data context and the layered logo mark.

---

## Index — what's in this system

**Foundations**
- `styles.css` — the single entry point consumers link. Pure `@import` manifest.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `motion.css`, `base.css`.
- `guidelines/cards/` — specimen cards rendered in the Design System tab (Colors, Type, Spacing, Brand).
- `assets/` — `strata-mark.svg`, `strata-mark-mono.svg`.

**Components** (`window.StrataDesignSystem_8a0ec2.<Name>`)
- `components/core/` — **Button**, **Badge**, **Panel**, **Stat**.
- `components/data/` — **StrataCore** (signature), **MoneyChart**, **Gauge**, **NumberTicker**.
- `components/protocol/` — **TrancheCard**, **EpochCountdown**, **EventFeed**.

Each directory holds `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md`, and one `*.card.html` thumbnail.

> **Note on `ds-runtime.js`:** the compiler generates `_ds_bundle.js` at the project root (the canonical runtime consumers load). Raw file-preview doesn't serve that generated file at its URL, so every `*.card.html` and the app load `../../_ds_bundle.js` first and fall back to a committed copy, `ds-runtime.js`, only if the namespace didn't populate. The Design System tab and consuming projects always get the fresh `_ds_bundle.js`; the fallback just makes direct file-preview render too. **Refresh `ds-runtime.js` (copy from `_ds_bundle.js`) whenever components change.**

**UI kit**
- `ui_kits/strata-app/` — the protocol app: **Landing** (thesis), **Deposit** (choose your layer), **Observatory** (live dashboard), **Simulator** (the judge's toy). `index.html` is the interactive click-through; `data.js` is the mock data + scenario engine.

**Skill**
- `SKILL.md` — makes this system portable to Claude Code as an Agent Skill.
