---
name: unistrata-design
description: Use this skill to generate well-branded interfaces and assets for Unistrata, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

Unistrata is a Uniswap v4 protocol that turns a liquidity pool into a capital structure: a **Bedrock** tranche (senior — mineral teal, fixed coupon, protected) and a **Sediment** tranche (junior / first-loss — ember amber, levered yield, absorbs loss first). The signature element is the **Unistrata Core** — a living sedimentary cross-section of the pool's NAV. The mood is "structured credit meets instrument panel": dark mineral canvas, editorial serif for big moments, mono for every number, one cinematic settlement sweep, everything else crisp.

Key files:
- `styles.css` — link this one file to get every token + webfont.
- `tokens/` — colors, typography, spacing, motion. Use the CSS custom properties; don't invent new colors.
- `readme.md` — full content + visual foundations, iconography, and the component/UI-kit index.
- `components/` — React primitives (Button, Badge, Panel, Stat, StrataCore, MoneyChart, Gauge, NumberTicker, TrancheCard, EpochCountdown, EventFeed — component identifiers keep the Strata* / senior/junior stems; the brand labels they render are Unistrata / Bedrock / Sediment). Each has a `.prompt.md` with usage.
- `ui_kits/strata-app/` — full product screens (Landing, Deposit, Observatory, Simulator) wired to mock data.
- `assets/` — the logo mark.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. To use the components, link `styles.css`, load React + the compiled bundle, and read components off the `window.StrataDesignSystem_8a0ec2` namespace (see any `*.card.html` for the exact pattern). If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask a few questions, and act as an expert designer who outputs HTML artifacts or production code, depending on the need. Hold the line on the brand: numbers are the protagonists, no hype copy, no emoji, no neon, the Core is the only thing that moves. Use the names Unistrata, Bedrock (senior), and Sediment (junior) in all copy.
