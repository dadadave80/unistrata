import React from 'react';

const CSS = `
.st-btn {
  --_bg: var(--surface-raised);
  --_fg: var(--text-primary);
  --_bd: var(--border);
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5em;
  font-family: var(--font-sans); font-weight: 500; line-height: 1;
  border: 1px solid var(--_bd); background: var(--_bg); color: var(--_fg);
  border-radius: var(--radius-md); cursor: pointer; white-space: nowrap;
  transition: background var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out),
              transform var(--dur-instant) var(--ease-press),
              box-shadow var(--dur-fast) var(--ease-out);
  -webkit-font-smoothing: antialiased; user-select: none;
}
.st-btn:hover { filter: brightness(1.08); }
.st-btn:active { transform: scale(var(--press-scale)); }
.st-btn:disabled { opacity: 0.42; cursor: not-allowed; filter: none; transform: none; }
.st-btn .st-btn__ic { display: inline-flex; flex: none; }

.st-btn--sm { height: 30px; padding: 0 12px; font-size: 13px; }
.st-btn--md { height: 38px; padding: 0 16px; font-size: 14px; }
.st-btn--lg { height: 46px; padding: 0 22px; font-size: 15px; }
.st-btn--full { width: 100%; }

.st-btn--primary { --_bg: var(--paper-100); --_fg: var(--ink-950); --_bd: var(--paper-100); font-weight: 600; }
.st-btn--primary:hover { filter: none; --_bg: #fff; }
.st-btn--secondary { --_bg: var(--surface-card); --_fg: var(--text-primary); --_bd: var(--border-strong); }
.st-btn--ghost { --_bg: transparent; --_fg: var(--text-secondary); --_bd: transparent; }
.st-btn--ghost:hover { --_bg: var(--surface-card); --_fg: var(--text-primary); filter: none; }
.st-btn--senior { --_bg: var(--senior-900); --_fg: var(--senior-100); --_bd: var(--senior-700); }
.st-btn--senior:hover { --_bg: var(--senior-800); filter: none; box-shadow: var(--glow-senior); }
.st-btn--junior { --_bg: var(--junior-900); --_fg: var(--junior-100); --_bd: var(--junior-700); }
.st-btn--junior:hover { --_bg: var(--junior-800); filter: none; box-shadow: var(--glow-junior); }
.st-btn--danger { --_bg: transparent; --_fg: var(--loss-300); --_bd: var(--loss-600); }
`;

function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

export function Button({
  variant = 'secondary', size = 'md', icon, iconRight,
  fullWidth = false, disabled = false, as = 'button',
  className = '', children, ...rest
}) {
  useCSS('st-btn-css', CSS);
  const Tag = as;
  const cls = [
    'st-btn', `st-btn--${variant}`, `st-btn--${size}`,
    fullWidth ? 'st-btn--full' : '', className,
  ].filter(Boolean).join(' ');
  return (
    <Tag className={cls} disabled={Tag === 'button' ? disabled : undefined} {...rest}>
      {icon && <span className="st-btn__ic">{icon}</span>}
      {children}
      {iconRight && <span className="st-btn__ic">{iconRight}</span>}
    </Tag>
  );
}
