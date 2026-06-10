Live countdown to the next epoch settlement with an elapsed meter. Ticks every second; fires `onSettle` and rolls over at zero — wire it to a StrataCore sweep.

```jsx
<EpochCountdown epoch={47} secondsLeft={11529} epochLength={28800}
  onSettle={() => setSweep(k => k + 1)} />
```

- `epochLength` defaults to 8h (28800s). Set `running={false}` to freeze (e.g. in the Simulator).
