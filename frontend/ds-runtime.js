/* @ds-bundle: {"format":3,"namespace":"StrataDesignSystem_8a0ec2","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Gauge","sourcePath":"components/data/Gauge.jsx"},{"name":"MoneyChart","sourcePath":"components/data/MoneyChart.jsx"},{"name":"NumberTicker","sourcePath":"components/data/NumberTicker.jsx"},{"name":"StrataCore","sourcePath":"components/data/StrataCore.jsx"},{"name":"EpochCountdown","sourcePath":"components/protocol/EpochCountdown.jsx"},{"name":"EventFeed","sourcePath":"components/protocol/EventFeed.jsx"},{"name":"TrancheCard","sourcePath":"components/protocol/TrancheCard.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"8348429a190f","components/core/Button.jsx":"22da9921ef63","components/core/Panel.jsx":"2e3e66d2437d","components/core/Stat.jsx":"276856a513cd","components/data/Gauge.jsx":"624d0e214ef9","components/data/MoneyChart.jsx":"48d756da62e2","components/data/NumberTicker.jsx":"527411b79af2","components/data/StrataCore.jsx":"febfa4abdace","components/protocol/EpochCountdown.jsx":"cf7a7d7d57a3","components/protocol/EventFeed.jsx":"332755cfeeae","components/protocol/TrancheCard.jsx":"7e73ec2e6ba1","ds-runtime.js":"94809bfd10a6","ui_kits/strata-app/AppShell.jsx":"5bbfeeb5b48e","ui_kits/strata-app/Deposit.jsx":"29a0085c129d","ui_kits/strata-app/Landing.jsx":"3482b04046b5","ui_kits/strata-app/Observatory.jsx":"da881b8a4578","ui_kits/strata-app/Simulator.jsx":"997317cf6d81","ui_kits/strata-app/data.js":"11ca06a1c6a5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.StrataDesignSystem_8a0ec2 = window.StrataDesignSystem_8a0ec2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  live = false,
  className = '',
  children,
  ...rest
}) {
  useCSS('st-badge-css', CSS);
  const cls = ['st-badge', `st-badge--${variant}`, `st-badge--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), (dot || live) && /*#__PURE__*/React.createElement("span", {
    className: `st-badge__dot${live ? ' st-badge__dot--live' : ''}`
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  as = 'button',
  className = '',
  children,
  ...rest
}) {
  useCSS('st-btn-css', CSS);
  const Tag = as;
  const cls = ['st-btn', `st-btn--${variant}`, `st-btn--${size}`, fullWidth ? 'st-btn--full' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    disabled: Tag === 'button' ? disabled : undefined
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    className: "st-btn__ic"
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    className: "st-btn__ic"
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function Panel({
  eyebrow,
  title,
  actions,
  accent,
  variant = 'default',
  padded = true,
  className = '',
  headless,
  children,
  ...rest
}) {
  useCSS('st-panel-css', CSS);
  const hasHead = !headless && (eyebrow || title || actions);
  const cls = ['st-panel', variant === 'sunken' ? 'st-panel--sunken' : '', accent ? `st-panel--accent-${accent}` : '', !hasHead && padded ? 'st-panel--pad' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("section", _extends({
    className: cls
  }, rest), hasHead && /*#__PURE__*/React.createElement("header", {
    className: "st-panel__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "st-panel__titles"
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    className: "st-panel__eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("span", {
    className: "st-panel__title"
  }, title)), actions && /*#__PURE__*/React.createElement("div", {
    className: "st-panel__actions"
  }, actions)), hasHead ? /*#__PURE__*/React.createElement("div", {
    className: padded ? 'st-panel__body' : ''
  }, children) : children);
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Panel.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function Stat({
  label,
  value,
  unit,
  delta,
  deltaDir = 'flat',
  tone = 'default',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  useCSS('st-stat-css', CSS);
  const cls = ['st-stat', `st-stat--${size}`, tone !== 'default' ? `st-stat--${tone}` : '', className].filter(Boolean).join(' ');
  const arrow = deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), label && /*#__PURE__*/React.createElement("span", {
    className: "st-stat__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "st-stat__value"
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    className: "st-stat__unit"
  }, unit)), delta != null && /*#__PURE__*/React.createElement("span", {
    className: `st-stat__delta st-stat__delta--${deltaDir}`
  }, arrow, " ", delta), children);
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/data/Gauge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function Gauge({
  value = 0,
  max = 1,
  min = 0,
  size = 180,
  label,
  unit,
  valueText,
  sweepDeg = 250,
  tone = 'senior',
  thresholds,
  className = '',
  ...rest
}) {
  useCSS('st-gauge-css', CSS);
  const r = size / 2 - 14;
  const cx = size / 2,
    cy = size / 2;
  const startAngle = 90 + (360 - sweepDeg) / 2; // centered at bottom gap
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const circumference = 2 * Math.PI * r;
  const arcLen = sweepDeg / 360 * circumference;
  const dashArray = `${arcLen} ${circumference}`;
  const offset = arcLen * (1 - frac);
  const accent = tone === 'junior' ? 'var(--junior-300)' : tone === 'loss' ? 'var(--loss-400)' : 'var(--senior-300)';
  const numSize = size * 0.2;

  // rotate so the arc starts at the bottom-left and sweeps clockwise
  const rot = startAngle;
  const ticks = (thresholds || []).map(t => {
    const tf = (t.at - min) / (max - min);
    const a = (rot + tf * sweepDeg) * (Math.PI / 180);
    return {
      x1: cx + (r - 7) * Math.cos(a),
      y1: cy + (r - 7) * Math.sin(a),
      x2: cx + (r + 4) * Math.cos(a),
      y2: cy + (r + 4) * Math.sin(a),
      color: t.color || 'var(--ink-550)'
    };
  });
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `st-gauge ${className}`,
    style: {
      width: size
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    style: {
      transform: `rotate(${rot - 90}deg)`
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: r,
    fill: "none",
    stroke: "var(--ink-700)",
    strokeWidth: "9",
    strokeDasharray: dashArray,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    className: "st-gauge__arc",
    cx: cx,
    cy: cy,
    r: r,
    fill: "none",
    stroke: accent,
    strokeWidth: "9",
    strokeDasharray: dashArray,
    strokeDashoffset: offset,
    strokeLinecap: "round",
    style: {
      filter: `drop-shadow(0 0 6px ${accent})`
    }
  }), ticks.map((t, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: t.x1,
    y1: t.y1,
    x2: t.x2,
    y2: t.y2,
    stroke: t.color,
    strokeWidth: "1.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "st-gauge__val"
  }, /*#__PURE__*/React.createElement("div", {
    className: "st-gauge__num",
    style: {
      fontSize: numSize
    }
  }, valueText ?? value), unit && /*#__PURE__*/React.createElement("div", {
    className: "st-gauge__unit"
  }, unit)));
}
Object.assign(__ds_scope, { Gauge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Gauge.jsx", error: String((e && e.message) || e) }); }

// components/data/MoneyChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
const ROLES = [{
  key: 'hodl',
  color: 'var(--line-hodl)',
  label: 'HODL',
  dash: '5 4',
  w: 1.5
}, {
  key: 'lp',
  color: 'var(--line-lp)',
  label: 'Vanilla LP',
  dash: '0',
  w: 2
}, {
  key: 'junior',
  color: 'var(--line-junior)',
  label: 'Sediment',
  dash: '0',
  w: 2
}, {
  key: 'senior',
  color: 'var(--line-senior)',
  label: 'Bedrock',
  dash: '0',
  w: 2.5
}];
function MoneyChart({
  series,
  price,
  progress = 1,
  height = 320,
  showLegend = true,
  showPrice = true,
  className = '',
  ...rest
}) {
  useCSS('st-chart-css', CSS);
  const W = 1000,
    H = 1000 * (height / (rest.aspect || 600)) || 600;
  const VH = 600;
  const keys = ROLES.filter(r => series && series[r.key]);
  const n = keys.length ? series[keys[0].key].length : 0;

  // y-domain across all series
  let lo = Infinity,
    hi = -Infinity;
  keys.forEach(r => series[r.key].forEach(v => {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }));
  if (!isFinite(lo)) {
    lo = 0;
    hi = 1;
  }
  const padY = (hi - lo) * 0.12 || 1;
  lo -= padY;
  hi += padY;
  const px = i => i / (n - 1) * W;
  const py = v => VH - (v - lo) / (hi - lo) * VH;
  const pathFor = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

  // price backdrop area
  let priceArea = null;
  if (showPrice && price && price.length) {
    let plo = Math.min(...price),
      phi = Math.max(...price);
    const pad = (phi - plo) * 0.15 || 1;
    plo -= pad;
    phi += pad;
    const ppy = v => VH - (v - plo) / (phi - plo) * VH;
    const top = price.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${ppy(v).toFixed(1)}`).join(' ');
    priceArea = `${top} L${W} ${VH} L0 ${VH} Z`;
  }
  const cut = Math.max(0, Math.min(1, progress));
  const headX = px((n - 1) * cut);
  const idx = Math.round((n - 1) * cut);
  const clipId = React.useId ? React.useId().replace(/:/g, '') : 'c' + Math.random().toString(36).slice(2);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `st-chart ${className}`
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${VH}`,
    style: {
      height
    },
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: clipId
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: headX,
    height: VH
  }))), [0.25, 0.5, 0.75].map((g, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    className: "st-chart__grid",
    x1: "0",
    x2: W,
    y1: VH * g,
    y2: VH * g
  })), priceArea && /*#__PURE__*/React.createElement("path", {
    className: "st-chart__price",
    d: priceArea
  }), keys.map(r => /*#__PURE__*/React.createElement("path", {
    key: 'f' + r.key,
    className: "st-chart__line st-chart__future",
    d: pathFor(series[r.key]),
    stroke: r.color,
    strokeWidth: r.w,
    strokeDasharray: r.dash
  })), /*#__PURE__*/React.createElement("g", {
    clipPath: `url(#${clipId})`
  }, keys.map(r => /*#__PURE__*/React.createElement("path", {
    key: r.key,
    className: "st-chart__line",
    d: pathFor(series[r.key]),
    stroke: r.color,
    strokeWidth: r.w,
    strokeDasharray: r.dash,
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }))), cut < 0.999 && /*#__PURE__*/React.createElement("line", {
    className: "st-chart__head",
    x1: headX,
    x2: headX,
    y1: "0",
    y2: VH
  }), keys.map(r => /*#__PURE__*/React.createElement("circle", {
    key: 'd' + r.key,
    className: "st-chart__dot",
    cx: headX,
    cy: py(series[r.key][idx]),
    r: "3.5",
    fill: r.color,
    vectorEffect: "non-scaling-stroke"
  }))), showLegend && /*#__PURE__*/React.createElement("div", {
    className: "st-chart__legend"
  }, keys.slice().reverse().map(r => /*#__PURE__*/React.createElement("span", {
    key: r.key,
    className: "st-chart__leg"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      borderTopColor: r.color,
      borderTopStyle: r.dash !== '0' ? 'dashed' : 'solid'
    }
  }), r.label, " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: r.color
    }
  }, series[r.key][idx].toFixed(1))))));
}
Object.assign(__ds_scope, { MoneyChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MoneyChart.jsx", error: String((e && e.message) || e) }); }

// components/data/NumberTicker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function format(n, {
  decimals = 0,
  prefix = '',
  suffix = '',
  commas = true
}) {
  const fixed = Number(n).toFixed(decimals);
  if (!commas) return prefix + fixed + suffix;
  const [int, frac] = fixed.split('.');
  const withC = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return prefix + withC + (frac ? '.' + frac : '') + suffix;
}

/**
 * Animates from its previous value to the new one on change.
 * Numbers tick — they never fade.
 */
function NumberTicker({
  value = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  commas = true,
  duration,
  className = '',
  style,
  ...rest
}) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef(0);
  const settleRef = React.useRef(0);
  const startRef = React.useRef(0);
  const dur = duration ?? (() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--dur-tick');
    const ms = parseFloat(v);
    return Number.isFinite(ms) ? ms : 520;
  });
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const D = typeof dur === 'function' ? dur() : dur;
    const from = fromRef.current;
    const to = value;
    if (reduce || D <= 1 || from === to) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    cancelAnimationFrame(rafRef.current);
    clearTimeout(settleRef.current);
    startRef.current = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - startRef.current) / D);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    // Guaranteed settle: if rAF is paused (background tab, capture), still land on `to`.
    settleRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      setDisplay(to);
      fromRef.current = to;
    }, D + 80);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(settleRef.current);
    };
  }, [value]); // eslint-disable-line

  return /*#__PURE__*/React.createElement("span", _extends({
    className: `st-ticker ${className}`,
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums lining-nums',
      fontFeatureSettings: 'var(--data-feature-settings)',
      ...style
    }
  }, rest), format(display, {
    decimals,
    prefix,
    suffix,
    commas
  }));
}
Object.assign(__ds_scope, { NumberTicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/NumberTicker.jsx", error: String((e && e.message) || e) }); }

// components/data/StrataCore.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function fmtUsd(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + Math.round(n);
}
function StrataCore({
  seniorNav = 1_620_000,
  juniorNav = 780_000,
  scaleMax,
  height = 360,
  sweepKey = 0,
  glyph = false,
  showScale = true,
  className = '',
  style,
  ...rest
}) {
  useCSS('st-core-css', CSS);
  const ref = scaleMax || (seniorNav + juniorNav) * 1.18; // headroom above for overburden
  const pad = glyph ? 0 : 14;
  const usable = height - pad * 2;
  const sH = Math.max(0, seniorNav / ref * usable);
  const jH = Math.max(0, juniorNav / ref * usable);
  const voidH = Math.max(0, usable - sH - jH);
  const sweepOn = sweepKey > 0;
  if (glyph) {
    const g = height;
    const gs = seniorNav / ref * g,
      gj = juniorNav / ref * g,
      gv = g - gs - gj;
    return /*#__PURE__*/React.createElement("span", _extends({
      className: `st-core ${className}`,
      style: {
        width: height * 0.92,
        height: g,
        borderRadius: 5,
        display: 'inline-block',
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      className: "st-core__stack"
    }, /*#__PURE__*/React.createElement("span", {
      className: "st-core__void",
      style: {
        height: gv
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "st-core__layer st-core__layer--junior",
      style: {
        bottom: gs,
        height: gj
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "st-core__edge st-core__edge--junior"
    })), /*#__PURE__*/React.createElement("span", {
      className: "st-core__layer st-core__layer--senior",
      style: {
        bottom: 0,
        height: gs
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "st-core__edge st-core__edge--senior"
    })), sweepOn && /*#__PURE__*/React.createElement("span", {
      key: sweepKey,
      className: "st-core__sweep st-core__sweep--on"
    })));
  }
  const scaleTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    t,
    y: pad + usable * t,
    val: fmtUsd(ref * (1 - t))
  }));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `st-core ${className}`,
    style: {
      height,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "st-core__stack",
    style: {
      left: pad,
      right: showScale ? 46 : pad,
      top: pad,
      bottom: pad
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "st-core__void",
    style: {
      height: voidH
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-core__voidline",
    style: {
      top: '34%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "st-core__voidline",
    style: {
      top: '68%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "st-core__layer st-core__layer--junior",
    style: {
      bottom: sH,
      height: jH
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-core__edge st-core__edge--junior"
  })), /*#__PURE__*/React.createElement("div", {
    className: "st-core__layer st-core__layer--senior",
    style: {
      bottom: 0,
      height: sH
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-core__edge st-core__edge--senior"
  })), /*#__PURE__*/React.createElement("div", {
    className: "st-core__tag",
    style: {
      bottom: sH + jH / 2 - 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "nm",
    style: {
      color: 'var(--junior-200)'
    }
  }, "Sediment"), /*#__PURE__*/React.createElement("span", {
    className: "nv",
    style: {
      color: 'var(--junior-100)'
    }
  }, fmtUsd(juniorNav)), /*#__PURE__*/React.createElement("span", {
    className: "sub",
    style: {
      color: 'var(--junior-300)'
    }
  }, "absorbs first")), /*#__PURE__*/React.createElement("div", {
    className: "st-core__tag",
    style: {
      bottom: sH / 2 - 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "nm",
    style: {
      color: 'var(--senior-200)'
    }
  }, "Bedrock"), /*#__PURE__*/React.createElement("span", {
    className: "nv",
    style: {
      color: 'var(--senior-100)'
    }
  }, fmtUsd(seniorNav)), /*#__PURE__*/React.createElement("span", {
    className: "sub",
    style: {
      color: 'var(--senior-300)'
    }
  }, "holds the line")), sweepOn && /*#__PURE__*/React.createElement("div", {
    key: sweepKey,
    className: "st-core__sweep st-core__sweep--on"
  })), showScale && /*#__PURE__*/React.createElement("div", {
    className: "st-core__scale"
  }, scaleTicks.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "st-core__tick",
    style: {
      top: s.y
    }
  }, s.val))));
}
Object.assign(__ds_scope, { StrataCore });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StrataCore.jsx", error: String((e && e.message) || e) }); }

