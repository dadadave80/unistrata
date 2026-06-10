Tabular numeric that animates from its old value to the new one whenever `value` changes — ease-out over ~520ms. Use it inside `Stat` for live metrics.

```jsx
<NumberTicker value={2403910} prefix="$" />
<Stat label="Senior coupon" tone="senior" size="lg"
  value={<NumberTicker value={7.2} decimals={1} suffix="%" />} />
```

- `decimals`, `prefix`, `suffix`, `commas` control formatting.
- Snaps instantly under reduced-motion. Always tabular + lining figures so columns stay aligned mid-tick.
