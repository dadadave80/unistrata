The signature element — a living cross-section of the pool's capital structure as horizontal sedimentary layers. Senior is the dense bedrock; junior sits above; the void on top is overburden/impairment. Watch junior compress while senior holds the line.

```jsx
const [sweep, setSweep] = React.useState(0);
<StrataCore seniorNav={1_620_000} juniorNav={780_000} scaleMax={2_600_000} height={380} sweepKey={sweep} />
<Button variant="senior" onClick={() => setSweep(k => k + 1)}>Run settlement</Button>

// nav / logo glyph
<StrataCore glyph height={22} seniorNav={1620000} juniorNav={780000} />
```

- Heights map NAV → pixels against `scaleMax` (keep it constant across a screen so loss visibly compresses junior).
- Bump `sweepKey` to fire the ~1s cinematic settlement sweep; layers re-equilibrate via the same slow ease.
- `glyph` renders the miniature for nav/logo use. Honors reduced-motion.
