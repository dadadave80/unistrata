'use client';

import React from 'react';

const CSS = `
.st-tranche {
  position: relative; display: flex; flex-direction: column; gap: var(--space-5);
  padding: var(--space-6); border-radius: var(--radius-lg); cursor: pointer;
  background: var(--surface-card); border: 1px solid var(--border);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out),
              transform var(--dur-instant) var(--ease-press);
  text-align: left; min-width: 0;
}
.st-tranche:active { transform: scale(0.995); }
.st-tranche__top { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0.8; }
.st-tranche--senior .st-tranche__top { background: var(--senior-500); }
.st-tranche--junior .st-tranche__top { background: var(--junior-500); }
.st-tranche--senior:hover { border-color: var(--senior-700); }
.st-tranche--junior:hover { border-color: var(--junior-700); }
.st-tranche[data-selected="true"] { background: var(--surface-raised); }
.st-tranche--senior[data-selected="true"] { border-color: var(--senior-600); box-shadow: var(--glow-senior); }
.st-tranche--junior[data-selected="true"] { border-color: var(--junior-600); box-shadow: var(--glow-junior); }

.st-tranche__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
.st-tranche__name { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--text-primary); letter-spacing: -0.01em; }
.st-tranche__role { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px; }
.st-tranche__apr { display: flex; align-items: baseline; gap: 8px; }
.st-tranche__apr .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500; font-size: 40px; line-height: 1; }
.st-tranche--senior .st-tranche__apr .v { color: var(--senior-200); }
.st-tranche--junior .st-tranche__apr .v { color: var(--junior-200); }
.st-tranche__apr .lbl { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--text-tertiary); }
.st-tranche__rows { display: flex; flex-direction: column; gap: 1px; background: var(--hairline);
  border-radius: var(--radius-sm); overflow: hidden; }
.st-tranche__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: 10px 12px; background: var(--bg-sunken); }
.st-tranche__row .k { font-family: var(--font-sans); font-size: 13px; color: var(--text-secondary); }
.st-tranche__row .val { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-size: 13px; color: var(--text-primary); }
.st-tranche__cap { height: 5px; border-radius: var(--radius-full); background: var(--ink-700); overflow: hidden; }
.st-tranche__cap > i { display: block; height: 100%; border-radius: inherit; transition: width var(--dur-slow) var(--ease-out); }
.st-tranche--senior .st-tranche__cap > i { background: var(--senior-500); }
.st-tranche--junior .st-tranche__cap > i { background: var(--junior-500); }
.st-tranche__foot { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); line-height: 1.45; }
`;

type TrancheRow = { label: React.ReactNode; value: React.ReactNode; tone?: 'senior' | 'junior' };

type TrancheCardProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'role'> & {
  /** Which layer. @default "senior" */
  tranche?: 'senior' | 'junior';
  /** Headline rate, e.g. "7.2%". */
  apr: React.ReactNode;
  /** Small label under the rate. */
  aprLabel?: React.ReactNode;
  /** Override the tranche name. */
  name?: React.ReactNode;
  /** Override the one-line role description. */
  role?: React.ReactNode;
  /** Key/value detail rows (coverage, premium, capacity remaining…). */
  rows?: TrancheRow[];
  /** Capacity-filled percent (renders a meter). */
  capacityPct?: number;
  /** Label for the capacity meter. */
  capacityLabel?: React.ReactNode;
  /** Plain-language risk footnote. */
  footnote?: React.ReactNode;
  /** Selected state. */
  selected?: boolean;
  /** Click handler. */
  onSelect?: () => void;
};

export function TrancheCard({
  tranche = 'senior', apr, aprLabel, name, role, rows = [], capacityPct,
  capacityLabel, footnote, selected = false, onSelect, className = '', children, ...rest
}: TrancheCardProps) {
  const defaults = tranche === 'senior'
    ? { name: 'Bedrock', role: 'Senior layer — variance-priced coupon, protected first', aprLabel: 'variance-priced' }
    : { name: 'Sediment', role: 'Junior layer — levered yield, absorbs loss first', aprLabel: 'trailing 30d' };
  return (
    <button type="button"
      className={`st-tranche st-tranche--${tranche} ${className}`}
      data-selected={selected ? 'true' : 'false'}
      onClick={onSelect} {...rest}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="st-tranche__top" />
      <div className="st-tranche__head">
        <div>
          <div className="st-tranche__name">{name ?? defaults.name}</div>
          <div className="st-tranche__role">{role ?? defaults.role}</div>
        </div>
      </div>
      <div className="st-tranche__apr">
        <span className="v">{apr}</span>
        <span className="lbl">{aprLabel ?? defaults.aprLabel}</span>
      </div>
      {capacityPct != null && (
        <div>
          <div className="st-tranche__row" style={{ background: 'transparent', padding: '0 0 7px' }}>
            <span className="k">{capacityLabel ?? 'Capacity filled'}</span>
            <span className="val">{capacityPct}%</span>
          </div>
          <div className="st-tranche__cap"><i style={{ width: `${capacityPct}%` }} /></div>
        </div>
      )}
      {rows.length > 0 && (
        <div className="st-tranche__rows">
          {rows.map((r, i) => (
            <div className="st-tranche__row" key={i}>
              <span className="k">{r.label}</span>
              <span className="val" style={r.tone === 'senior' ? { color: 'var(--senior-200)' } : r.tone === 'junior' ? { color: 'var(--junior-200)' } : undefined}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {footnote && <div className="st-tranche__foot">{footnote}</div>}
      {children}
    </button>
  );
}
