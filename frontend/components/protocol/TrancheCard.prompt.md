A selectable deposit card for one tranche. Senior reads calm and dense; junior reads warm and alive — the same instrument in two temperaments, via restrained contrast (never green/red).

```jsx
<TrancheCard tranche="senior" apr="7.2%" selected={layer==='senior'} onSelect={()=>setLayer('senior')}
  rows={[
    { label: 'Coverage ratio', value: '$1.84M junior below you', tone: 'senior' },
    { label: 'Capacity remaining', value: '$310K' },
  ]}
  capacityPct={81}
  footnote="Protected from impermanent loss until the junior layer is exhausted." />

<TrancheCard tranche="junior" apr="23.4%" aprLabel="trailing 30d"
  rows={[{ label: 'Risk premium earned', value: '+4.1%', tone: 'junior' }]}
  footnote="You absorb losses first. In exchange you keep all excess fees." />
```

- `tranche` sets the whole temperament; `rows` are key/value details (give `tone` to tint a value).
- `capacityPct` renders a meter; `selected` adds the tranche glow.
