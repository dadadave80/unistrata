'use client';

import React from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useReadContracts, useWriteContract, useSignTypedData, usePublicClient, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Panel } from '@/components/Panel';
import { NumberTicker } from '@/components/NumberTicker';
import { ShieldCheck, Flame, LogOut, Clock, Check } from 'lucide-react';
import {
  HOOK_ADDRESS, BEDROCK_TOKEN, SEDIMENT_TOKEN, erc20Abi, hookAbi, CHAIN_ID, txUrl,
} from '@/lib/contracts';
import { buildErc20Permit, splitSig, permitDeadline } from '@/lib/eip2612';
import { useWithdrawRequests } from '@/lib/useWithdrawRequests';
import { shortAddr } from '@/lib/format';

const wdCSS = `
.wd__head { margin-bottom: var(--space-8); }
.wd__title { font-family: var(--font-display); font-size: 36px; font-weight: 500; letter-spacing: -0.015em; color: var(--text-primary); }
.wd__sub { font-family: var(--font-sans); font-size: 16px; color: var(--text-secondary); margin-top: 8px; max-width: 62ch; line-height: 1.5; }
.wd__grid { display: grid; grid-template-columns: 1fr 0.92fr; gap: var(--space-8); align-items: start; }
.wd__ticket { position: sticky; top: 84px; }
.wd__toggle { display:inline-flex; background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 3px; gap: 3px; margin-bottom: var(--space-6); }
.wd__tgl { font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--text-secondary); background: transparent; border: none; border-radius: var(--radius-sm); padding: 8px 16px; cursor: pointer; }
.wd__tgl[data-on="true"] { background: var(--surface-raised); color: var(--text-primary); box-shadow: var(--elev-1); }
.wd__field { display: flex; flex-direction: column; gap: 8px; }
.wd__fieldlabel { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.wd__input { display: flex; align-items: center; gap: 10px; background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 14px; }
.wd__input:focus-within { border-color: var(--senior-600); }
.wd__input input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 24px; font-weight: 500; }
.wd__input .tok { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 5px 11px; }
.wd__bal { display:flex; align-items:center; justify-content:space-between; font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); }
.wd__bal button { background:none; border:none; color: var(--senior-300); cursor:pointer; border-bottom:1px dotted var(--senior-700); font-family: var(--font-mono); font-size: 12px; }
.wd__note { display:flex; gap:10px; align-items:flex-start; padding: 12px 14px; background: var(--surface-card); border:1px solid var(--border-subtle); border-radius: var(--radius-md); }
.wd__note svg { width:16px; height:16px; color: var(--text-tertiary); flex:none; margin-top:1px; }
.wd__note p { font-family: var(--font-sans); font-size: 12.5px; color: var(--text-secondary); line-height:1.5; }
.wd__wallet { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12.5px; color: var(--text-secondary); background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 6px 12px; }
.wd__wallet .d { width: 7px; height: 7px; border-radius: 50%; background: var(--senior-400); box-shadow: 0 0 8px 0 var(--senior-400); flex: none; }
.wd__wallet button { background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 0; display: inline-flex; }
.wd__reqs { display:flex; flex-direction:column; gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow:hidden; }
.wd__req { display:grid; grid-template-columns: 18px 1fr auto; gap: 12px; align-items:center; background: var(--bg-sunken); padding: 13px 15px; }
.wd__req .mk { width:9px; height:9px; border-radius:3px; }
.wd__req .mk--s { background: var(--senior-400); }
.wd__req .mk--j { background: var(--junior-400); }
.wd__reqmeta { min-width:0; }
.wd__reqttl { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.wd__reqsub { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); margin-top: 3px; }
.wd__empty { font-family: var(--font-sans); font-size: 13px; color: var(--text-tertiary); padding: 18px 4px; line-height:1.5; }
.wd__deptx { display:flex; align-items:center; justify-content:center; gap:7px; font-family: var(--font-mono); font-size: 11px; color: var(--senior-200); margin-top: var(--space-4); }
.wd__deptx a { color: var(--senior-300); border-bottom: 1px dotted var(--senior-700); }
.wd__err { font-family: var(--font-mono); font-size: 11px; color: var(--loss-300); text-align:center; margin-top: var(--space-4); line-height:1.5; }
@media (max-width: 1000px){ .wd__grid{ grid-template-columns: 1fr; } .wd__ticket{ position: static; } }
`;

