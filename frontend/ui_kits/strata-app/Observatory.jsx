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

  // REAL live testnet state (Unichain Sepolia) with a best-effort RPC refresh; snapshot is the fallback.
  const [, force] = React.useReducer(function (x) { return x + 1; }, 0);
  React.useEffect(function () {
    const t = OB.live;
    if (!t || !t.refresh) return undefined;
    t.refresh().then(force);
    const onUpd = function () { force(); };
    window.addEventListener('strata:testnet', onUpd);
    const id = setInterval(function () { t.refresh().then(force); }, 30000);
    return function () { window.removeEventListener('strata:testnet', onUpd); clearInterval(id); };
  }, []);

  const live = OB.live || {};
  const lp = live.pool || OB.pool;
  const addr = (live.addresses && live.addresses.hook) || '0x0000…0000';
  const hookShort = addr.slice(0, 6) + '…' + addr.slice(-4);
  const sNav = lp.bedrockNav || core.seniorNav;
  const jNav = lp.sedimentNav || core.juniorNav;
  const scaleMax = lp.tvl ? lp.tvl * 1.3 : OB.SCALE_MAX;
  const epoch = (lp.epoch !== undefined) ? lp.epoch : OB.pool.epoch;
  const varAcc = lp.varAcc || 0;
  const trigger = lp.spikeThreshold || 4000000;
  const volRatio = live.volRatio || (varAcc / trigger);

  return (
    <div>
      <div className="ob__head">
        <div>
          <div className="ob__title">Observatory</div>
          <div className="ob__sub">live · tWETH/tUSDC · hook {hookShort} · Unichain Sepolia · measured from on-chain ticks, no external oracle</div>
        </div>
        <Badge variant="live" live>Reactive Network connected</Badge>
      </div>

      <div className="ob__grid">
        <Panel padded>
          <div className="ob__corehead">
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Unistrata Core · live capital structure</div>
            </div>
            <Button size="sm" variant="senior" onClick={onSettle}>Replay settlement</Button>
          </div>
          <StrataCore seniorNav={sNav} juniorNav={jNav} scaleMax={scaleMax} height={360} sweepKey={core.sweepKey} />
          <div className="ob__navrow">
            <div className="ob__navcell"><Stat label="Bedrock NAV" tone="senior" size="sm" value={<NumberTicker value={sNav} prefix="$" />} unit="protected" /></div>
            <div className="ob__navcell"><Stat label="Sediment NAV" tone="junior" size="sm" value={<NumberTicker value={jNav} prefix="$" />} unit="first-loss buffer" /></div>
            <div className="ob__navcell"><Stat label="Epoch" size="sm" value={<NumberTicker value={epoch} />} unit="settled on-chain" /></div>
          </div>
        </Panel>

        <div className="ob__side">
          <Panel eyebrow="Realized variance" title="varAcc vs trigger">
            <div className="ob__gaugewrap">
              <Gauge value={volRatio} min={0} max={2} size={168} valueText={volRatio.toFixed(2) + '×'} unit="of trigger" tone="senior"
                thresholds={[{ at: 1, color: 'var(--loss-400)' }]} />
              <div className="ob__gaugemeta">
                <Stat label="varAcc" size="sm" value={<NumberTicker value={varAcc} />} delta={volRatio >= 1 ? 'trigger crossed' : 'below trigger'} deltaDir={volRatio >= 1 ? 'up' : 'down'} />
                <Stat label="Emergency trigger" size="sm" value={trigger.toLocaleString()} unit="varAcc" />
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, maxWidth: '24ch' }}>
                  Variance crossed the trigger → Reactive closed the epoch early.
                </div>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Epoch clock" title="Next settlement">
            <EpochCountdown epoch={epoch} secondsLeft={OB.pool.secondsLeft} epochLength={(lp.epochLengthH || 24) * 3600} running onSettle={onSettle} />
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
