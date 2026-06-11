'use client';

import React from 'react';

const CSS = `
.st-feed { font-family: var(--font-mono); background: var(--ink-1000);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
.st-feed__bar { display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; border-bottom: 1px solid var(--hairline); background: var(--ink-950); }
.st-feed__title { display: flex; align-items: center; gap: 9px; font-size: 11px;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }
.st-feed__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--senior-400);
  box-shadow: 0 0 0 0 var(--senior-400); animation: st-feed-pulse 2000ms var(--ease-out) infinite; }
@keyframes st-feed-pulse { 0%{ box-shadow:0 0 0 0 color-mix(in oklab,var(--senior-400) 55%,transparent);} 70%{ box-shadow:0 0 0 6px transparent;} 100%{ box-shadow:0 0 0 0 transparent;} }
.st-feed__meta { font-size: 10px; color: var(--text-tertiary); letter-spacing: 0.04em; }
.st-feed__list { max-height: var(--st-feed-h, none); overflow: auto; }
.st-feed__row { display: grid; grid-template-columns: 84px 14px 1fr; gap: 10px;
  padding: 11px 14px; border-bottom: 1px solid var(--hairline); align-items: start; }
.st-feed__row:last-child { border-bottom: none; }
.st-feed__row:hover { background: rgba(255,255,255,0.015); }
.st-feed__ts { font-size: 11px; color: var(--text-tertiary); font-variant-numeric: tabular-nums; line-height: 1.5; white-space: nowrap; }
.st-feed__mark { width: 8px; height: 8px; border-radius: 2px; margin-top: 5px; }
.st-feed__mark--settle { background: var(--senior-400); }
.st-feed__mark--reactive { background: var(--senior-300); box-shadow: 0 0 8px 0 var(--senior-400); }
.st-feed__mark--emergency { background: var(--loss-400); box-shadow: 0 0 8px 0 var(--loss-500); }
.st-feed__mark--info { background: var(--ink-550); }
.st-feed__body { min-width: 0; }
.st-feed__msg { font-size: 12.5px; color: var(--text-primary); line-height: 1.5; }
.st-feed__msg .fn { color: var(--senior-200); }
.st-feed__msg .em { color: var(--loss-300); }
.st-feed__sub { font-size: 11px; color: var(--text-tertiary); margin-top: 3px; line-height: 1.5;
  display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: center; }
.st-feed__tx { color: var(--senior-300); text-decoration: none; border-bottom: 1px dotted var(--senior-700); }
.st-feed__tx:hover { color: var(--senior-200); }
.st-feed__chain { color: var(--text-tertiary); }
.st-feed__empty { padding: 22px 14px; font-size: 12.5px; color: var(--text-tertiary); line-height: 1.6; }
.st-feed__dot--idle { animation: none; background: var(--ink-550); box-shadow: none; }
@media (prefers-reduced-motion: reduce) { .st-feed__dot { animation: none; } }
`;

const MARK = { settle: 'settle', reactive: 'reactive', emergency: 'emergency', info: 'info' } as const;

type FeedEvent = {
  /** Mono timestamp, e.g. "14:02:11" or "2d ago". */
  time: string;
  /** Row marker color/role. */
  kind: 'settle' | 'reactive' | 'emergency' | 'info';
  /** Message — may contain <span class="fn"> for fn() calls and <span class="em"> for alerts. */
  message: string;
  /** Truncated tx hash, e.g. "0x7a3f…e201". */
  tx?: string;
  /** Full explorer URL for this tx (e.g. https://sepolia.uniscan.xyz/tx/0x…). */
  txUrl?: string;
  /** Chain / network label. */
  chain?: string;
  /** Related epoch number. */
  epoch?: number;
};

type EventFeedProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Newest-first event rows. */
  events?: FeedEvent[];
  /** Header label. */
  title?: string;
  /** Scroll cap in px. */
  maxHeight?: number;
  /** Base URL for tx links. */
  explorerBase?: string;
  /** Message shown when there are no events (honest empty state — no fabricated rows). */
  emptyLabel?: string;
};

export function EventFeed({
  events = [], title = 'Reactive Network · automation feed', maxHeight,
  explorerBase = '#', emptyLabel = 'No on-chain events yet.', className = '', ...rest
}: EventFeedProps) {
  const isEmpty = events.length === 0;
  return (
    <div className={`st-feed ${className}`} style={maxHeight ? ({ ['--st-feed-h']: maxHeight + 'px' } as React.CSSProperties) : undefined} {...rest}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="st-feed__bar">
        <span className="st-feed__title"><span className={`st-feed__dot${isEmpty ? ' st-feed__dot--idle' : ''}`} />{title}</span>
        <span className="st-feed__meta">no keepers · no bots</span>
      </div>
      <div className="st-feed__list">
        {isEmpty && <div className="st-feed__empty">{emptyLabel}</div>}
        {events.map((e: FeedEvent, i: number) => (
          <div className="st-feed__row" key={i}>
            <span className="st-feed__ts">{e.time}</span>
            <span className={`st-feed__mark st-feed__mark--${MARK[e.kind] || 'info'}`} />
            <div className="st-feed__body">
              <div className="st-feed__msg" dangerouslySetInnerHTML={{ __html: e.message }} />
              {(e.tx || e.chain || e.epoch != null) && (
                <div className="st-feed__sub">
                  {e.chain && <span className="st-feed__chain">{e.chain}</span>}
                  {e.epoch != null && <span className="st-feed__chain">epoch {e.epoch}</span>}
                  {e.tx && <a className="st-feed__tx" href={e.txUrl || explorerBase} target="_blank" rel="noreferrer">{e.tx} ↗</a>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