const ZERO = '0x0000000000000000000000000000000000000000';

export function Withdraw() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();
  const client = usePublicClient({ chainId: CHAIN_ID });
  const walletChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const [tranche, setTranche] = React.useState<'senior' | 'junior'>('junior');
  const [shares, setShares] = React.useState(0);
  const [busy, setBusy] = React.useState<false | 'sign' | 'request' | 'claim'>(false);
  const [tx, setTx] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const isSenior = tranche === 'senior';

  // share balances + current epoch. EIP-2612 needs no standing allowance, so none is read.
  const { data: reads, refetch: refetchReads } = useReadContracts({
    contracts: [
      { address: BEDROCK_TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: SEDIMENT_TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: HOOK_ADDRESS, abi: hookAbi, functionName: 'epochId', chainId: CHAIN_ID },
    ],
    query: { enabled: isConnected, refetchInterval: 30_000 },
  });
  const ok = (i: number) => reads && reads[i].status === 'success';
  const beBal = ok(0) ? Number(formatUnits(reads![0].result as bigint, 18)) : 0;
  const seBal = ok(1) ? Number(formatUnits(reads![1].result as bigint, 18)) : 0;
  const epoch = ok(2) ? Number(reads![2].result as bigint) : 0;

  const bal = isSenior ? beBal : seBal;
  const sym = isSenior ? 'BEDR' : 'SEDI';

  const { requests, refetch: refetchReqs } = useWithdrawRequests(address as `0x${string}` | undefined, epoch);

  async function refresh() { await Promise.all([refetchReads(), refetchReqs()]); }

  async function requestWithdrawal() {
    if (!address) { open(); return; }
    setErr(null); setTx(null);
    try {
      // Pin the signing chain before signTypedData — the EIP-2612 domain is chain- and token-specific, so
      // a wrong-chain signature would not verify on the hook (review #4; this screen had no guard before).
      if (walletChainId !== CHAIN_ID) await switchChainAsync({ chainId: CHAIN_ID });
      if (!client) throw new Error('No RPC client for the configured chain.');
      const shareAmount = parseUnits(String(shares), 18);
      const token = isSenior ? BEDROCK_TOKEN : SEDIMENT_TOKEN;

      // Sign an EIP-2612 permit on the SHARE token (spender = the hook) so the escrow needs no standing
      // approval — request in a single tx. Read name + current nonce fresh for a matching, non-stale sig.
      setBusy('sign');
      const [name, nonce] = await Promise.all([
        client.readContract({ address: token, abi: erc20Abi, functionName: 'name' }) as Promise<string>,
        client.readContract({ address: token, abi: erc20Abi, functionName: 'nonces', args: [address] }) as Promise<bigint>,
      ]);
      const deadline = permitDeadline();
      const p = buildErc20Permit({ tokenName: name, token, chainId: CHAIN_ID, owner: address, spender: HOOK_ADDRESS, value: shareAmount, nonce, deadline });
      const signature = await signTypedDataAsync({ domain: p.domain, types: p.types, primaryType: p.primaryType, message: p.message });
      const { v, r, s } = splitSig(signature);

      setBusy('request');
      const h = await writeContractAsync({ address: HOOK_ADDRESS, abi: hookAbi, functionName: 'requestWithdrawWithPermit', args: [isSenior, shareAmount, deadline, v, r, s], chainId: CHAIN_ID });
      setTx(h);
      await refresh();
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setErr(m.length > 140 ? m.slice(0, 140) + '…' : m);
    } finally { setBusy(false); }
  }

  async function claim(id: number) {
    if (!address) { open(); return; }
    setErr(null); setTx(null);
    try {
      setBusy('claim');
      const h = await writeContractAsync({ address: HOOK_ADDRESS, abi: hookAbi, functionName: 'claim', args: [BigInt(id)], chainId: CHAIN_ID });
      setTx(h);
      await refresh();
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setErr(m.length > 140 ? m.slice(0, 140) + '…' : m);
    } finally { setBusy(false); }
  }

  let label: string; let disabled = false; let action: () => void = requestWithdrawal;
  if (!isConnected) { label = 'Connect wallet to withdraw'; action = () => open(); }
  else if (!(shares > 0)) { label = 'Enter a share amount'; disabled = true; }
  else if (shares > bal + 1e-9) { label = `Only ${bal.toFixed(2)} ${sym} available`; disabled = true; }
  else if (busy === 'sign') { label = `Sign ${sym} permit in wallet…`; disabled = true; }
  else if (busy === 'request') { label = 'Confirm request in wallet…'; disabled = true; }
  else if (busy === 'claim') { label = 'Claiming…'; disabled = true; }
  else { label = `Request ${sym} withdrawal`; }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: wdCSS }} />
      <div className="wd__head">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
          <div>
            <div className="wd__title">Withdraw</div>
            <p className="wd__sub">Withdrawals are queued and settle at an epoch boundary — Bedrock unlocks next epoch, Sediment after two, so a junior can&apos;t exit just ahead of the volatility it&apos;s paid to absorb.</p>
          </div>
          {isConnected && (
            <span className="wd__wallet"><span className="d" />{address ? shortAddr(address) : ''}<button title="Manage" onClick={() => open()}><LogOut size={14} /></button></span>
          )}
        </div>
      </div>

      <div className="wd__grid">
        <div>
          <Panel eyebrow="Your tranche positions" title="Queued withdrawals">
            {!isConnected ? (
              <div className="wd__empty">Connect a wallet to see your BEDR / SEDI positions and any queued withdrawals.</div>
            ) : requests.length === 0 ? (
              <div className="wd__empty">No queued withdrawals. Request one on the right — it appears here with its unlock epoch, then becomes claimable once the epoch settles.</div>
            ) : (
              <div className="wd__reqs">
                {requests.map((r) => (
                  <div className="wd__req" key={r.id}>
                    <span className={`mk ${r.isBedrock ? 'mk--s' : 'mk--j'}`} />
                    <div className="wd__reqmeta">
                      <div className="wd__reqttl">{r.shares.toFixed(2)} {r.isBedrock ? 'BEDR' : 'SEDI'}</div>
                      <div className="wd__reqsub">
                        {r.claimed ? 'claimed' : r.eligible ? 'claimable now' : `locked until epoch ${r.eligibleEpoch} (now ${epoch})`}
                      </div>
                    </div>
                    {r.claimed ? (
                      <Badge variant="neutral" size="sm"><Check size={12} /> done</Badge>
                    ) : r.eligible ? (
                      <Button size="sm" variant="senior" disabled={busy === 'claim'} onClick={() => claim(r.id)}>{busy === 'claim' ? 'Claiming…' : 'Claim'}</Button>
                    ) : (
                      <Badge variant="neutral" size="sm"><Clock size={12} /> epoch {r.eligibleEpoch}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="wd__ticket">
          <Panel accent={isSenior ? 'senior' : 'junior'} eyebrow="Request a withdrawal" title={isSenior ? 'Bedrock · senior shares' : 'Sediment · junior shares'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="wd__toggle">
                <button className="wd__tgl" data-on={isSenior} onClick={() => { setTranche('senior'); setShares(0); }}>Bedrock</button>
                <button className="wd__tgl" data-on={!isSenior} onClick={() => { setTranche('junior'); setShares(0); }}>Sediment</button>
              </div>

              <div className="wd__field">
                <span className="wd__fieldlabel">Shares to redeem</span>
                <div className="wd__input">
                  <input type="text" inputMode="decimal" value={shares ? shares.toLocaleString('en-US') : ''} placeholder="0"
                    onChange={(e) => { const v = Number(e.target.value.replace(/[^0-9.]/g, '')); setShares(Number.isFinite(v) ? v : 0); }} />
                  <span className="tok">{sym}</span>
                </div>
                <div className="wd__bal">
                  <span>balance {bal.toFixed(2)} {sym}</span>
                  <button onClick={() => setShares(Number(bal.toFixed(6)))}>Max</button>
                </div>
              </div>

              <div className="wd__note">
                {isSenior ? <ShieldCheck /> : <Flame />}
                <p>{isSenior
                  ? 'Bedrock redeems at the next epoch boundary (epoch + 1). You receive your share-proportional slice of pool assets at settlement.'
                  : 'Sediment redeems after two epochs (epoch + 2) — the lockup keeps junior capital underwriting through at least one full settlement.'}</p>
              </div>

              <Button variant={isSenior ? 'senior' : 'junior'} size="lg" fullWidth disabled={disabled} onClick={action}>{label}</Button>

              {tx ? (
                <div className="wd__deptx">Submitted · <a href={txUrl(tx)} target="_blank" rel="noreferrer">{shortAddr(tx)} ↗</a></div>
              ) : err ? (
                <div className="wd__err">{err}</div>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