// components/protocol/EpochCountdown.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function hms(total) {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600),
    m = Math.floor(t % 3600 / 60),
    s = t % 60;
  const p = x => String(x).padStart(2, '0');
  return {
    h: p(h),
    m: p(m),
    s: p(s)
  };
}
function EpochCountdown({
  epoch = 47,
  secondsLeft = 11529,
  epochLength = 28800,
  running = true,
  onSettle,
  className = '',
  ...rest
}) {
  useCSS('st-epoch-css', CSS);
  const [left, setLeft] = React.useState(secondsLeft);
  React.useEffect(() => setLeft(secondsLeft), [secondsLeft]);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) {
          onSettle && onSettle();
          return epochLength;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, epochLength]); // eslint-disable-line

  const {
    h,
    m,
    s
  } = hms(left);
  const elapsed = Math.max(0, Math.min(1, 1 - left / epochLength));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `st-epoch ${className}`
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "st-epoch__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-epoch__label"
  }, "Next settlement"), /*#__PURE__*/React.createElement("span", {
    className: "st-epoch__no"
  }, "epoch ", epoch, " \u2192 ", epoch + 1)), /*#__PURE__*/React.createElement("div", {
    className: "st-epoch__time"
  }, h, /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, ":"), m, /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, ":"), s), /*#__PURE__*/React.createElement("div", {
    className: "st-epoch__bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: `${elapsed * 100}%`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "st-epoch__ticks"
  }, /*#__PURE__*/React.createElement("span", null, "epoch opened"), /*#__PURE__*/React.createElement("span", null, (epochLength / 3600).toFixed(0), "h epoch"), /*#__PURE__*/React.createElement("span", null, "waterfall")));
}
Object.assign(__ds_scope, { EpochCountdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/protocol/EpochCountdown.jsx", error: String((e && e.message) || e) }); }

// components/protocol/EventFeed.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
@media (prefers-reduced-motion: reduce) { .st-feed__dot { animation: none; } }
`;
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
const MARK = {
  settle: 'settle',
  reactive: 'reactive',
  emergency: 'emergency',
  info: 'info'
};
function EventFeed({
  events = [],
  title = 'Reactive Network · automation feed',
  maxHeight,
  explorerBase = '#',
  className = '',
  ...rest
}) {
  useCSS('st-feed-css', CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `st-feed ${className}`,
    style: maxHeight ? {
      ['--st-feed-h']: maxHeight + 'px'
    } : null
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "st-feed__bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-feed__title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-feed__dot"
  }), title), /*#__PURE__*/React.createElement("span", {
    className: "st-feed__meta"
  }, "no keepers \xB7 no bots")), /*#__PURE__*/React.createElement("div", {
    className: "st-feed__list"
  }, events.map((e, i) => /*#__PURE__*/React.createElement("div", {
    className: "st-feed__row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "st-feed__ts"
  }, e.time), /*#__PURE__*/React.createElement("span", {
    className: `st-feed__mark st-feed__mark--${MARK[e.kind] || 'info'}`
  }), /*#__PURE__*/React.createElement("div", {
    className: "st-feed__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "st-feed__msg",
    dangerouslySetInnerHTML: {
      __html: e.message
    }
  }), (e.tx || e.chain || e.epoch != null) && /*#__PURE__*/React.createElement("div", {
    className: "st-feed__sub"
  }, e.chain && /*#__PURE__*/React.createElement("span", {
    className: "st-feed__chain"
  }, e.chain), e.epoch != null && /*#__PURE__*/React.createElement("span", {
    className: "st-feed__chain"
  }, "epoch ", e.epoch), e.tx && /*#__PURE__*/React.createElement("a", {
    className: "st-feed__tx",
    href: explorerBase,
    onClick: ev => ev.preventDefault()
  }, e.tx, " \u2197")))))));
}
Object.assign(__ds_scope, { EventFeed });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/protocol/EventFeed.jsx", error: String((e && e.message) || e) }); }

// components/protocol/TrancheCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.st-tranche {
  position: relative; display: flex; flex-direction: column; gap: var(--space-5);
  padding: var(--space-6); border-radius: var(--radius-lg); cursor: pointer;
  background: var(--surface-card); border: 1px solid var(--border);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out),
              transform var(--dur-instant) var(--ease-press);
  text-align: left; min-width: 0;
}
.st-tranche:active { transform: scale(0.995); }
.st-tranche__top { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0.8; }
.st-tranche--senior .st-tranche__top { background: var(--senior-500); }
.st-tranche--junior .st-tranche__top { background: var(--junior-500); }
.st-tranche--senior:hover { border-color: var(--senior-700); }
.st-tranche--junior:hover { border-color: var(--junior-700); }
.st-tranche[data-selected="true"] { background: var(--surface-raised); }
.st-tranche--senior[data-selected="true"] { border-color: var(--senior-600); box-shadow: var(--glow-senior); }
.st-tranche--junior[data-selected="true"] { border-color: var(--junior-600); box-shadow: var(--glow-junior); }

.st-tranche__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
.st-tranche__name { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--text-primary); letter-spacing: -0.01em; }
.st-tranche__role { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px; }
.st-tranche__apr { display: flex; align-items: baseline; gap: 8px; }
.st-tranche__apr .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500; font-size: 40px; line-height: 1; }
.st-tranche--senior .st-tranche__apr .v { color: var(--senior-200); }
.st-tranche--junior .st-tranche__apr .v { color: var(--junior-200); }
.st-tranche__apr .lbl { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--text-tertiary); }
.st-tranche__rows { display: flex; flex-direction: column; gap: 1px; background: var(--hairline);
  border-radius: var(--radius-sm); overflow: hidden; }
.st-tranche__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: 10px 12px; background: var(--bg-sunken); }
.st-tranche__row .k { font-family: var(--font-sans); font-size: 13px; color: var(--text-secondary); }
.st-tranche__row .val { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-size: 13px; color: var(--text-primary); }
.st-tranche__cap { height: 5px; border-radius: var(--radius-full); background: var(--ink-700); overflow: hidden; }
.st-tranche__cap > i { display: block; height: 100%; border-radius: inherit; transition: width var(--dur-slow) var(--ease-out); }
.st-tranche--senior .st-tranche__cap > i { background: var(--senior-500); }
.st-tranche--junior .st-tranche__cap > i { background: var(--junior-500); }
.st-tranche__foot { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); line-height: 1.45; }
`;
function useCSS(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const e = document.createElement('style');
    e.id = id;
    e.textContent = css;
    document.head.appendChild(e);
  }, [id, css]);
}
function TrancheCard({
  tranche = 'senior',
  apr,
  aprLabel,
  name,
  role,
  rows = [],
  capacityPct,
  capacityLabel,
  footnote,
  selected = false,
  onSelect,
  className = '',
  children,
  ...rest
}) {
  useCSS('st-tranche-css', CSS);
  const defaults = tranche === 'senior' ? {
    name: 'Bedrock',
    role: 'Senior layer — fixed coupon, protected first',
    aprLabel: 'fixed this epoch'
  } : {
    name: 'Sediment',
    role: 'Junior layer — levered yield, absorbs loss first',
    aprLabel: 'trailing 30d'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: `st-tranche st-tranche--${tranche} ${className}`,
    "data-selected": selected ? 'true' : 'false',
    onClick: onSelect
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "st-tranche__top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__name"
  }, name ?? defaults.name), /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__role"
  }, role ?? defaults.role))), /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__apr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, apr), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, aprLabel ?? defaults.aprLabel)), capacityPct != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__row",
    style: {
      background: 'transparent',
      padding: '0 0 7px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, capacityLabel ?? 'Capacity filled'), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, capacityPct, "%")), /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__cap"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: `${capacityPct}%`
    }
  }))), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__rows"
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, r.label), /*#__PURE__*/React.createElement("span", {
    className: "val",
    style: r.tone === 'senior' ? {
      color: 'var(--senior-200)'
    } : r.tone === 'junior' ? {
      color: 'var(--junior-200)'
    } : null
  }, r.value)))), footnote && /*#__PURE__*/React.createElement("div", {
    className: "st-tranche__foot"
  }, footnote), children);
}
Object.assign(__ds_scope, { TrancheCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/protocol/TrancheCard.jsx", error: String((e && e.message) || e) }); }

// ds-runtime.js
try { (() => {
/* @ds-bundle: {"format":3,"namespace":"StrataDesignSystem_8a0ec2","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Gauge","sourcePath":"components/data/Gauge.jsx"},{"name":"MoneyChart","sourcePath":"components/data/MoneyChart.jsx"},{"name":"NumberTicker","sourcePath":"components/data/NumberTicker.jsx"},{"name":"StrataCore","sourcePath":"components/data/StrataCore.jsx"},{"name":"EpochCountdown","sourcePath":"components/protocol/EpochCountdown.jsx"},{"name":"EventFeed","sourcePath":"components/protocol/EventFeed.jsx"},{"name":"TrancheCard","sourcePath":"components/protocol/TrancheCard.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"8348429a190f","components/core/Button.jsx":"22da9921ef63","components/core/Panel.jsx":"2e3e66d2437d","components/core/Stat.jsx":"276856a513cd","components/data/Gauge.jsx":"624d0e214ef9","components/data/MoneyChart.jsx":"48d756da62e2","components/data/NumberTicker.jsx":"dd8d0cdb0f4b","components/data/StrataCore.jsx":"febfa4abdace","components/protocol/EpochCountdown.jsx":"cf7a7d7d57a3","components/protocol/EventFeed.jsx":"332755cfeeae","components/protocol/TrancheCard.jsx":"7e73ec2e6ba1","ds-runtime.js":"64811770c56f","ui_kits/strata-app/AppShell.jsx":"e4b3a9fab69e","ui_kits/strata-app/Deposit.jsx":"7e2a379f4434","ui_kits/strata-app/Landing.jsx":"3482b04046b5","ui_kits/strata-app/Observatory.jsx":"da881b8a4578","ui_kits/strata-app/Simulator.jsx":"997317cf6d81","ui_kits/strata-app/data.js":"11ca06a1c6a5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {
  const __ds_ns = window.StrataDesignSystem_8a0ec2 = window.StrataDesignSystem_8a0ec2 || {};
  const __ds_scope = {};
  __ds_ns.__errors = __ds_ns.__errors || [];

  // components/core/Badge.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function Badge({
        variant = 'neutral',
        size = 'md',
        dot = false,
        live = false,
        className = '',
        children,
        ...rest
      }) {
        useCSS('st-badge-css', CSS);
        const cls = ['st-badge', `st-badge--${variant}`, `st-badge--${size}`, className].filter(Boolean).join(' ');
        return /*#__PURE__*/React.createElement("span", _extends({
          className: cls
        }, rest), (dot || live) && /*#__PURE__*/React.createElement("span", {
          className: `st-badge__dot${live ? ' st-badge__dot--live' : ''}`
        }), children);
      }
      Object.assign(__ds_scope, {
        Badge
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Badge.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/core/Button.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
          el.id = id;
          el.textContent = css;
          document.head.appendChild(el);
        }, [id, css]);
      }
      function Button({
        variant = 'secondary',
        size = 'md',
        icon,
        iconRight,
        fullWidth = false,
        disabled = false,
        as = 'button',
        className = '',
        children,
        ...rest
      }) {
        useCSS('st-btn-css', CSS);
        const Tag = as;
        const cls = ['st-btn', `st-btn--${variant}`, `st-btn--${size}`, fullWidth ? 'st-btn--full' : '', className].filter(Boolean).join(' ');
        return /*#__PURE__*/React.createElement(Tag, _extends({
          className: cls,
          disabled: Tag === 'button' ? disabled : undefined
        }, rest), icon && /*#__PURE__*/React.createElement("span", {
          className: "st-btn__ic"
        }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
          className: "st-btn__ic"
        }, iconRight));
      }
      Object.assign(__ds_scope, {
        Button
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Button.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/core/Panel.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function Panel({
        eyebrow,
        title,
        actions,
        accent,
        variant = 'default',
        padded = true,
        className = '',
        headless,
        children,
        ...rest
      }) {
        useCSS('st-panel-css', CSS);
        const hasHead = !headless && (eyebrow || title || actions);
        const cls = ['st-panel', variant === 'sunken' ? 'st-panel--sunken' : '', accent ? `st-panel--accent-${accent}` : '', !hasHead && padded ? 'st-panel--pad' : '', className].filter(Boolean).join(' ');
        return /*#__PURE__*/React.createElement("section", _extends({
          className: cls
        }, rest), hasHead && /*#__PURE__*/React.createElement("header", {
          className: "st-panel__head"
        }, /*#__PURE__*/React.createElement("div", {
          className: "st-panel__titles"
        }, eyebrow && /*#__PURE__*/React.createElement("span", {
          className: "st-panel__eyebrow"
        }, eyebrow), title && /*#__PURE__*/React.createElement("span", {
          className: "st-panel__title"
        }, title)), actions && /*#__PURE__*/React.createElement("div", {
          className: "st-panel__actions"
        }, actions)), hasHead ? /*#__PURE__*/React.createElement("div", {
          className: padded ? 'st-panel__body' : ''
        }, children) : children);
      }
      Object.assign(__ds_scope, {
        Panel
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Panel.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/core/Stat.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function Stat({
        label,
        value,
        unit,
        delta,
        deltaDir = 'flat',
        tone = 'default',
        size = 'md',
        className = '',
        children,
        ...rest
      }) {
        useCSS('st-stat-css', CSS);
        const cls = ['st-stat', `st-stat--${size}`, tone !== 'default' ? `st-stat--${tone}` : '', className].filter(Boolean).join(' ');
        const arrow = deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—';
        return /*#__PURE__*/React.createElement("div", _extends({
          className: cls
        }, rest), label && /*#__PURE__*/React.createElement("span", {
          className: "st-stat__label"
        }, label), /*#__PURE__*/React.createElement("span", {
          className: "st-stat__value"
        }, value, unit && /*#__PURE__*/React.createElement("span", {
          className: "st-stat__unit"
        }, unit)), delta != null && /*#__PURE__*/React.createElement("span", {
          className: `st-stat__delta st-stat__delta--${deltaDir}`
        }, arrow, " ", delta), children);
      }
      Object.assign(__ds_scope, {
        Stat
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/core/Stat.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/data/Gauge.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function Gauge({
        value = 0,
        max = 1,
        min = 0,
        size = 180,
        label,
        unit,
        valueText,
        sweepDeg = 250,
        tone = 'senior',
        thresholds,
        className = '',
        ...rest
      }) {
        useCSS('st-gauge-css', CSS);
        const r = size / 2 - 14;
        const cx = size / 2,
          cy = size / 2;
        const startAngle = 90 + (360 - sweepDeg) / 2; // centered at bottom gap
        const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
        const circumference = 2 * Math.PI * r;
        const arcLen = sweepDeg / 360 * circumference;
        const dashArray = `${arcLen} ${circumference}`;
        const offset = arcLen * (1 - frac);
        const accent = tone === 'junior' ? 'var(--junior-300)' : tone === 'loss' ? 'var(--loss-400)' : 'var(--senior-300)';
        const numSize = size * 0.2;

        // rotate so the arc starts at the bottom-left and sweeps clockwise
        const rot = startAngle;
        const ticks = (thresholds || []).map(t => {
          const tf = (t.at - min) / (max - min);
          const a = (rot + tf * sweepDeg) * (Math.PI / 180);
          return {
            x1: cx + (r - 7) * Math.cos(a),
            y1: cy + (r - 7) * Math.sin(a),
            x2: cx + (r + 4) * Math.cos(a),
            y2: cy + (r + 4) * Math.sin(a),
            color: t.color || 'var(--ink-550)'
          };
        });
        return /*#__PURE__*/React.createElement("div", _extends({
          className: `st-gauge ${className}`,
          style: {
            width: size
          }
        }, rest), /*#__PURE__*/React.createElement("svg", {
          width: size,
          height: size,
          viewBox: `0 0 ${size} ${size}`,
          style: {
            transform: `rotate(${rot - 90}deg)`
          }
        }, /*#__PURE__*/React.createElement("circle", {
          cx: cx,
          cy: cy,
          r: r,
          fill: "none",
          stroke: "var(--ink-700)",
          strokeWidth: "9",
          strokeDasharray: dashArray,
          strokeLinecap: "round"
        }), /*#__PURE__*/React.createElement("circle", {
          className: "st-gauge__arc",
          cx: cx,
          cy: cy,
          r: r,
          fill: "none",
          stroke: accent,
          strokeWidth: "9",
          strokeDasharray: dashArray,
          strokeDashoffset: offset,
          strokeLinecap: "round",
          style: {
            filter: `drop-shadow(0 0 6px ${accent})`
          }
        }), ticks.map((t, i) => /*#__PURE__*/React.createElement("line", {
          key: i,
          x1: t.x1,
          y1: t.y1,
          x2: t.x2,
          y2: t.y2,
          stroke: t.color,
          strokeWidth: "1.5"
        }))), /*#__PURE__*/React.createElement("div", {
          className: "st-gauge__val"
        }, /*#__PURE__*/React.createElement("div", {
          className: "st-gauge__num",
          style: {
            fontSize: numSize
          }
        }, valueText ?? value), unit && /*#__PURE__*/React.createElement("div", {
          className: "st-gauge__unit"
        }, unit)));
      }
      Object.assign(__ds_scope, {
        Gauge
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/Gauge.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/data/MoneyChart.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      const ROLES = [{
        key: 'hodl',
        color: 'var(--line-hodl)',
        label: 'HODL',
        dash: '5 4',
        w: 1.5
      }, {
        key: 'lp',
        color: 'var(--line-lp)',
        label: 'Vanilla LP',
        dash: '0',
        w: 2
      }, {
        key: 'junior',
        color: 'var(--line-junior)',
        label: 'Sediment',
        dash: '0',
        w: 2
      }, {
        key: 'senior',
        color: 'var(--line-senior)',
        label: 'Bedrock',
        dash: '0',
        w: 2.5
      }];
      function MoneyChart({
        series,
        price,
        progress = 1,
        height = 320,
        showLegend = true,
        showPrice = true,
        className = '',
        ...rest
      }) {
        useCSS('st-chart-css', CSS);
        const W = 1000,
          H = 1000 * (height / (rest.aspect || 600)) || 600;
        const VH = 600;
        const keys = ROLES.filter(r => series && series[r.key]);
        const n = keys.length ? series[keys[0].key].length : 0;

        // y-domain across all series
        let lo = Infinity,
          hi = -Infinity;
        keys.forEach(r => series[r.key].forEach(v => {
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }));
        if (!isFinite(lo)) {
          lo = 0;
          hi = 1;
        }
        const padY = (hi - lo) * 0.12 || 1;
        lo -= padY;
        hi += padY;
        const px = i => i / (n - 1) * W;
        const py = v => VH - (v - lo) / (hi - lo) * VH;
        const pathFor = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

        // price backdrop area
        let priceArea = null;
        if (showPrice && price && price.length) {
          let plo = Math.min(...price),
            phi = Math.max(...price);
          const pad = (phi - plo) * 0.15 || 1;
          plo -= pad;
          phi += pad;
          const ppy = v => VH - (v - plo) / (phi - plo) * VH;
          const top = price.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${ppy(v).toFixed(1)}`).join(' ');
          priceArea = `${top} L${W} ${VH} L0 ${VH} Z`;
        }
        const cut = Math.max(0, Math.min(1, progress));
        const headX = px((n - 1) * cut);
        const idx = Math.round((n - 1) * cut);
        const clipId = React.useId ? React.useId().replace(/:/g, '') : 'c' + Math.random().toString(36).slice(2);
        return /*#__PURE__*/React.createElement("div", _extends({
          className: `st-chart ${className}`
        }, rest), /*#__PURE__*/React.createElement("svg", {
          viewBox: `0 0 ${W} ${VH}`,
          style: {
            height
          },
          preserveAspectRatio: "none"
        }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
          id: clipId
        }, /*#__PURE__*/React.createElement("rect", {
          x: "0",
          y: "0",
          width: headX,
          height: VH
        }))), [0.25, 0.5, 0.75].map((g, i) => /*#__PURE__*/React.createElement("line", {
          key: i,
          className: "st-chart__grid",
          x1: "0",
          x2: W,
          y1: VH * g,
          y2: VH * g
        })), priceArea && /*#__PURE__*/React.createElement("path", {
          className: "st-chart__price",
          d: priceArea
        }), keys.map(r => /*#__PURE__*/React.createElement("path", {
          key: 'f' + r.key,
          className: "st-chart__line st-chart__future",
          d: pathFor(series[r.key]),
          stroke: r.color,
          strokeWidth: r.w,
          strokeDasharray: r.dash
        })), /*#__PURE__*/React.createElement("g", {
          clipPath: `url(#${clipId})`
        }, keys.map(r => /*#__PURE__*/React.createElement("path", {
          key: r.key,
          className: "st-chart__line",
          d: pathFor(series[r.key]),
          stroke: r.color,
          strokeWidth: r.w,
          strokeDasharray: r.dash,
          strokeLinejoin: "round",
          strokeLinecap: "round"
        }))), cut < 0.999 && /*#__PURE__*/React.createElement("line", {
          className: "st-chart__head",
          x1: headX,
          x2: headX,
          y1: "0",
          y2: VH
        }), keys.map(r => /*#__PURE__*/React.createElement("circle", {
          key: 'd' + r.key,
          className: "st-chart__dot",
          cx: headX,
          cy: py(series[r.key][idx]),
          r: "3.5",
          fill: r.color,
          vectorEffect: "non-scaling-stroke"
        }))), showLegend && /*#__PURE__*/React.createElement("div", {
          className: "st-chart__legend"
        }, keys.slice().reverse().map(r => /*#__PURE__*/React.createElement("span", {
          key: r.key,
          className: "st-chart__leg"
        }, /*#__PURE__*/React.createElement("i", {
          style: {
            borderTopColor: r.color,
            borderTopStyle: r.dash !== '0' ? 'dashed' : 'solid'
          }
        }), r.label, " ", /*#__PURE__*/React.createElement("b", {
          style: {
            color: r.color
          }
        }, series[r.key][idx].toFixed(1))))));
      }
      Object.assign(__ds_scope, {
        MoneyChart
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/MoneyChart.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/data/NumberTicker.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
      function format(n, {
        decimals = 0,
        prefix = '',
        suffix = '',
        commas = true
      }) {
        const fixed = Number(n).toFixed(decimals);
        if (!commas) return prefix + fixed + suffix;
        const [int, frac] = fixed.split('.');
        const withC = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return prefix + withC + (frac ? '.' + frac : '') + suffix;
      }

      /**
       * Animates from its previous value to the new one on change.
       * Numbers tick — they never fade.
       */
      function NumberTicker({
        value = 0,
        decimals = 0,
        prefix = '',
        suffix = '',
        commas = true,
        duration,
        className = '',
        style,
        ...rest
      }) {
        const [display, setDisplay] = React.useState(value);
        const fromRef = React.useRef(value);
        const rafRef = React.useRef(0);
        const startRef = React.useRef(0);
        const dur = duration ?? (() => {
          const v = getComputedStyle(document.documentElement).getPropertyValue('--dur-tick');
          const ms = parseFloat(v);
          return Number.isFinite(ms) ? ms : 520;
        });
        React.useEffect(() => {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const D = typeof dur === 'function' ? dur() : dur;
          const from = fromRef.current;
          const to = value;
          if (reduce || D <= 1 || from === to) {
            setDisplay(to);
            fromRef.current = to;
            return;
          }
          cancelAnimationFrame(rafRef.current);
          startRef.current = performance.now();
          const tick = now => {
            const t = Math.min(1, (now - startRef.current) / D);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setDisplay(from + (to - from) * eased);
            if (t < 1) rafRef.current = requestAnimationFrame(tick);else fromRef.current = to;
          };
          rafRef.current = requestAnimationFrame(tick);
          return () => cancelAnimationFrame(rafRef.current);
        }, [value]); // eslint-disable-line

        return /*#__PURE__*/React.createElement("span", _extends({
          className: `st-ticker ${className}`,
          style: {
            fontFamily: 'var(--font-mono)',
            fontVariantNumeric: 'tabular-nums lining-nums',
            fontFeatureSettings: 'var(--data-feature-settings)',
            ...style
          }
        }, rest), format(display, {
          decimals,
          prefix,
          suffix,
          commas
        }));
      }
      Object.assign(__ds_scope, {
        NumberTicker
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/NumberTicker.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/data/StrataCore.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function fmtUsd(n) {
        if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
        return '$' + Math.round(n);
      }
      function StrataCore({
        seniorNav = 1_620_000,
        juniorNav = 780_000,
        scaleMax,
        height = 360,
        sweepKey = 0,
        glyph = false,
        showScale = true,
        className = '',
        style,
        ...rest
      }) {
        useCSS('st-core-css', CSS);
        const ref = scaleMax || (seniorNav + juniorNav) * 1.18; // headroom above for overburden
        const pad = glyph ? 0 : 14;
        const usable = height - pad * 2;
        const sH = Math.max(0, seniorNav / ref * usable);
        const jH = Math.max(0, juniorNav / ref * usable);
        const voidH = Math.max(0, usable - sH - jH);
        const sweepOn = sweepKey > 0;
        if (glyph) {
          const g = height;
          const gs = seniorNav / ref * g,
            gj = juniorNav / ref * g,
            gv = g - gs - gj;
          return /*#__PURE__*/React.createElement("span", _extends({
            className: `st-core ${className}`,
            style: {
              width: height * 0.92,
              height: g,
              borderRadius: 5,
              display: 'inline-block',
              ...style
            }
          }, rest), /*#__PURE__*/React.createElement("span", {
            className: "st-core__stack"
          }, /*#__PURE__*/React.createElement("span", {
            className: "st-core__void",
            style: {
              height: gv
            }
          }), /*#__PURE__*/React.createElement("span", {
            className: "st-core__layer st-core__layer--junior",
            style: {
              bottom: gs,
              height: gj
            }
          }, /*#__PURE__*/React.createElement("span", {
            className: "st-core__edge st-core__edge--junior"
          })), /*#__PURE__*/React.createElement("span", {
            className: "st-core__layer st-core__layer--senior",
            style: {
              bottom: 0,
              height: gs
            }
          }, /*#__PURE__*/React.createElement("span", {
            className: "st-core__edge st-core__edge--senior"
          })), sweepOn && /*#__PURE__*/React.createElement("span", {
            key: sweepKey,
            className: "st-core__sweep st-core__sweep--on"
          })));
        }
        const scaleTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
          t,
          y: pad + usable * t,
          val: fmtUsd(ref * (1 - t))
        }));
        return /*#__PURE__*/React.createElement("div", _extends({
          className: `st-core ${className}`,
          style: {
            height,
            ...style
          }
        }, rest), /*#__PURE__*/React.createElement("div", {
          className: "st-core__stack",
          style: {
            left: pad,
            right: showScale ? 46 : pad,
            top: pad,
            bottom: pad
          }
        }, /*#__PURE__*/React.createElement("div", {
          className: "st-core__void",
          style: {
            height: voidH
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-core__voidline",
          style: {
            top: '34%'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "st-core__voidline",
          style: {
            top: '68%'
          }
        })), /*#__PURE__*/React.createElement("div", {
          className: "st-core__layer st-core__layer--junior",
          style: {
            bottom: sH,
            height: jH
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-core__edge st-core__edge--junior"
        })), /*#__PURE__*/React.createElement("div", {
          className: "st-core__layer st-core__layer--senior",
          style: {
            bottom: 0,
            height: sH
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-core__edge st-core__edge--senior"
        })), /*#__PURE__*/React.createElement("div", {
          className: "st-core__tag",
          style: {
            bottom: sH + jH / 2 - 14
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "nm",
          style: {
            color: 'var(--junior-200)'
          }
        }, "Sediment"), /*#__PURE__*/React.createElement("span", {
          className: "nv",
          style: {
            color: 'var(--junior-100)'
          }
        }, fmtUsd(juniorNav)), /*#__PURE__*/React.createElement("span", {
          className: "sub",
          style: {
            color: 'var(--junior-300)'
          }
        }, "absorbs first")), /*#__PURE__*/React.createElement("div", {
          className: "st-core__tag",
          style: {
            bottom: sH / 2 - 14
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "nm",
          style: {
            color: 'var(--senior-200)'
          }
        }, "Bedrock"), /*#__PURE__*/React.createElement("span", {
          className: "nv",
          style: {
            color: 'var(--senior-100)'
          }
        }, fmtUsd(seniorNav)), /*#__PURE__*/React.createElement("span", {
          className: "sub",
          style: {
            color: 'var(--senior-300)'
          }
        }, "holds the line")), sweepOn && /*#__PURE__*/React.createElement("div", {
          key: sweepKey,
          className: "st-core__sweep st-core__sweep--on"
        })), showScale && /*#__PURE__*/React.createElement("div", {
          className: "st-core__scale"
        }, scaleTicks.map((s, i) => /*#__PURE__*/React.createElement("span", {
          key: i,
          className: "st-core__tick",
          style: {
            top: s.y
          }
        }, s.val))));
      }
      Object.assign(__ds_scope, {
        StrataCore
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/data/StrataCore.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/protocol/EpochCountdown.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function hms(total) {
        const t = Math.max(0, Math.floor(total));
        const h = Math.floor(t / 3600),
          m = Math.floor(t % 3600 / 60),
          s = t % 60;
        const p = x => String(x).padStart(2, '0');
        return {
          h: p(h),
          m: p(m),
          s: p(s)
        };
      }
      function EpochCountdown({
        epoch = 47,
        secondsLeft = 11529,
        epochLength = 28800,
        running = true,
        onSettle,
        className = '',
        ...rest
      }) {
        useCSS('st-epoch-css', CSS);
        const [left, setLeft] = React.useState(secondsLeft);
        React.useEffect(() => setLeft(secondsLeft), [secondsLeft]);
        React.useEffect(() => {
          if (!running) return;
          const id = setInterval(() => {
            setLeft(prev => {
              if (prev <= 1) {
                onSettle && onSettle();
                return epochLength;
              }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(id);
        }, [running, epochLength]); // eslint-disable-line

        const {
          h,
          m,
          s
        } = hms(left);
        const elapsed = Math.max(0, Math.min(1, 1 - left / epochLength));
        return /*#__PURE__*/React.createElement("div", _extends({
          className: `st-epoch ${className}`
        }, rest), /*#__PURE__*/React.createElement("div", {
          className: "st-epoch__head"
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-epoch__label"
        }, "Next settlement"), /*#__PURE__*/React.createElement("span", {
          className: "st-epoch__no"
        }, "epoch ", epoch, " \u2192 ", epoch + 1)), /*#__PURE__*/React.createElement("div", {
          className: "st-epoch__time"
        }, h, /*#__PURE__*/React.createElement("span", {
          className: "u"
        }, ":"), m, /*#__PURE__*/React.createElement("span", {
          className: "u"
        }, ":"), s), /*#__PURE__*/React.createElement("div", {
          className: "st-epoch__bar"
        }, /*#__PURE__*/React.createElement("i", {
          style: {
            width: `${elapsed * 100}%`
          }
        })), /*#__PURE__*/React.createElement("div", {
          className: "st-epoch__ticks"
        }, /*#__PURE__*/React.createElement("span", null, "epoch opened"), /*#__PURE__*/React.createElement("span", null, (epochLength / 3600).toFixed(0), "h epoch"), /*#__PURE__*/React.createElement("span", null, "waterfall")));
      }
      Object.assign(__ds_scope, {
        EpochCountdown
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/protocol/EpochCountdown.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/protocol/EventFeed.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
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
@media (prefers-reduced-motion: reduce) { .st-feed__dot { animation: none; } }
`;
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      const MARK = {
        settle: 'settle',
        reactive: 'reactive',
        emergency: 'emergency',
        info: 'info'
      };
      function EventFeed({
        events = [],
        title = 'Reactive Network · automation feed',
        maxHeight,
        explorerBase = '#',
        className = '',
        ...rest
      }) {
        useCSS('st-feed-css', CSS);
        return /*#__PURE__*/React.createElement("div", _extends({
          className: `st-feed ${className}`,
          style: maxHeight ? {
            ['--st-feed-h']: maxHeight + 'px'
          } : null
        }, rest), /*#__PURE__*/React.createElement("div", {
          className: "st-feed__bar"
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-feed__title"
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-feed__dot"
        }), title), /*#__PURE__*/React.createElement("span", {
          className: "st-feed__meta"
        }, "no keepers \xB7 no bots")), /*#__PURE__*/React.createElement("div", {
          className: "st-feed__list"
        }, events.map((e, i) => /*#__PURE__*/React.createElement("div", {
          className: "st-feed__row",
          key: i
        }, /*#__PURE__*/React.createElement("span", {
          className: "st-feed__ts"
        }, e.time), /*#__PURE__*/React.createElement("span", {
          className: `st-feed__mark st-feed__mark--${MARK[e.kind] || 'info'}`
        }), /*#__PURE__*/React.createElement("div", {
          className: "st-feed__body"
        }, /*#__PURE__*/React.createElement("div", {
          className: "st-feed__msg",
          dangerouslySetInnerHTML: {
            __html: e.message
          }
        }), (e.tx || e.chain || e.epoch != null) && /*#__PURE__*/React.createElement("div", {
          className: "st-feed__sub"
        }, e.chain && /*#__PURE__*/React.createElement("span", {
          className: "st-feed__chain"
        }, e.chain), e.epoch != null && /*#__PURE__*/React.createElement("span", {
          className: "st-feed__chain"
        }, "epoch ", e.epoch), e.tx && /*#__PURE__*/React.createElement("a", {
          className: "st-feed__tx",
          href: explorerBase,
          onClick: ev => ev.preventDefault()
        }, e.tx, " \u2197")))))));
      }
      Object.assign(__ds_scope, {
        EventFeed
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/protocol/EventFeed.jsx",
      error: String(e && e.message || e)
    });
  }

  // components/protocol/TrancheCard.jsx
  try {
    (() => {
      function _extends() {
        return _extends = Object.assign ? Object.assign.bind() : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }, _extends.apply(null, arguments);
      }
      const CSS = `
.st-tranche {
  position: relative; display: flex; flex-direction: column; gap: var(--space-5);
  padding: var(--space-6); border-radius: var(--radius-lg); cursor: pointer;
  background: var(--surface-card); border: 1px solid var(--border);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out),
              transform var(--dur-instant) var(--ease-press);
  text-align: left; min-width: 0;
}
.st-tranche:active { transform: scale(0.995); }
.st-tranche__top { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0.8; }
.st-tranche--senior .st-tranche__top { background: var(--senior-500); }
.st-tranche--junior .st-tranche__top { background: var(--junior-500); }
.st-tranche--senior:hover { border-color: var(--senior-700); }
.st-tranche--junior:hover { border-color: var(--junior-700); }
.st-tranche[data-selected="true"] { background: var(--surface-raised); }
.st-tranche--senior[data-selected="true"] { border-color: var(--senior-600); box-shadow: var(--glow-senior); }
.st-tranche--junior[data-selected="true"] { border-color: var(--junior-600); box-shadow: var(--glow-junior); }

.st-tranche__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
.st-tranche__name { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--text-primary); letter-spacing: -0.01em; }
.st-tranche__role { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px; }
.st-tranche__apr { display: flex; align-items: baseline; gap: 8px; }
.st-tranche__apr .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500; font-size: 40px; line-height: 1; }
.st-tranche--senior .st-tranche__apr .v { color: var(--senior-200); }
.st-tranche--junior .st-tranche__apr .v { color: var(--junior-200); }
.st-tranche__apr .lbl { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--text-tertiary); }
.st-tranche__rows { display: flex; flex-direction: column; gap: 1px; background: var(--hairline);
  border-radius: var(--radius-sm); overflow: hidden; }
.st-tranche__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: 10px 12px; background: var(--bg-sunken); }
.st-tranche__row .k { font-family: var(--font-sans); font-size: 13px; color: var(--text-secondary); }
.st-tranche__row .val { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-size: 13px; color: var(--text-primary); }
.st-tranche__cap { height: 5px; border-radius: var(--radius-full); background: var(--ink-700); overflow: hidden; }
.st-tranche__cap > i { display: block; height: 100%; border-radius: inherit; transition: width var(--dur-slow) var(--ease-out); }
.st-tranche--senior .st-tranche__cap > i { background: var(--senior-500); }
.st-tranche--junior .st-tranche__cap > i { background: var(--junior-500); }
.st-tranche__foot { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); line-height: 1.45; }
`;
      function useCSS(id, css) {
        React.useEffect(() => {
          if (document.getElementById(id)) return;
          const e = document.createElement('style');
          e.id = id;
          e.textContent = css;
          document.head.appendChild(e);
        }, [id, css]);
      }
      function TrancheCard({
        tranche = 'senior',
        apr,
        aprLabel,
        name,
        role,
        rows = [],
        capacityPct,
        capacityLabel,
        footnote,
        selected = false,
        onSelect,
        className = '',
        children,
        ...rest
      }) {
        useCSS('st-tranche-css', CSS);
        const defaults = tranche === 'senior' ? {
          name: 'Bedrock',
          role: 'Senior layer — fixed coupon, protected first',
          aprLabel: 'fixed this epoch'
        } : {
          name: 'Sediment',
          role: 'Junior layer — levered yield, absorbs loss first',
          aprLabel: 'trailing 30d'
        };
        return /*#__PURE__*/React.createElement("button", _extends({
          type: "button",
          className: `st-tranche st-tranche--${tranche} ${className}`,
          "data-selected": selected ? 'true' : 'false',
          onClick: onSelect
        }, rest), /*#__PURE__*/React.createElement("span", {
          className: "st-tranche__top"
        }), /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__head"
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__name"
        }, name ?? defaults.name), /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__role"
        }, role ?? defaults.role))), /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__apr"
        }, /*#__PURE__*/React.createElement("span", {
          className: "v"
        }, apr), /*#__PURE__*/React.createElement("span", {
          className: "lbl"
        }, aprLabel ?? defaults.aprLabel)), capacityPct != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__row",
          style: {
            background: 'transparent',
            padding: '0 0 7px'
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "k"
        }, capacityLabel ?? 'Capacity filled'), /*#__PURE__*/React.createElement("span", {
          className: "val"
        }, capacityPct, "%")), /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__cap"
        }, /*#__PURE__*/React.createElement("i", {
          style: {
            width: `${capacityPct}%`
          }
        }))), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__rows"
        }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__row",
          key: i
        }, /*#__PURE__*/React.createElement("span", {
          className: "k"
        }, r.label), /*#__PURE__*/React.createElement("span", {
          className: "val",
          style: r.tone === 'senior' ? {
            color: 'var(--senior-200)'
          } : r.tone === 'junior' ? {
            color: 'var(--junior-200)'
          } : null
        }, r.value)))), footnote && /*#__PURE__*/React.createElement("div", {
          className: "st-tranche__foot"
        }, footnote), children);
      }
      Object.assign(__ds_scope, {
        TrancheCard
      });
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "components/protocol/TrancheCard.jsx",
      error: String(e && e.message || e)
    });
  }

  // ds-runtime.js
  try {
    (() => {
      /* @ds-bundle: {"format":3,"namespace":"StrataDesignSystem_8a0ec2","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Gauge","sourcePath":"components/data/Gauge.jsx"},{"name":"MoneyChart","sourcePath":"components/data/MoneyChart.jsx"},{"name":"NumberTicker","sourcePath":"components/data/NumberTicker.jsx"},{"name":"StrataCore","sourcePath":"components/data/StrataCore.jsx"},{"name":"EpochCountdown","sourcePath":"components/protocol/EpochCountdown.jsx"},{"name":"EventFeed","sourcePath":"components/protocol/EventFeed.jsx"},{"name":"TrancheCard","sourcePath":"components/protocol/TrancheCard.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"8348429a190f","components/core/Button.jsx":"22da9921ef63","components/core/Panel.jsx":"2e3e66d2437d","components/core/Stat.jsx":"276856a513cd","components/data/Gauge.jsx":"624d0e214ef9","components/data/MoneyChart.jsx":"0ad579ed22f7","components/data/NumberTicker.jsx":"dd8d0cdb0f4b","components/data/StrataCore.jsx":"b460188c91e6","components/protocol/EpochCountdown.jsx":"cf7a7d7d57a3","components/protocol/EventFeed.jsx":"332755cfeeae","components/protocol/TrancheCard.jsx":"4f754c61ff6c","ui_kits/strata-app/AppShell.jsx":"c67444e93af7","ui_kits/strata-app/Deposit.jsx":"f802a748161c","ui_kits/strata-app/Landing.jsx":"51f7aaa5ff90","ui_kits/strata-app/Observatory.jsx":"b6de42be5411","ui_kits/strata-app/Simulator.jsx":"3bdc2f5690f7","ui_kits/strata-app/data.js":"f5123913ea45"},"inlinedExternals":[],"unexposedExports":[]} */

      (() => {
        const __ds_ns = window.StrataDesignSystem_8a0ec2 = window.StrataDesignSystem_8a0ec2 || {};
        const __ds_scope = {};
        __ds_ns.__errors = __ds_ns.__errors || [];

        // components/core/Badge.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function Badge({
              variant = 'neutral',
              size = 'md',
              dot = false,
              live = false,
              className = '',
              children,
              ...rest
            }) {
              useCSS('st-badge-css', CSS);
              const cls = ['st-badge', `st-badge--${variant}`, `st-badge--${size}`, className].filter(Boolean).join(' ');
              return /*#__PURE__*/React.createElement("span", _extends({
                className: cls
              }, rest), (dot || live) && /*#__PURE__*/React.createElement("span", {
                className: `st-badge__dot${live ? ' st-badge__dot--live' : ''}`
              }), children);
            }
            Object.assign(__ds_scope, {
              Badge
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/core/Badge.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/core/Button.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
                el.id = id;
                el.textContent = css;
                document.head.appendChild(el);
              }, [id, css]);
            }
            function Button({
              variant = 'secondary',
              size = 'md',
              icon,
              iconRight,
              fullWidth = false,
              disabled = false,
              as = 'button',
              className = '',
              children,
              ...rest
            }) {
              useCSS('st-btn-css', CSS);
              const Tag = as;
              const cls = ['st-btn', `st-btn--${variant}`, `st-btn--${size}`, fullWidth ? 'st-btn--full' : '', className].filter(Boolean).join(' ');
              return /*#__PURE__*/React.createElement(Tag, _extends({
                className: cls,
                disabled: Tag === 'button' ? disabled : undefined
              }, rest), icon && /*#__PURE__*/React.createElement("span", {
                className: "st-btn__ic"
              }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
                className: "st-btn__ic"
              }, iconRight));
            }
            Object.assign(__ds_scope, {
              Button
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/core/Button.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/core/Panel.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function Panel({
              eyebrow,
              title,
              actions,
              accent,
              variant = 'default',
              padded = true,
              className = '',
              headless,
              children,
              ...rest
            }) {
              useCSS('st-panel-css', CSS);
              const hasHead = !headless && (eyebrow || title || actions);
              const cls = ['st-panel', variant === 'sunken' ? 'st-panel--sunken' : '', accent ? `st-panel--accent-${accent}` : '', !hasHead && padded ? 'st-panel--pad' : '', className].filter(Boolean).join(' ');
              return /*#__PURE__*/React.createElement("section", _extends({
                className: cls
              }, rest), hasHead && /*#__PURE__*/React.createElement("header", {
                className: "st-panel__head"
              }, /*#__PURE__*/React.createElement("div", {
                className: "st-panel__titles"
              }, eyebrow && /*#__PURE__*/React.createElement("span", {
                className: "st-panel__eyebrow"
              }, eyebrow), title && /*#__PURE__*/React.createElement("span", {
                className: "st-panel__title"
              }, title)), actions && /*#__PURE__*/React.createElement("div", {
                className: "st-panel__actions"
              }, actions)), hasHead ? /*#__PURE__*/React.createElement("div", {
                className: padded ? 'st-panel__body' : ''
              }, children) : children);
            }
            Object.assign(__ds_scope, {
              Panel
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/core/Panel.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/core/Stat.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function Stat({
              label,
              value,
              unit,
              delta,
              deltaDir = 'flat',
              tone = 'default',
              size = 'md',
              className = '',
              children,
              ...rest
            }) {
              useCSS('st-stat-css', CSS);
              const cls = ['st-stat', `st-stat--${size}`, tone !== 'default' ? `st-stat--${tone}` : '', className].filter(Boolean).join(' ');
              const arrow = deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—';
              return /*#__PURE__*/React.createElement("div", _extends({
                className: cls
              }, rest), label && /*#__PURE__*/React.createElement("span", {
                className: "st-stat__label"
              }, label), /*#__PURE__*/React.createElement("span", {
                className: "st-stat__value"
              }, value, unit && /*#__PURE__*/React.createElement("span", {
                className: "st-stat__unit"
              }, unit)), delta != null && /*#__PURE__*/React.createElement("span", {
                className: `st-stat__delta st-stat__delta--${deltaDir}`
              }, arrow, " ", delta), children);
            }
            Object.assign(__ds_scope, {
              Stat
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/core/Stat.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/data/Gauge.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function Gauge({
              value = 0,
              max = 1,
              min = 0,
              size = 180,
              label,
              unit,
              valueText,
              sweepDeg = 250,
              tone = 'senior',
              thresholds,
              className = '',
              ...rest
            }) {
              useCSS('st-gauge-css', CSS);
              const r = size / 2 - 14;
              const cx = size / 2,
                cy = size / 2;
              const startAngle = 90 + (360 - sweepDeg) / 2; // centered at bottom gap
              const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
              const circumference = 2 * Math.PI * r;
              const arcLen = sweepDeg / 360 * circumference;
              const dashArray = `${arcLen} ${circumference}`;
              const offset = arcLen * (1 - frac);
              const accent = tone === 'junior' ? 'var(--junior-300)' : tone === 'loss' ? 'var(--loss-400)' : 'var(--senior-300)';
              const numSize = size * 0.2;

              // rotate so the arc starts at the bottom-left and sweeps clockwise
              const rot = startAngle;
              const ticks = (thresholds || []).map(t => {
                const tf = (t.at - min) / (max - min);
                const a = (rot + tf * sweepDeg) * (Math.PI / 180);
                return {
                  x1: cx + (r - 7) * Math.cos(a),
                  y1: cy + (r - 7) * Math.sin(a),
                  x2: cx + (r + 4) * Math.cos(a),
                  y2: cy + (r + 4) * Math.sin(a),
                  color: t.color || 'var(--ink-550)'
                };
              });
              return /*#__PURE__*/React.createElement("div", _extends({
                className: `st-gauge ${className}`,
                style: {
                  width: size
                }
              }, rest), /*#__PURE__*/React.createElement("svg", {
                width: size,
                height: size,
                viewBox: `0 0 ${size} ${size}`,
                style: {
                  transform: `rotate(${rot - 90}deg)`
                }
              }, /*#__PURE__*/React.createElement("circle", {
                cx: cx,
                cy: cy,
                r: r,
                fill: "none",
                stroke: "var(--ink-700)",
                strokeWidth: "9",
                strokeDasharray: dashArray,
                strokeLinecap: "round"
              }), /*#__PURE__*/React.createElement("circle", {
                className: "st-gauge__arc",
                cx: cx,
                cy: cy,
                r: r,
                fill: "none",
                stroke: accent,
                strokeWidth: "9",
                strokeDasharray: dashArray,
                strokeDashoffset: offset,
                strokeLinecap: "round",
                style: {
                  filter: `drop-shadow(0 0 6px ${accent})`
                }
              }), ticks.map((t, i) => /*#__PURE__*/React.createElement("line", {
                key: i,
                x1: t.x1,
                y1: t.y1,
                x2: t.x2,
                y2: t.y2,
                stroke: t.color,
                strokeWidth: "1.5"
              }))), /*#__PURE__*/React.createElement("div", {
                className: "st-gauge__val"
              }, /*#__PURE__*/React.createElement("div", {
                className: "st-gauge__num",
                style: {
                  fontSize: numSize
                }
              }, valueText ?? value), unit && /*#__PURE__*/React.createElement("div", {
                className: "st-gauge__unit"
              }, unit)));
            }
            Object.assign(__ds_scope, {
              Gauge
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/data/Gauge.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/data/MoneyChart.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            const ROLES = [{
              key: 'hodl',
              color: 'var(--line-hodl)',
              label: 'HODL',
              dash: '5 4',
              w: 1.5
            }, {
              key: 'lp',
              color: 'var(--line-lp)',
              label: 'Vanilla LP',
              dash: '0',
              w: 2
            }, {
              key: 'junior',
              color: 'var(--line-junior)',
              label: 'Junior',
              dash: '0',
              w: 2
            }, {
              key: 'senior',
              color: 'var(--line-senior)',
              label: 'Senior',
              dash: '0',
              w: 2.5
            }];
            function MoneyChart({
              series,
              price,
              progress = 1,
              height = 320,
              showLegend = true,
              showPrice = true,
              className = '',
              ...rest
            }) {
              useCSS('st-chart-css', CSS);
              const W = 1000,
                H = 1000 * (height / (rest.aspect || 600)) || 600;
              const VH = 600;
              const keys = ROLES.filter(r => series && series[r.key]);
              const n = keys.length ? series[keys[0].key].length : 0;

              // y-domain across all series
              let lo = Infinity,
                hi = -Infinity;
              keys.forEach(r => series[r.key].forEach(v => {
                lo = Math.min(lo, v);
                hi = Math.max(hi, v);
              }));
              if (!isFinite(lo)) {
                lo = 0;
                hi = 1;
              }
              const padY = (hi - lo) * 0.12 || 1;
              lo -= padY;
              hi += padY;
              const px = i => i / (n - 1) * W;
              const py = v => VH - (v - lo) / (hi - lo) * VH;
              const pathFor = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

              // price backdrop area
              let priceArea = null;
              if (showPrice && price && price.length) {
                let plo = Math.min(...price),
                  phi = Math.max(...price);
                const pad = (phi - plo) * 0.15 || 1;
                plo -= pad;
                phi += pad;
                const ppy = v => VH - (v - plo) / (phi - plo) * VH;
                const top = price.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${ppy(v).toFixed(1)}`).join(' ');
                priceArea = `${top} L${W} ${VH} L0 ${VH} Z`;
              }
              const cut = Math.max(0, Math.min(1, progress));
              const headX = px((n - 1) * cut);
              const idx = Math.round((n - 1) * cut);
              const clipId = React.useId ? React.useId().replace(/:/g, '') : 'c' + Math.random().toString(36).slice(2);
              return /*#__PURE__*/React.createElement("div", _extends({
                className: `st-chart ${className}`
              }, rest), /*#__PURE__*/React.createElement("svg", {
                viewBox: `0 0 ${W} ${VH}`,
                style: {
                  height
                },
                preserveAspectRatio: "none"
              }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
                id: clipId
              }, /*#__PURE__*/React.createElement("rect", {
                x: "0",
                y: "0",
                width: headX,
                height: VH
              }))), [0.25, 0.5, 0.75].map((g, i) => /*#__PURE__*/React.createElement("line", {
                key: i,
                className: "st-chart__grid",
                x1: "0",
                x2: W,
                y1: VH * g,
                y2: VH * g
              })), priceArea && /*#__PURE__*/React.createElement("path", {
                className: "st-chart__price",
                d: priceArea
              }), keys.map(r => /*#__PURE__*/React.createElement("path", {
                key: 'f' + r.key,
                className: "st-chart__line st-chart__future",
                d: pathFor(series[r.key]),
                stroke: r.color,
                strokeWidth: r.w,
                strokeDasharray: r.dash
              })), /*#__PURE__*/React.createElement("g", {
                clipPath: `url(#${clipId})`
              }, keys.map(r => /*#__PURE__*/React.createElement("path", {
                key: r.key,
                className: "st-chart__line",
                d: pathFor(series[r.key]),
                stroke: r.color,
                strokeWidth: r.w,
                strokeDasharray: r.dash,
                strokeLinejoin: "round",
                strokeLinecap: "round"
              }))), cut < 0.999 && /*#__PURE__*/React.createElement("line", {
                className: "st-chart__head",
                x1: headX,
                x2: headX,
                y1: "0",
                y2: VH
              }), keys.map(r => /*#__PURE__*/React.createElement("circle", {
                key: 'd' + r.key,
                className: "st-chart__dot",
                cx: headX,
                cy: py(series[r.key][idx]),
                r: "3.5",
                fill: r.color,
                vectorEffect: "non-scaling-stroke"
              }))), showLegend && /*#__PURE__*/React.createElement("div", {
                className: "st-chart__legend"
              }, keys.slice().reverse().map(r => /*#__PURE__*/React.createElement("span", {
                key: r.key,
                className: "st-chart__leg"
              }, /*#__PURE__*/React.createElement("i", {
                style: {
                  borderTopColor: r.color,
                  borderTopStyle: r.dash !== '0' ? 'dashed' : 'solid'
                }
              }), r.label, " ", /*#__PURE__*/React.createElement("b", {
                style: {
                  color: r.color
                }
              }, series[r.key][idx].toFixed(1))))));
            }
            Object.assign(__ds_scope, {
              MoneyChart
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/data/MoneyChart.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/data/NumberTicker.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
            function format(n, {
              decimals = 0,
              prefix = '',
              suffix = '',
              commas = true
            }) {
              const fixed = Number(n).toFixed(decimals);
              if (!commas) return prefix + fixed + suffix;
              const [int, frac] = fixed.split('.');
              const withC = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              return prefix + withC + (frac ? '.' + frac : '') + suffix;
            }

            /**
             * Animates from its previous value to the new one on change.
             * Numbers tick — they never fade.
             */
            function NumberTicker({
              value = 0,
              decimals = 0,
              prefix = '',
              suffix = '',
              commas = true,
              duration,
              className = '',
              style,
              ...rest
            }) {
              const [display, setDisplay] = React.useState(value);
              const fromRef = React.useRef(value);
              const rafRef = React.useRef(0);
              const startRef = React.useRef(0);
              const dur = duration ?? (() => {
                const v = getComputedStyle(document.documentElement).getPropertyValue('--dur-tick');
                const ms = parseFloat(v);
                return Number.isFinite(ms) ? ms : 520;
              });
              React.useEffect(() => {
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const D = typeof dur === 'function' ? dur() : dur;
                const from = fromRef.current;
                const to = value;
                if (reduce || D <= 1 || from === to) {
                  setDisplay(to);
                  fromRef.current = to;
                  return;
                }
                cancelAnimationFrame(rafRef.current);
                startRef.current = performance.now();
                const tick = now => {
                  const t = Math.min(1, (now - startRef.current) / D);
                  const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
                  setDisplay(from + (to - from) * eased);
                  if (t < 1) rafRef.current = requestAnimationFrame(tick);else fromRef.current = to;
                };
                rafRef.current = requestAnimationFrame(tick);
                return () => cancelAnimationFrame(rafRef.current);
              }, [value]); // eslint-disable-line

              return /*#__PURE__*/React.createElement("span", _extends({
                className: `st-ticker ${className}`,
                style: {
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums lining-nums',
                  fontFeatureSettings: 'var(--data-feature-settings)',
                  ...style
                }
              }, rest), format(display, {
                decimals,
                prefix,
                suffix,
                commas
              }));
            }
            Object.assign(__ds_scope, {
              NumberTicker
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/data/NumberTicker.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/data/StrataCore.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function fmtUsd(n) {
              if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
              if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
              return '$' + Math.round(n);
            }
            function StrataCore({
              seniorNav = 1_620_000,
              juniorNav = 780_000,
              scaleMax,
              height = 360,
              sweepKey = 0,
              glyph = false,
              showScale = true,
              className = '',
              style,
              ...rest
            }) {
              useCSS('st-core-css', CSS);
              const ref = scaleMax || (seniorNav + juniorNav) * 1.18; // headroom above for overburden
              const pad = glyph ? 0 : 14;
              const usable = height - pad * 2;
              const sH = Math.max(0, seniorNav / ref * usable);
              const jH = Math.max(0, juniorNav / ref * usable);
              const voidH = Math.max(0, usable - sH - jH);
              const sweepOn = sweepKey > 0;
              if (glyph) {
                const g = height;
                const gs = seniorNav / ref * g,
                  gj = juniorNav / ref * g,
                  gv = g - gs - gj;
                return /*#__PURE__*/React.createElement("span", _extends({
                  className: `st-core ${className}`,
                  style: {
                    width: height * 0.92,
                    height: g,
                    borderRadius: 5,
                    display: 'inline-block',
                    ...style
                  }
                }, rest), /*#__PURE__*/React.createElement("span", {
                  className: "st-core__stack"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "st-core__void",
                  style: {
                    height: gv
                  }
                }), /*#__PURE__*/React.createElement("span", {
                  className: "st-core__layer st-core__layer--junior",
                  style: {
                    bottom: gs,
                    height: gj
                  }
                }, /*#__PURE__*/React.createElement("span", {
                  className: "st-core__edge st-core__edge--junior"
                })), /*#__PURE__*/React.createElement("span", {
                  className: "st-core__layer st-core__layer--senior",
                  style: {
                    bottom: 0,
                    height: gs
                  }
                }, /*#__PURE__*/React.createElement("span", {
                  className: "st-core__edge st-core__edge--senior"
                })), sweepOn && /*#__PURE__*/React.createElement("span", {
                  key: sweepKey,
                  className: "st-core__sweep st-core__sweep--on"
                })));
              }
              const scaleTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
                t,
                y: pad + usable * t,
                val: fmtUsd(ref * (1 - t))
              }));
              return /*#__PURE__*/React.createElement("div", _extends({
                className: `st-core ${className}`,
                style: {
                  height,
                  ...style
                }
              }, rest), /*#__PURE__*/React.createElement("div", {
                className: "st-core__stack",
                style: {
                  left: pad,
                  right: showScale ? 46 : pad,
                  top: pad,
                  bottom: pad
                }
              }, /*#__PURE__*/React.createElement("div", {
                className: "st-core__void",
                style: {
                  height: voidH
                }
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-core__voidline",
                style: {
                  top: '34%'
                }
              }), /*#__PURE__*/React.createElement("span", {
                className: "st-core__voidline",
                style: {
                  top: '68%'
                }
              })), /*#__PURE__*/React.createElement("div", {
                className: "st-core__layer st-core__layer--junior",
                style: {
                  bottom: sH,
                  height: jH
                }
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-core__edge st-core__edge--junior"
              })), /*#__PURE__*/React.createElement("div", {
                className: "st-core__layer st-core__layer--senior",
                style: {
                  bottom: 0,
                  height: sH
                }
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-core__edge st-core__edge--senior"
              })), /*#__PURE__*/React.createElement("div", {
                className: "st-core__tag",
                style: {
                  bottom: sH + jH / 2 - 14
                }
              }, /*#__PURE__*/React.createElement("span", {
                className: "nm",
                style: {
                  color: 'var(--junior-200)'
                }
              }, "Junior"), /*#__PURE__*/React.createElement("span", {
                className: "nv",
                style: {
                  color: 'var(--junior-100)'
                }
              }, fmtUsd(juniorNav)), /*#__PURE__*/React.createElement("span", {
                className: "sub",
                style: {
                  color: 'var(--junior-300)'
                }
              }, "absorbs first")), /*#__PURE__*/React.createElement("div", {
                className: "st-core__tag",
                style: {
                  bottom: sH / 2 - 14
                }
              }, /*#__PURE__*/React.createElement("span", {
                className: "nm",
                style: {
                  color: 'var(--senior-200)'
                }
              }, "Senior"), /*#__PURE__*/React.createElement("span", {
                className: "nv",
                style: {
                  color: 'var(--senior-100)'
                }
              }, fmtUsd(seniorNav)), /*#__PURE__*/React.createElement("span", {
                className: "sub",
                style: {
                  color: 'var(--senior-300)'
                }
              }, "holds the line")), sweepOn && /*#__PURE__*/React.createElement("div", {
                key: sweepKey,
                className: "st-core__sweep st-core__sweep--on"
              })), showScale && /*#__PURE__*/React.createElement("div", {
                className: "st-core__scale"
              }, scaleTicks.map((s, i) => /*#__PURE__*/React.createElement("span", {
                key: i,
                className: "st-core__tick",
                style: {
                  top: s.y
                }
              }, s.val))));
            }
            Object.assign(__ds_scope, {
              StrataCore
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/data/StrataCore.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/protocol/EpochCountdown.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function hms(total) {
              const t = Math.max(0, Math.floor(total));
              const h = Math.floor(t / 3600),
                m = Math.floor(t % 3600 / 60),
                s = t % 60;
              const p = x => String(x).padStart(2, '0');
              return {
                h: p(h),
                m: p(m),
                s: p(s)
              };
            }
            function EpochCountdown({
              epoch = 47,
              secondsLeft = 11529,
              epochLength = 28800,
              running = true,
              onSettle,
              className = '',
              ...rest
            }) {
              useCSS('st-epoch-css', CSS);
              const [left, setLeft] = React.useState(secondsLeft);
              React.useEffect(() => setLeft(secondsLeft), [secondsLeft]);
              React.useEffect(() => {
                if (!running) return;
                const id = setInterval(() => {
                  setLeft(prev => {
                    if (prev <= 1) {
                      onSettle && onSettle();
                      return epochLength;
                    }
                    return prev - 1;
                  });
                }, 1000);
                return () => clearInterval(id);
              }, [running, epochLength]); // eslint-disable-line

              const {
                h,
                m,
                s
              } = hms(left);
              const elapsed = Math.max(0, Math.min(1, 1 - left / epochLength));
              return /*#__PURE__*/React.createElement("div", _extends({
                className: `st-epoch ${className}`
              }, rest), /*#__PURE__*/React.createElement("div", {
                className: "st-epoch__head"
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-epoch__label"
              }, "Next settlement"), /*#__PURE__*/React.createElement("span", {
                className: "st-epoch__no"
              }, "epoch ", epoch, " \u2192 ", epoch + 1)), /*#__PURE__*/React.createElement("div", {
                className: "st-epoch__time"
              }, h, /*#__PURE__*/React.createElement("span", {
                className: "u"
              }, ":"), m, /*#__PURE__*/React.createElement("span", {
                className: "u"
              }, ":"), s), /*#__PURE__*/React.createElement("div", {
                className: "st-epoch__bar"
              }, /*#__PURE__*/React.createElement("i", {
                style: {
                  width: `${elapsed * 100}%`
                }
              })), /*#__PURE__*/React.createElement("div", {
                className: "st-epoch__ticks"
              }, /*#__PURE__*/React.createElement("span", null, "epoch opened"), /*#__PURE__*/React.createElement("span", null, (epochLength / 3600).toFixed(0), "h epoch"), /*#__PURE__*/React.createElement("span", null, "waterfall")));
            }
            Object.assign(__ds_scope, {
              EpochCountdown
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/protocol/EpochCountdown.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/protocol/EventFeed.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
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
@media (prefers-reduced-motion: reduce) { .st-feed__dot { animation: none; } }
`;
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            const MARK = {
              settle: 'settle',
              reactive: 'reactive',
              emergency: 'emergency',
              info: 'info'
            };
            function EventFeed({
              events = [],
              title = 'Reactive Network · automation feed',
              maxHeight,
              explorerBase = '#',
              className = '',
              ...rest
            }) {
              useCSS('st-feed-css', CSS);
              return /*#__PURE__*/React.createElement("div", _extends({
                className: `st-feed ${className}`,
                style: maxHeight ? {
                  ['--st-feed-h']: maxHeight + 'px'
                } : null
              }, rest), /*#__PURE__*/React.createElement("div", {
                className: "st-feed__bar"
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-feed__title"
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-feed__dot"
              }), title), /*#__PURE__*/React.createElement("span", {
                className: "st-feed__meta"
              }, "no keepers \xB7 no bots")), /*#__PURE__*/React.createElement("div", {
                className: "st-feed__list"
              }, events.map((e, i) => /*#__PURE__*/React.createElement("div", {
                className: "st-feed__row",
                key: i
              }, /*#__PURE__*/React.createElement("span", {
                className: "st-feed__ts"
              }, e.time), /*#__PURE__*/React.createElement("span", {
                className: `st-feed__mark st-feed__mark--${MARK[e.kind] || 'info'}`
              }), /*#__PURE__*/React.createElement("div", {
                className: "st-feed__body"
              }, /*#__PURE__*/React.createElement("div", {
                className: "st-feed__msg",
                dangerouslySetInnerHTML: {
                  __html: e.message
                }
              }), (e.tx || e.chain || e.epoch != null) && /*#__PURE__*/React.createElement("div", {
                className: "st-feed__sub"
              }, e.chain && /*#__PURE__*/React.createElement("span", {
                className: "st-feed__chain"
              }, e.chain), e.epoch != null && /*#__PURE__*/React.createElement("span", {
                className: "st-feed__chain"
              }, "epoch ", e.epoch), e.tx && /*#__PURE__*/React.createElement("a", {
                className: "st-feed__tx",
                href: explorerBase,
                onClick: ev => ev.preventDefault()
              }, e.tx, " \u2197")))))));
            }
            Object.assign(__ds_scope, {
              EventFeed
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/protocol/EventFeed.jsx",
            error: String(e && e.message || e)
          });
        }

        // components/protocol/TrancheCard.jsx
        try {
          (() => {
            function _extends() {
              return _extends = Object.assign ? Object.assign.bind() : function (n) {
                for (var e = 1; e < arguments.length; e++) {
                  var t = arguments[e];
                  for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
                }
                return n;
              }, _extends.apply(null, arguments);
            }
            const CSS = `
.st-tranche {
  position: relative; display: flex; flex-direction: column; gap: var(--space-5);
  padding: var(--space-6); border-radius: var(--radius-lg); cursor: pointer;
  background: var(--surface-card); border: 1px solid var(--border);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out),
              transform var(--dur-instant) var(--ease-press);
  text-align: left; min-width: 0;
}
.st-tranche:active { transform: scale(0.995); }
.st-tranche__top { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0.8; }
.st-tranche--senior .st-tranche__top { background: var(--senior-500); }
.st-tranche--junior .st-tranche__top { background: var(--junior-500); }
.st-tranche--senior:hover { border-color: var(--senior-700); }
.st-tranche--junior:hover { border-color: var(--junior-700); }
.st-tranche[data-selected="true"] { background: var(--surface-raised); }
.st-tranche--senior[data-selected="true"] { border-color: var(--senior-600); box-shadow: var(--glow-senior); }
.st-tranche--junior[data-selected="true"] { border-color: var(--junior-600); box-shadow: var(--glow-junior); }

.st-tranche__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
.st-tranche__name { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--text-primary); letter-spacing: -0.01em; }
.st-tranche__role { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px; }
.st-tranche__apr { display: flex; align-items: baseline; gap: 8px; }
.st-tranche__apr .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500; font-size: 40px; line-height: 1; }
.st-tranche--senior .st-tranche__apr .v { color: var(--senior-200); }
.st-tranche--junior .st-tranche__apr .v { color: var(--junior-200); }
.st-tranche__apr .lbl { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--text-tertiary); }
.st-tranche__rows { display: flex; flex-direction: column; gap: 1px; background: var(--hairline);
  border-radius: var(--radius-sm); overflow: hidden; }
.st-tranche__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: 10px 12px; background: var(--bg-sunken); }
.st-tranche__row .k { font-family: var(--font-sans); font-size: 13px; color: var(--text-secondary); }
.st-tranche__row .val { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums;
  font-size: 13px; color: var(--text-primary); }
