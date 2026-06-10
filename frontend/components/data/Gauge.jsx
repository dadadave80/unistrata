import React from 'react';

const CSS = `
.st-gauge { position: relative; display: inline-flex; flex-direction: column; align-items: center; }
.st-gauge__val { position: absolute; left: 0; right: 0; top: 52%; transform: translateY(-50%);
  text-align: center; pointer-events: none; }
.st-gauge__num { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500; color: var(--text-primary); line-height: 1; }
.st-gauge__unit { font-family: var(--font-mono); font-size: 10px; color: var(--text-tertiary);
  letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
.st-gauge__arc { transition: stroke-dashoffset var(--dur-slow) var(--ease-out); }
`;

function useCSS(id, css){ React.useEffect(()=>{ if(document.getElementById(id))return; const e=document.createElement('style'); e.id=id; e.textContent=css; document.head.appendChild(e);},[id,css]); }

export function Gauge({
  value = 0, max = 1, min = 0, size = 180, label, unit, valueText,
  sweepDeg = 250, tone = 'senior', thresholds, className = '', ...rest
}) {
  useCSS('st-gauge-css', CSS);
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  const startAngle = 90 + (360 - sweepDeg) / 2; // centered at bottom gap
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const circumference = 2 * Math.PI * r;
  const arcLen = (sweepDeg / 360) * circumference;
  const dashArray = `${arcLen} ${circumference}`;
  const offset = arcLen * (1 - frac);

  const accent = tone === 'junior' ? 'var(--junior-300)' : tone === 'loss' ? 'var(--loss-400)' : 'var(--senior-300)';
  const numSize = size * 0.2;

  // rotate so the arc starts at the bottom-left and sweeps clockwise
  const rot = startAngle;

  const ticks = (thresholds || []).map((t) => {
    const tf = (t.at - min) / (max - min);
    const a = (rot + tf * sweepDeg) * (Math.PI / 180);
    return { x1: cx + (r - 7) * Math.cos(a), y1: cy + (r - 7) * Math.sin(a),
             x2: cx + (r + 4) * Math.cos(a), y2: cy + (r + 4) * Math.sin(a), color: t.color || 'var(--ink-550)' };
  });

  return (
    <div className={`st-gauge ${className}`} style={{ width: size }} {...rest}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: `rotate(${rot - 90}deg)` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-700)" strokeWidth="9"
          strokeDasharray={dashArray} strokeLinecap="round" />
        <circle className="st-gauge__arc" cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="9"
          strokeDasharray={dashArray} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.color} strokeWidth="1.5" />
        ))}
      </svg>
      <div className="st-gauge__val">
        <div className="st-gauge__num" style={{ fontSize: numSize }}>{valueText ?? value}</div>
        {unit && <div className="st-gauge__unit">{unit}</div>}
      </div>
    </div>
  );
}
