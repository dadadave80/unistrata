The money chart — four portfolio paths over a volatile price backdrop: HODL (dashed neutral), vanilla LP (clay, bleeds), Strata senior (calm teal coupon line), Strata junior (kinetic amber). Drive `progress` from a scrubber to reveal lines in sync with the price path.

```jsx
<MoneyChart
  price={pricePath}
  series={{ hodl, lp, senior, junior }}
  progress={scrub}        // 0..1
  height={320}
/>
```

- All series arrays must be equal length; y-scale auto-fits across them.
- `progress` clips the drawn lines and drops a playhead with per-line value dots; the legend reads the value at the playhead.
- Strokes are non-scaling so the chart can stretch full-width without thickening.