.st-tranche__cap { height: 5px; border-radius: var(--radius-full); background: var(--ink-700); overflow: hidden; }
.st-tranche__cap > i { display: block; height: 100%; border-radius: inherit; transition: width var(--dur-slow) var(--ease-out); }
.st-tranche--senior .st-tranche__cap > i { background: var(--senior-500); }
.st-tranche--junior .st-tranche__cap > i { background: var(--junior-500); }
.st-tranche__foot { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-tertiary); line-height: 1.45; }
`;
            function useCSS(id, css) {
              React.useEffect(() => {
                if (document.getElementById(id)) return;
                const e = document.createElement('style');
                e.id = id;
                e.textContent = css;
                document.head.appendChild(e);
              }, [id, css]);
            }
            function TrancheCard({
              tranche = 'senior',
              apr,
              aprLabel,
              name,
              role,
              rows = [],
              capacityPct,
              capacityLabel,
              footnote,
              selected = false,
              onSelect,
              className = '',
              children,
              ...rest
            }) {
              useCSS('st-tranche-css', CSS);
              const defaults = tranche === 'senior' ? {
                name: 'Senior',
                role: 'The bedrock — fixed coupon, protected first',
                aprLabel: 'fixed this epoch'
              } : {
                name: 'Junior',
                role: 'The topsoil — levered yield, absorbs loss first',
                aprLabel: 'trailing 30d'
              };
              return /*#__PURE__*/React.createElement("button", _extends({
                type: "button",
                className: `st-tranche st-tranche--${tranche} ${className}`,
                "data-selected": selected ? 'true' : 'false',
                onClick: onSelect
              }, rest), /*#__PURE__*/React.createElement("span", {
                className: "st-tranche__top"
              }), /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__head"
              }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__name"
              }, name ?? defaults.name), /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__role"
              }, role ?? defaults.role))), /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__apr"
              }, /*#__PURE__*/React.createElement("span", {
                className: "v"
              }, apr), /*#__PURE__*/React.createElement("span", {
                className: "lbl"
              }, aprLabel ?? defaults.aprLabel)), capacityPct != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__row",
                style: {
                  background: 'transparent',
                  padding: '0 0 7px'
                }
              }, /*#__PURE__*/React.createElement("span", {
                className: "k"
              }, capacityLabel ?? 'Capacity filled'), /*#__PURE__*/React.createElement("span", {
                className: "val"
              }, capacityPct, "%")), /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__cap"
              }, /*#__PURE__*/React.createElement("i", {
                style: {
                  width: `${capacityPct}%`
                }
              }))), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__rows"
              }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__row",
                key: i
              }, /*#__PURE__*/React.createElement("span", {
                className: "k"
              }, r.label), /*#__PURE__*/React.createElement("span", {
                className: "val",
                style: r.tone === 'senior' ? {
                  color: 'var(--senior-200)'
                } : r.tone === 'junior' ? {
                  color: 'var(--junior-200)'
                } : null
              }, r.value)))), footnote && /*#__PURE__*/React.createElement("div", {
                className: "st-tranche__foot"
              }, footnote), children);
            }
            Object.assign(__ds_scope, {
              TrancheCard
            });
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "components/protocol/TrancheCard.jsx",
            error: String(e && e.message || e)
          });
        }

        // ui_kits/strata-app/AppShell.jsx
        try {
          (() => {
            /* global React */
            (function () {
              const {
                StrataCore,
                Badge
              } = window.StrataDesignSystem_8a0ec2;
              const SD = window.StrataData;
              const NAV = [{
                id: 'landing',
                label: 'Thesis',
                icon: 'layers'
              }, {
                id: 'deposit',
                label: 'Deposit',
                icon: 'arrow-down-to-line'
              }, {
                id: 'observatory',
                label: 'Observatory',
                icon: 'radio-tower'
              }, {
                id: 'simulator',
                label: 'Simulator',
                icon: 'sliders-horizontal'
              }];
              const shellCSS = `
