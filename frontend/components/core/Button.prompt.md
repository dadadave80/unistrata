Primary action control — solid bone-white for the one true CTA, tranche-tinted variants for senior/junior deposit actions; quiet secondary/ghost for everything else.

```jsx
<Button variant="primary" size="lg">Open Strata</Button>
<Button variant="senior" icon={<i data-lucide="arrow-down-to-line" />}>Deposit to senior</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

- `variant`: `primary` (bone-white, one per view), `secondary` (bordered surface), `ghost` (chromeless), `senior` / `junior` (tranche-tinted with matching glow on hover), `danger` (clay outline).
- `size`: `sm` 30px · `md` 38px · `lg` 46px.
- Hover lifts brightness; press scales to 0.98; tranche variants bloom a soft glow. Respects reduced-motion via tokens.
