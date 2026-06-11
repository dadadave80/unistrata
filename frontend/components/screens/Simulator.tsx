'use client';

import React from 'react';
import { Panel } from '@/components/Panel';
import { Stat } from '@/components/Stat';
import { Badge } from '@/components/Badge';
import { StrataCore } from '@/components/StrataCore';
import { MoneyChart } from '@/components/MoneyChart';
import { NumberTicker } from '@/components/NumberTicker';
import { SCENARIOS, type ScenarioId } from '@/lib/sim-data';
import { fmtUsd } from '@/lib/format';

const simCSS = `
.sm__head { display:flex; align-items:flex-end; justify-content:space-between; gap: var(--space-6); margin-bottom: var(--space-7); }
.sm__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.sm__sub { font-family: var(--font-sans); font-size: 15px; color: var(--text-secondary); margin-top: 7px; max-width: 58ch; line-height:1.5; }
.sm__pills { display:inline-flex; background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 3px; gap: 3px; }
.sm__pill { font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--text-secondary);
  background: transparent; border: none; border-radius: var(--radius-sm); padding: 8px 16px; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.sm__pill:hover { color: var(--text-primary); }
.sm__pill[data-on="true"] { background: var(--surface-raised); color: var(--text-primary); box-shadow: var(--elev-1); }
.sm__grid { display:grid; grid-template-columns: 1fr 1.1fr; gap: var(--space-6); align-items: start; }
.sm__readouts { display:grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; margin-top: var(--space-5); }
.sm__rd { background: var(--bg-sunken); padding: 13px 15px; }
.sm-fast .st-core__layer, .sm-fast .st-core__void, .sm-fast .st-core__tag { transition: bottom 70ms linear, height 70ms linear; }
.sm__scrub { margin-top: var(--space-7); background: var(--surface-card); border:1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-6); }
.sm__scrubhead { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-5); }
.sm__time { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); }
.sm__price { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 16px; color: var(--text-primary); font-weight:500; }
.sm__range { -webkit-appearance:none; appearance:none; width:100%; height: 6px; border-radius: var(--radius-full);
  background: var(--ink-700); outline: none; cursor: pointer; }
.sm__range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width: 18px; height: 18px; border-radius: 50%;
  background: var(--paper-100); border: 3px solid var(--ink-950); box-shadow: 0 0 0 1px var(--border-strong), 0 2px 8px rgba(0,0,0,0.5); cursor: grab; }
.sm__range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--paper-100); border: 3px solid var(--ink-950); cursor: grab; }
.sm__ticks { display:flex; justify-content:space-between; margin-top: 9px; font-family: var(--font-mono); font-size: 10px; color: var(--text-tertiary); }
@media (max-width: 1000px){ .sm__grid{ grid-template-columns: 1fr; } }
`;

const SCN: { id: ScenarioId; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'trend', label: 'Trend' },
  { id: 'crash', label: 'Crash' },
];

export function Simulator() {
  const [scn, setScn] = React.useState<ScenarioId>('crash');
  const data = SCENARIOS[scn];
  const N = data.price.length; // real sim/out scenarios are per-epoch (variable length)
  const [idx, setIdx] = React.useState(N - 1);
  const i = Math.min(idx, N - 1);
  const price = data.price[i];
  const sNav = data.seniorNav[i];
  const jNav = data.juniorNav[i];
  const j0 = data.juniorNav[0];
  const progress = N > 1 ? i / (N - 1) : 1;
  const change = (price / data.price[0] - 1) * 100;
  const scaleMax = data.scaleMax;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: simCSS }} />
      <div className="sm__head">
        <div>
          <div className="sm__title">Simulator</div>
          <p className="sm__sub">Pick a scenario and scrub the settled epochs. The capital structure and the money chart respond in sync — watch Sediment compress while Bedrock holds its line.</p>
        </div>
        <div className="sm__pills">
          {SCN.map((s) => (
            <button key={s.id} className="sm__pill" data-on={scn === s.id}
              onClick={() => { setScn(s.id); setIdx(SCENARIOS[s.id].price.length - 1); }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="sm__grid">
        <Panel padded>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Capital structure</span>
            <Badge variant={change < -1 ? 'negative' : change > 1 ? 'senior' : 'neutral'} dot>{change >= 0 ? '+' : ''}{change.toFixed(1)}% tWETH</Badge>
          </div>
          <div className="sm-fast">
            <StrataCore seniorNav={sNav} juniorNav={jNav} scaleMax={scaleMax} height={320} />
          </div>
          <div className="sm__readouts">
            <div className="sm__rd"><Stat label="Bedrock NAV" tone="senior" size="sm" value={<NumberTicker value={sNav} prefix="$" duration={120} />} /></div>
            <div className="sm__rd"><Stat label="Sediment NAV" tone="junior" size="sm" value={<NumberTicker value={jNav} prefix="$" duration={120} />} /></div>
            <div className="sm__rd"><Stat label="Sediment drawdown" size="sm" value={<NumberTicker value={(jNav / j0 - 1) * 100} decimals={1} suffix="%" duration={120} />} /></div>
          </div>
        </Panel>

        <Panel padded>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>Depositor outcome · index = 100 at epoch 0</div>
          <MoneyChart price={data.price} series={data.series} progress={progress} height={300} />
        </Panel>
      </div>

      <div className="sm__scrub">
        <div className="sm__scrubhead">
          <span className="sm__time">epoch {i} of {N - 1} · {data.name} scenario · replayed from sim/out</span>
          <span className="sm__price">tWETH {fmtUsd(price, 0)}</span>
        </div>
        <input className="sm__range" type="range" min={0} max={N - 1} value={i}
          onInput={(e) => setIdx(Number((e.target as HTMLInputElement).value))}
          onChange={(e) => setIdx(Number(e.target.value))} />
        <div className="sm__ticks"><span>epoch 0 · {fmtUsd(data.price[0], 0)}</span><span>scrub the settled epochs</span><span>epoch {N - 1}</span></div>
      </div>
    </div>
  );
}