.sx { display: grid; grid-template-columns: var(--rail-width) 1fr; min-height: 100%; background: var(--bg-app); }
.sx__rail { border-right: 1px solid var(--hairline); background: var(--ink-950);
  display: flex; flex-direction: column; padding: 20px 14px; position: sticky; top: 0; height: 100vh; }
.sx__brand { display: flex; align-items: center; gap: 11px; padding: 4px 8px 22px; }
.sx__brand .wm { font-family: var(--font-display); font-weight: 500; font-size: 22px; letter-spacing: -0.02em; color: var(--text-primary); }
.sx__brand .live-glyph { display: inline-flex; }
.sx__nav { display: flex; flex-direction: column; gap: 2px; }
.sx__item { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: var(--radius-md);
  font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--text-secondary);
  background: transparent; border: none; cursor: pointer; width: 100%; text-align: left;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.sx__item:hover { background: var(--surface-card); color: var(--text-primary); }
.sx__item[data-active="true"] { background: var(--surface-raised); color: var(--text-primary); box-shadow: inset 2px 0 0 0 var(--senior-500); }
.sx__item svg { width: 17px; height: 17px; flex: none; opacity: 0.85; }
.sx__sectlabel { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-tertiary); padding: 0 11px; margin: 18px 0 8px; }
.sx__spacer { flex: 1; }
.sx__live { border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; background: var(--ink-900); }
.sx__live .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.sx__live .ttl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.sx__live .glyphrow { display: flex; align-items: center; gap: 10px; }
.sx__live .meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
.sx__live .meta b { color: var(--senior-200); font-weight: 500; }

.sx__main { min-width: 0; display: flex; flex-direction: column; }
.sx__topbar { height: var(--topbar-height); border-bottom: 1px solid var(--hairline);
  display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-8);
  position: sticky; top: 0; z-index: 5; background: color-mix(in oklab, var(--bg-app) 86%, transparent); backdrop-filter: blur(10px); }
.sx__crumb { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.04em; }
.sx__crumb b { color: var(--text-primary); font-weight: 500; }
.sx__poolsum { display: flex; align-items: center; gap: 22px; }
.sx__poolsum .pm { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); display: flex; flex-direction: column; gap: 1px; }
.sx__poolsum .pm b { font-size: 13px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.sx__content { padding: var(--space-9) var(--space-8); max-width: var(--maxw-wide); width: 100%; margin: 0 auto; }
@media (max-width: 880px) {
  .sx { grid-template-columns: 1fr; }
  .sx__rail { display: none; }
}
`;
              function Icon({
                name
              }) {
                const ref = React.useRef(null);
                React.useEffect(() => {
                  if (window.lucide) window.lucide.createIcons({
                    nameAttr: 'data-lucide',
                    icons: window.lucide.icons
                  });
                });
                return React.createElement('i', {
                  'data-lucide': name,
                  ref
                });
              }
              function useShellCSS() {
                React.useEffect(() => {
                  if (document.getElementById('sx-css')) return;
                  const e = document.createElement('style');
                  e.id = 'sx-css';
                  e.textContent = shellCSS;
                  document.head.appendChild(e);
                }, []);
              }
              function AppShell({
                screen,
                onNav,
                seniorNav = SD.SENIOR0,
                juniorNav = SD.JUNIOR0,
                sweepKey = 0,
                children
              }) {
                useShellCSS();
                React.useEffect(() => {
                  if (window.lucide) window.lucide.createIcons();
                });
                const cur = NAV.find(n => n.id === screen) || NAV[0];
                return /*#__PURE__*/React.createElement("div", {
                  className: "sx"
                }, /*#__PURE__*/React.createElement("aside", {
                  className: "sx__rail"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "sx__brand"
                }, /*#__PURE__*/React.createElement("img", {
                  src: "../../assets/strata-mark.svg",
                  width: "30",
                  height: "30",
                  alt: "Strata"
                }), /*#__PURE__*/React.createElement("span", {
                  className: "wm"
                }, "Strata")), /*#__PURE__*/React.createElement("div", {
                  className: "sx__sectlabel"
                }, "Protocol"), /*#__PURE__*/React.createElement("nav", {
                  className: "sx__nav"
                }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
                  key: n.id,
                  className: "sx__item",
                  "data-active": screen === n.id,
                  onClick: () => onNav(n.id)
                }, /*#__PURE__*/React.createElement(Icon, {
                  name: n.icon
                }), n.label))), /*#__PURE__*/React.createElement("div", {
                  className: "sx__spacer"
                }), /*#__PURE__*/React.createElement("div", {
                  className: "sx__live"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "top"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "ttl"
                }, "Live core"), /*#__PURE__*/React.createElement(Badge, {
                  variant: "live",
                  live: true,
                  size: "sm"
                }, "Reactive")), /*#__PURE__*/React.createElement("div", {
                  className: "glyphrow"
                }, /*#__PURE__*/React.createElement(StrataCore, {
                  glyph: true,
                  height: 46,
                  seniorNav: seniorNav,
                  juniorNav: juniorNav,
                  scaleMax: SD.SCALE_MAX,
                  sweepKey: sweepKey
                }), /*#__PURE__*/React.createElement("div", {
                  className: "meta"
                }, "epoch ", /*#__PURE__*/React.createElement("b", null, "47"), /*#__PURE__*/React.createElement("br", null), "\u03C3\xB2 ", /*#__PURE__*/React.createElement("b", null, "0.41"), "%/day")))), /*#__PURE__*/React.createElement("main", {
                  className: "sx__main"
                }, /*#__PURE__*/React.createElement("header", {
                  className: "sx__topbar"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "sx__crumb"
                }, "strata ", /*#__PURE__*/React.createElement("span", {
                  style: {
                    opacity: 0.4
                  }
                }, "/"), " ", /*#__PURE__*/React.createElement("b", null, cur.label)), /*#__PURE__*/React.createElement("div", {
                  className: "sx__poolsum"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "pm"
                }, "ETH / USDC", /*#__PURE__*/React.createElement("b", null, SD.fmtUsd(SD.TVL), " TVL")), /*#__PURE__*/React.createElement("div", {
                  className: "pm"
                }, "Senior", /*#__PURE__*/React.createElement("b", {
                  style: {
                    color: 'var(--senior-200)'
                  }
                }, SD.pool.seniorApr, "% APR")), /*#__PURE__*/React.createElement("div", {
                  className: "pm"
                }, "Junior", /*#__PURE__*/React.createElement("b", {
                  style: {
                    color: 'var(--junior-200)'
                  }
                }, SD.pool.juniorApr, "% APR")))), /*#__PURE__*/React.createElement("div", {
                  className: "sx__content"
                }, children)));
              }
              window.AppShell = AppShell;
              window.StrataIcon = Icon;
            })();
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "ui_kits/strata-app/AppShell.jsx",
            error: String(e && e.message || e)
          });
        }

        // ui_kits/strata-app/Deposit.jsx
        try {
          (() => {
            /* global React */
            (function () {
              const {
                Button,
                Badge,
                Panel,
                Stat,
                TrancheCard,
                NumberTicker
              } = window.StrataDesignSystem_8a0ec2;
              const DP = window.StrataData;
              const depositCSS = `
.dp__head { margin-bottom: var(--space-8); }
.dp__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.dp__sub { font-family: var(--font-sans); font-size: 16px; color: var(--text-secondary); margin-top: 8px; max-width: 60ch; line-height: 1.5; }
.dp__grid { display: grid; grid-template-columns: 1fr 0.92fr; gap: var(--space-8); align-items: start; }
.dp__cards { display: flex; flex-direction: column; gap: var(--space-5); }
.dp__ticket { position: sticky; top: 84px; }
.dp__field { display: flex; flex-direction: column; gap: 8px; }
.dp__fieldlabel { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.dp__input { display: flex; align-items: center; gap: 10px; background: var(--bg-sunken); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 14px 14px; transition: border-color var(--dur-fast) var(--ease-out); }
.dp__input:focus-within { border-color: var(--senior-600); }
.dp__input input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: var(--text-primary);
  font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 26px; font-weight: 500; letter-spacing: 0.01em; }
.dp__input .tok { display: flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary);
  background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 5px 11px; }
.dp__input .tok .d { width: 8px; height: 8px; border-radius: 50%; background: var(--senior-400); }
.dp__chips { display: flex; gap: 7px; }
.dp__chip { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); background: var(--surface-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 9px; cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out); }
.dp__chip:hover { border-color: var(--border-strong); color: var(--text-primary); }
.dp__summary { display: flex; flex-direction: column; gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow: hidden; }
.dp__line { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-sunken); }
.dp__line .k { font-family: var(--font-sans); font-size: 13.5px; color: var(--text-secondary); }
.dp__line .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); }
.dp__line--em .v { font-size: 18px; }
.dp__cover { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: var(--senior-950);
  border: 1px solid var(--senior-800); border-radius: var(--radius-md); }
.dp__cover svg { width: 16px; height: 16px; color: var(--senior-300); flex: none; margin-top: 1px; }
.dp__cover p { font-family: var(--font-sans); font-size: 12.5px; color: var(--senior-100); line-height: 1.5; }
.dp__cover.j { background: var(--junior-950); border-color: var(--junior-800); }
.dp__cover.j svg { color: var(--junior-300); }
.dp__cover.j p { color: var(--junior-100); }
.dp__foot { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align: center; line-height: 1.6; }
@media (max-width: 1000px){ .dp__grid{ grid-template-columns: 1fr; } .dp__ticket{ position: static; } }
`;
              function Deposit() {
                React.useEffect(() => {
                  if (document.getElementById('dp-css')) return;
                  const e = document.createElement('style');
                  e.id = 'dp-css';
                  e.textContent = depositCSS;
                  document.head.appendChild(e);
                  if (window.lucide) window.lucide.createIcons();
                }, []);
                React.useEffect(() => {
                  if (window.lucide) window.lucide.createIcons();
                });
                const [tranche, setTranche] = React.useState('senior');
                const [amount, setAmount] = React.useState(25000);
                const isSenior = tranche === 'senior';
                const sharePrice = isSenior ? 1.0234 : 1.1871;
                const shares = amount / sharePrice;
                const accent = isSenior ? 'senior' : 'junior';
                return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "dp__head"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "dp__title"
                }, "Choose your layer"), /*#__PURE__*/React.createElement("p", {
                  className: "dp__sub"
                }, "The same instrument, two temperaments. Senior is bedrock \u2014 fixed coupon, protected first. Junior is topsoil \u2014 levered yield in exchange for absorbing loss first.")), /*#__PURE__*/React.createElement("div", {
                  className: "dp__grid"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "dp__cards"
                }, /*#__PURE__*/React.createElement(TrancheCard, {
                  tranche: "senior",
                  apr: "7.2%",
                  selected: isSenior,
                  onSelect: () => setTranche('senior'),
                  capacityPct: 81,
                  capacityLabel: "Senior capacity filled",
                  rows: [{
                    label: 'Coverage ratio',
                    value: '$1.84M junior below you',
                    tone: 'senior'
                  }, {
                    label: 'Capacity remaining',
                    value: '$310K'
                  }, {
                    label: 'Coupon priced from',
                    value: 'σ² = 0.41%/day'
                  }],
                  footnote: "Protected from impermanent loss until the junior layer is exhausted. Coupon repriced every epoch."
                }), /*#__PURE__*/React.createElement(TrancheCard, {
                  tranche: "junior",
                  apr: "23.4%",
                  aprLabel: "trailing 30d APR",
                  selected: !isSenior,
                  onSelect: () => setTranche('junior'),
                  capacityPct: 62,
                  capacityLabel: "Junior capacity filled",
                  rows: [{
                    label: 'Risk premium earned',
                    value: '+4.1% this epoch',
                    tone: 'junior'
                  }, {
                    label: 'Excess fees',
                    value: 'all retained'
                  }, {
                    label: 'Leverage on pool',
                    value: '≈ 3.1×'
                  }],
                  footnote: "You absorb losses first. In exchange you keep all excess fees and the volatility risk premium."
                })), /*#__PURE__*/React.createElement("div", {
                  className: "dp__ticket"
                }, /*#__PURE__*/React.createElement(Panel, {
                  accent: accent,
                  eyebrow: isSenior ? 'Deposit to senior' : 'Deposit to junior',
                  title: isSenior ? 'Fixed coupon · 7.2% this epoch' : 'Levered yield · 23.4% trailing'
                }, /*#__PURE__*/React.createElement("div", {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-6)'
                  }
                }, /*#__PURE__*/React.createElement("div", {
                  className: "dp__field"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "dp__fieldlabel"
                }, "Amount in"), /*#__PURE__*/React.createElement("div", {
                  className: "dp__input"
                }, /*#__PURE__*/React.createElement("input", {
                  type: "text",
                  inputMode: "decimal",
                  value: amount.toLocaleString('en-US'),
                  onChange: e => {
                    const v = Number(e.target.value.replace(/[^0-9.]/g, ''));
                    setAmount(Number.isFinite(v) ? v : 0);
                  }
                }), /*#__PURE__*/React.createElement("span", {
                  className: "tok"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "d",
                  style: {
                    background: 'var(--paper-300)'
                  }
                }), "USDC")), /*#__PURE__*/React.createElement("div", {
                  className: "dp__chips"
                }, [10000, 25000, 50000, 100000].map(v => /*#__PURE__*/React.createElement("button", {
                  key: v,
                  className: "dp__chip",
                  onClick: () => setAmount(v)
                }, DP.fmtUsd(v, 0))))), /*#__PURE__*/React.createElement("div", {
                  className: "dp__summary"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "dp__line dp__line--em"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "k"
                }, "Shares out"), /*#__PURE__*/React.createElement("span", {
                  className: "v",
                  style: {
                    color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)'
                  }
                }, /*#__PURE__*/React.createElement(NumberTicker, {
                  value: shares,
                  decimals: 2
                }), " ", isSenior ? 'srETH' : 'jrETH')), /*#__PURE__*/React.createElement("div", {
                  className: "dp__line"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "k"
                }, "Share price"), /*#__PURE__*/React.createElement("span", {
                  className: "v"
                }, sharePrice.toFixed(4), " USDC")), /*#__PURE__*/React.createElement("div", {
                  className: "dp__line"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "k"
                }, isSenior ? 'Projected coupon (8h epoch)' : 'Projected premium (8h epoch)'), /*#__PURE__*/React.createElement("span", {
                  className: "v",
                  style: {
                    color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)'
                  }
                }, "+", DP.fmtUsd(amount * (isSenior ? 0.072 : 0.234) / (365 * 3), 0))), /*#__PURE__*/React.createElement("div", {
                  className: "dp__line"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "k"
                }, "Settles"), /*#__PURE__*/React.createElement("span", {
                  className: "v"
                }, "epoch 48"))), /*#__PURE__*/React.createElement("div", {
                  className: `dp__cover ${isSenior ? '' : 'j'}`
                }, /*#__PURE__*/React.createElement("i", {
                  "data-lucide": isSenior ? 'shield-check' : 'flame'
                }), /*#__PURE__*/React.createElement("p", null, isSenior ? 'Your principal is covered by $1.84M of junior capital before any impairment can reach you.' : 'You are underwriting volatility. You absorb the first dollar of impermanent loss — and keep every excess fee.')), /*#__PURE__*/React.createElement(Button, {
                  variant: accent,
                  size: "lg",
                  fullWidth: true
                }, isSenior ? 'Deposit to senior' : 'Deposit to junior'), /*#__PURE__*/React.createElement("div", {
                  className: "dp__foot"
                }, "Withdrawals are requested, then settle at the next epoch boundary.", /*#__PURE__*/React.createElement("br", null), "Request withdrawal \u2014 settles at epoch 48."))))));
              }
              window.Deposit = Deposit;
            })();
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "ui_kits/strata-app/Deposit.jsx",
            error: String(e && e.message || e)
          });
        }

        // ui_kits/strata-app/Landing.jsx
        try {
          (() => {
            /* global React */
            (function () {
              const {
                Button,
                Badge,
                Panel,
                Stat,
                StrataCore,
                MoneyChart,
                NumberTicker
              } = window.StrataDesignSystem_8a0ec2;
              const LD = window.StrataData;
              const landingCSS = `
.lg__hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: var(--space-10); align-items: center; margin-bottom: var(--space-11); }
.lg__eyebrow { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-6); }
.lg__thesis { font-family: var(--font-display); font-weight: 500; font-size: clamp(34px, 4vw, 58px);
  line-height: 1.04; letter-spacing: -0.022em; color: var(--text-primary); text-wrap: balance; }
.lg__thesis em { font-style: italic; color: var(--senior-200); }
.lg__sub { font-family: var(--font-sans); font-size: 17px; line-height: 1.55; color: var(--text-secondary);
  max-width: 52ch; margin: var(--space-6) 0 var(--space-8); }
