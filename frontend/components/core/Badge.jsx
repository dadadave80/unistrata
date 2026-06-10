import React from 'react';

const CSS = `
.st-badge {
  display: inline-flex; align-items: center; gap: 0.45em;
  font-family: var(--font-mono); font-weight: 500; line-height: 1;
  letter-spacing: 0.04em; text-transform: uppercase;
  border: 1px solid var(--_bd, var(--border)); background: var(--_bg, var(--surface-card));
  color: var(--_fg, var(--text-secondary)); white-space: nowrap;
}
.st-badge--sm { height: 19px; padding: 0 7px; font-size: 10px; border-radius: var(--radius-xs); }
.st-badge--md { height: 23px; padding: 0 9px; font-size: 11px; border-radius: var(--radius-sm); }
.st-badge__dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: currentColor; flex: none; }
.st-badge__dot--live { box-shadow: 0 0 0 0 currentColor; animation: st-badge-pulse 1800ms var(--ease-out) infinite; }
@keyframes st-badge-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in oklab, currentColor 60%, transparent); }
  70% { box-shadow: 0 0 0 5px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.st-badge--neutral  { --_bg: var(--surface-card); --_fg: var(--text-secondary); --_bd: var(--border); }
.st-badge--senior   { --_bg: var(--senior-950); --_fg: var(--senior-200); --_bd: var(--senior-800); }
.st-badge--junior   { --_bg: var(--junior-950); --_fg: var(--junior-200); --_bd: var(--junior-800); }
.st-badge--positive { --_bg: var(--senior-950); --_fg: var(--senior-200); --_bd: var(--senior-800); }
.st-badge--negative { --_bg: #2A1714; --_fg: var(--loss-300); --_bd: var(--loss-600); }
.st-badge--live     { --_bg: transparent; --_fg: var(--senior-200); --_bd: var(--senior-800); }
@media (prefers-reduced-motion: reduce) { .st-badge__dot--live { animation: none; } }
`;

function useCSS(id, css){ React.useEffect(()=>{ if(document.getElementById(id))return; const e=document.createElement('style'); e.id=id; e.textContent=css; document.head.appendChild(e);},[id,css]); }

export function Badge({ variant = 'neutral', size = 'md', dot = false, live = false, className = '', children, ...rest }) {
  useCSS('st-badge-css', CSS);
  const cls = ['st-badge', `st-badge--${variant}`, `st-badge--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {(dot || live) && <span className={`st-badge__dot${live ? ' st-badge__dot--live' : ''}`} />}
      {children}
    </span>
  );
}
