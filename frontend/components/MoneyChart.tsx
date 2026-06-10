'use client';

import React from 'react';

const CSS = `
.st-chart { position: relative; width: 100%; }
.st-chart svg { display: block; width: 100%; height: auto; }
.st-chart__grid { stroke: var(--hairline); stroke-width: 1; vector-effect: non-scaling-stroke; }
.st-chart__price { fill: rgba(120,140,150,0.06); stroke: none; }
.st-chart__line { fill: none; vector-effect: non-scaling-stroke; }
.st-chart__future { opacity: 0.22; }
.st-chart__head { stroke: var(--ink-550); stroke-width: 1; vector-effect: non-scaling-stroke; stroke-dasharray: 3 3; }
.st-chart__dot { stroke: var(--ink-950); stroke-width: 2; }
.st-chart__legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 12px; }
.st-chart__leg { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono);
  font-size: 11px; color: var(--text-secondary); letter-spacing: 0.01em; }
.st-chart__leg i { width: 16px; height: 0; border-top-width: 2px; border-top-style: solid; display: inline-block; }
.st-chart__leg b { font-weight: 500; color: var(--text-primary); font-variant-numeric: tabular-nums; }
`;

function useCSS(id: string, css: string) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}

type RoleKey = 'hodl' | 'lp' | 'junior' | 'senior';

interface Role {
  key: RoleKey;
  color: string;
  label: string;
  dash: string;
  w: number;
}

const ROLES: Role[] = [
  { key: 'hodl',   color: 'var(--line-hodl)',   label: 'HODL',       dash: '5 4', w: 1.5 },
  { key: 'lp',     color: 'var(--line-lp)',     label: 'Vanilla LP', dash: '0',   w: 2 },
  { key: 'junior', color: 'var(--line-junior)', label: 'Sediment',   dash: '0',   w: 2 },
  { key: 'senior', color: 'var(--line-senior)', label: 'Bedrock',    dash: '0',   w: 2.5 },
];

export interface MoneyChartSeries {
  /** Buy-and-hold reference (dashed neutral). */
  hodl: number[];
  /** Vanilla LP — bleeds through volatility (clay). */
  lp: number[];
  /** Strata senior — the calm coupon line (teal). */
  senior: number[];
  /** Strata junior — levered, kinetic (amber). */
  junior: number[];
}

type MoneyChartProps = {
  /** Equal-length value arrays, one per role. */
  series: MoneyChartSeries;
  /** Underlying price path for the faint backdrop area. */
  price?: number[];
  /** Reveal fraction 0–1 (scrubber). @default 1 */
  progress?: number;
  /** Pixel height. @default 320 */
  height?: number;
  /** Show the inline value legend. @default true */
  showLegend?: boolean;
  /** Show the price backdrop. @default true */
  showPrice?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function MoneyChart({
  series, price, progress = 1, height = 320, showLegend = true,
  showPrice = true, className = '', ...rest
}: MoneyChartProps) {
  useCSS('st-chart-css', CSS);
  const W = 1000, H = 1000 * (height / ((rest as { aspect?: number }).aspect || 600)) || 600;
  const VH = 600;
  const keys = ROLES.filter(r => series && series[r.key]);
  const n = keys.length ? series[keys[0].key].length : 0;

  // y-domain across all series
  let lo = Infinity, hi = -Infinity;
  keys.forEach(r => series[r.key].forEach(v => { lo = Math.min(lo, v); hi = Math.max(hi, v); }));
  if (!isFinite(lo)) { lo = 0; hi = 1; }
  const padY = (hi - lo) * 0.12 || 1;
  lo -= padY; hi += padY;
  const px = (i: number) => (i / (n - 1)) * W;
  const py = (v: number) => VH - ((v - lo) / (hi - lo)) * VH;

  const pathFor = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

  // price backdrop area
  let priceArea: string | null = null;
  if (showPrice && price && price.length) {
    let plo = Math.min(...price), phi = Math.max(...price);
    const pad = (phi - plo) * 0.15 || 1; plo -= pad; phi += pad;
    const ppy = (v: number) => VH - ((v - plo) / (phi - plo)) * VH;
    const top = price.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${ppy(v).toFixed(1)}`).join(' ');
    priceArea = `${top} L${W} ${VH} L0 ${VH} Z`;
  }

  const cut = Math.max(0, Math.min(1, progress));
  const headX = px((n - 1) * cut);
  const idx = Math.round((n - 1) * cut);
  const clipId = React.useId ? React.useId().replace(/:/g, '') : 'c' + Math.random().toString(36).slice(2);

  return (
    <div className={`st-chart ${className}`} {...rest}>
      <svg viewBox={`0 0 ${W} ${VH}`} style={{ height }} preserveAspectRatio="none">
        <defs>
          <clipPath id={clipId}><rect x="0" y="0" width={headX} height={VH} /></clipPath>
        </defs>
        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((g, i) => (
          <line key={i} className="st-chart__grid" x1="0" x2={W} y1={VH * g} y2={VH * g} />
        ))}
        {priceArea && <path className="st-chart__price" d={priceArea} />}
        {/* future (faint full lines) */}
        {keys.map(r => (
          <path key={'f' + r.key} className="st-chart__line st-chart__future" d={pathFor(series[r.key])}
            stroke={r.color} strokeWidth={r.w} strokeDasharray={r.dash} />
        ))}
        {/* drawn-so-far (clipped) */}
        <g clipPath={`url(#${clipId})`}>
          {keys.map(r => (
            <path key={r.key} className="st-chart__line" d={pathFor(series[r.key])}
              stroke={r.color} strokeWidth={r.w} strokeDasharray={r.dash} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </g>
        {/* playhead + dots */}
        {cut < 0.999 && <line className="st-chart__head" x1={headX} x2={headX} y1="0" y2={VH} />}
        {keys.map(r => (
          <circle key={'d' + r.key} className="st-chart__dot" cx={headX} cy={py(series[r.key][idx])} r="3.5"
            fill={r.color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      {showLegend && (
        <div className="st-chart__legend">
          {keys.slice().reverse().map(r => (
            <span key={r.key} className="st-chart__leg">
              <i style={{ borderTopColor: r.color, borderTopStyle: r.dash !== '0' ? 'dashed' : 'solid' }} />
              {r.label} <b style={{ color: r.color }}>{series[r.key][idx].toFixed(1)}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