.lg__cta { display: flex; align-items: center; gap: var(--space-4); }
.lg__cta .note { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); }
.lg__corewrap { position: relative; }
.lg__corecap { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.lg__corecap .c { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.lg__metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--hairline);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-11); }
.lg__metric { background: var(--surface-card); padding: var(--space-6); }
.lg__charthead { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); }
.lg__chartttl { font-family: var(--font-display); font-size: 28px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary); }
.lg__chartsub { font-family: var(--font-sans); font-size: 14px; color: var(--text-tertiary); margin-top: 6px; max-width: 46ch; line-height: 1.5; }
@media (max-width: 1000px){ .lg__hero{ grid-template-columns: 1fr; } .lg__metrics{ grid-template-columns: repeat(2,1fr);} }
`;
              function Landing({
                core,
                onSettle,
                onNav
              }) {
                React.useEffect(() => {
                  if (document.getElementById('lg-css')) return;
                  const e = document.createElement('style');
                  e.id = 'lg-css';
                  e.textContent = landingCSS;
                  document.head.appendChild(e);
                }, []);
                const crash = LD.scenarios.crash;
                return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
                  className: "lg__hero"
                }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "lg__eyebrow"
                }, /*#__PURE__*/React.createElement(Badge, {
                  variant: "senior",
                  size: "sm"
                }, "Uniswap v4 hook"), /*#__PURE__*/React.createElement(Badge, {
                  variant: "live",
                  live: true,
                  size: "sm"
                }, "Reactive settlement")), /*#__PURE__*/React.createElement("h1", {
                  className: "lg__thesis"
                }, "LPs are forced sellers of volatility with no buyer.", /*#__PURE__*/React.createElement("br", null), "Strata built the ", /*#__PURE__*/React.createElement("em", null, "buyer"), "."), /*#__PURE__*/React.createElement("p", {
                  className: "lg__sub"
                }, "A liquidity pool, split into two layers like geological strata. Senior earns a fixed coupon priced from the pool's own measured volatility. Junior underwrites the risk and keeps the premium."), /*#__PURE__*/React.createElement("div", {
                  className: "lg__cta"
                }, /*#__PURE__*/React.createElement(Button, {
                  variant: "primary",
                  size: "lg",
                  onClick: () => onNav('deposit')
                }, "Open Strata"), /*#__PURE__*/React.createElement("span", {
                  className: "note"
                }, "no oracle \xB7 no keepers \xB7 settles every 8h"))), /*#__PURE__*/React.createElement("div", {
                  className: "lg__corewrap"
                }, /*#__PURE__*/React.createElement(StrataCore, {
                  seniorNav: core.seniorNav,
                  juniorNav: core.juniorNav,
                  scaleMax: LD.SCALE_MAX,
                  height: 392,
                  sweepKey: core.sweepKey
                }), /*#__PURE__*/React.createElement("div", {
                  className: "lg__corecap"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "c"
                }, "epoch 47 \xB7 waterfall runs senior-first"), /*#__PURE__*/React.createElement(Button, {
                  size: "sm",
                  variant: "senior",
                  onClick: onSettle
                }, "Run a settlement \u2192")))), /*#__PURE__*/React.createElement("section", {
                  className: "lg__metrics"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "lg__metric"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Total value locked",
                  size: "md",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: LD.TVL,
                    prefix: "$"
                  })
                })), /*#__PURE__*/React.createElement("div", {
                  className: "lg__metric"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Senior coupon",
                  tone: "senior",
                  size: "md",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: 7.2,
                    decimals: 1,
                    suffix: "%"
                  }),
                  unit: "fixed APR"
                })), /*#__PURE__*/React.createElement("div", {
                  className: "lg__metric"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Junior trailing",
                  tone: "junior",
                  size: "md",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: 23.4,
                    decimals: 1,
                    suffix: "%"
                  }),
                  unit: "levered APR"
                })), /*#__PURE__*/React.createElement("div", {
                  className: "lg__metric"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Realized vol",
                  size: "md",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: 0.41,
                    decimals: 2,
                    suffix: "%"
                  }),
                  unit: "\u03C3\xB2 / day",
                  delta: "EWMA rising",
                  deltaDir: "up"
                }))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
                  className: "lg__charthead"
                }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "lg__chartttl"
                }, "Senior holds its line through a 40% swing"), /*#__PURE__*/React.createElement("div", {
                  className: "lg__chartsub"
                }, "ETH falls $3,400 \u2192 $2,040 and recovers to $2,720 over 72 hours. Vanilla LP bleeds to impermanent loss; senior tracks a calm coupon; junior absorbs the hit, then keeps the fees on the way back.")), /*#__PURE__*/React.createElement(Button, {
                  variant: "secondary",
                  onClick: () => onNav('simulator')
                }, "Open the simulator")), /*#__PURE__*/React.createElement(Panel, {
                  padded: true
                }, /*#__PURE__*/React.createElement(MoneyChart, {
                  price: crash.price,
                  series: crash.series,
                  progress: 1,
                  height: 340
                }))));
              }
              window.Landing = Landing;
            })();
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "ui_kits/strata-app/Landing.jsx",
            error: String(e && e.message || e)
          });
        }

        // ui_kits/strata-app/Observatory.jsx
        try {
          (() => {
            /* global React */
            (function () {
              const {
                Panel,
                Stat,
                Badge,
                Button,
                StrataCore,
                Gauge,
                EpochCountdown,
                EventFeed,
                NumberTicker
              } = window.StrataDesignSystem_8a0ec2;
              const OB = window.StrataData;
              const obsCSS = `
.ob__head { display:flex; align-items:flex-end; justify-content:space-between; gap: var(--space-6); margin-bottom: var(--space-7); }
.ob__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.ob__sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); margin-top: 7px; letter-spacing: 0.02em; }
.ob__grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: var(--space-6); align-items: start; }
.ob__corehead { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-5); }
.ob__navrow { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; margin-top: var(--space-5); }
.ob__navcell { background: var(--bg-sunken); padding: 13px 15px; }
.ob__side { display:flex; flex-direction: column; gap: var(--space-6); }
.ob__gaugewrap { display:flex; align-items:center; gap: var(--space-6); }
.ob__gaugemeta { display:flex; flex-direction: column; gap: var(--space-4); }
.ob__feedwrap { margin-top: var(--space-7); }
@media (max-width: 1000px){ .ob__grid{ grid-template-columns: 1fr; } }
`;
              function Observatory({
                core,
                onSettle
              }) {
                React.useEffect(() => {
                  if (document.getElementById('ob-css')) return;
                  const e = document.createElement('style');
                  e.id = 'ob-css';
                  e.textContent = obsCSS;
                  document.head.appendChild(e);
                }, []);
                const coverage = core.juniorNav;
                return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "ob__head"
                }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "ob__title"
                }, "Observatory"), /*#__PURE__*/React.createElement("div", {
                  className: "ob__sub"
                }, "live \xB7 ETH/USDC \xB7 pool 0x88b\u20263a2 \xB7 measured from on-chain ticks, no external oracle")), /*#__PURE__*/React.createElement(Badge, {
                  variant: "live",
                  live: true
                }, "Reactive Network connected")), /*#__PURE__*/React.createElement("div", {
                  className: "ob__grid"
                }, /*#__PURE__*/React.createElement(Panel, {
                  padded: true
                }, /*#__PURE__*/React.createElement("div", {
                  className: "ob__corehead"
                }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)'
                  }
                }, "Strata Core \xB7 capital structure")), /*#__PURE__*/React.createElement(Button, {
                  size: "sm",
                  variant: "senior",
                  onClick: onSettle
                }, "Force settlement")), /*#__PURE__*/React.createElement(StrataCore, {
                  seniorNav: core.seniorNav,
                  juniorNav: core.juniorNav,
                  scaleMax: OB.SCALE_MAX,
                  height: 360,
                  sweepKey: core.sweepKey
                }), /*#__PURE__*/React.createElement("div", {
                  className: "ob__navrow"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "ob__navcell"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Senior NAV",
                  tone: "senior",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: core.seniorNav,
                    prefix: "$"
                  })
                })), /*#__PURE__*/React.createElement("div", {
                  className: "ob__navcell"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Junior NAV",
                  tone: "junior",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: core.juniorNav,
                    prefix: "$"
                  })
                })), /*#__PURE__*/React.createElement("div", {
                  className: "ob__navcell"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Coverage ratio",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: coverage / 1e6,
                    decimals: 2,
                    prefix: "$",
                    suffix: "M"
                  }),
                  unit: "junior buffer"
                })))), /*#__PURE__*/React.createElement("div", {
                  className: "ob__side"
                }, /*#__PURE__*/React.createElement(Panel, {
                  eyebrow: "Realized volatility",
                  title: "\u03C3\xB2 from pool ticks"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "ob__gaugewrap"
                }, /*#__PURE__*/React.createElement(Gauge, {
                  value: OB.pool.vol,
                  min: 0,
                  max: 1,
                  size: 168,
                  valueText: "0.41",
                  unit: "\u03C3\xB2 %/day",
                  tone: "senior",
                  thresholds: [{
                    at: 0.6,
                    color: 'var(--junior-400)'
                  }, {
                    at: 0.85,
                    color: 'var(--loss-400)'
                  }]
                }), /*#__PURE__*/React.createElement("div", {
                  className: "ob__gaugemeta"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "EWMA",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: OB.pool.volEwma,
                    decimals: 2
                  }),
                  delta: "+0.06 rising",
                  deltaDir: "up"
                }), /*#__PURE__*/React.createElement(Stat, {
                  label: "Emergency trigger",
                  size: "sm",
                  value: "0.85",
                  unit: "\u03C3\xB2 %/day"
                }), /*#__PURE__*/React.createElement("div", {
                  style: {
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.5,
                    maxWidth: '24ch'
                  }
                }, "Above trigger, Reactive closes the epoch early.")))), /*#__PURE__*/React.createElement(Panel, {
                  eyebrow: "Epoch clock",
                  title: "Next settlement"
                }, /*#__PURE__*/React.createElement(EpochCountdown, {
                  epoch: OB.pool.epoch,
                  secondsLeft: OB.pool.secondsLeft,
                  epochLength: OB.pool.epochLengthH * 3600,
                  running: true,
                  onSettle: onSettle
                })))), /*#__PURE__*/React.createElement("div", {
                  className: "ob__feedwrap"
                }, /*#__PURE__*/React.createElement(EventFeed, {
                  events: OB.events,
                  maxHeight: 320
                })));
              }
              window.Observatory = Observatory;
            })();
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "ui_kits/strata-app/Observatory.jsx",
            error: String(e && e.message || e)
          });
        }

        // ui_kits/strata-app/Simulator.jsx
        try {
          (() => {
            /* global React */
            (function () {
              const {
                Panel,
                Stat,
                Badge,
                StrataCore,
                MoneyChart,
                NumberTicker
              } = window.StrataDesignSystem_8a0ec2;
              const SM = window.StrataData;
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
/* scrubbing must feel instant — override the cinematic settle transition */
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
              const SCN = [{
                id: 'calm',
                label: 'Calm'
              }, {
                id: 'trend',
                label: 'Trend'
              }, {
                id: 'crash',
                label: 'Crash'
              }];
              function Simulator() {
                React.useEffect(() => {
                  if (document.getElementById('sm-css')) return;
                  const e = document.createElement('style');
                  e.id = 'sm-css';
                  e.textContent = simCSS;
                  document.head.appendChild(e);
                }, []);
                const [scn, setScn] = React.useState('crash');
                const [idx, setIdx] = React.useState(SM.N - 1);
                const data = SM.scenarios[scn];
                const i = Math.min(idx, SM.N - 1);
                const price = data.price[i];
                const sNav = data.seniorNav[i];
                const jNav = data.juniorNav[i];
                const progress = i / (SM.N - 1);
                const hours = Math.round(progress * 72);
                const change = (price / SM.P0 - 1) * 100;
                return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "sm__head"
                }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                  className: "sm__title"
                }, "Simulator"), /*#__PURE__*/React.createElement("p", {
                  className: "sm__sub"
                }, "Pick a scenario and scrub the price path. The capital structure and the money chart respond in sync \u2014 watch junior compress while senior holds its line.")), /*#__PURE__*/React.createElement("div", {
                  className: "sm__pills"
                }, SCN.map(s => /*#__PURE__*/React.createElement("button", {
                  key: s.id,
                  className: "sm__pill",
                  "data-on": scn === s.id,
                  onClick: () => setScn(s.id)
                }, s.label)))), /*#__PURE__*/React.createElement("div", {
                  className: "sm__grid"
                }, /*#__PURE__*/React.createElement(Panel, {
                  padded: true
                }, /*#__PURE__*/React.createElement("div", {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-5)'
                  }
                }, /*#__PURE__*/React.createElement("span", {
                  style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)'
                  }
                }, "Capital structure"), /*#__PURE__*/React.createElement(Badge, {
                  variant: change < -1 ? 'negative' : change > 1 ? 'senior' : 'neutral',
                  dot: true
                }, change >= 0 ? '+' : '', change.toFixed(1), "% ETH")), /*#__PURE__*/React.createElement("div", {
                  className: "sm-fast"
                }, /*#__PURE__*/React.createElement(StrataCore, {
                  seniorNav: sNav,
                  juniorNav: jNav,
                  scaleMax: SM.SCALE_MAX,
                  height: 320
                })), /*#__PURE__*/React.createElement("div", {
                  className: "sm__readouts"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "sm__rd"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Senior NAV",
                  tone: "senior",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: sNav,
                    prefix: "$",
                    duration: 120
                  })
                })), /*#__PURE__*/React.createElement("div", {
                  className: "sm__rd"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Junior NAV",
                  tone: "junior",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: jNav,
                    prefix: "$",
                    duration: 120
                  })
                })), /*#__PURE__*/React.createElement("div", {
                  className: "sm__rd"
                }, /*#__PURE__*/React.createElement(Stat, {
                  label: "Junior drawdown",
                  size: "sm",
                  value: /*#__PURE__*/React.createElement(NumberTicker, {
                    value: (jNav / SM.JUNIOR0 - 1) * 100,
                    decimals: 1,
                    suffix: "%",
                    duration: 120
                  })
                })))), /*#__PURE__*/React.createElement(Panel, {
                  padded: true
                }, /*#__PURE__*/React.createElement("div", {
                  style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-5)'
                  }
                }, "Depositor outcome \xB7 index = 100 at t0"), /*#__PURE__*/React.createElement(MoneyChart, {
                  price: data.price,
                  series: data.series,
                  progress: progress,
                  height: 300
                }))), /*#__PURE__*/React.createElement("div", {
                  className: "sm__scrub"
                }, /*#__PURE__*/React.createElement("div", {
                  className: "sm__scrubhead"
                }, /*#__PURE__*/React.createElement("span", {
                  className: "sm__time"
                }, "t + ", hours, "h of 72h \xB7 ", data.name, " scenario"), /*#__PURE__*/React.createElement("span", {
                  className: "sm__price"
                }, "ETH ", SM.fmtUsd(price, 0).replace('$', '$'))), /*#__PURE__*/React.createElement("input", {
                  className: "sm__range",
                  type: "range",
                  min: "0",
                  max: SM.N - 1,
                  value: idx,
                  onInput: e => setIdx(Number(e.target.value)),
                  onChange: e => setIdx(Number(e.target.value))
                }), /*#__PURE__*/React.createElement("div", {
                  className: "sm__ticks"
                }, /*#__PURE__*/React.createElement("span", null, "t0 \xB7 $3,400"), /*#__PURE__*/React.createElement("span", null, "scrub the 72-hour path"), /*#__PURE__*/React.createElement("span", null, "t72"))));
              }
              window.Simulator = Simulator;
            })();
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "ui_kits/strata-app/Simulator.jsx",
            error: String(e && e.message || e)
          });
        }

        // ui_kits/strata-app/data.js
        try {
          (() => {
            /* Strata — mock protocol data + scenario engine.
               Exposes window.StrataData. No backend; every screen is demoable. */
            (function () {
              const P0 = 3400; // ETH start price
              const TVL = 2_400_000;
              const SENIOR0 = 1_620_000; // 67%
              const JUNIOR0 = 780_000; // 33%
              const SCALE_MAX = 2_600_000;
              const N = 73; // hourly points across 72h

              // 50/50 ETH/USDC mechanics, all values indexed to 100 at t0.
              const hodlIdx = r => 50 * (1 + r); // value of holding initial halves
              const lpIdxNoFee = r => 100 * Math.sqrt(r); // constant-product LP value

              function build(name, priceFn, feeRate) {
                const price = [],
                  hodl = [],
                  lp = [],
                  senior = [],
                  junior = [];
                const seniorNav = [],
                  juniorNav = [];
                let feeAcc = 0,
                  couponAcc = 0;
                let prevP = P0;
                for (let i = 0; i < N; i++) {
                  const t = i / (N - 1);
                  const P = priceFn(t, i);
                  const r = P / P0;
                  // fees accrue with realized movement (junior keeps the excess)
                  feeAcc += Math.abs(P - prevP) / P0 * feeRate;
                  couponAcc += 0.072 * (1 / 8760); // 7.2% APR, hourly
                  prevP = P;
                  const poolNav = TVL * (Math.sqrt(r) + feeAcc * 0.55);
                  const sNav = Math.min(poolNav, SENIOR0 * (1 + couponAcc));
                  const jNav = Math.max(0, poolNav - sNav);
                  price.push(P);
                  hodl.push(hodlIdx(r));
                  lp.push(lpIdxNoFee(r) + feeAcc * 38); // vanilla LP keeps only its share of fees
                  senior.push(sNav / SENIOR0 * 100);
                  junior.push(jNav / JUNIOR0 * 100);
                  seniorNav.push(sNav);
                  juniorNav.push(jNav);
                }
                return {
                  name,
                  price,
                  series: {
                    hodl,
                    lp,
                    senior,
                    junior
                  },
                  seniorNav,
                  juniorNav
                };
              }
              const scenarios = {
                calm: build('Calm', (t, i) => P0 * (1 + 0.025 * Math.sin(i / 4) + 0.012 * Math.sin(i / 1.7)), 1.0),
                trend: build('Trend', (t, i) => P0 * (1 + 0.16 * t + 0.018 * Math.sin(i / 3)), 0.7),
                crash: build('Crash', (t, i) => {
                  // 3400 → 2040 (−40%) over first 40h, recover to 2720 by 72h
                  let mult;
                  if (t < 0.55) mult = 1 - 0.40 * (t / 0.55);else mult = 0.60 + 0.20 * ((t - 0.55) / 0.45);
                  return P0 * mult * (1 + 0.012 * Math.sin(i / 2.2));
                }, 1.9)
              };
              const epochs = (() => {
                // recent settlement ledger
                return [{
                  time: '2d 04:11',
                  kind: 'emergency',
                  epoch: 47,
                  message: 'Vol spike on Reactive Network → <span class="em">emergencySettle()</span> executed, epoch 47 closed early',
                  tx: '0x7a3f…e201',
                  chain: 'Reactive ⇄ Ethereum'
                }, {
                  time: '16:00:02',
                  kind: 'settle',
                  epoch: 46,
                  message: 'Waterfall ran → coupon <span class="fn">accrued to senior</span> (7.0%), junior took residual fees',
                  tx: '0x1c9d…0a4f',
                  chain: 'Ethereum'
                }, {
                  time: '15:59:48',
                  kind: 'reactive',
                  epoch: 46,
                  message: 'Reactive callback armed → watching σ² against 0.85%/day emergency trigger',
                  tx: '0x44b2…9fe3',
                  chain: 'Reactive Network'
                }, {
                  time: '08:00:01',
                  kind: 'settle',
                  epoch: 45,
                  message: 'Waterfall ran → senior coupon paid in full, junior premium +3.8%',
                  tx: '0xa1e7…22c8',
                  chain: 'Ethereum'
                }, {
                  time: '00:00:00',
                  kind: 'settle',
                  epoch: 44,
                  message: 'Epoch opened → coupon repriced from realized vol: σ² = 0.41%/day',
                  tx: '0x9f02…b71d',
                  chain: 'Ethereum'
                }, {
                  time: '-8:00:03',
                  kind: 'info',
                  epoch: 43,
                  message: 'Tick observation window closed → 480 price samples ingested',
                  tx: '0x3 db…7c10',
                  chain: 'Ethereum'
                }];
              })();
              window.StrataData = {
                P0,
                TVL,
                SENIOR0,
                JUNIOR0,
                SCALE_MAX,
                N,
                scenarios,
                events: epochs,
                pool: {
                  pair: 'ETH / USDC',
                  tvl: TVL,
                  senior: SENIOR0,
                  junior: JUNIOR0,
                  splitSenior: 0.675,
                  splitJunior: 0.325,
                  epoch: 47,
                  epochLengthH: 8,
                  secondsLeft: 11529,
                  seniorApr: 7.2,
                  juniorApr: 23.4,
                  vol: 0.41,
                  volEwma: 0.47,
                  coverage: 1_840_000
                },
                fmtUsd(n, dp = 0) {
                  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
                  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(dp) + 'K';
                  return '$' + n.toFixed(dp);
                }
              };
            })();
          })();
        } catch (e) {
          __ds_ns.__errors.push({
            path: "ui_kits/strata-app/data.js",
            error: String(e && e.message || e)
          });
        }
        __ds_ns.Badge = __ds_scope.Badge;
        __ds_ns.Button = __ds_scope.Button;
        __ds_ns.Panel = __ds_scope.Panel;
        __ds_ns.Stat = __ds_scope.Stat;
        __ds_ns.Gauge = __ds_scope.Gauge;
        __ds_ns.MoneyChart = __ds_scope.MoneyChart;
        __ds_ns.NumberTicker = __ds_scope.NumberTicker;
        __ds_ns.StrataCore = __ds_scope.StrataCore;
        __ds_ns.EpochCountdown = __ds_scope.EpochCountdown;
        __ds_ns.EventFeed = __ds_scope.EventFeed;
        __ds_ns.TrancheCard = __ds_scope.TrancheCard;
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ds-runtime.js",
      error: String(e && e.message || e)
    });
  }

  // ui_kits/strata-app/AppShell.jsx
  try {
    (() => {
      /* global React */
      (function () {
        const {
          StrataCore,
          Badge
        } = window.StrataDesignSystem_8a0ec2;
        const SD = window.StrataData;
        const NAV = [{
          id: 'landing',
          label: 'Thesis',
          icon: 'layers'
        }, {
          id: 'deposit',
          label: 'Deposit',
          icon: 'arrow-down-to-line'
        }, {
          id: 'observatory',
          label: 'Observatory',
          icon: 'radio-tower'
        }, {
          id: 'simulator',
          label: 'Simulator',
          icon: 'sliders-horizontal'
        }];
        const shellCSS = `
.sx { display: grid; grid-template-columns: var(--rail-width) 1fr; min-height: 100%; background: var(--bg-app); }
.sx__rail { border-right: 1px solid var(--hairline); background: var(--ink-950);
  display: flex; flex-direction: column; padding: 20px 14px; position: sticky; top: 0; height: 100vh; }
.sx__brand { display: flex; align-items: center; gap: 11px; padding: 4px 8px 22px; }
.sx__brand .wm { font-family: var(--font-display); font-weight: 500; font-size: 22px; letter-spacing: -0.02em; color: var(--text-primary); }
.sx__brand .live-glyph { display: inline-flex; }
.sx__nav { display: flex; flex-direction: column; gap: 2px; }
.sx__item { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: var(--radius-md);
  font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--text-secondary);
  background: transparent; border: none; cursor: pointer; width: 100%; text-align: left;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.sx__item:hover { background: var(--surface-card); color: var(--text-primary); }
.sx__item[data-active="true"] { background: var(--surface-raised); color: var(--text-primary); box-shadow: inset 2px 0 0 0 var(--senior-500); }
.sx__item svg { width: 17px; height: 17px; flex: none; opacity: 0.85; }
.sx__sectlabel { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-tertiary); padding: 0 11px; margin: 18px 0 8px; }
.sx__spacer { flex: 1; }
.sx__live { border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; background: var(--ink-900); }
.sx__live .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.sx__live .ttl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.sx__live .glyphrow { display: flex; align-items: center; gap: 10px; }
.sx__live .meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
.sx__live .meta b { color: var(--senior-200); font-weight: 500; }

.sx__main { min-width: 0; display: flex; flex-direction: column; }
.sx__topbar { height: var(--topbar-height); border-bottom: 1px solid var(--hairline);
  display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-8);
  position: sticky; top: 0; z-index: 5; background: color-mix(in oklab, var(--bg-app) 86%, transparent); backdrop-filter: blur(10px); }
