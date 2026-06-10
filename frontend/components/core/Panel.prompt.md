Surface container for grouping content, with an optional header (mono eyebrow + title + right-aligned actions) and an optional tranche accent rail.

```jsx
<Panel eyebrow="Epoch 47" title="Settlement waterfall" actions={<Button size="sm" variant="ghost">Export</Button>}>
  …
</Panel>
<Panel accent="senior" padded>…</Panel>
```

- `variant`: `default` (raised card) or `sunken` (recessed well).
- `accent`: adds a `senior`/`junior` inset rail.
- Omit eyebrow/title/actions for a plain padded card.
