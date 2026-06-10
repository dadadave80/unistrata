# Unistrata — Design Correction Prompt for Claude

> **How to use this file.** Paste or attach it whenever you ask Claude (or any AI) to design,
> build, or restyle the Unistrata frontend. It overrides the model's default aesthetic instincts.
> When this brief conflicts with your "house style" defaults, **follow this brief.** The goal is a
> product that looks *engineered and earned*, not generated.

---

## 1. What Unistrata is (design must reflect the substance)

Unistrata is a **Uniswap v4 hook** that splits a single liquidity position into two **strata**:

- **Bedrock** (the senior tranche) — shielded from drawdown, earns a **fixed, variance-priced coupon**. The floor.
- **Sediment** (the junior tranche) — **underwrites the volatility**, absorbs the impermanent loss, and keeps the upside.

The coupon is priced from the pool's **own realized variance** (σ²/8 actuarial fair value) measured
oracle-free from the tick path, settled each epoch through a waterfall, and automated end-to-end by a
**Reactive Network** smart contract (no keepers, no bots). The proof artifacts are real: a simulated
"money chart" (Bedrock stays flat through a ~44% crash while Sediment absorbs it) and a live cross-chain
testnet tx trail. **Design around the evidence, not around marketing.**

Gloss for finance-literate visitors, once: *Bedrock = senior tranche, Sediment = junior/first-loss tranche.*

---

## 2. Brand essence

**A quant terminal that went to art school.** Precise, data-first, quietly confident. It reads like
infrastructure a desk would actually trust — not a consumer app, not a memecoin, not a pitch deck.

Personality axes: **precise > playful · earned > hyped · architectural > organic · dense > sparse-but-empty.**

Voice: terse, specific, quantitative. Explain the mechanism plainly (variance → σ²/8 coupon → waterfall).
Never sell. If a sentence could appear on any DeFi landing page, delete it.

---

## 3. Visual language

**Motif: stratification / core sample.** The whole identity is *layers viewed in cross-section* — the
literal meaning of "strata." Lean into horizontal bands, sediment lines, depth, and a geological core-sample
feel. Bedrock sits beneath (dense, dark, stable); Sediment rides above (lighter, granular, mobile).

- **Palette:** stone & slate neutrals as the base. **Bedrock** = charcoal/basalt darks. **Sediment** =
  warm sand/ochre. Exactly **one** cool signal accent for live data/highlights (a precise cyan or signal
  blue). Use the accent sparingly — it should mean "this number is live/important," not decorate.
  Do **not** default to Uniswap pink/purple (it reads as a fork); a single restrained pink nod is the
  most pink that's allowed, and only if it earns its place.
- **Typography:** a strong **grotesk** for display/headings (pick a real face — e.g. a condensed or
  neo-grotesk — not the default UI sans). **Monospace** for all numbers, addresses, and tabular data,
  with **tabular figures** so columns align. Generous size contrast between display and body.
- **Layout:** stratified — horizontal bands/registers, hairline rules (1px), real whitespace, crisp
  architectural corners (small or zero radius, not pill-rounded everything). Depth via subtle layering
  and elevation, **not** via frosted glass.
- **Charts are the hero.** The money chart (Bedrock flat vs Sediment absorbing the crash) and the
  variance/coupon curve are the centerpieces. Tooltips, axes, and gridlines should look like a research
  terminal: legible, labeled, honest.
- **Motion:** restrained and functional (data transitions, value ticks). No looping hero animations,
  no parallax blobs.

---

## 4. Tranche language (use consistently)

| Term | Role | Copy framing |
|---|---|---|
| **Bedrock** | senior | "Shielded. Earns the fixed, variance-priced coupon. The floor under your LP." |
| **Sediment** | junior | "Underwrites the volatility. Absorbs impermanent loss. Keeps the upside." |

Token tickers: **BEDR** (Bedrock), **SEDI** (Sediment).

---

## 5. HARD anti-AI-slop ruleset (the correction)

These are the patterns that make a UI look machine-generated. **Do not produce them.**

- ❌ **No purple→indigo / pink→purple gradient hero**, and no big blurred gradient "orb/blob" backdrop.
- ❌ **No glassmorphism** (frosted translucent cards) as a default surface treatment.
- ❌ **No emoji** in headings, nav, buttons, or section labels.
- ❌ **No centered single-column hero** with one huge headline + subtext + two pill buttons.
- ❌ **No generic `Inter + rounded-2xl + drop-shadow-xl` card grid.** If every card is a rounded
  white box with a soft shadow and an icon-in-a-tinted-circle, start over.
- ❌ **No fake/lorem/placeholder data.** Wire **real** numbers: the committed `sim/out/*.json` (money
  chart) and live testnet reads (NAV per share, coupon rate, epoch, tx hashes). Empty states say so.
- ❌ **No hype copy** — "revolutionary", "next-gen", "seamless", "unlock", "supercharge", "the future of".
- ❌ **No icon-salad** (a Lucide/Heroicon on every list item for decoration).
- ❌ **No dark-neon-on-pure-black cliché** unless the terminal aesthetic genuinely calls for it and it's done deliberately.
- ❌ **No over-rounding.** Architectural > bubbly.

## 6. DO

- ✅ Lead with the **proof**: the money chart + the live cross-chain tx trail (origin `UnistrataObservation`
  → RSC reaction → callback landing). Real evidence is the pitch.
- ✅ **Tabular monospace figures** for every number; align decimals; show units.
- ✅ **Stratified layout** that echoes the brand (Bedrock band / Sediment band, depth in cross-section).
- ✅ **Explain the mechanism** honestly and briefly (variance measure → σ²/8 coupon → epoch waterfall →
  Reactive automation). Link to the contracts and tx hashes.
- ✅ **High-contrast, accessible** type and color; legible at a glance on a projector (it's a demo).
- ✅ State **v1 simplifications** plainly where relevant (deposits mint at last-settled NAV, etc.) — honesty reads as competence.

---

## 7. One-paragraph design summary (paste-ready brief)

> Build the Unistrata frontend as a **research/quant terminal with a stratified, core-sample visual
> identity**. Stone/slate neutrals, Bedrock charcoal + Sediment sand, one cool signal accent; a strong
> grotesk for display and **tabular monospace** for all data. Horizontal layered bands, hairline rules,
> crisp corners, generous whitespace. The hero is the **money chart** (Bedrock flat through the crash,
> Sediment absorbing it) plus the **live cross-chain tx trail** — real numbers from `sim/out/*.json` and
> testnet reads, never placeholder data. Copy is terse and quantitative. **No** gradient-blob hero, **no**
> glassmorphism, **no** emoji, **no** generic rounded-card grid, **no** hype words. Make it look engineered.
