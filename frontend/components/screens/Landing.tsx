'use client';

import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Panel } from '@/components/Panel';
import { Stat } from '@/components/Stat';
import { StrataCore } from '@/components/StrataCore';
import { MoneyChart } from '@/components/MoneyChart';
import { NumberTicker } from '@/components/NumberTicker';
import { SCENARIOS } from '@/lib/sim-data';
import { useHookState } from '@/lib/useHookState';
import { useShell } from '@/context/Shell';

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
/* The metric tiles pass descriptive captions ("first-loss + fees", etc.) into Stat's inline
   \`unit\`. In a quarter-width cell those collide with the big number and wrap into fragments —
   force the unit onto its own line beneath the value. */
.lg__metric .st-stat__value { flex-wrap: wrap; row-gap: 6px; white-space: nowrap; }
.lg__metric .st-stat__unit { flex-basis: 100%; font-size: 11.5px; line-height: 1.45;
  letter-spacing: 0.02em; white-space: normal; }
.lg__charthead { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); }
.lg__chartttl { font-family: var(--font-display); font-size: 28px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary); }
.lg__chartsub { font-family: var(--font-sans); font-size: 14px; color: var(--text-tertiary); margin-top: 6px; max-width: 46ch; line-height: 1.5; }
@media (max-width: 1000px){ .lg__hero{ grid-template-columns: 1fr; } .lg__metrics{ grid-template-columns: repeat(2,1fr);} }
`;

export function Landing() {
  const { core, runSettlement, nav } = useShell();
  const crash = SCENARIOS.crash;
  const live = useHookState(); // real hook state (30s refetch) with the verified-snapshot fallback
  // The hero "live core" scales to the live capital structure (falls back to the sim scale when empty),
  // so large real deposits don't overflow a hardcoded axis.
  const scaleMax = Math.round((core.seniorNav + core.juniorNav) * 1.3) || crash.scaleMax;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: landingCSS }} />
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
            from the pool&apos;s own measured volatility. Sediment underwrites the risk and keeps the premium.
          </p>
          <div className="lg__cta">
            <Button variant="primary" size="lg" onClick={() => nav('/deposit')}>Open Unistrata</Button>
            <span className="note">no oracle · no keepers · settles every epoch</span>
          </div>
        </div>

        <div className="lg__corewrap">
          <StrataCore seniorNav={core.seniorNav} juniorNav={core.juniorNav} scaleMax={scaleMax}
            height={392} sweepKey={core.sweepKey} />
          <div className="lg__corecap">
            <span className="c">live core · waterfall runs Bedrock-first</span>
            <Button size="sm" variant="senior" onClick={runSettlement}>Run a settlement →</Button>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Badge variant={live.live ? 'live' : 'neutral'} live={live.live} size="sm">
          {live.live ? 'live · Unichain Sepolia' : 'verified snapshot'}
        </Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
          hook reads, refreshed every 30s · no oracle
        </span>
      </section>
      <section className="lg__metrics">
        <div className="lg__metric"><Stat label="Total value locked" size="md" value={<NumberTicker value={live.tvl} prefix="$" />} unit={`epoch ${live.epoch}`} /></div>
        <div className="lg__metric"><Stat label="Bedrock NAV" tone="senior" size="md" value={<NumberTicker value={live.bedrockNav} prefix="$" />} unit="protected first" /></div>
        <div className="lg__metric"><Stat label="Sediment NAV" tone="junior" size="md" value={<NumberTicker value={live.sedimentNav} prefix="$" />} unit="first-loss + fees" /></div>
        <div className="lg__metric"><Stat label="Realized variance" size="md" value={<NumberTicker value={live.varAccEpoch} />} unit="varAcc this epoch · on-chain ticks" delta={live.varAccEpoch >= live.spikeThreshold ? 'spike trigger crossed' : 'below trigger'} deltaDir={live.varAccEpoch >= live.spikeThreshold ? 'up' : undefined} /></div>
      </section>

      <section>
        <div className="lg__charthead">
          <div>
            <div className="lg__chartttl">Bedrock holds its line through a 50% crash</div>
            <div className="lg__chartsub">Replayed on-chain from the real May 2021 ETH crash (sim/out): tWETH falls $3,191 → $1,603 (−50%) and recovers to $1,889. Vanilla LP bleeds below HODL to impermanent loss; Bedrock&apos;s NAV holds flat — principal protected; Sediment absorbs the drawdown, then keeps the fees on the recovery.</div>
          </div>
          <Button variant="secondary" onClick={() => nav('/simulator')}>Open the simulator</Button>
        </div>
        <Panel padded>
          <MoneyChart price={crash.price} series={crash.series} progress={1} height={340} />
        </Panel>
      </section>
    </div>
  );
}
