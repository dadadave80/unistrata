'use client';

import { Panel } from '@/components/Panel';
import { Stat } from '@/components/Stat';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { StrataCore } from '@/components/StrataCore';
import { Gauge } from '@/components/Gauge';
import { EpochCountdown } from '@/components/EpochCountdown';
import { EventFeed } from '@/components/EventFeed';
import { NumberTicker } from '@/components/NumberTicker';
import { useHookState } from '@/lib/useHookState';
import { useHookEvents } from '@/lib/useHookEvents';
import { TESTNET } from '@/lib/testnet';
import { EXPLORER } from '@/lib/contracts';
import { shortAddr } from '@/lib/format';
import { useShell } from '@/context/Shell';

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

export function Observatory() {
  const { core, runSettlement } = useShell();
  const live = useHookState(); // live UnistrataHook state (30s refetch) with snapshot fallback
  const liveFeed = useHookEvents(); // live on-chain event log (20s rescan) with verified-trail fallback
  const sNav = live.bedrockNav;
  const jNav = live.sedimentNav;
  const scaleMax = live.tvl ? live.tvl * 1.3 : 30000;
  const volRatio = live.varAcc / live.spikeThreshold;
  const hookShort = shortAddr(TESTNET.addresses.hook);
  const useLiveFeed = liveFeed.live && liveFeed.events.length > 0;
  const feedEvents = useLiveFeed ? liveFeed.events : TESTNET.events;
  const connected = live.live || liveFeed.live;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: obsCSS }} />
      <div className="ob__head">
        <div>
          <div className="ob__title">Observatory</div>
          <div className="ob__sub">{live.live ? 'live' : 'snapshot'} · tWETH/tUSDC · hook {hookShort} · Unichain Sepolia · measured from on-chain ticks, no external oracle</div>
        </div>
        <Badge variant={connected ? 'live' : 'neutral'} live={connected}>{connected ? 'Reactive Network connected' : 'RPC unreachable · snapshot'}</Badge>
      </div>

      <div className="ob__grid">
        <Panel padded>
          <div className="ob__corehead">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Unistrata Core · live capital structure</div>
            <Button size="sm" variant="senior" onClick={runSettlement}>Replay settlement</Button>
          </div>
          <StrataCore seniorNav={sNav} juniorNav={jNav} scaleMax={scaleMax} height={360} sweepKey={core.sweepKey} />
          <div className="ob__navrow">
            <div className="ob__navcell"><Stat label="Bedrock NAV" tone="senior" size="sm" value={<NumberTicker value={sNav} prefix="$" />} unit="protected" /></div>
            <div className="ob__navcell"><Stat label="Sediment NAV" tone="junior" size="sm" value={<NumberTicker value={jNav} prefix="$" />} unit="first-loss buffer" /></div>
            <div className="ob__navcell"><Stat label="Epoch" size="sm" value={<NumberTicker value={live.epoch} />} unit="settled on-chain" /></div>
          </div>
        </Panel>

        <div className="ob__side">
          <Panel eyebrow="Realized variance" title="varAcc vs trigger">
            <div className="ob__gaugewrap">
              <Gauge value={volRatio} min={0} max={2} size={168} valueText={volRatio.toFixed(2) + '×'} unit="of trigger" tone="senior"
                thresholds={[{ at: 1, color: 'var(--loss-400)' }]} />
              <div className="ob__gaugemeta">
                <Stat label="varAcc" size="sm" value={<NumberTicker value={live.varAcc} />} delta={volRatio >= 1 ? 'trigger crossed' : 'below trigger'} deltaDir={volRatio >= 1 ? 'up' : 'down'} />
                <Stat label="Emergency trigger" size="sm" value={live.spikeThreshold.toLocaleString()} unit="varAcc · RSC constant" />
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, maxWidth: '24ch' }}>
                  Variance crossed the trigger → Reactive closed the epoch early.
                </div>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Epoch clock" title="Next settlement">
            <EpochCountdown epoch={live.epoch} secondsLeft={live.secondsToSettle} epochLength={live.epochDuration} running />
          </Panel>
        </div>
      </div>

      <div className="ob__feedwrap">
        <EventFeed events={feedEvents} maxHeight={320}
          title={useLiveFeed ? 'Reactive Network · live on-chain feed' : 'Reactive Network · verified run (re-run 04–06 for live)'}
          explorerBase={EXPLORER} />
      </div>
    </div>
  );
}