.sx__crumb { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.04em; }
.sx__crumb b { color: var(--text-primary); font-weight: 500; }
.sx__poolsum { display: flex; align-items: center; gap: 22px; }
.sx__poolsum .pm { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); display: flex; flex-direction: column; gap: 1px; }
.sx__poolsum .pm b { font-size: 13px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.sx__content { padding: var(--space-9) var(--space-8); max-width: var(--maxw-wide); width: 100%; margin: 0 auto; }
@media (max-width: 880px) {
  .sx { grid-template-columns: 1fr; }
  .sx__rail { display: none; }
}
`;
        function Icon({
          name
        }) {
          const ref = React.useRef(null);
          React.useEffect(() => {
            if (window.lucide) window.lucide.createIcons({
              nameAttr: 'data-lucide',
              icons: window.lucide.icons
            });
          });
          return React.createElement('i', {
            'data-lucide': name,
            ref
          });
        }
        function useShellCSS() {
          React.useEffect(() => {
            if (document.getElementById('sx-css')) return;
            const e = document.createElement('style');
            e.id = 'sx-css';
            e.textContent = shellCSS;
            document.head.appendChild(e);
          }, []);
        }
        function AppShell({
          screen,
          onNav,
          seniorNav = SD.SENIOR0,
          juniorNav = SD.JUNIOR0,
          sweepKey = 0,
          children
        }) {
          useShellCSS();
          React.useEffect(() => {
            if (window.lucide) window.lucide.createIcons();
          });
          const cur = NAV.find(n => n.id === screen) || NAV[0];
          return /*#__PURE__*/React.createElement("div", {
            className: "sx"
          }, /*#__PURE__*/React.createElement("aside", {
            className: "sx__rail"
          }, /*#__PURE__*/React.createElement("div", {
            className: "sx__brand"
          }, /*#__PURE__*/React.createElement("img", {
            src: "../../assets/strata-mark.svg",
            width: "30",
            height: "30",
            alt: "Unistrata"
          }), /*#__PURE__*/React.createElement("span", {
            className: "wm"
          }, "Unistrata")), /*#__PURE__*/React.createElement("div", {
            className: "sx__sectlabel"
          }, "Protocol"), /*#__PURE__*/React.createElement("nav", {
            className: "sx__nav"
          }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
            key: n.id,
            className: "sx__item",
            "data-active": screen === n.id,
            onClick: () => onNav(n.id)
          }, /*#__PURE__*/React.createElement(Icon, {
            name: n.icon
          }), n.label))), /*#__PURE__*/React.createElement("div", {
            className: "sx__spacer"
          }), /*#__PURE__*/React.createElement("div", {
            className: "sx__live"
          }, /*#__PURE__*/React.createElement("div", {
            className: "top"
          }, /*#__PURE__*/React.createElement("span", {
            className: "ttl"
          }, "Live core"), /*#__PURE__*/React.createElement(Badge, {
            variant: "live",
            live: true,
            size: "sm"
          }, "Reactive")), /*#__PURE__*/React.createElement("div", {
            className: "glyphrow"
          }, /*#__PURE__*/React.createElement(StrataCore, {
            glyph: true,
            height: 46,
            seniorNav: seniorNav,
            juniorNav: juniorNav,
            scaleMax: SD.SCALE_MAX,
            sweepKey: sweepKey
          }), /*#__PURE__*/React.createElement("div", {
            className: "meta"
          }, "epoch ", /*#__PURE__*/React.createElement("b", null, "47"), /*#__PURE__*/React.createElement("br", null), "\u03C3\xB2 ", /*#__PURE__*/React.createElement("b", null, "0.41"), "%/day")))), /*#__PURE__*/React.createElement("main", {
            className: "sx__main"
          }, /*#__PURE__*/React.createElement("header", {
            className: "sx__topbar"
          }, /*#__PURE__*/React.createElement("div", {
            className: "sx__crumb"
          }, "unistrata ", /*#__PURE__*/React.createElement("span", {
            style: {
              opacity: 0.4
            }
          }, "/"), " ", /*#__PURE__*/React.createElement("b", null, cur.label)), /*#__PURE__*/React.createElement("div", {
            className: "sx__poolsum"
          }, /*#__PURE__*/React.createElement("div", {
            className: "pm"
          }, "ETH / USDC", /*#__PURE__*/React.createElement("b", null, SD.fmtUsd(SD.TVL), " TVL")), /*#__PURE__*/React.createElement("div", {
            className: "pm"
          }, "Senior", /*#__PURE__*/React.createElement("b", {
            style: {
              color: 'var(--senior-200)'
            }
          }, SD.pool.seniorApr, "% APR")), /*#__PURE__*/React.createElement("div", {
            className: "pm"
          }, "Junior", /*#__PURE__*/React.createElement("b", {
            style: {
              color: 'var(--junior-200)'
            }
          }, SD.pool.juniorApr, "% APR")))), /*#__PURE__*/React.createElement("div", {
            className: "sx__content"
          }, children)));
        }
        window.AppShell = AppShell;
        window.StrataIcon = Icon;
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/strata-app/AppShell.jsx",
      error: String(e && e.message || e)
    });
  }

  // ui_kits/strata-app/Deposit.jsx
  try {
    (() => {
      /* global React */
      (function () {
        const {
          Button,
          Badge,
          Panel,
          Stat,
          TrancheCard,
          NumberTicker
        } = window.StrataDesignSystem_8a0ec2;
        const DP = window.StrataData;
        const depositCSS = `
.dp__head { margin-bottom: var(--space-8); }
.dp__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.dp__sub { font-family: var(--font-sans); font-size: 16px; color: var(--text-secondary); margin-top: 8px; max-width: 60ch; line-height: 1.5; }
.dp__grid { display: grid; grid-template-columns: 1fr 0.92fr; gap: var(--space-8); align-items: start; }
.dp__cards { display: flex; flex-direction: column; gap: var(--space-5); }
.dp__ticket { position: sticky; top: 84px; }
.dp__field { display: flex; flex-direction: column; gap: 8px; }
.dp__fieldlabel { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.dp__input { display: flex; align-items: center; gap: 10px; background: var(--bg-sunken); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 14px 14px; transition: border-color var(--dur-fast) var(--ease-out); }
.dp__input:focus-within { border-color: var(--senior-600); }
.dp__input input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: var(--text-primary);
  font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 26px; font-weight: 500; letter-spacing: 0.01em; }
.dp__input .tok { display: flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary);
  background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 5px 11px; }
.dp__input .tok .d { width: 8px; height: 8px; border-radius: 50%; background: var(--senior-400); }
.dp__chips { display: flex; gap: 7px; }
.dp__chip { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); background: var(--surface-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 9px; cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out); }
.dp__chip:hover { border-color: var(--border-strong); color: var(--text-primary); }
.dp__summary { display: flex; flex-direction: column; gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow: hidden; }
.dp__line { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-sunken); }
.dp__line .k { font-family: var(--font-sans); font-size: 13.5px; color: var(--text-secondary); }
.dp__line .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); }
.dp__line--em .v { font-size: 18px; }
.dp__cover { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: var(--senior-950);
  border: 1px solid var(--senior-800); border-radius: var(--radius-md); }
.dp__cover svg { width: 16px; height: 16px; color: var(--senior-300); flex: none; margin-top: 1px; }
.dp__cover p { font-family: var(--font-sans); font-size: 12.5px; color: var(--senior-100); line-height: 1.5; }
.dp__cover.j { background: var(--junior-950); border-color: var(--junior-800); }
.dp__cover.j svg { color: var(--junior-300); }
.dp__cover.j p { color: var(--junior-100); }
.dp__foot { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align: center; line-height: 1.6; }
@media (max-width: 1000px){ .dp__grid{ grid-template-columns: 1fr; } .dp__ticket{ position: static; } }
`;
        function Deposit() {
          React.useEffect(() => {
            if (document.getElementById('dp-css')) return;
            const e = document.createElement('style');
            e.id = 'dp-css';
            e.textContent = depositCSS;
            document.head.appendChild(e);
            if (window.lucide) window.lucide.createIcons();
          }, []);
          React.useEffect(() => {
            if (window.lucide) window.lucide.createIcons();
          });
          const [tranche, setTranche] = React.useState('senior');
          const [amount, setAmount] = React.useState(25000);
          const isSenior = tranche === 'senior';
          const sharePrice = isSenior ? 1.0234 : 1.1871;
          const shares = amount / sharePrice;
          const accent = isSenior ? 'senior' : 'junior';
          return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "dp__head"
          }, /*#__PURE__*/React.createElement("div", {
            className: "dp__title"
          }, "Choose your layer"), /*#__PURE__*/React.createElement("p", {
            className: "dp__sub"
          }, "The same instrument, two temperaments. Bedrock is the senior layer \u2014 fixed coupon, protected first. Sediment is the junior layer \u2014 levered yield in exchange for absorbing loss first.")), /*#__PURE__*/React.createElement("div", {
            className: "dp__grid"
          }, /*#__PURE__*/React.createElement("div", {
            className: "dp__cards"
          }, /*#__PURE__*/React.createElement(TrancheCard, {
            tranche: "senior",
            apr: "7.2%",
            selected: isSenior,
            onSelect: () => setTranche('senior'),
            capacityPct: 81,
            capacityLabel: "Bedrock capacity filled",
            rows: [{
              label: 'Coverage ratio',
              value: '$1.84M Sediment below you',
              tone: 'senior'
            }, {
              label: 'Capacity remaining',
              value: '$310K'
            }, {
              label: 'Coupon priced from',
              value: 'σ² = 0.41%/day'
            }],
            footnote: "Protected from impermanent loss until the Sediment layer is exhausted. Coupon repriced every epoch."
          }), /*#__PURE__*/React.createElement(TrancheCard, {
            tranche: "junior",
            apr: "23.4%",
            aprLabel: "trailing 30d APR",
            selected: !isSenior,
            onSelect: () => setTranche('junior'),
            capacityPct: 62,
            capacityLabel: "Sediment capacity filled",
            rows: [{
              label: 'Risk premium earned',
              value: '+4.1% this epoch',
              tone: 'junior'
            }, {
              label: 'Excess fees',
              value: 'all retained'
            }, {
              label: 'Leverage on pool',
              value: '≈ 3.1×'
            }],
            footnote: "You absorb losses first. In exchange you keep all excess fees and the volatility risk premium."
          })), /*#__PURE__*/React.createElement("div", {
            className: "dp__ticket"
          }, /*#__PURE__*/React.createElement(Panel, {
            accent: accent,
            eyebrow: isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment',
            title: isSenior ? 'Fixed coupon · 7.2% this epoch' : 'Levered yield · 23.4% trailing'
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }
          }, /*#__PURE__*/React.createElement("div", {
            className: "dp__field"
          }, /*#__PURE__*/React.createElement("span", {
            className: "dp__fieldlabel"
          }, "Amount in"), /*#__PURE__*/React.createElement("div", {
            className: "dp__input"
          }, /*#__PURE__*/React.createElement("input", {
            type: "text",
            inputMode: "decimal",
            value: amount.toLocaleString('en-US'),
            onChange: e => {
              const v = Number(e.target.value.replace(/[^0-9.]/g, ''));
              setAmount(Number.isFinite(v) ? v : 0);
            }
          }), /*#__PURE__*/React.createElement("span", {
            className: "tok"
          }, /*#__PURE__*/React.createElement("span", {
            className: "d",
            style: {
              background: 'var(--paper-300)'
            }
          }), "USDC")), /*#__PURE__*/React.createElement("div", {
            className: "dp__chips"
          }, [10000, 25000, 50000, 100000].map(v => /*#__PURE__*/React.createElement("button", {
            key: v,
            className: "dp__chip",
            onClick: () => setAmount(v)
          }, DP.fmtUsd(v, 0))))), /*#__PURE__*/React.createElement("div", {
            className: "dp__summary"
          }, /*#__PURE__*/React.createElement("div", {
            className: "dp__line dp__line--em"
          }, /*#__PURE__*/React.createElement("span", {
            className: "k"
          }, "Shares out"), /*#__PURE__*/React.createElement("span", {
            className: "v",
            style: {
              color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)'
            }
          }, /*#__PURE__*/React.createElement(NumberTicker, {
            value: shares,
            decimals: 2
          }), " ", isSenior ? 'BEDR' : 'SEDI')), /*#__PURE__*/React.createElement("div", {
            className: "dp__line"
          }, /*#__PURE__*/React.createElement("span", {
            className: "k"
          }, "Share price"), /*#__PURE__*/React.createElement("span", {
            className: "v"
          }, sharePrice.toFixed(4), " USDC")), /*#__PURE__*/React.createElement("div", {
            className: "dp__line"
          }, /*#__PURE__*/React.createElement("span", {
            className: "k"
          }, isSenior ? 'Projected coupon (8h epoch)' : 'Projected premium (8h epoch)'), /*#__PURE__*/React.createElement("span", {
            className: "v",
            style: {
              color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)'
            }
          }, "+", DP.fmtUsd(amount * (isSenior ? 0.072 : 0.234) / (365 * 3), 0))), /*#__PURE__*/React.createElement("div", {
            className: "dp__line"
          }, /*#__PURE__*/React.createElement("span", {
            className: "k"
          }, "Settles"), /*#__PURE__*/React.createElement("span", {
            className: "v"
          }, "epoch 48"))), /*#__PURE__*/React.createElement("div", {
            className: `dp__cover ${isSenior ? '' : 'j'}`
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": isSenior ? 'shield-check' : 'flame'
          }), /*#__PURE__*/React.createElement("p", null, isSenior ? 'Your principal is covered by $1.84M of Sediment capital before any impairment can reach you.' : 'You are underwriting volatility. You absorb the first dollar of impermanent loss — and keep every excess fee.')), /*#__PURE__*/React.createElement(Button, {
            variant: accent,
            size: "lg",
            fullWidth: true
          }, isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment'), /*#__PURE__*/React.createElement("div", {
            className: "dp__foot"
          }, "Withdrawals are requested, then settle at the next epoch boundary.", /*#__PURE__*/React.createElement("br", null), "Request withdrawal \u2014 settles at epoch 48."))))));
        }
        window.Deposit = Deposit;
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/strata-app/Deposit.jsx",
      error: String(e && e.message || e)
    });
  }

  // ui_kits/strata-app/Landing.jsx
  try {
    (() => {
      /* global React */
      (function () {
        const {
          Button,
          Badge,
          Panel,
          Stat,
          StrataCore,
          MoneyChart,
          NumberTicker
        } = window.StrataDesignSystem_8a0ec2;
        const LD = window.StrataData;
        const landingCSS = `
.lg__hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: var(--space-10); align-items: center; margin-bottom: var(--space-11); }
.lg__eyebrow { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-6); }
.lg__thesis { font-family: var(--font-display); font-weight: 500; font-size: clamp(34px, 4vw, 58px);
  line-height: 1.04; letter-spacing: -0.022em; color: var(--text-primary); text-wrap: balance; }
.lg__thesis em { font-style: italic; color: var(--senior-200); }
.lg__sub { font-family: var(--font-sans); font-size: 17px; line-height: 1.55; color: var(--text-secondary);
  max-width: 52ch; margin: var(--space-6) 0 var(--space-8); }
.lg__cta { display: flex; align-items: center; gap: var(--space-4); }
.lg__cta .note { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); }
.lg__corewrap { position: relative; }
.lg__corecap { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.lg__corecap .c { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.lg__metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--hairline);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-11); }
.lg__metric { background: var(--surface-card); padding: var(--space-6); }
.lg__charthead { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); }
.lg__chartttl { font-family: var(--font-display); font-size: 28px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary); }
.lg__chartsub { font-family: var(--font-sans); font-size: 14px; color: var(--text-tertiary); margin-top: 6px; max-width: 46ch; line-height: 1.5; }
@media (max-width: 1000px){ .lg__hero{ grid-template-columns: 1fr; } .lg__metrics{ grid-template-columns: repeat(2,1fr);} }
`;
        function Landing({
          core,
          onSettle,
          onNav
        }) {
          React.useEffect(() => {
            if (document.getElementById('lg-css')) return;
            const e = document.createElement('style');
            e.id = 'lg-css';
            e.textContent = landingCSS;
            document.head.appendChild(e);
          }, []);
          const crash = LD.scenarios.crash;
          return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
            className: "lg__hero"
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "lg__eyebrow"
          }, /*#__PURE__*/React.createElement(Badge, {
            variant: "senior",
            size: "sm"
          }, "Uniswap v4 hook"), /*#__PURE__*/React.createElement(Badge, {
            variant: "live",
            live: true,
            size: "sm"
          }, "Reactive settlement")), /*#__PURE__*/React.createElement("h1", {
            className: "lg__thesis"
          }, "LPs are forced sellers of volatility with no buyer.", /*#__PURE__*/React.createElement("br", null), "Unistrata built the ", /*#__PURE__*/React.createElement("em", null, "buyer"), "."), /*#__PURE__*/React.createElement("p", {
            className: "lg__sub"
          }, "A liquidity pool, split into two layers like geological strata. Bedrock earns a fixed coupon priced from the pool's own measured volatility. Sediment underwrites the risk and keeps the premium."), /*#__PURE__*/React.createElement("div", {
            className: "lg__cta"
          }, /*#__PURE__*/React.createElement(Button, {
            variant: "primary",
            size: "lg",
            onClick: () => onNav('deposit')
          }, "Open Unistrata"), /*#__PURE__*/React.createElement("span", {
            className: "note"
          }, "no oracle \xB7 no keepers \xB7 settles every 8h"))), /*#__PURE__*/React.createElement("div", {
            className: "lg__corewrap"
          }, /*#__PURE__*/React.createElement(StrataCore, {
            seniorNav: core.seniorNav,
            juniorNav: core.juniorNav,
            scaleMax: LD.SCALE_MAX,
            height: 392,
            sweepKey: core.sweepKey
          }), /*#__PURE__*/React.createElement("div", {
            className: "lg__corecap"
          }, /*#__PURE__*/React.createElement("span", {
            className: "c"
          }, "epoch 47 \xB7 waterfall runs Bedrock-first"), /*#__PURE__*/React.createElement(Button, {
            size: "sm",
            variant: "senior",
            onClick: onSettle
          }, "Run a settlement \u2192")))), /*#__PURE__*/React.createElement("section", {
            className: "lg__metrics"
          }, /*#__PURE__*/React.createElement("div", {
            className: "lg__metric"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Total value locked",
            size: "md",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: LD.TVL,
              prefix: "$"
            })
          })), /*#__PURE__*/React.createElement("div", {
            className: "lg__metric"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Bedrock coupon",
            tone: "senior",
            size: "md",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: 7.2,
              decimals: 1,
              suffix: "%"
            }),
            unit: "fixed APR"
          })), /*#__PURE__*/React.createElement("div", {
            className: "lg__metric"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Sediment trailing",
            tone: "junior",
            size: "md",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: 23.4,
              decimals: 1,
              suffix: "%"
            }),
            unit: "levered APR"
          })), /*#__PURE__*/React.createElement("div", {
            className: "lg__metric"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Realized vol",
            size: "md",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: 0.41,
              decimals: 2,
              suffix: "%"
            }),
            unit: "\u03C3\xB2 / day",
            delta: "EWMA rising",
            deltaDir: "up"
          }))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
            className: "lg__charthead"
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "lg__chartttl"
          }, "Bedrock holds its line through a 40% swing"), /*#__PURE__*/React.createElement("div", {
            className: "lg__chartsub"
          }, "ETH falls $3,400 \u2192 $2,040 and recovers to $2,720 over 72 hours. Vanilla LP bleeds to impermanent loss; Bedrock tracks a calm coupon; Sediment absorbs the hit, then keeps the fees on the way back.")), /*#__PURE__*/React.createElement(Button, {
            variant: "secondary",
            onClick: () => onNav('simulator')
          }, "Open the simulator")), /*#__PURE__*/React.createElement(Panel, {
            padded: true
          }, /*#__PURE__*/React.createElement(MoneyChart, {
            price: crash.price,
            series: crash.series,
            progress: 1,
            height: 340
          }))));
        }
        window.Landing = Landing;
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/strata-app/Landing.jsx",
      error: String(e && e.message || e)
    });
  }

  // ui_kits/strata-app/Observatory.jsx
  try {
    (() => {
      /* global React */
      (function () {
        const {
          Panel,
          Stat,
          Badge,
          Button,
          StrataCore,
          Gauge,
          EpochCountdown,
          EventFeed,
          NumberTicker
        } = window.StrataDesignSystem_8a0ec2;
        const OB = window.StrataData;
        const obsCSS = `
