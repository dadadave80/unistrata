'use client';

import React from 'react';

const CSS = `
.st-epoch { display: flex; flex-direction: column; gap: var(--space-4); }
.st-epoch__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
.st-epoch__label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--text-tertiary); }
.st-epoch__no { font-family: var(--font-mono); font-size: 11px; color: var(--senior-200); }
.st-epoch__time { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-size: 38px; font-weight: 500; color: var(--text-primary); line-height: 1; letter-spacing: 0.01em; }
.st-epoch__time .u { color: var(--text-tertiary); }
.st-epoch__sub { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); }
.st-epoch__bar { position: relative; height: 6px; border-radius: var(--radius-full); background: var(--ink-700); overflow: hidden; }
.st-epoch__bar > i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: inherit;
  background: linear-gradient(90deg, var(--senior-700), var(--senior-400));
  transition: width 1000ms linear; }
.st-epoch__ticks { display: flex; justify-content: space-between; font-family: var(--font-mono);
  font-size: 9.5px; color: var(--text-tertiary); }
`;

function hms(total: number) {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const p = (x: number) => String(x).padStart(2, '0');
  return { h: p(h), m: p(m), s: p(s) };
}

type EpochCountdownProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Current epoch number. @default 47 */
  epoch?: number;
  /** Seconds remaining until settlement. @default 11529 */
  secondsLeft?: number;
  /** Epoch length in seconds. @default 28800 (8h) */
  epochLength?: number;
  /** Whether the clock ticks. @default true */
  running?: boolean;
};

export function EpochCountdown({
  epoch = 47, secondsLeft = 11529, epochLength = 28800,
  running = true, className = '', ...rest
}: EpochCountdownProps) {
  const [left, setLeft] = React.useState(secondsLeft);
  React.useEffect(() => setLeft(secondsLeft), [secondsLeft]);
  React.useEffect(() => {
    if (!running) return;
    // Count down to zero and HOLD — once the epoch has elapsed, settlement is due. We never loop back to
    // a full epoch (that fabricates a settlement that didn't happen on-chain); a real settlement updates
    // epochStart, which flows in via the secondsLeft prop and restarts the clock for the new epoch.
    const id = setInterval(() => {
      setLeft((prev: number) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line

  const due = left <= 0;
  const { h, m, s } = hms(left);
  const elapsed = Math.max(0, Math.min(1, 1 - left / epochLength));

  return (
    <div className={`st-epoch ${className}`} {...rest}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="st-epoch__head">
        <span className="st-epoch__label">{due ? 'Settlement due' : 'Next settlement'}</span>
        <span className="st-epoch__no">epoch {epoch} → {epoch + 1}</span>
      </div>
      <div className="st-epoch__time">
        {h}<span className="u">:</span>{m}<span className="u">:</span>{s}
      </div>
      <div className="st-epoch__bar"><i style={{ width: `${elapsed * 100}%` }} /></div>
      <div className="st-epoch__ticks">
        <span>epoch opened</span>
        <span>{(epochLength / 3600).toFixed(0)}h epoch</span>
        <span>waterfall</span>
      </div>
    </div>
  );
}
