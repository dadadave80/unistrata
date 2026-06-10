'use client';

import React from 'react';

const CSS = `
.st-stat { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.st-stat__label {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--tracking-label);
  text-transform: uppercase; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px;
}
.st-stat__value {
  font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: var(--data-feature-settings);
  font-weight: 500; color: var(--_tone, var(--text-primary)); line-height: 1;
  display: flex; align-items: baseline; gap: 0.25em;
}
.st-stat__unit { font-size: 0.5em; color: var(--text-tertiary); font-weight: 500; letter-spacing: 0.02em; }
.st-stat--sm .st-stat__value { font-size: 20px; }
.st-stat--md .st-stat__value { font-size: 28px; }
.st-stat--lg .st-stat__value { font-size: 40px; }
.st-stat--xl .st-stat__value { font-size: 56px; }
.st-stat--senior .st-stat__value { --_tone: var(--senior-200); }
.st-stat--junior .st-stat__value { --_tone: var(--junior-200); }
.st-stat__delta {
  font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 12px;
  display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;
}
.st-stat__delta--up { color: var(--positive); }
.st-stat__delta--down { color: var(--negative); }
.st-stat__delta--flat { color: var(--text-tertiary); }
`;

function useCSS(id: string, css: string) { React.useEffect(()=>{ if(document.getElementById(id))return; const e=document.createElement('style'); e.id=id; e.textContent=css; document.head.appendChild(e);},[id,css]); }

type StatProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  delta?: React.ReactNode;
  deltaDir?: 'up' | 'down' | 'flat';
  tone?: 'default' | 'senior' | 'junior';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
};

export function Stat({
  label, value, unit, delta, deltaDir = 'flat',
  tone = 'default', size = 'md', className = '', children, ...rest
}: StatProps) {
  useCSS('st-stat-css', CSS);
  const cls = ['st-stat', `st-stat--${size}`, tone !== 'default' ? `st-stat--${tone}` : '', className].filter(Boolean).join(' ');
  const arrow = deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—';
  return (
    <div className={cls} {...rest}>
      {label && <span className="st-stat__label">{label}</span>}
      <span className="st-stat__value">{value}{unit && <span className="st-stat__unit">{unit}</span>}</span>
      {delta != null && (
        <span className={`st-stat__delta st-stat__delta--${deltaDir}`}>{arrow} {delta}</span>
      )}
      {children}
    </div>
  );
}
