import React from 'react';

const CSS = `
.st-core { position: relative; width: 100%; background: var(--ink-950);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
  overflow: hidden; --_pad: 0px; box-shadow: var(--elev-2); }
.st-core__stack { position: absolute; inset: 0; }
.st-core__layer {
  position: absolute; left: 0; right: 0; overflow: hidden;
  transition: height var(--dur-settle) var(--ease-settle),
              bottom var(--dur-settle) var(--ease-settle);
}
.st-core__layer--senior { background: linear-gradient(180deg, #2A5560 0%, #16323A 60%, #0E242B 100%); }
.st-core__layer--junior { background: linear-gradient(180deg, #B5712E 0%, #7A4A22 70%, #50311C 100%); }
.st-core__edge { position: absolute; top: 0; left: 0; right: 0; height: 1.5px; }
.st-core__edge--senior { background: var(--senior-300); box-shadow: 0 0 14px 0 var(--senior-400); }
.st-core__edge--junior { background: var(--junior-300); box-shadow: 0 0 12px 0 var(--junior-400); }
/* sediment striation texture */
.st-core__layer::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 9px);
}
.st-core__void { position: absolute; left:0; right:0; top:0;
  transition: height var(--dur-settle) var(--ease-settle);
  background-image: repeating-linear-gradient(180deg, rgba(236,234,227,0.05) 0 1px, transparent 1px 22px); }
.st-core__voidline { position:absolute; left:0; right:0; height:1px; background: rgba(236,234,227,0.12); }

/* layer labels */
.st-core__tag { position: absolute; left: 16px; display: flex; align-items: baseline; gap: 8px;
  transition: bottom var(--dur-settle) var(--ease-settle); pointer-events: none; }
.st-core__tag .nm { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; }
.st-core__tag .nv { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-size: 14px; font-weight: 500; }
.st-core__tag .sub { font-family: var(--font-mono); font-size: 10px; }

/* depth scale ticks */
.st-core__scale { position: absolute; right: 0; top: 0; bottom: 0; width: 46px;
  border-left: 1px solid var(--hairline); pointer-events: none; }
.st-core__tick { position: absolute; right: 8px; font-family: var(--font-mono);
  font-size: 9px; color: var(--text-tertiary); font-variant-numeric: tabular-nums;
  transform: translateY(-50%); }
.st-core__tick::before { content:''; position:absolute; right:-8px; top:50%; width:5px; height:1px; background: var(--ink-600); }

/* settlement sweep */
.st-core__sweep { position: absolute; left: 0; right: 0; height: 2px; top: 0;
  background: linear-gradient(90deg, transparent, var(--paper-100) 30%, var(--paper-100) 70%, transparent);
  box-shadow: 0 0 24px 3px rgba(236,234,227,0.5); opacity: 0; }
.st-core__sweep--on { animation: st-core-sweep var(--dur-settle) var(--ease-settle) 1; }
@keyframes st-core-sweep {
  0% { top: 0; opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .st-core__layer, .st-core__void, .st-core__tag { transition: none; }
  .st-core__sweep--on { animation-duration: 1ms; }
}
`;

function useCSS(id, css){ React.useEffect(()=>{ if(document.getElementById(id))return; const e=document.createElement('style'); e.id=id; e.textContent=css; document.head.appendChild(e);},[id,css]); }

function fmtUsd(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + Math.round(n);
}

export function StrataCore({
  seniorNav = 1_620_000,
  juniorNav = 780_000,
  scaleMax,
  height = 360,
  sweepKey = 0,
  glyph = false,
  showScale = true,
  className = '', style, ...rest
}) {
  useCSS('st-core-css', CSS);
  const ref = scaleMax || (seniorNav + juniorNav) * 1.18; // headroom above for overburden
  const pad = glyph ? 0 : 14;
  const usable = height - pad * 2;
  const sH = Math.max(0, (seniorNav / ref) * usable);
  const jH = Math.max(0, (juniorNav / ref) * usable);
  const voidH = Math.max(0, usable - sH - jH);

  const sweepOn = sweepKey > 0;

  if (glyph) {
    const g = height;
    const gs = (seniorNav / ref) * g, gj = (juniorNav / ref) * g, gv = g - gs - gj;
    return (
      <span className={`st-core ${className}`} style={{ width: height * 0.92, height: g, borderRadius: 5, display: 'inline-block', ...style }} {...rest}>
        <span className="st-core__stack">
          <span className="st-core__void" style={{ height: gv }} />
          <span className="st-core__layer st-core__layer--junior" style={{ bottom: gs, height: gj }}><span className="st-core__edge st-core__edge--junior" /></span>
          <span className="st-core__layer st-core__layer--senior" style={{ bottom: 0, height: gs }}><span className="st-core__edge st-core__edge--senior" /></span>
          {sweepOn && <span key={sweepKey} className="st-core__sweep st-core__sweep--on" />}
        </span>
      </span>
    );
  }

  const scaleTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    t, y: pad + usable * t, val: fmtUsd(ref * (1 - t)),
  }));

  return (
    <div className={`st-core ${className}`} style={{ height, ...style }} {...rest}>
      <div className="st-core__stack" style={{ left: pad, right: (showScale ? 46 : pad), top: pad, bottom: pad }}>
        {/* overburden / impairment void */}
        <div className="st-core__void" style={{ height: voidH }}>
          <span className="st-core__voidline" style={{ top: '34%' }} />
          <span className="st-core__voidline" style={{ top: '68%' }} />
        </div>
        {/* junior */}
        <div className="st-core__layer st-core__layer--junior" style={{ bottom: sH, height: jH }}>
          <span className="st-core__edge st-core__edge--junior" />
        </div>
        {/* senior */}
        <div className="st-core__layer st-core__layer--senior" style={{ bottom: 0, height: sH }}>
          <span className="st-core__edge st-core__edge--senior" />
        </div>

        {/* tags */}
        <div className="st-core__tag" style={{ bottom: sH + jH / 2 - 14 }}>
          <span className="nm" style={{ color: 'var(--junior-200)' }}>Sediment</span>
          <span className="nv" style={{ color: 'var(--junior-100)' }}>{fmtUsd(juniorNav)}</span>
          <span className="sub" style={{ color: 'var(--junior-300)' }}>absorbs first</span>
        </div>
        <div className="st-core__tag" style={{ bottom: sH / 2 - 14 }}>
          <span className="nm" style={{ color: 'var(--senior-200)' }}>Bedrock</span>
          <span className="nv" style={{ color: 'var(--senior-100)' }}>{fmtUsd(seniorNav)}</span>
          <span className="sub" style={{ color: 'var(--senior-300)' }}>holds the line</span>
        </div>

        {sweepOn && <div key={sweepKey} className="st-core__sweep st-core__sweep--on" />}
      </div>

      {showScale && (
        <div className="st-core__scale">
          {scaleTicks.map((s, i) => (
            <span key={i} className="st-core__tick" style={{ top: s.y }}>{s.val}</span>
          ))}
        </div>
      )}
    </div>
  );
}
