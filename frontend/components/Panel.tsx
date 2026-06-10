'use client';

import React from 'react';

const CSS = `
.st-panel {
  background: var(--surface-card); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg); box-shadow: var(--elev-2);
  display: flex; flex-direction: column; min-width: 0;
}
.st-panel--sunken { background: var(--bg-sunken); box-shadow: none; border-color: var(--hairline); }
.st-panel--flush { padding: 0; }
.st-panel--pad { padding: var(--space-6); }
.st-panel__head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--hairline);
}
.st-panel__titles { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.st-panel__eyebrow {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--tracking-label);
  text-transform: uppercase; color: var(--text-tertiary);
}
.st-panel__title { font-family: var(--font-sans); font-weight: 600; font-size: 15px; color: var(--text-primary); }
.st-panel__actions { display: flex; align-items: center; gap: var(--space-2); flex: none; }
.st-panel__body { padding: var(--space-6); min-width: 0; }
.st-panel--accent-senior { box-shadow: var(--elev-2), inset 2px 0 0 0 var(--senior-600); }
.st-panel--accent-junior { box-shadow: var(--elev-2), inset 2px 0 0 0 var(--junior-600); }
`;

function useCSS(id: string, css: string) { React.useEffect(()=>{ if(document.getElementById(id))return; const e=document.createElement('style'); e.id=id; e.textContent=css; document.head.appendChild(e);},[id,css]); }

type PanelProps = React.HTMLAttributes<HTMLElement> & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  accent?: 'senior' | 'junior';
  variant?: 'default' | 'sunken';
  padded?: boolean;
  headless?: boolean;
  children?: React.ReactNode;
};

export function Panel({
  eyebrow, title, actions, accent, variant = 'default',
  padded = true, className = '', headless, children, ...rest
}: PanelProps) {
  useCSS('st-panel-css', CSS);
  const hasHead = !headless && (eyebrow || title || actions);
  const cls = [
    'st-panel',
    variant === 'sunken' ? 'st-panel--sunken' : '',
    accent ? `st-panel--accent-${accent}` : '',
    !hasHead && padded ? 'st-panel--pad' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <section className={cls} {...rest}>
      {hasHead && (
        <header className="st-panel__head">
          <div className="st-panel__titles">
            {eyebrow && <span className="st-panel__eyebrow">{eyebrow}</span>}
            {title && <span className="st-panel__title">{title}</span>}
          </div>
          {actions && <div className="st-panel__actions">{actions}</div>}
        </header>
      )}
      {hasHead ? <div className={padded ? 'st-panel__body' : ''}>{children}</div> : children}
    </section>
  );
}
