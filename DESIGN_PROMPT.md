# Unistrata — Naming Update Prompt (for the existing design system)

> **Use this when updating the Unistrata frontend / design system.**
> A design system already exists. **Do NOT restyle, redesign, or re-theme anything.** This is a pure
> rename: apply the term changes below and leave all visuals exactly as they are.

## Rename map

| Old | New | Where it appears |
|---|---|---|
| Strata | **Unistrata** | product name, logo wordmark, page titles, copy, URLs/handles |
| Senior tranche | **Bedrock** | tranche labels, headings, body copy |
| Junior tranche | **Sediment** | tranche labels, headings, body copy |
| `sSTR` | `BEDR` | senior token ticker |
| `jSTR` | `SEDI` | junior token ticker |
| "Strata Senior" | "Unistrata Bedrock" | senior token name |
| "Strata Junior" | "Unistrata Sediment" | junior token name |

## Notes

- **Bedrock** = senior tranche (shielded, earns the fixed variance-priced coupon — the floor).
  **Sediment** = junior / first-loss tranche (underwrites the volatility, absorbs the impermanent loss,
  keeps the upside). If the UI still surfaces the words "senior/junior" anywhere, gloss it once
  (e.g. "Bedrock (senior)") and use the new terms everywhere else.
- The geological **layers** metaphor still holds, so any existing strata/layer visual motif stays — only
  the words change.
- **Leave untouched:** palette, typography, spacing, components, iconography, imagery, layout, motion.
- Don't touch data bindings or contract addresses — this rename is cosmetic (labels/copy only).
