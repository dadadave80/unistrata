/* global React */
(function () {
const { StrataCore, Badge } = window.StrataDesignSystem_8a0ec2;
const SD = window.StrataData;

const NAV = [
  { id: 'landing', label: 'Thesis', icon: 'layers' },
  { id: 'deposit', label: 'Deposit', icon: 'arrow-down-to-line' },
  { id: 'observatory', label: 'Observatory', icon: 'radio-tower' },
  { id: 'simulator', label: 'Simulator', icon: 'sliders-horizontal' },
];

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

function Icon({ name }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons({ nameAttr: 'data-lucide', icons: window.lucide.icons }); });
  return React.createElement('i', { 'data-lucide': name, ref });
}

function useShellCSS() {
  React.useEffect(() => {
    if (document.getElementById('sx-css')) return;
    const e = document.createElement('style'); e.id = 'sx-css'; e.textContent = shellCSS; document.head.appendChild(e);
  }, []);
}

function AppShell({ screen, onNav, seniorNav = SD.SENIOR0, juniorNav = SD.JUNIOR0, sweepKey = 0, children }) {
  useShellCSS();
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  const cur = NAV.find(n => n.id === screen) || NAV[0];
  return (
    <div className="sx">
      <aside className="sx__rail">
        <div className="sx__brand">
          <img src="../../assets/strata-mark.svg" width="30" height="30" alt="Unistrata" />
          <span className="wm">Unistrata</span>
        </div>
        <div className="sx__sectlabel">Protocol</div>
        <nav className="sx__nav">
          {NAV.map(n => (
            <button key={n.id} className="sx__item" data-active={screen === n.id} onClick={() => onNav(n.id)}>
              <Icon name={n.icon} />{n.label}
            </button>
          ))}
        </nav>
        <div className="sx__spacer" />
        <div className="sx__live">
          <div className="top">
            <span className="ttl">Live core</span>
            <Badge variant="live" live size="sm">Reactive</Badge>
          </div>
          <div className="glyphrow">
            <StrataCore glyph height={46} seniorNav={seniorNav} juniorNav={juniorNav} scaleMax={SD.SCALE_MAX} sweepKey={sweepKey} />
            <div className="meta">epoch <b>47</b><br />σ² <b>0.41</b>%/day</div>
          </div>
        </div>
      </aside>

      <main className="sx__main">
        <header className="sx__topbar">
          <div className="sx__crumb">unistrata <span style={{opacity:0.4}}>/</span> <b>{cur.label}</b></div>
          <div className="sx__poolsum">
            <div className="pm">ETH / USDC<b>{SD.fmtUsd(SD.TVL)} TVL</b></div>
            <div className="pm">Bedrock<b style={{color:'var(--senior-200)'}}>{SD.pool.seniorApr}% APR</b></div>
            <div className="pm">Sediment<b style={{color:'var(--junior-200)'}}>{SD.pool.juniorApr}% APR</b></div>
          </div>
        </header>
        <div className="sx__content">{children}</div>
      </main>
    </div>
  );
}

window.AppShell = AppShell;
window.StrataIcon = Icon;
})();