.ob__head { display:flex; align-items:flex-end; justify-content:space-between; gap: var(--space-6); margin-bottom: var(--space-7); }
.ob__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.ob__sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); margin-top: 7px; letter-spacing: 0.02em; }
.ob__grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: var(--space-6); align-items: start; }
.ob__corehead { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-5); }
.ob__navrow { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; margin-top: var(--space-5); }
.ob__navcell { background: var(--bg-sunken); padding: 13px 15px; }
.ob__side { display:flex; flex-direction: column; gap: var(--space-6); }
.ob__gaugewrap { display:flex; align-items:center; gap: var(--space-6); }
.ob__gaugemeta { display:flex; flex-direction: column; gap: var(--space-4); }
.ob__feedwrap { margin-top: var(--space-7); }
@media (max-width: 1000px){ .ob__grid{ grid-template-columns: 1fr; } }
`;
        function Observatory({
          core,
          onSettle
        }) {
          React.useEffect(() => {
            if (document.getElementById('ob-css')) return;
            const e = document.createElement('style');
            e.id = 'ob-css';
            e.textContent = obsCSS;
            document.head.appendChild(e);
          }, []);
          const coverage = core.juniorNav;
          return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "ob__head"
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "ob__title"
          }, "Observatory"), /*#__PURE__*/React.createElement("div", {
            className: "ob__sub"
          }, "live \xB7 ETH/USDC \xB7 pool 0x88b\u20263a2 \xB7 measured from on-chain ticks, no external oracle")), /*#__PURE__*/React.createElement(Badge, {
            variant: "live",
            live: true
          }, "Reactive Network connected")), /*#__PURE__*/React.createElement("div", {
            className: "ob__grid"
          }, /*#__PURE__*/React.createElement(Panel, {
            padded: true
          }, /*#__PURE__*/React.createElement("div", {
            className: "ob__corehead"
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)'
            }
          }, "Unistrata Core \xB7 capital structure")), /*#__PURE__*/React.createElement(Button, {
            size: "sm",
            variant: "senior",
            onClick: onSettle
          }, "Force settlement")), /*#__PURE__*/React.createElement(StrataCore, {
            seniorNav: core.seniorNav,
            juniorNav: core.juniorNav,
            scaleMax: OB.SCALE_MAX,
            height: 360,
            sweepKey: core.sweepKey
          }), /*#__PURE__*/React.createElement("div", {
            className: "ob__navrow"
          }, /*#__PURE__*/React.createElement("div", {
            className: "ob__navcell"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Bedrock NAV",
            tone: "senior",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: core.seniorNav,
              prefix: "$"
            })
          })), /*#__PURE__*/React.createElement("div", {
            className: "ob__navcell"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Sediment NAV",
            tone: "junior",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: core.juniorNav,
              prefix: "$"
            })
          })), /*#__PURE__*/React.createElement("div", {
            className: "ob__navcell"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Coverage ratio",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: coverage / 1e6,
              decimals: 2,
              prefix: "$",
              suffix: "M"
            }),
            unit: "Sediment buffer"
          })))), /*#__PURE__*/React.createElement("div", {
            className: "ob__side"
          }, /*#__PURE__*/React.createElement(Panel, {
            eyebrow: "Realized volatility",
            title: "\u03C3\xB2 from pool ticks"
          }, /*#__PURE__*/React.createElement("div", {
            className: "ob__gaugewrap"
          }, /*#__PURE__*/React.createElement(Gauge, {
            value: OB.pool.vol,
            min: 0,
            max: 1,
            size: 168,
            valueText: "0.41",
            unit: "\u03C3\xB2 %/day",
            tone: "senior",
            thresholds: [{
              at: 0.6,
              color: 'var(--junior-400)'
            }, {
              at: 0.85,
              color: 'var(--loss-400)'
            }]
          }), /*#__PURE__*/React.createElement("div", {
            className: "ob__gaugemeta"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "EWMA",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: OB.pool.volEwma,
              decimals: 2
            }),
            delta: "+0.06 rising",
            deltaDir: "up"
          }), /*#__PURE__*/React.createElement(Stat, {
            label: "Emergency trigger",
            size: "sm",
            value: "0.85",
            unit: "\u03C3\xB2 %/day"
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--text-tertiary)',
              lineHeight: 1.5,
              maxWidth: '24ch'
            }
          }, "Above trigger, Reactive closes the epoch early.")))), /*#__PURE__*/React.createElement(Panel, {
            eyebrow: "Epoch clock",
            title: "Next settlement"
          }, /*#__PURE__*/React.createElement(EpochCountdown, {
            epoch: OB.pool.epoch,
            secondsLeft: OB.pool.secondsLeft,
            epochLength: OB.pool.epochLengthH * 3600,
            running: true,
            onSettle: onSettle
          })))), /*#__PURE__*/React.createElement("div", {
            className: "ob__feedwrap"
          }, /*#__PURE__*/React.createElement(EventFeed, {
            events: OB.events,
            maxHeight: 320
          })));
        }
        window.Observatory = Observatory;
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/strata-app/Observatory.jsx",
      error: String(e && e.message || e)
    });
  }

  // ui_kits/strata-app/Simulator.jsx
  try {
    (() => {
      /* global React */
      (function () {
        const {
          Panel,
          Stat,
          Badge,
          StrataCore,
          MoneyChart,
          NumberTicker
        } = window.StrataDesignSystem_8a0ec2;
        const SM = window.StrataData;
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
/* scrubbing must feel instant — override the cinematic settle transition */
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
        const SCN = [{
          id: 'calm',
          label: 'Calm'
        }, {
          id: 'trend',
          label: 'Trend'
        }, {
          id: 'crash',
          label: 'Crash'
        }];
        function Simulator() {
          React.useEffect(() => {
            if (document.getElementById('sm-css')) return;
            const e = document.createElement('style');
            e.id = 'sm-css';
            e.textContent = simCSS;
            document.head.appendChild(e);
          }, []);
          const [scn, setScn] = React.useState('crash');
          const [idx, setIdx] = React.useState(SM.N - 1);
          const data = SM.scenarios[scn];
          const i = Math.min(idx, SM.N - 1);
          const price = data.price[i];
          const sNav = data.seniorNav[i];
          const jNav = data.juniorNav[i];
          const progress = i / (SM.N - 1);
          const hours = Math.round(progress * 72);
          const change = (price / SM.P0 - 1) * 100;
          return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "sm__head"
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "sm__title"
          }, "Simulator"), /*#__PURE__*/React.createElement("p", {
            className: "sm__sub"
          }, "Pick a scenario and scrub the price path. The capital structure and the money chart respond in sync \u2014 watch Sediment compress while Bedrock holds its line.")), /*#__PURE__*/React.createElement("div", {
            className: "sm__pills"
          }, SCN.map(s => /*#__PURE__*/React.createElement("button", {
            key: s.id,
            className: "sm__pill",
            "data-on": scn === s.id,
            onClick: () => setScn(s.id)
          }, s.label)))), /*#__PURE__*/React.createElement("div", {
            className: "sm__grid"
          }, /*#__PURE__*/React.createElement(Panel, {
            padded: true
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-5)'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)'
            }
          }, "Capital structure"), /*#__PURE__*/React.createElement(Badge, {
            variant: change < -1 ? 'negative' : change > 1 ? 'senior' : 'neutral',
            dot: true
          }, change >= 0 ? '+' : '', change.toFixed(1), "% ETH")), /*#__PURE__*/React.createElement("div", {
            className: "sm-fast"
          }, /*#__PURE__*/React.createElement(StrataCore, {
            seniorNav: sNav,
            juniorNav: jNav,
            scaleMax: SM.SCALE_MAX,
            height: 320
          })), /*#__PURE__*/React.createElement("div", {
            className: "sm__readouts"
          }, /*#__PURE__*/React.createElement("div", {
            className: "sm__rd"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Bedrock NAV",
            tone: "senior",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: sNav,
              prefix: "$",
              duration: 120
            })
          })), /*#__PURE__*/React.createElement("div", {
            className: "sm__rd"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Sediment NAV",
            tone: "junior",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: jNav,
              prefix: "$",
              duration: 120
            })
          })), /*#__PURE__*/React.createElement("div", {
            className: "sm__rd"
          }, /*#__PURE__*/React.createElement(Stat, {
            label: "Sediment drawdown",
            size: "sm",
            value: /*#__PURE__*/React.createElement(NumberTicker, {
              value: (jNav / SM.JUNIOR0 - 1) * 100,
              decimals: 1,
              suffix: "%",
              duration: 120
            })
          })))), /*#__PURE__*/React.createElement(Panel, {
            padded: true
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-5)'
            }
          }, "Depositor outcome \xB7 index = 100 at t0"), /*#__PURE__*/React.createElement(MoneyChart, {
            price: data.price,
            series: data.series,
            progress: progress,
            height: 300
          }))), /*#__PURE__*/React.createElement("div", {
            className: "sm__scrub"
          }, /*#__PURE__*/React.createElement("div", {
            className: "sm__scrubhead"
          }, /*#__PURE__*/React.createElement("span", {
            className: "sm__time"
          }, "t + ", hours, "h of 72h \xB7 ", data.name, " scenario"), /*#__PURE__*/React.createElement("span", {
            className: "sm__price"
          }, "ETH ", SM.fmtUsd(price, 0).replace('$', '$'))), /*#__PURE__*/React.createElement("input", {
            className: "sm__range",
            type: "range",
            min: "0",
            max: SM.N - 1,
            value: idx,
            onInput: e => setIdx(Number(e.target.value)),
            onChange: e => setIdx(Number(e.target.value))
          }), /*#__PURE__*/React.createElement("div", {
            className: "sm__ticks"
          }, /*#__PURE__*/React.createElement("span", null, "t0 \xB7 $3,400"), /*#__PURE__*/React.createElement("span", null, "scrub the 72-hour path"), /*#__PURE__*/React.createElement("span", null, "t72"))));
        }
        window.Simulator = Simulator;
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/strata-app/Simulator.jsx",
      error: String(e && e.message || e)
    });
  }

  // ui_kits/strata-app/data.js
  try {
    (() => {
      /* Unistrata — mock protocol data + scenario engine.
         Exposes window.StrataData. No backend; every screen is demoable. */
      (function () {
        const P0 = 3400; // ETH start price
        const TVL = 2_400_000;
        const SENIOR0 = 1_620_000; // 67%
        const JUNIOR0 = 780_000; // 33%
        const SCALE_MAX = 2_600_000;
        const N = 73; // hourly points across 72h

        // 50/50 ETH/USDC mechanics, all values indexed to 100 at t0.
        const hodlIdx = r => 50 * (1 + r); // value of holding initial halves
        const lpIdxNoFee = r => 100 * Math.sqrt(r); // constant-product LP value

        function build(name, priceFn) {
          const price = [],
            hodl = [],
            lp = [],
            senior = [],
            junior = [];
          const seniorNav = [],
            juniorNav = [];
          let feeAcc = 0,
            premiumAcc = 0,
            couponAcc = 0;
          let prevP = P0;
          for (let i = 0; i < N; i++) {
            const t = i / (N - 1);
            const P = priceFn(t, i);
            const r = P / P0;
            // junior's edge: a steady risk premium plus volatility fees it keeps in full.
            // Kept deliberately smaller than impermanent loss so a crash COMPRESSES junior.
            feeAcc += Math.abs(P - prevP) / P0 * 0.04; // excess fees scale with realized vol
            premiumAcc += 0.00050; // steady premium per hour
            couponAcc += 0.072 * (1 / 8760); // 7.2% APR senior coupon, hourly
            prevP = P;

            // Pool NAV: impermanent-loss curve (sqrt) + what junior earns. Senior is
            // protected first (takes its principal + coupon); junior is the residual.
            const poolNav = TVL * (Math.sqrt(r) + premiumAcc + feeAcc);
            const sNav = Math.min(poolNav, SENIOR0 * (1 + couponAcc));
            const jNav = Math.max(0, poolNav - sNav);
            price.push(P);
            hodl.push(hodlIdx(r));
            lp.push(lpIdxNoFee(r) + feeAcc * 10); // vanilla LP keeps only a thin fee share
            senior.push(sNav / SENIOR0 * 100);
            junior.push(jNav / JUNIOR0 * 100);
            seniorNav.push(sNav);
            juniorNav.push(jNav);
          }
          return {
            name,
            price,
            series: {
              hodl,
              lp,
              senior,
              junior
            },
            seniorNav,
            juniorNav
          };
        }
        const scenarios = {
          calm: build('Calm', (t, i) => P0 * (1 + 0.025 * Math.sin(i / 4) + 0.012 * Math.sin(i / 1.7))),
          trend: build('Trend', (t, i) => P0 * (1 + 0.16 * t + 0.018 * Math.sin(i / 3))),
          crash: build('Crash', (t, i) => {
            // 3400 → 2040 (−40%) over the first ~40h, recover to 2720 by 72h
            let mult;
            if (t < 0.55) mult = 1 - 0.40 * (t / 0.55);else mult = 0.60 + 0.20 * ((t - 0.55) / 0.45);
            return P0 * mult * (1 + 0.012 * Math.sin(i / 2.2));
          })
        };
        const epochs = (() => {
          // recent settlement ledger
          return [{
            time: '2d 04:11',
            kind: 'emergency',
            epoch: 47,
            message: 'Vol spike on Reactive Network → <span class="em">emergencySettle()</span> executed, epoch 47 closed early',
            tx: '0x7a3f…e201',
            chain: 'Reactive ⇄ Ethereum'
          }, {
            time: '16:00:02',
            kind: 'settle',
            epoch: 46,
            message: 'Waterfall ran → coupon <span class="fn">accrued to Bedrock</span> (7.0%), Sediment took residual fees',
            tx: '0x1c9d…0a4f',
            chain: 'Ethereum'
          }, {
            time: '15:59:48',
            kind: 'reactive',
            epoch: 46,
            message: 'Reactive callback armed → watching σ² against 0.85%/day emergency trigger',
            tx: '0x44b2…9fe3',
            chain: 'Reactive Network'
          }, {
            time: '08:00:01',
            kind: 'settle',
            epoch: 45,
            message: 'Waterfall ran → Bedrock coupon paid in full, Sediment premium +3.8%',
            tx: '0xa1e7…22c8',
            chain: 'Ethereum'
          }, {
            time: '00:00:00',
            kind: 'settle',
            epoch: 44,
            message: 'Epoch opened → coupon repriced from realized vol: σ² = 0.41%/day',
            tx: '0x9f02…b71d',
            chain: 'Ethereum'
          }, {
            time: '-8:00:03',
            kind: 'info',
            epoch: 43,
            message: 'Tick observation window closed → 480 price samples ingested',
            tx: '0x3 db…7c10',
            chain: 'Ethereum'
          }];
        })();
        window.StrataData = {
          P0,
          TVL,
          SENIOR0,
          JUNIOR0,
          SCALE_MAX,
          N,
          scenarios,
          events: epochs,
          pool: {
            pair: 'ETH / USDC',
            tvl: TVL,
            senior: SENIOR0,
            junior: JUNIOR0,
            splitSenior: 0.675,
            splitJunior: 0.325,
            epoch: 47,
            epochLengthH: 8,
            secondsLeft: 11529,
            seniorApr: 7.2,
            juniorApr: 23.4,
            vol: 0.41,
            volEwma: 0.47,
            coverage: 1_840_000
          },
          fmtUsd(n, dp = 0) {
            if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
            if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(dp) + 'K';
            return '$' + n.toFixed(dp);
          }
        };
      })();
    })();
  } catch (e) {
    __ds_ns.__errors.push({
      path: "ui_kits/strata-app/data.js",
      error: String(e && e.message || e)
    });
  }
  __ds_ns.Badge = __ds_scope.Badge;
  __ds_ns.Button = __ds_scope.Button;
  __ds_ns.Panel = __ds_scope.Panel;
  __ds_ns.Stat = __ds_scope.Stat;
  __ds_ns.Gauge = __ds_scope.Gauge;
  __ds_ns.MoneyChart = __ds_scope.MoneyChart;
  __ds_ns.NumberTicker = __ds_scope.NumberTicker;
  __ds_ns.StrataCore = __ds_scope.StrataCore;
  __ds_ns.EpochCountdown = __ds_scope.EpochCountdown;
  __ds_ns.EventFeed = __ds_scope.EventFeed;
  __ds_ns.TrancheCard = __ds_scope.TrancheCard;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ds-runtime.js", error: String((e && e.message) || e) }); }

// ui_kits/strata-app/AppShell.jsx
try { (() => {
/* global React */
(function () {
  const {
    StrataCore,
    Badge
  } = window.StrataDesignSystem_8a0ec2;
  const SD = window.StrataData;
  const NAV = [{
    id: 'landing',
    label: 'Thesis',
    icon: 'layers'
  }, {
    id: 'deposit',
    label: 'Deposit',
    icon: 'arrow-down-to-line'
  }, {
    id: 'observatory',
    label: 'Observatory',
    icon: 'radio-tower'
  }, {
    id: 'simulator',
    label: 'Simulator',
    icon: 'sliders-horizontal'
  }];
  const shellCSS = `
.sx { display: grid; grid-template-columns: var(--rail-width) 1fr; min-height: 100%; background: var(--bg-app); }
.sx__rail { border-right: 1px solid var(--hairline); background: var(--ink-950);
  display: flex; flex-direction: column; padding: 20px 14px; position: sticky; top: 0; height: 100vh; }
.sx__brand { display: flex; align-items: center; gap: 11px; padding: 4px 8px 22px; }
.sx__brand .wm { font-family: var(--font-display); font-weight: 500; font-size: 22px; letter-spacing: -0.02em; color: var(--text-primary); }
.sx__brand .live-glyph { display: inline-flex; }
.sx__nav { display: flex; flex-direction: column; gap: 2px; }
.sx__item { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: var(--radius-md);
  font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--text-secondary);
  background: transparent; border: none; cursor: pointer; width: 100%; text-align: left;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.sx__item:hover { background: var(--surface-card); color: var(--text-primary); }
.sx__item[data-active="true"] { background: var(--surface-raised); color: var(--text-primary); box-shadow: inset 2px 0 0 0 var(--senior-500); }
.sx__item svg { width: 17px; height: 17px; flex: none; opacity: 0.85; }
.sx__sectlabel { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-tertiary); padding: 0 11px; margin: 18px 0 8px; }
.sx__spacer { flex: 1; }
.sx__live { border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; background: var(--ink-900); }
.sx__live .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.sx__live .ttl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.sx__live .glyphrow { display: flex; align-items: center; gap: 10px; }
.sx__live .meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
.sx__live .meta b { color: var(--senior-200); font-weight: 500; }

.sx__main { min-width: 0; display: flex; flex-direction: column; }
.sx__topbar { height: var(--topbar-height); border-bottom: 1px solid var(--hairline);
  display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-8);
  position: sticky; top: 0; z-index: 5; background: color-mix(in oklab, var(--bg-app) 86%, transparent); backdrop-filter: blur(10px); }
.sx__crumb { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.04em; }
.sx__crumb b { color: var(--text-primary); font-weight: 500; }
.sx__poolsum { display: flex; align-items: center; gap: 22px; }
.sx__poolsum .pm { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); display: flex; flex-direction: column; gap: 1px; }
.sx__poolsum .pm b { font-size: 13px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.sx__content { padding: var(--space-9) var(--space-8); max-width: var(--maxw-wide); width: 100%; margin: 0 auto; }
@media (max-width: 880px) {
  .sx { grid-template-columns: 1fr; }
  .sx__rail { display: none; }
}
`;
  function Icon({
    name
  }) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons({
        nameAttr: 'data-lucide',
        icons: window.lucide.icons
      });
    });
    return React.createElement('i', {
      'data-lucide': name,
      ref
    });
  }
  function useShellCSS() {
    React.useEffect(() => {
      if (document.getElementById('sx-css')) return;
      const e = document.createElement('style');
      e.id = 'sx-css';
      e.textContent = shellCSS;
      document.head.appendChild(e);
    }, []);
  }
  function AppShell({
    screen,
    onNav,
    seniorNav = SD.SENIOR0,
    juniorNav = SD.JUNIOR0,
    sweepKey = 0,
    children
  }) {
    useShellCSS();
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const cur = NAV.find(n => n.id === screen) || NAV[0];
    return /*#__PURE__*/React.createElement("div", {
      className: "sx"
    }, /*#__PURE__*/React.createElement("aside", {
      className: "sx__rail"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sx__brand"
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/strata-mark.svg",
      width: "30",
      height: "30",
      alt: "Unistrata"
    }), /*#__PURE__*/React.createElement("span", {
      className: "wm"
    }, "Unistrata")), /*#__PURE__*/React.createElement("div", {
      className: "sx__sectlabel"
    }, "Protocol"), /*#__PURE__*/React.createElement("nav", {
      className: "sx__nav"
    }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
      key: n.id,
      className: "sx__item",
      "data-active": screen === n.id,
      onClick: () => onNav(n.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon
    }), n.label))), /*#__PURE__*/React.createElement("div", {
      className: "sx__spacer"
    }), /*#__PURE__*/React.createElement("div", {
      className: "sx__live"
    }, /*#__PURE__*/React.createElement("div", {
      className: "top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ttl"
    }, "Live core"), /*#__PURE__*/React.createElement(Badge, {
      variant: "live",
      live: true,
      size: "sm"
    }, "Reactive")), /*#__PURE__*/React.createElement("div", {
      className: "glyphrow"
    }, /*#__PURE__*/React.createElement(StrataCore, {
      glyph: true,
      height: 46,
      seniorNav: seniorNav,
      juniorNav: juniorNav,
      scaleMax: SD.SCALE_MAX,
      sweepKey: sweepKey
    }), /*#__PURE__*/React.createElement("div", {
      className: "meta"
    }, "epoch ", /*#__PURE__*/React.createElement("b", null, "47"), /*#__PURE__*/React.createElement("br", null), "\u03C3\xB2 ", /*#__PURE__*/React.createElement("b", null, "0.41"), "%/day")))), /*#__PURE__*/React.createElement("main", {
      className: "sx__main"
    }, /*#__PURE__*/React.createElement("header", {
      className: "sx__topbar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sx__crumb"
    }, "unistrata ", /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: 0.4
      }
    }, "/"), " ", /*#__PURE__*/React.createElement("b", null, cur.label)), /*#__PURE__*/React.createElement("div", {
      className: "sx__poolsum"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pm"
    }, "ETH / USDC", /*#__PURE__*/React.createElement("b", null, SD.fmtUsd(SD.TVL), " TVL")), /*#__PURE__*/React.createElement("div", {
      className: "pm"
    }, "Bedrock", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--senior-200)'
      }
    }, SD.pool.seniorApr, "% APR")), /*#__PURE__*/React.createElement("div", {
      className: "pm"
    }, "Sediment", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--junior-200)'
      }
    }, SD.pool.juniorApr, "% APR")))), /*#__PURE__*/React.createElement("div", {
      className: "sx__content"
    }, children)));
  }
  window.AppShell = AppShell;
  window.StrataIcon = Icon;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strata-app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strata-app/Deposit.jsx
try { (() => {
/* global React */
(function () {
  const {
    Button,
    Badge,
    Panel,
    Stat,
    TrancheCard,
    NumberTicker
  } = window.StrataDesignSystem_8a0ec2;
  const DP = window.StrataData;
  const FAUCET = {
    eth: 0.1,
    usdc: 10000
  };
  const COOLDOWN_S = 8 * 3600; // 8h, matches the epoch
  const WKEY = 'unistrata.wallet';
  const hex = n => '0x' + Array.from({
    length: n
  }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const trunc = h => h.slice(0, 6) + '…' + h.slice(-4);
  const hms = t => {
    t = Math.max(0, Math.floor(t));
    const p = x => String(x).padStart(2, '0');
    return `${p(Math.floor(t / 3600))}:${p(Math.floor(t % 3600 / 60))}:${p(t % 60)}`;
  };
  function loadWallet() {
    try {
      return JSON.parse(localStorage.getItem(WKEY)) || null;
    } catch (e) {
      return null;
    }
  }
  const depositCSS = `
.dp__head { margin-bottom: var(--space-8); }
.dp__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.dp__sub { font-family: var(--font-sans); font-size: 16px; color: var(--text-secondary); margin-top: 8px; max-width: 60ch; line-height: 1.5; }
.dp__grid { display: grid; grid-template-columns: 1fr 0.92fr; gap: var(--space-8); align-items: start; }
.dp__cards { display: flex; flex-direction: column; gap: var(--space-5); }
.dp__ticket { position: sticky; top: 84px; }
.dp__field { display: flex; flex-direction: column; gap: 8px; }
.dp__fieldlabel { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.dp__input { display: flex; align-items: center; gap: 10px; background: var(--bg-sunken); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 14px 14px; transition: border-color var(--dur-fast) var(--ease-out); }
.dp__input:focus-within { border-color: var(--senior-600); }
.dp__input input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: var(--text-primary);
  font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 26px; font-weight: 500; letter-spacing: 0.01em; }
.dp__input .tok { display: flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary);
  background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 5px 11px; }
.dp__input .tok .d { width: 8px; height: 8px; border-radius: 50%; background: var(--senior-400); }
.dp__chips { display: flex; gap: 7px; flex-wrap: wrap; }
.dp__chip { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); background: var(--surface-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 9px; cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out); }
.dp__chip:hover { border-color: var(--border-strong); color: var(--text-primary); }
.dp__chip--max { color: var(--senior-200); border-color: var(--senior-800); }
.dp__summary { display: flex; flex-direction: column; gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow: hidden; }
.dp__line { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-sunken); }
.dp__line .k { font-family: var(--font-sans); font-size: 13.5px; color: var(--text-secondary); }
.dp__line .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); }
.dp__line--em .v { font-size: 18px; }
.dp__cover { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: var(--senior-950);
  border: 1px solid var(--senior-800); border-radius: var(--radius-md); }
.dp__cover svg { width: 16px; height: 16px; color: var(--senior-300); flex: none; margin-top: 1px; }
.dp__cover p { font-family: var(--font-sans); font-size: 12.5px; color: var(--senior-100); line-height: 1.5; }
.dp__cover.j { background: var(--junior-950); border-color: var(--junior-800); }
.dp__cover.j svg { color: var(--junior-300); }
.dp__cover.j p { color: var(--junior-100); }
.dp__foot { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align: center; line-height: 1.6; }

/* ---- Faucet ---- */
.dp__faucet { margin-bottom: var(--space-7); }
.dp__faucetbody { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); flex-wrap: wrap; }
.dp__faucetbal { display: flex; align-items: center; gap: var(--space-6); flex-wrap: wrap; }
.dp__wallet { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12.5px; color: var(--text-secondary);
  background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 6px 12px; }
