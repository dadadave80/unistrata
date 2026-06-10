A single data readout — mono eyebrow label, large tabular value with optional unit, and an optional directional delta. The workhorse for every metric.

```jsx
<Stat label="Senior coupon" value="7.2" unit="% APR" tone="senior" size="lg" />
<Stat label="Realized vol" value="0.41" unit="%/day" delta="+0.06 EWMA" deltaDir="up" />
```

- `tone`: `senior` / `junior` tints the value.
- `size`: `sm` · `md` · `lg` · `xl` (use xl sparingly, for the hero number).
- `deltaDir` colors the delta: `up` positive, `down` negative, `flat` muted. Pass a `NumberTicker` as `value` to make it tick.
