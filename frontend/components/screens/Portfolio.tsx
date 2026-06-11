'use client';

import { formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Panel } from '@/components/Panel';
import { Stat } from '@/components/Stat';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { StrataCore } from '@/components/StrataCore';
import { NumberTicker } from '@/components/NumberTicker';
import { ShieldCheck, Flame, Wallet, Clock, Check } from 'lucide-react';
import { BEDROCK_TOKEN, SEDIMENT_TOKEN, erc20Abi, CHAIN_ID } from '@/lib/contracts';
import { useHookState } from '@/lib/useHookState';
import { useWithdrawRequests } from '@/lib/useWithdrawRequests';
import { useShell } from '@/context/Shell';
import { shortAddr } from '@/lib/format';

const psCSS = `
.ps__head { display:flex; align-items:flex-end; justify-content:space-between; gap: var(--space-6); margin-bottom: var(--space-7); }
.ps__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.ps__sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); margin-top: 7px; letter-spacing: 0.02em; }
.ps__grid { display:grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-6); align-items: start; }
.ps__corehead { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-5); }
.ps__navrow { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; margin-top: var(--space-5); }
.ps__navcell { background: var(--bg-sunken); padding: 13px 15px; }
.ps__side { display:flex; flex-direction: column; gap: var(--space-6); }
.ps__total { display:flex; align-items:baseline; justify-content:space-between; gap: var(--space-4); margin-bottom: var(--space-5); }
.ps__totval { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 38px; font-weight: 500; color: var(--text-primary); line-height:1; }
.ps__est { font-family: var(--font-mono); font-size: 10.5px; color: var(--text-tertiary); margin-top: 7px; max-width: 32ch; line-height: 1.45; }
.ps__bar { display:flex; height: 12px; border-radius: var(--radius-full); overflow:hidden; background: var(--ink-700); margin: var(--space-5) 0; }
.ps__bar i { display:block; height:100%; }
.ps__bar .be { background: var(--senior-400); }
.ps__bar .se { background: var(--junior-400); }
.ps__rows { display:flex; flex-direction:column; gap:1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; }
.ps__row { display:grid; grid-template-columns: 28px 1fr auto; gap: 12px; align-items:center; background: var(--bg-sunken); padding: 14px 15px; }
.ps__row svg { width:17px; height:17px; }
.ps__row .be { color: var(--senior-300); }
.ps__row .se { color: var(--junior-300); }
.ps__rowttl { font-family: var(--font-sans); font-size: 13.5px; font-weight:500; color: var(--text-primary); }
.ps__rowsub { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); margin-top: 3px; }
.ps__rowval { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 15px; color: var(--text-primary); text-align:right; }
.ps__rowpct { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align:right; margin-top: 3px; }
.ps__empty { font-family: var(--font-sans); font-size: 13.5px; color: var(--text-secondary); line-height:1.55; padding: 6px 2px var(--space-5); }
.ps__wq { display:flex; align-items:center; justify-content:space-between; gap: var(--space-4); font-family: var(--font-mono); font-size: 12.5px; color: var(--text-secondary); }
.ps__wq b { color: var(--senior-200); font-weight:500; }
@media (max-width: 1000px){ .ps__grid{ grid-template-columns: 1fr; } }
`;

const ZERO = '0x0000000000000000000000000000000000000000';

