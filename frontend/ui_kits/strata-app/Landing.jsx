/* global React */
(function () {
const { Button, Badge, Panel, Stat, StrataCore, MoneyChart, NumberTicker } = window.StrataDesignSystem_8a0ec2;
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

function Landing({ core, onSettle, onNav }) {
  React.useEffect(() => {
    if (document.getElementById('lg-css')) return;
    const e = document.createElement('style'); e.id = 'lg-css'; e.textContent = landingCSS; document.head.appendChild(e);
  }, []);
  const crash = LD.scenarios.crash;

  return (
    <div>
      <section className="lg__hero">
        <div>
          <div className="lg__eyebrow">
            <Badge variant="senior" size="sm">Uniswap v4 hook</Badge>
            <Badge variant="live" live size="sm">Reactive settlement</Badge>
          </div>
          <h1 className="lg__thesis">
            LPs are forced sellers of volatility with no buyer.<br />Unistrata built the <em>buyer</em>.
          </h1>
          <p className="lg__sub">
            A liquidity pool, split into two layers like geological strata. Bedrock earns a fixed coupon priced
            from the pool's own measured volatility. Sediment underwrites the risk and keeps the premium.
          </p>
          <div className="lg__cta">
            <Button variant="primary" size="lg" onClick={() => onNav('deposit')}>Open Unistrata</Button>
            <span className="note">no oracle · no keepers · settles every 8h</span>
          </div>
        </div>

        <div className="lg__corewrap">
          <StrataCore seniorNav={core.seniorNav} juniorNav={core.juniorNav} scaleMax={LD.SCALE_MAX}
            height={392} sweepKey={core.sweepKey} />
          <div className="lg__corecap">
            <span className="c">epoch 47 · waterfall runs Bedrock-first</span>
            <Button size="sm" variant="senior" onClick={onSettle}>Run a settlement →</Button>
          </div>
        </div>
      </section>

      <section className="lg__metrics">
        <div className="lg__metric"><Stat label="Total value locked" size="md" value={<NumberTicker value={LD.TVL} prefix="$" />} /></div>
        <div className="lg__metric"><Stat label="Bedrock coupon" tone="senior" size="md" value={<NumberTicker value={7.2} decimals={1} suffix="%" />} unit="fixed APR" /></div>
        <div className="lg__metric"><Stat label="Sediment trailing" tone="junior" size="md" value={<NumberTicker value={23.4} decimals={1} suffix="%" />} unit="levered APR" /></div>
        <div className="lg__metric"><Stat label="Realized vol" size="md" value={<NumberTicker value={0.41} decimals={2} suffix="%" />} unit="σ² / day" delta="EWMA rising" deltaDir="up" /></div>
      </section>

      <section>
        <div className="lg__charthead">
          <div>
            <div className="lg__chartttl">Bedrock holds its line through a 40% swing</div>
            <div className="lg__chartsub">ETH falls $3,400 → $2,040 and recovers to $2,720 over 72 hours. Vanilla LP bleeds to impermanent loss; Bedrock tracks a calm coupon; Sediment absorbs the hit, then keeps the fees on the way back.</div>
          </div>
          <Button variant="secondary" onClick={() => onNav('simulator')}>Open the simulator</Button>
        </div>
        <Panel padded>
          <MoneyChart price={crash.price} series={crash.series} progress={1} height={340} />
        </Panel>
      </section>
    </div>
  );
}

window.Landing = Landing;
})();
