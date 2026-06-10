Terminal-like ledger of cross-chain events — the proof there are no humans behind the curtain. Reactive Network watches the pool and fires settlements autonomously; each row links to the explorer.

```jsx
<EventFeed maxHeight={360} events={[
  { time: '2d 04:11', kind: 'emergency', epoch: 47,
    message: 'Vol spike detected on Reactive Network → <span class="em">emergencySettle()</span> executed, epoch 47 closed early',
    tx: '0x7a3f…e201', chain: 'Reactive ⇄ Ethereum' },
  { time: '08:00:02', kind: 'settle', epoch: 46,
    message: 'Waterfall ran → coupon <span class="fn">accrued to senior</span>, junior took residual',
    tx: '0x1c9d…0a4f', chain: 'Ethereum' },
]} />
```

- `kind` colors the marker: `settle` (teal), `reactive` (glow teal), `emergency` (clay glow), `info` (grey).
- `message` accepts inline `<span class="fn">` for fn() calls and `<span class="em">` for alerts.
- A pulsing header dot signals the live connection (stilled under reduced-motion).