export function Portfolio() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { core, runSettlement, nav } = useShell();
  const live = useHookState(); // live pool state (30s refetch) with snapshot fallback

  // Share balances + tranche supplies → price each holding at the live NAV per share.
  const { data: reads } = useReadContracts({
    contracts: [
      { address: BEDROCK_TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: SEDIMENT_TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: BEDROCK_TOKEN, abi: erc20Abi, functionName: 'totalSupply', chainId: CHAIN_ID },
      { address: SEDIMENT_TOKEN, abi: erc20Abi, functionName: 'totalSupply', chainId: CHAIN_ID },
    ],
    query: { enabled: isConnected, refetchInterval: 30_000 },
  });
  const ok = (i: number) => Boolean(reads && reads[i].status === 'success');
  const num = (i: number) => (ok(i) ? Number(formatUnits(reads![i].result as bigint, 18)) : 0);
  const beBal = num(0);
  const seBal = num(1);
  const beSupply = num(2);
  const seSupply = num(3);

  // value = (your shares / tranche shares outstanding) × tranche NAV  (ERC4626-style share pricing)
  const beValue = beSupply > 0 ? (beBal / beSupply) * live.bedrockNav : 0;
  const seValue = seSupply > 0 ? (seBal / seSupply) * live.sedimentNav : 0;
  const total = beValue + seValue;
  const bePct = total > 0 ? (beValue / total) * 100 : 0;
  const sePct = total > 0 ? (seValue / total) * 100 : 0;
  const shareOfPool = live.tvl > 0 ? (total / live.tvl) * 100 : 0;
  const hasPosition = beBal > 1e-9 || seBal > 1e-9;

  // Honest pricing: the $ figures are trustworthy only when the tranche supplies were read AND the NAVs
  // are live. Otherwise we'd multiply current supply by a stale snapshot NAV, or show a real position as
  // "$0" when a supply read fails — so in those states the value is marked estimated ("≈") or withheld.
  const priced = ok(2) && ok(3);          // both supplies read → a number can be computed at all
  const valueLive = live.live && priced;  // the number reflects current on-chain state
  const sign = valueLive ? '$' : '≈ $';
  // Round once so the per-tranche rows always reconcile with the headline total.
  const beR = Math.round(beValue);
  const seR = Math.round(seValue);
  const totalR = beR + seR;

  const { requests } = useWithdrawRequests(address as `0x${string}` | undefined, live.epoch);
  const queued = requests.filter((r) => !r.claimed);
  const claimable = queued.filter((r) => r.eligible).length;

  const scaleMax = live.tvl ? live.tvl * 1.3 : 30000;
  const volRatio = live.spikeThreshold > 0 ? live.varAcc / live.spikeThreshold : 0;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: psCSS }} />
      <div className="ps__head">
        <div>
          <div className="ps__title">Portfolio</div>
          <div className="ps__sub">
            {isConnected ? <>your position · {address ? shortAddr(address) : ''} · </> : null}
            {live.live ? 'live' : 'snapshot'} · tWETH/tUSDC · valued at the current epoch NAV
          </div>
        </div>
        <Badge variant={live.live ? 'live' : 'neutral'} live={live.live}>{live.live ? 'Reactive Network connected' : 'RPC unreachable · snapshot'}</Badge>
      </div>

      <div className="ps__grid">
        {/* Pool chart — the live capital structure */}
        <Panel padded>
          <div className="ps__corehead">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Pool · live capital structure</div>
            <Button size="sm" variant="senior" onClick={runSettlement}>Replay settlement</Button>
          </div>
          <StrataCore seniorNav={live.bedrockNav} juniorNav={live.sedimentNav} scaleMax={scaleMax} height={360} sweepKey={core.sweepKey} />
          <div className="ps__navrow">
            <div className="ps__navcell"><Stat label="Total value locked" size="sm" value={<NumberTicker value={live.tvl} prefix="$" />} unit={`epoch ${live.epoch}`} /></div>
            <div className="ps__navcell"><Stat label="Bedrock NAV" tone="senior" size="sm" value={<NumberTicker value={live.bedrockNav} prefix="$" />} /></div>
            <div className="ps__navcell"><Stat label="Sediment NAV" tone="junior" size="sm" value={<NumberTicker value={live.sedimentNav} prefix="$" />} /></div>
          </div>
          <div className="ps__navrow" style={{ marginTop: 1 }}>
            <div className="ps__navcell"><Stat label="Realized variance" size="sm" value={<NumberTicker value={live.varAcc} />} unit="varAcc" delta={volRatio >= 1 ? 'spike trigger crossed' : `${(volRatio * 100).toFixed(0)}% of trigger`} deltaDir={volRatio >= 1 ? 'up' : undefined} /></div>
            <div className="ps__navcell"><Stat label="Bedrock outstanding" size="sm" value={<NumberTicker value={beSupply} decimals={0} />} unit="BEDR" /></div>
            <div className="ps__navcell"><Stat label="Sediment outstanding" size="sm" value={<NumberTicker value={seSupply} decimals={0} />} unit="SEDI" /></div>
          </div>
        </Panel>

        {/* Your position */}
        <div className="ps__side">
          <Panel padded eyebrow="Your position" title="Holdings, valued at NAV">
            {!isConnected ? (
              <div>
                <p className="ps__empty">Connect a wallet to see your BEDR / SEDI holdings, their current value, and your share of the pool.</p>
                <Button variant="primary" size="lg" fullWidth onClick={() => open()}><Wallet size={16} /> Connect wallet</Button>
              </div>
            ) : !hasPosition ? (
              <div>
                <p className="ps__empty">No position yet. Deposit into Bedrock for a protected, variance-priced coupon — or Sediment to underwrite the volatility and keep the fees.</p>
                <Button variant="primary" size="lg" fullWidth onClick={() => nav('/deposit')}>Open a position →</Button>
              </div>
            ) : (
              <>
                <div className="ps__total">
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Total value</div>
                    <div className="ps__totval">{!priced ? '—' : <>{sign}<NumberTicker value={totalR} /></>}</div>
                    {!valueLive && (
                      <div className="ps__est">{!priced
                        ? 'pool supply unavailable — your shares are shown below'
                        : 'estimated at the last-settled NAV · reconnecting to live'}</div>
                    )}
                  </div>
                  {valueLive && <Badge variant="neutral" size="sm">{shareOfPool < 0.1 ? '<0.1' : shareOfPool.toFixed(1)}% of pool</Badge>}
                </div>

                <div className="ps__bar" title={`Bedrock ${bePct.toFixed(0)}% · Sediment ${sePct.toFixed(0)}%`}>
                  <i className="be" style={{ width: `${bePct}%` }} />
                  <i className="se" style={{ width: `${sePct}%` }} />
                </div>

                <div className="ps__rows">
                  <div className="ps__row">
                    <ShieldCheck className="be" />
                    <div>
                      <div className="ps__rowttl">Bedrock · BEDR</div>
                      <div className="ps__rowsub">{beBal.toFixed(2)} shares · senior, protected</div>
                    </div>
                    <div>
                      <div className="ps__rowval">{priced ? `${sign}${beR.toLocaleString()}` : '—'}</div>
                      <div className="ps__rowpct">{priced ? `${bePct.toFixed(0)}%` : 'shares only'}</div>
                    </div>
                  </div>
                  <div className="ps__row">
                    <Flame className="se" />
                    <div>
                      <div className="ps__rowttl">Sediment · SEDI</div>
                      <div className="ps__rowsub">{seBal.toFixed(2)} shares · junior, first-loss + fees</div>
                    </div>
                    <div>
                      <div className="ps__rowval">{priced ? `${sign}${seR.toLocaleString()}` : '—'}</div>
                      <div className="ps__rowpct">{priced ? `${sePct.toFixed(0)}%` : 'shares only'}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Panel>

          {isConnected && (
            <Panel padded eyebrow="Queued withdrawals" title="Pending exits">
              {queued.length === 0 ? (
                <div className="ps__wq">
                  <span>No queued withdrawals.</span>
                  <Button size="sm" variant="secondary" onClick={() => nav('/withdraw')}>Withdraw →</Button>
                </div>
              ) : (
                <div className="ps__wq">
                  <span>
                    <b>{queued.length}</b> queued{claimable > 0 ? <> · <b>{claimable}</b> claimable now</> : null}
                    {claimable === 0 ? <Clock size={12} style={{ verticalAlign: '-2px', marginLeft: 6, opacity: 0.6 }} /> : <Check size={12} style={{ verticalAlign: '-2px', marginLeft: 6, color: 'var(--senior-300)' }} />}
                  </span>
                  <Button size="sm" variant={claimable > 0 ? 'senior' : 'secondary'} onClick={() => nav('/withdraw')}>{claimable > 0 ? 'Claim →' : 'Manage →'}</Button>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
