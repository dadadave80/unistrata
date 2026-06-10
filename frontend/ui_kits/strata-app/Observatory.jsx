/* global React */
(function () {
const { Panel, Stat, Badge, Button, StrataCore, Gauge, EpochCountdown, EventFeed, NumberTicker } = window.StrataDesignSystem_8a0ec2;
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

function Observatory({ core, onSettle }) {
  React.useEffect(() => {
    if (document.getElementById('ob-css')) return;
    const e = document.createElement('style'); e.id = 'ob-css'; e.textContent = obsCSS; document.head.appendChild(e);
  }, []);
  const coverage = core.juniorNav;
  return (
    <div>
      <div className="ob__head">
        <div>
          <div className="ob__title">Observatory</div>
          <div className="ob__sub">live · ETH/USDC · pool 0x88b…3a2 · measured from on-chain ticks, no external oracle</div>
        </div>
        <Badge variant="live" live>Reactive Network connected</Badge>
      </div>

      <div className="ob__grid">
        <Panel padded>
          <div className="ob__corehead">
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Unistrata Core · capital structure</div>
            </div>
            <Button size="sm" variant="senior" onClick={onSettle}>Force settlement</Button>
          </div>
          <StrataCore seniorNav={core.seniorNav} juniorNav={core.juniorNav} scaleMax={OB.SCALE_MAX} height={360} sweepKey={core.sweepKey} />
          <div className="ob__navrow">
            <div className="ob__navcell"><Stat label="Bedrock NAV" tone="senior" size="sm" value={<NumberTicker value={core.seniorNav} prefix="$" />} /></div>
            <div className="ob__navcell"><Stat label="Sediment NAV" tone="junior" size="sm" value={<NumberTicker value={core.juniorNav} prefix="$" />} /></div>
            <div className="ob__navcell"><Stat label="Coverage ratio" size="sm" value={<NumberTicker value={coverage / 1e6} decimals={2} prefix="$" suffix="M" />} unit="Sediment buffer" /></div>
          </div>
        </Panel>

        <div className="ob__side">
          <Panel eyebrow="Realized volatility" title="σ² from pool ticks">
            <div className="ob__gaugewrap">
              <Gauge value={OB.pool.vol} min={0} max={1} size={168} valueText="0.41" unit="σ² %/day" tone="senior"
                thresholds={[{ at: 0.6, color: 'var(--junior-400)' }, { at: 0.85, color: 'var(--loss-400)' }]} />
              <div className="ob__gaugemeta">
                <Stat label="EWMA" size="sm" value={<NumberTicker value={OB.pool.volEwma} decimals={2} />} delta="+0.06 rising" deltaDir="up" />
                <Stat label="Emergency trigger" size="sm" value="0.85" unit="σ² %/day" />
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, maxWidth: '24ch' }}>
                  Above trigger, Reactive closes the epoch early.
                </div>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Epoch clock" title="Next settlement">
            <EpochCountdown epoch={OB.pool.epoch} secondsLeft={OB.pool.secondsLeft} epochLength={OB.pool.epochLengthH * 3600} running onSettle={onSettle} />
          </Panel>
        </div>
      </div>

      <div className="ob__feedwrap">
        <EventFeed events={OB.events} maxHeight={320} />
      </div>
    </div>
  );
}

window.Observatory = Observatory;
})();
