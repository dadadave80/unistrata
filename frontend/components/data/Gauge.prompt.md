Radial instrument gauge for the realized-volatility readout. A 250° glowing arc with a tabular center value and optional threshold ticks.

```jsx
<Gauge value={0.41} min={0} max={1} unit="σ² %/day"
  valueText="0.41" tone="senior"
  thresholds={[{ at: 0.6, color: 'var(--junior-400)' }, { at: 0.85, color: 'var(--loss-400)' }]} />
```

- `tone`: `senior` / `junior` / `loss`.
- Pass `valueText` for formatted center copy; `thresholds` mark vol bands. Arc animates on value change.