.dp__wallet .d { width: 7px; height: 7px; border-radius: 50%; background: var(--senior-400); box-shadow: 0 0 8px 0 var(--senior-400); flex: none; }
.dp__wallet button { background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 0; display: inline-flex; }
.dp__wallet button:hover { color: var(--text-secondary); }
.dp__wallet button svg { width: 14px; height: 14px; }
.dp__bal { display: flex; flex-direction: column; gap: 3px; }
.dp__bal .k { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.dp__bal .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums; font-size: 19px; font-weight: 500; color: var(--text-primary); display: flex; align-items: baseline; gap: 5px; }
.dp__bal .v small { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
.dp__helper { font-family: var(--font-sans); font-size: 13px; color: var(--text-tertiary); max-width: 52ch; line-height: 1.5; }
.dp__drip { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11.5px; color: var(--senior-200);
  background: var(--senior-950); border: 1px solid var(--senior-800); border-radius: var(--radius-sm); padding: 7px 11px; }
.dp__drip svg { width: 14px; height: 14px; color: var(--senior-300); flex: none; }
.dp__drip a { color: var(--senior-300); border-bottom: 1px dotted var(--senior-700); }
.dp__drip a:hover { color: var(--senior-200); }
.dp__balline { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.dp__balline .wb { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.dp__balline .wb b { color: var(--text-secondary); font-weight: 500; }
.dp__deptx { display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--font-mono); font-size: 11px; color: var(--senior-200); line-height: 1.5; text-align: center; }
.dp__deptx svg { width: 13px; height: 13px; color: var(--senior-300); flex: none; }
.dp__deptx a { color: var(--senior-300); border-bottom: 1px dotted var(--senior-700); }
@media (max-width: 1000px){ .dp__grid{ grid-template-columns: 1fr; } .dp__ticket{ position: static; } }
`;
  function Deposit() {
    React.useEffect(() => {
      if (document.getElementById('dp-css')) return;
      const e = document.createElement('style');
      e.id = 'dp-css';
      e.textContent = depositCSS;
      document.head.appendChild(e);
      if (window.lucide) window.lucide.createIcons();
    }, []);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const [tranche, setTranche] = React.useState('senior');
    const [amount, setAmount] = React.useState(25000);
    const [wallet, setWallet] = React.useState(loadWallet); // null = disconnected
    const [claiming, setClaiming] = React.useState(false);
    const [drip, setDrip] = React.useState(null); // last faucet claim
    const [depTx, setDepTx] = React.useState(null); // last deposit
    const [now, setNow] = React.useState(Date.now());
    React.useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(id);
    }, []);
    React.useEffect(() => {
      try {
        if (wallet) localStorage.setItem(WKEY, JSON.stringify(wallet));else localStorage.removeItem(WKEY);
      } catch (e) {}
    }, [wallet]);
    const isSenior = tranche === 'senior';
    const sharePrice = isSenior ? 1.0234 : 1.1871;
    const shares = amount / sharePrice;
    const accent = isSenior ? 'senior' : 'junior';
    const cooldownLeft = wallet && wallet.lastClaim ? Math.max(0, COOLDOWN_S - Math.floor((now - wallet.lastClaim) / 1000)) : 0;
    const onCooldown = cooldownLeft > 0;
    const connect = () => {
      setDepTx(null);
      setWallet({
        address: hex(40),
        eth: 0,
        usdc: 0,
        lastClaim: 0
      });
    };
    const disconnect = () => {
      setWallet(null);
      setDrip(null);
      setDepTx(null);
    };
    const claim = () => {
      if (claiming || onCooldown) return;
      setClaiming(true);
      setTimeout(() => {
        const tx = trunc(hex(40));
        setWallet(w => ({
          ...w,
          eth: w.eth + FAUCET.eth,
          usdc: w.usdc + FAUCET.usdc,
          lastClaim: Date.now()
        }));
        setDrip({
          tx
        });
        setClaiming(false);
      }, 850);
    };
    const doDeposit = () => {
      const amt = amount;
      setWallet(w => ({
        ...w,
        usdc: w.usdc - amt
      }));
      setDepTx({
        amt,
        shares: amt / sharePrice,
        ticker: isSenior ? 'BEDR' : 'SEDI',
        layer: isSenior ? 'Bedrock' : 'Sediment',
        tx: trunc(hex(40))
      });
    };

    // deposit button state machine
    let depLabel,
      depDisabled = false,
      depAction = doDeposit;
    if (!wallet) {
      depLabel = 'Connect wallet to deposit';
      depAction = connect;
    } else if (!(amount > 0)) {
      depLabel = 'Enter an amount';
      depDisabled = true;
    } else if (amount > wallet.usdc) {
      depLabel = 'Insufficient test USDC — claim above';
      depDisabled = true;
    } else {
      depLabel = isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment';
    }
    const claimLabel = claiming ? 'Dripping…' : onCooldown ? `Next claim ${hms(cooldownLeft)}` : 'Claim test tokens';
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "dp__head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dp__title"
    }, "Choose your layer"), /*#__PURE__*/React.createElement("p", {
      className: "dp__sub"
    }, "The same instrument, two temperaments. Bedrock is the senior layer \u2014 fixed coupon, protected first. Sediment is the junior layer \u2014 levered yield in exchange for absorbing loss first.")), /*#__PURE__*/React.createElement("div", {
      className: "dp__faucet"
    }, /*#__PURE__*/React.createElement(Panel, {
      eyebrow: "Testnet faucet",
      title: "Fund your test wallet",
      actions: wallet ? /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        disabled: claiming || onCooldown,
        onClick: claim,
        icon: /*#__PURE__*/React.createElement("i", {
          "data-lucide": "droplets"
        })
      }, claimLabel) : /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        onClick: connect,
        icon: /*#__PURE__*/React.createElement("i", {
          "data-lucide": "wallet"
        })
      }, "Connect wallet")
    }, wallet ? /*#__PURE__*/React.createElement("div", {
      className: "dp__faucetbody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dp__faucetbal"
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral",
      size: "sm"
    }, "Unichain Sepolia"), /*#__PURE__*/React.createElement("span", {
      className: "dp__wallet"
    }, /*#__PURE__*/React.createElement("span", {
      className: "d"
    }), trunc(wallet.address), /*#__PURE__*/React.createElement("button", {
      title: "Disconnect",
      onClick: disconnect
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "log-out"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "dp__bal"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Test ETH"), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, /*#__PURE__*/React.createElement(NumberTicker, {
      value: wallet.eth,
      decimals: 2
    }), " ", /*#__PURE__*/React.createElement("small", null, "gas"))), /*#__PURE__*/React.createElement("div", {
      className: "dp__bal"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Test USDC"), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, /*#__PURE__*/React.createElement(NumberTicker, {
      value: wallet.usdc,
      decimals: 0
    }), " ", /*#__PURE__*/React.createElement("small", null, "USDC")))), drip ? /*#__PURE__*/React.createElement("span", {
      className: "dp__drip"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle-2"
    }), " Dripped 0.1 ETH + 10,000 USDC \xB7 ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => e.preventDefault()
    }, drip.tx, " \u2197")) : /*#__PURE__*/React.createElement("span", {
      className: "dp__helper"
    }, "Each claim drips 0.1 test ETH for gas and 10,000 test USDC. 8-hour cooldown per wallet.")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral",
      size: "sm"
    }, "Unichain Sepolia \xB7 testnet"), /*#__PURE__*/React.createElement("p", {
      className: "dp__helper"
    }, "Connect a wallet to claim test ETH and USDC, then deposit to a layer below. Nothing here touches mainnet \u2014 these tokens have no value.")))), /*#__PURE__*/React.createElement("div", {
      className: "dp__grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dp__cards"
    }, /*#__PURE__*/React.createElement(TrancheCard, {
      tranche: "senior",
      apr: "7.2%",
      selected: isSenior,
      onSelect: () => setTranche('senior'),
      capacityPct: 81,
      capacityLabel: "Bedrock capacity filled",
      rows: [{
        label: 'Coverage ratio',
        value: '$1.84M Sediment below you',
        tone: 'senior'
      }, {
        label: 'Capacity remaining',
        value: '$310K'
      }, {
        label: 'Coupon priced from',
        value: 'σ² = 0.41%/day'
      }],
      footnote: "Protected from impermanent loss until the Sediment layer is exhausted. Coupon repriced every epoch."
    }), /*#__PURE__*/React.createElement(TrancheCard, {
      tranche: "junior",
      apr: "23.4%",
      aprLabel: "trailing 30d APR",
      selected: !isSenior,
      onSelect: () => setTranche('junior'),
      capacityPct: 62,
      capacityLabel: "Sediment capacity filled",
      rows: [{
        label: 'Risk premium earned',
        value: '+4.1% this epoch',
        tone: 'junior'
      }, {
        label: 'Excess fees',
        value: 'all retained'
      }, {
        label: 'Leverage on pool',
        value: '≈ 3.1×'
      }],
      footnote: "You absorb losses first. In exchange you keep all excess fees and the volatility risk premium."
    })), /*#__PURE__*/React.createElement("div", {
      className: "dp__ticket"
    }, /*#__PURE__*/React.createElement(Panel, {
      accent: accent,
      eyebrow: isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment',
      title: isSenior ? 'Fixed coupon · 7.2% this epoch' : 'Levered yield · 23.4% trailing'
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "dp__field"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dp__balline"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dp__fieldlabel"
    }, "Amount in"), wallet && /*#__PURE__*/React.createElement("span", {
      className: "wb"
    }, "Wallet ", /*#__PURE__*/React.createElement("b", null, wallet.usdc.toLocaleString('en-US')), " USDC")), /*#__PURE__*/React.createElement("div", {
      className: "dp__input"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      inputMode: "decimal",
      value: amount.toLocaleString('en-US'),
      onChange: e => {
        const v = Number(e.target.value.replace(/[^0-9.]/g, ''));
        setAmount(Number.isFinite(v) ? v : 0);
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "tok"
    }, /*#__PURE__*/React.createElement("span", {
      className: "d",
      style: {
        background: 'var(--paper-300)'
      }
    }), "USDC")), /*#__PURE__*/React.createElement("div", {
      className: "dp__chips"
    }, [10000, 25000, 50000, 100000].map(v => /*#__PURE__*/React.createElement("button", {
      key: v,
      className: "dp__chip",
      onClick: () => setAmount(v)
    }, DP.fmtUsd(v, 0))), wallet && wallet.usdc > 0 && /*#__PURE__*/React.createElement("button", {
      className: "dp__chip dp__chip--max",
      onClick: () => setAmount(Math.floor(wallet.usdc))
    }, "Max"))), /*#__PURE__*/React.createElement("div", {
      className: "dp__summary"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dp__line dp__line--em"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Shares out"), /*#__PURE__*/React.createElement("span", {
      className: "v",
      style: {
        color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)'
      }
    }, /*#__PURE__*/React.createElement(NumberTicker, {
      value: shares,
      decimals: 2
    }), " ", isSenior ? 'BEDR' : 'SEDI')), /*#__PURE__*/React.createElement("div", {
      className: "dp__line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Share price"), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, sharePrice.toFixed(4), " USDC")), /*#__PURE__*/React.createElement("div", {
      className: "dp__line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, isSenior ? 'Projected coupon (8h epoch)' : 'Projected premium (8h epoch)'), /*#__PURE__*/React.createElement("span", {
      className: "v",
      style: {
        color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)'
      }
    }, "+", DP.fmtUsd(amount * (isSenior ? 0.072 : 0.234) / (365 * 3), 0))), /*#__PURE__*/React.createElement("div", {
      className: "dp__line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Settles"), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, "epoch 48"))), /*#__PURE__*/React.createElement("div", {
      className: `dp__cover ${isSenior ? '' : 'j'}`
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": isSenior ? 'shield-check' : 'flame'
    }), /*#__PURE__*/React.createElement("p", null, isSenior ? 'Your principal is covered by $1.84M of Sediment capital before any impairment can reach you.' : 'You are underwriting volatility. You absorb the first dollar of impermanent loss — and keep every excess fee.')), /*#__PURE__*/React.createElement(Button, {
      variant: accent,
      size: "lg",
      fullWidth: true,
      disabled: depDisabled,
      onClick: depAction
    }, depLabel), depTx ? /*#__PURE__*/React.createElement("div", {
      className: "dp__deptx"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle-2"
    }), " Deposited ", depTx.amt.toLocaleString('en-US'), " USDC \u2192 ", depTx.shares.toFixed(2), " ", depTx.ticker, " to ", depTx.layer, " \xB7 ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => e.preventDefault()
    }, depTx.tx, " \u2197")) : /*#__PURE__*/React.createElement("div", {
      className: "dp__foot"
    }, "Withdrawals are requested, then settle at the next epoch boundary.", /*#__PURE__*/React.createElement("br", null), "Request withdrawal \u2014 settles at epoch 48."))))));
  }
  window.Deposit = Deposit;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strata-app/Deposit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strata-app/Landing.jsx
try { (() => {
/* global React */
(function () {
  const {
    Button,
    Badge,
    Panel,
    Stat,
    StrataCore,
    MoneyChart,
    NumberTicker
  } = window.StrataDesignSystem_8a0ec2;
  const LD = window.StrataData;
  const landingCSS = `
.lg__hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: var(--space-10); align-items: center; margin-bottom: var(--space-11); }
.lg__eyebrow { display: inline-flex; align-items: center; gap: 10px; margin-bottom: var(--space-6); }
.lg__thesis { font-family: var(--font-display); font-weight: 500; font-size: clamp(34px, 4vw, 58px);
  line-height: 1.04; letter-spacing: -0.022em; color: var(--text-primary); text-wrap: balance; }
.lg__thesis em { font-style: italic; color: var(--senior-200); }
.lg__sub { font-family: var(--font-sans); font-size: 17px; line-height: 1.55; color: var(--text-secondary);
  max-width: 52ch; margin: var(--space-6) 0 var(--space-8); }
.lg__cta { display: flex; align-items: center; gap: var(--space-4); }
.lg__cta .note { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); }
.lg__corewrap { position: relative; }
.lg__corecap { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.lg__corecap .c { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.lg__metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--hairline);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-11); }
.lg__metric { background: var(--surface-card); padding: var(--space-6); }
.lg__charthead { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); }
.lg__chartttl { font-family: var(--font-display); font-size: 28px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary); }
.lg__chartsub { font-family: var(--font-sans); font-size: 14px; color: var(--text-tertiary); margin-top: 6px; max-width: 46ch; line-height: 1.5; }
@media (max-width: 1000px){ .lg__hero{ grid-template-columns: 1fr; } .lg__metrics{ grid-template-columns: repeat(2,1fr);} }
`;
  function Landing({
    core,
    onSettle,
    onNav
  }) {
    React.useEffect(() => {
      if (document.getElementById('lg-css')) return;
      const e = document.createElement('style');
      e.id = 'lg-css';
      e.textContent = landingCSS;
      document.head.appendChild(e);
    }, []);
    const crash = LD.scenarios.crash;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
      className: "lg__hero"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "lg__eyebrow"
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "senior",
      size: "sm"
    }, "Uniswap v4 hook"), /*#__PURE__*/React.createElement(Badge, {
      variant: "live",
      live: true,
      size: "sm"
    }, "Reactive settlement")), /*#__PURE__*/React.createElement("h1", {
      className: "lg__thesis"
    }, "LPs are forced sellers of volatility with no buyer.", /*#__PURE__*/React.createElement("br", null), "Unistrata built the ", /*#__PURE__*/React.createElement("em", null, "buyer"), "."), /*#__PURE__*/React.createElement("p", {
      className: "lg__sub"
    }, "A liquidity pool, split into two layers like geological strata. Bedrock earns a fixed coupon priced from the pool's own measured volatility. Sediment underwrites the risk and keeps the premium."), /*#__PURE__*/React.createElement("div", {
      className: "lg__cta"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      onClick: () => onNav('deposit')
    }, "Open Unistrata"), /*#__PURE__*/React.createElement("span", {
      className: "note"
    }, "no oracle \xB7 no keepers \xB7 settles every 8h"))), /*#__PURE__*/React.createElement("div", {
      className: "lg__corewrap"
    }, /*#__PURE__*/React.createElement(StrataCore, {
      seniorNav: core.seniorNav,
      juniorNav: core.juniorNav,
      scaleMax: LD.SCALE_MAX,
      height: 392,
      sweepKey: core.sweepKey
    }), /*#__PURE__*/React.createElement("div", {
      className: "lg__corecap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "c"
    }, "epoch 47 \xB7 waterfall runs Bedrock-first"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "senior",
      onClick: onSettle
    }, "Run a settlement \u2192")))), /*#__PURE__*/React.createElement("section", {
      className: "lg__metrics"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lg__metric"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Total value locked",
      size: "md",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: LD.TVL,
        prefix: "$"
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "lg__metric"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Bedrock coupon",
      tone: "senior",
      size: "md",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: 7.2,
        decimals: 1,
        suffix: "%"
      }),
      unit: "fixed APR"
    })), /*#__PURE__*/React.createElement("div", {
      className: "lg__metric"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Sediment trailing",
      tone: "junior",
      size: "md",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: 23.4,
        decimals: 1,
        suffix: "%"
      }),
      unit: "levered APR"
    })), /*#__PURE__*/React.createElement("div", {
      className: "lg__metric"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Realized vol",
      size: "md",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: 0.41,
        decimals: 2,
        suffix: "%"
      }),
      unit: "\u03C3\xB2 / day",
      delta: "EWMA rising",
      deltaDir: "up"
    }))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
      className: "lg__charthead"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "lg__chartttl"
    }, "Bedrock holds its line through a 40% swing"), /*#__PURE__*/React.createElement("div", {
      className: "lg__chartsub"
    }, "ETH falls $3,400 \u2192 $2,040 and recovers to $2,720 over 72 hours. Vanilla LP bleeds to impermanent loss; Bedrock tracks a calm coupon; Sediment absorbs the hit, then keeps the fees on the way back.")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => onNav('simulator')
    }, "Open the simulator")), /*#__PURE__*/React.createElement(Panel, {
      padded: true
    }, /*#__PURE__*/React.createElement(MoneyChart, {
      price: crash.price,
      series: crash.series,
      progress: 1,
      height: 340
    }))));
  }
  window.Landing = Landing;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strata-app/Landing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strata-app/Observatory.jsx
try { (() => {
/* global React */
(function () {
  const {
    Panel,
    Stat,
    Badge,
    Button,
    StrataCore,
    Gauge,
    EpochCountdown,
    EventFeed,
    NumberTicker
  } = window.StrataDesignSystem_8a0ec2;
  const OB = window.StrataData;
  const obsCSS = `
.ob__head { display:flex; align-items:flex-end; justify-content:space-between; gap: var(--space-6); margin-bottom: var(--space-7); }
.ob__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.ob__sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); margin-top: 7px; letter-spacing: 0.02em; }
.ob__grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: var(--space-6); align-items: start; }
.ob__corehead { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-5); }
.ob__navrow { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; margin-top: var(--space-5); }
.ob__navcell { background: var(--bg-sunken); padding: 13px 15px; }
.ob__side { display:flex; flex-direction: column; gap: var(--space-6); }
.ob__gaugewrap { display:flex; align-items:center; gap: var(--space-6); }
.ob__gaugemeta { display:flex; flex-direction: column; gap: var(--space-4); }
.ob__feedwrap { margin-top: var(--space-7); }
@media (max-width: 1000px){ .ob__grid{ grid-template-columns: 1fr; } }
`;
  function Observatory({
    core,
    onSettle
  }) {
    React.useEffect(() => {
      if (document.getElementById('ob-css')) return;
      const e = document.createElement('style');
      e.id = 'ob-css';
      e.textContent = obsCSS;
      document.head.appendChild(e);
    }, []);
    const coverage = core.juniorNav;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "ob__head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "ob__title"
    }, "Observatory"), /*#__PURE__*/React.createElement("div", {
      className: "ob__sub"
    }, "live \xB7 ETH/USDC \xB7 pool 0x88b\u20263a2 \xB7 measured from on-chain ticks, no external oracle")), /*#__PURE__*/React.createElement(Badge, {
      variant: "live",
      live: true
    }, "Reactive Network connected")), /*#__PURE__*/React.createElement("div", {
      className: "ob__grid"
    }, /*#__PURE__*/React.createElement(Panel, {
      padded: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "ob__corehead"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)'
      }
    }, "Unistrata Core \xB7 capital structure")), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "senior",
      onClick: onSettle
    }, "Force settlement")), /*#__PURE__*/React.createElement(StrataCore, {
      seniorNav: core.seniorNav,
      juniorNav: core.juniorNav,
      scaleMax: OB.SCALE_MAX,
      height: 360,
      sweepKey: core.sweepKey
    }), /*#__PURE__*/React.createElement("div", {
      className: "ob__navrow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ob__navcell"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Bedrock NAV",
      tone: "senior",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: core.seniorNav,
        prefix: "$"
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "ob__navcell"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Sediment NAV",
      tone: "junior",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: core.juniorNav,
        prefix: "$"
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "ob__navcell"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Coverage ratio",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: coverage / 1e6,
        decimals: 2,
        prefix: "$",
        suffix: "M"
      }),
      unit: "Sediment buffer"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "ob__side"
    }, /*#__PURE__*/React.createElement(Panel, {
      eyebrow: "Realized volatility",
      title: "\u03C3\xB2 from pool ticks"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ob__gaugewrap"
    }, /*#__PURE__*/React.createElement(Gauge, {
      value: OB.pool.vol,
      min: 0,
      max: 1,
      size: 168,
      valueText: "0.41",
      unit: "\u03C3\xB2 %/day",
      tone: "senior",
      thresholds: [{
        at: 0.6,
        color: 'var(--junior-400)'
      }, {
        at: 0.85,
        color: 'var(--loss-400)'
      }]
    }), /*#__PURE__*/React.createElement("div", {
      className: "ob__gaugemeta"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "EWMA",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: OB.pool.volEwma,
        decimals: 2
      }),
      delta: "+0.06 rising",
      deltaDir: "up"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Emergency trigger",
      size: "sm",
      value: "0.85",
      unit: "\u03C3\xB2 %/day"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--text-tertiary)',
        lineHeight: 1.5,
        maxWidth: '24ch'
      }
    }, "Above trigger, Reactive closes the epoch early.")))), /*#__PURE__*/React.createElement(Panel, {
      eyebrow: "Epoch clock",
      title: "Next settlement"
    }, /*#__PURE__*/React.createElement(EpochCountdown, {
      epoch: OB.pool.epoch,
      secondsLeft: OB.pool.secondsLeft,
      epochLength: OB.pool.epochLengthH * 3600,
      running: true,
      onSettle: onSettle
    })))), /*#__PURE__*/React.createElement("div", {
      className: "ob__feedwrap"
    }, /*#__PURE__*/React.createElement(EventFeed, {
      events: OB.events,
      maxHeight: 320
    })));
  }
  window.Observatory = Observatory;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strata-app/Observatory.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strata-app/Simulator.jsx
try { (() => {
/* global React */
(function () {
  const {
    Panel,
    Stat,
    Badge,
    StrataCore,
    MoneyChart,
    NumberTicker
  } = window.StrataDesignSystem_8a0ec2;
  const SM = window.StrataData;
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
/* scrubbing must feel instant — override the cinematic settle transition */
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
  const SCN = [{
    id: 'calm',
    label: 'Calm'
  }, {
    id: 'trend',
    label: 'Trend'
  }, {
    id: 'crash',
    label: 'Crash'
  }];
  function Simulator() {
    React.useEffect(() => {
      if (document.getElementById('sm-css')) return;
      const e = document.createElement('style');
      e.id = 'sm-css';
      e.textContent = simCSS;
      document.head.appendChild(e);
    }, []);
    const [scn, setScn] = React.useState('crash');
    const [idx, setIdx] = React.useState(SM.N - 1);
    const data = SM.scenarios[scn];
    const i = Math.min(idx, SM.N - 1);
    const price = data.price[i];
    const sNav = data.seniorNav[i];
    const jNav = data.juniorNav[i];
    const progress = i / (SM.N - 1);
    const hours = Math.round(progress * 72);
    const change = (price / SM.P0 - 1) * 100;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "sm__head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "sm__title"
    }, "Simulator"), /*#__PURE__*/React.createElement("p", {
      className: "sm__sub"
    }, "Pick a scenario and scrub the price path. The capital structure and the money chart respond in sync \u2014 watch Sediment compress while Bedrock holds its line.")), /*#__PURE__*/React.createElement("div", {
      className: "sm__pills"
    }, SCN.map(s => /*#__PURE__*/React.createElement("button", {
      key: s.id,
      className: "sm__pill",
      "data-on": scn === s.id,
      onClick: () => setScn(s.id)
    }, s.label)))), /*#__PURE__*/React.createElement("div", {
      className: "sm__grid"
    }, /*#__PURE__*/React.createElement(Panel, {
      padded: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)'
      }
    }, "Capital structure"), /*#__PURE__*/React.createElement(Badge, {
      variant: change < -1 ? 'negative' : change > 1 ? 'senior' : 'neutral',
      dot: true
    }, change >= 0 ? '+' : '', change.toFixed(1), "% ETH")), /*#__PURE__*/React.createElement("div", {
      className: "sm-fast"
    }, /*#__PURE__*/React.createElement(StrataCore, {
      seniorNav: sNav,
      juniorNav: jNav,
      scaleMax: SM.SCALE_MAX,
      height: 320
    })), /*#__PURE__*/React.createElement("div", {
      className: "sm__readouts"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sm__rd"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Bedrock NAV",
      tone: "senior",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: sNav,
        prefix: "$",
        duration: 120
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "sm__rd"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Sediment NAV",
      tone: "junior",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: jNav,
        prefix: "$",
        duration: 120
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "sm__rd"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Sediment drawdown",
      size: "sm",
      value: /*#__PURE__*/React.createElement(NumberTicker, {
        value: (jNav / SM.JUNIOR0 - 1) * 100,
        decimals: 1,
        suffix: "%",
        duration: 120
      })
    })))), /*#__PURE__*/React.createElement(Panel, {
      padded: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        marginBottom: 'var(--space-5)'
      }
    }, "Depositor outcome \xB7 index = 100 at t0"), /*#__PURE__*/React.createElement(MoneyChart, {
      price: data.price,
      series: data.series,
      progress: progress,
      height: 300
    }))), /*#__PURE__*/React.createElement("div", {
      className: "sm__scrub"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sm__scrubhead"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sm__time"
    }, "t + ", hours, "h of 72h \xB7 ", data.name, " scenario"), /*#__PURE__*/React.createElement("span", {
      className: "sm__price"
    }, "ETH ", SM.fmtUsd(price, 0).replace('$', '$'))), /*#__PURE__*/React.createElement("input", {
      className: "sm__range",
      type: "range",
      min: "0",
      max: SM.N - 1,
      value: idx,
      onInput: e => setIdx(Number(e.target.value)),
      onChange: e => setIdx(Number(e.target.value))
    }), /*#__PURE__*/React.createElement("div", {
      className: "sm__ticks"
    }, /*#__PURE__*/React.createElement("span", null, "t0 \xB7 $3,400"), /*#__PURE__*/React.createElement("span", null, "scrub the 72-hour path"), /*#__PURE__*/React.createElement("span", null, "t72"))));
  }
  window.Simulator = Simulator;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strata-app/Simulator.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strata-app/data.js
try { (() => {
/* Unistrata — mock protocol data + scenario engine.
   Exposes window.StrataData. No backend; every screen is demoable. */
(function () {
  const P0 = 3400; // ETH start price
  const TVL = 2_400_000;
  const SENIOR0 = 1_620_000; // 67%
  const JUNIOR0 = 780_000; // 33%
  const SCALE_MAX = 2_600_000;
  const N = 73; // hourly points across 72h

  // 50/50 ETH/USDC mechanics, all values indexed to 100 at t0.
  const hodlIdx = r => 50 * (1 + r); // value of holding initial halves
  const lpIdxNoFee = r => 100 * Math.sqrt(r); // constant-product LP value

  function build(name, priceFn) {
    const price = [],
      hodl = [],
      lp = [],
      senior = [],
      junior = [];
    const seniorNav = [],
      juniorNav = [];
    let feeAcc = 0,
      premiumAcc = 0,
      couponAcc = 0;
    let prevP = P0;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const P = priceFn(t, i);
      const r = P / P0;
      // junior's edge: a steady risk premium plus volatility fees it keeps in full.
      // Kept deliberately smaller than impermanent loss so a crash COMPRESSES junior.
      feeAcc += Math.abs(P - prevP) / P0 * 0.04; // excess fees scale with realized vol
      premiumAcc += 0.00050; // steady premium per hour
      couponAcc += 0.072 * (1 / 8760); // 7.2% APR senior coupon, hourly
      prevP = P;

      // Pool NAV: impermanent-loss curve (sqrt) + what junior earns. Senior is
      // protected first (takes its principal + coupon); junior is the residual.
      const poolNav = TVL * (Math.sqrt(r) + premiumAcc + feeAcc);
      const sNav = Math.min(poolNav, SENIOR0 * (1 + couponAcc));
      const jNav = Math.max(0, poolNav - sNav);
      price.push(P);
      hodl.push(hodlIdx(r));
      lp.push(lpIdxNoFee(r) + feeAcc * 10); // vanilla LP keeps only a thin fee share
      senior.push(sNav / SENIOR0 * 100);
      junior.push(jNav / JUNIOR0 * 100);
      seniorNav.push(sNav);
      juniorNav.push(jNav);
    }
    return {
      name,
      price,
      series: {
        hodl,
        lp,
        senior,
        junior
      },
      seniorNav,
      juniorNav
    };
  }
  const scenarios = {
    calm: build('Calm', (t, i) => P0 * (1 + 0.025 * Math.sin(i / 4) + 0.012 * Math.sin(i / 1.7))),
    trend: build('Trend', (t, i) => P0 * (1 + 0.16 * t + 0.018 * Math.sin(i / 3))),
    crash: build('Crash', (t, i) => {
      // 3400 → 2040 (−40%) over the first ~40h, recover to 2720 by 72h
      let mult;
      if (t < 0.55) mult = 1 - 0.40 * (t / 0.55);else mult = 0.60 + 0.20 * ((t - 0.55) / 0.45);
      return P0 * mult * (1 + 0.012 * Math.sin(i / 2.2));
    })
  };
  const epochs = (() => {
    // recent settlement ledger
    return [{
      time: '2d 04:11',
      kind: 'emergency',
      epoch: 47,
      message: 'Vol spike on Reactive Network → <span class="em">emergencySettle()</span> executed, epoch 47 closed early',
      tx: '0x7a3f…e201',
      chain: 'Reactive ⇄ Ethereum'
    }, {
      time: '16:00:02',
      kind: 'settle',
      epoch: 46,
      message: 'Waterfall ran → coupon <span class="fn">accrued to Bedrock</span> (7.0%), Sediment took residual fees',
      tx: '0x1c9d…0a4f',
      chain: 'Ethereum'
    }, {
      time: '15:59:48',
      kind: 'reactive',
      epoch: 46,
      message: 'Reactive callback armed → watching σ² against 0.85%/day emergency trigger',
      tx: '0x44b2…9fe3',
      chain: 'Reactive Network'
    }, {
      time: '08:00:01',
      kind: 'settle',
      epoch: 45,
      message: 'Waterfall ran → Bedrock coupon paid in full, Sediment premium +3.8%',
      tx: '0xa1e7…22c8',
      chain: 'Ethereum'
    }, {
      time: '00:00:00',
      kind: 'settle',
      epoch: 44,
      message: 'Epoch opened → coupon repriced from realized vol: σ² = 0.41%/day',
      tx: '0x9f02…b71d',
      chain: 'Ethereum'
    }, {
      time: '-8:00:03',
      kind: 'info',
      epoch: 43,
      message: 'Tick observation window closed → 480 price samples ingested',
      tx: '0x3 db…7c10',
      chain: 'Ethereum'
    }];
  })();
  window.StrataData = {
    P0,
    TVL,
    SENIOR0,
    JUNIOR0,
    SCALE_MAX,
    N,
    scenarios,
    events: epochs,
    pool: {
      pair: 'ETH / USDC',
      tvl: TVL,
      senior: SENIOR0,
      junior: JUNIOR0,
      splitSenior: 0.675,
      splitJunior: 0.325,
      epoch: 47,
      epochLengthH: 8,
      secondsLeft: 11529,
      seniorApr: 7.2,
      juniorApr: 23.4,
      vol: 0.41,
      volEwma: 0.47,
      coverage: 1_840_000
    },
    fmtUsd(n, dp = 0) {
      if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
      if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(dp) + 'K';
      return '$' + n.toFixed(dp);
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strata-app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Gauge = __ds_scope.Gauge;

__ds_ns.MoneyChart = __ds_scope.MoneyChart;

__ds_ns.NumberTicker = __ds_scope.NumberTicker;

__ds_ns.StrataCore = __ds_scope.StrataCore;

__ds_ns.EpochCountdown = __ds_scope.EpochCountdown;

__ds_ns.EventFeed = __ds_scope.EventFeed;

__ds_ns.TrancheCard = __ds_scope.TrancheCard;

})();
