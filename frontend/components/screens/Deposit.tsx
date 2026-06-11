'use client';

import React from 'react';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { useAccount, useReadContracts, useWriteContract, useSignTypedData } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Panel } from '@/components/Panel';
import { TrancheCard } from '@/components/TrancheCard';
import { NumberTicker } from '@/components/NumberTicker';
import { ShieldCheck, Flame, LogOut } from 'lucide-react';
import { HOOK_ADDRESS, TOKEN0, TOKEN1, TOKEN_WETH, TOKEN_USDC, erc20Abi, hookAbi, CHAIN_ID, txUrl } from '@/lib/contracts';
import { PERMIT2_ADDRESS, buildPermitBatch } from '@/lib/permit2';
import { fmtUsd, shortAddr } from '@/lib/format';
import { usePoolPrice } from '@/lib/usePoolPrice';

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
.dp__chips { display: flex; gap: 7px; flex-wrap: wrap; }
.dp__chip { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); background: var(--surface-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 9px; cursor: pointer; transition: all var(--dur-fast) var(--ease-out); }
.dp__chip:hover { border-color: var(--border-strong); color: var(--text-primary); }
.dp__summary { display: flex; flex-direction: column; gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow: hidden; }
.dp__line { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-sunken); }
.dp__line .k { font-family: var(--font-sans); font-size: 13.5px; color: var(--text-secondary); }
.dp__line .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); }
.dp__line--em .v { font-size: 18px; }
.dp__cover { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: var(--senior-950); border: 1px solid var(--senior-800); border-radius: var(--radius-md); }
.dp__cover svg { width: 16px; height: 16px; color: var(--senior-300); flex: none; margin-top: 1px; }
.dp__cover p { font-family: var(--font-sans); font-size: 12.5px; color: var(--senior-100); line-height: 1.5; }
.dp__cover.j { background: var(--junior-950); border-color: var(--junior-800); }
.dp__cover.j svg { color: var(--junior-300); }
.dp__cover.j p { color: var(--junior-100); }
.dp__foot { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align: center; line-height: 1.6; }
.dp__wallet { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12.5px; color: var(--text-secondary);
  background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 6px 12px; }
.dp__wallet .d { width: 7px; height: 7px; border-radius: 50%; background: var(--senior-400); box-shadow: 0 0 8px 0 var(--senior-400); flex: none; }
.dp__wallet button { background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 0; display: inline-flex; }
.dp__balrow { display:flex; align-items:center; gap: var(--space-6); flex-wrap: wrap; }
.dp__bal { display: flex; flex-direction: column; gap: 3px; }
.dp__bal .k { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.dp__bal .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums; font-size: 17px; font-weight: 500; color: var(--text-primary); }
.dp__helper { font-family: var(--font-sans); font-size: 13px; color: var(--text-tertiary); max-width: 56ch; line-height: 1.5; }
.dp__deptx { display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--font-mono); font-size: 11px; color: var(--senior-200); line-height: 1.5; text-align: center; }
.dp__deptx a { color: var(--senior-300); border-bottom: 1px dotted var(--senior-700); }
.dp__err { font-family: var(--font-mono); font-size: 11px; color: var(--loss-300); text-align:center; line-height:1.5; }
@media (max-width: 1000px){ .dp__grid{ grid-template-columns: 1fr; } .dp__ticket{ position: static; } }
`;

export function Deposit() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();

  const [tranche, setTranche] = React.useState<'senior' | 'junior'>('senior');
  const [amount, setAmount] = React.useState(2000);
  const [depTx, setDepTx] = React.useState<string | null>(null);
  const [depBusy, setDepBusy] = React.useState<false | 'approve' | 'sign' | 'deposit'>(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [faucetBusy, setFaucetBusy] = React.useState(false);
  const [faucetTx, setFaucetTx] = React.useState<string | null>(null);

  const isSenior = tranche === 'senior';
  const accent = isSenior ? 'senior' : 'junior';
  const sharePrice = isSenior ? 1.0 : 0.97;
  const shares = amount / sharePrice;
  // Live pool price (tUSDC per tWETH) from the v4 PoolManager's slot0 — never a hardcoded 3000, which
  // would mis-pair the deposit legs once the pool moves off the seed price (review #17). Falls back to
  // the seed price only while the read is loading.
  const livePrice = usePoolPrice() ?? 3000;

  // live balances + current Permit2 allowances of the connected wallet (allowance is to Permit2, never the hook)
  const ZERO = '0x0000000000000000000000000000000000000000';
  const { data: bals, refetch: refetchBals } = useReadContracts({
    contracts: [
      { address: TOKEN_USDC, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: TOKEN_WETH, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: TOKEN0, abi: erc20Abi, functionName: 'allowance', args: [address ?? ZERO, PERMIT2_ADDRESS], chainId: CHAIN_ID },
      { address: TOKEN1, abi: erc20Abi, functionName: 'allowance', args: [address ?? ZERO, PERMIT2_ADDRESS], chainId: CHAIN_ID },
    ],
    query: { enabled: isConnected },
  });
  const usdcBal = bals && bals[0].status === 'success' ? Number(formatUnits(bals[0].result as bigint, 6)) : 0;
  const wethBal = bals && bals[1].status === 'success' ? Number(formatUnits(bals[1].result as bigint, 18)) : 0;
  const allow0 = bals && bals[2].status === 'success' ? (bals[2].result as bigint) : 0n;
  const allow1 = bals && bals[3].status === 'success' ? (bals[3].result as bigint) : 0n;

  // Testnet faucet — DemoERC20.mint is permissionless, so the wallet mints to itself.
  // Mints 10,000 tUSDC (+ tWETH so a balanced deposit actually works).
  async function claimFaucet() {
    if (!address) { open(); return; }
    setFaucetBusy(true); setErr(null); setFaucetTx(null);
    try {
      await writeContractAsync({ address: TOKEN_USDC, abi: erc20Abi, functionName: 'mint', args: [address, parseUnits('10000', 6)], chainId: CHAIN_ID });
      const tx = await writeContractAsync({ address: TOKEN_WETH, abi: erc20Abi, functionName: 'mint', args: [address, parseUnits('4', 18)], chainId: CHAIN_ID });
      setFaucetTx(tx);
      await refetchBals();
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setErr(m.length > 140 ? m.slice(0, 140) + '…' : m);
    } finally {
      setFaucetBusy(false);
    }
  }

  async function permitAndDeposit() {
    if (!address) { open(); return; }
    setErr(null); setDepTx(null);
    try {
      // The "Amount in" field is denominated in tUSDC; pair it with ~balanced tWETH at the LIVE pool price.
      // Map each leg to token0/token1 BY IDENTITY (the pool sorts tokens by address) so the Permit2 batch is
      // always ordered [currency0, currency1] — a future re-deploy that reorders tokens can't silently break it.
      const usdcAmount = parseUnits(String(amount), 6); // tUSDC, 6 dec
      const wethAmount = parseUnits((amount / livePrice).toFixed(18), 18); // tWETH, 18 dec (live-priced)
      const amount0Max = (TOKEN0 as string) === TOKEN_USDC ? usdcAmount : wethAmount;
      const amount1Max = (TOKEN1 as string) === TOKEN_USDC ? usdcAmount : wethAmount;

      // One-time unlimited approval to the audited, immutable canonical Permit2 (never to the hook).
      // After this, deposits are just a signature — no further approvals. The hook can only ever pull
      // via a fresh, exact-amount, deadline-bounded Permit2 signature, so the standing allowance is inert
      // without the user's explicit sign-off each time.
      if (allow0 < amount0Max) {
        setDepBusy('approve');
        await writeContractAsync({ address: TOKEN0, abi: erc20Abi, functionName: 'approve', args: [PERMIT2_ADDRESS, maxUint256], chainId: CHAIN_ID });
      }
      if (allow1 < amount1Max) {
        setDepBusy('approve');
        await writeContractAsync({ address: TOKEN1, abi: erc20Abi, functionName: 'approve', args: [PERMIT2_ADDRESS, maxUint256], chainId: CHAIN_ID });
      }

      // Sign the exact-amount batch transfer (spender = the hook). Gasless.
      setDepBusy('sign');
      const p = buildPermitBatch({ token0: TOKEN0, amount0Max, token1: TOKEN1, amount1Max, spender: HOOK_ADDRESS, chainId: CHAIN_ID });
      const signature = await signTypedDataAsync({
        domain: p.domain, types: p.types, primaryType: p.primaryType, message: p.message,
      });

      // The hook pulls the maxes via Permit2, deposits, mints shares to us, and refunds the unused remainder.
      setDepBusy('deposit');
      const tx = await writeContractAsync({
        address: HOOK_ADDRESS, abi: hookAbi, functionName: 'depositWithPermit',
        // viem can't infer the nested tuple[] component type (collapses `permitted` to never[]); the
        // runtime struct shape is correct and verified by the on-chain depositWithPermit test.
        args: [isSenior, p.permitStruct as never, signature], chainId: CHAIN_ID,
      });
      setDepTx(tx);
      await refetchBals();
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setErr(m.length > 140 ? m.slice(0, 140) + '…' : m);
    } finally {
      setDepBusy(false);
    }
  }

  let depLabel: string; let depDisabled = false; let depAction: () => void = permitAndDeposit;
  if (!isConnected) { depLabel = 'Connect wallet to deposit'; depAction = () => open(); }
  else if (!(amount > 0)) { depLabel = 'Enter an amount'; depDisabled = true; }
  else if (depBusy === 'approve') { depLabel = 'Approve Permit2 in wallet…'; depDisabled = true; }
  else if (depBusy === 'sign') { depLabel = 'Sign the deposit…'; depDisabled = true; }
  else if (depBusy === 'deposit') { depLabel = 'Confirm deposit in wallet…'; depDisabled = true; }
  else { depLabel = isSenior ? 'Sign & deposit to Bedrock' : 'Sign & deposit to Sediment'; }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: depositCSS }} />
      <div className="dp__head">
        <div className="dp__title">Choose your layer</div>
        <p className="dp__sub">The same instrument, two temperaments. Bedrock is the senior layer — fixed coupon, protected first. Sediment is the junior layer — levered yield in exchange for absorbing loss first.</p>
      </div>

      <div style={{ marginBottom: 'var(--space-7)' }}>
        <Panel eyebrow="Testnet faucet" title="Fund your test wallet"
          actions={isConnected
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="dp__wallet"><span className="d" />{address ? shortAddr(address) : ''}<button title="Manage" onClick={() => open()}><LogOut size={14} /></button></span>
                <Button variant="secondary" size="sm" disabled={faucetBusy} onClick={claimFaucet}>{faucetBusy ? 'Minting…' : 'Claim test tokens'}</Button>
              </div>
            : <Button variant="secondary" size="sm" onClick={() => open()}>Connect wallet</Button>}>
          {isConnected ? (
            <div className="dp__balrow">
              <Badge variant="neutral" size="sm">Unichain Sepolia</Badge>
              <div className="dp__bal"><span className="k">tUSDC</span><span className="v"><NumberTicker value={usdcBal} decimals={0} /></span></div>
              <div className="dp__bal"><span className="k">tWETH</span><span className="v"><NumberTicker value={wethBal} decimals={3} /></span></div>
              {faucetTx
                ? <span className="dp__deptx">Minted 10,000 tUSDC + 4 tWETH · <a href={txUrl(faucetTx)} target="_blank" rel="noreferrer">{shortAddr(faucetTx)} ↗</a></span>
                : <p className="dp__helper">Claim mints 10,000 tUSDC + 4 tWETH to your wallet (DemoERC20, permissionless). Then deposit to a layer below.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <Badge variant="neutral" size="sm">Unichain Sepolia · testnet</Badge>
              <p className="dp__helper">Connect a wallet (Reown / WalletConnect) to deposit into a layer. This is a testnet hook — tokens have no value.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="dp__grid">
        <div className="dp__cards">
          <TrancheCard tranche="senior" apr="7.2%" selected={isSenior} onSelect={() => setTranche('senior')}
            capacityPct={47} capacityLabel="Bedrock capacity filled"
            rows={[
              { label: 'Coverage ratio', value: '$13.5K Sediment below you', tone: 'senior' },
              { label: 'NAV per share', value: '1.0000 (protected)' },
              { label: 'Coupon priced from', value: 'realized σ²' },
            ]}
            footnote="Protected from impermanent loss until the Sediment layer is exhausted. Coupon repriced every epoch." />
          <TrancheCard tranche="junior" apr="absorbs IL" aprLabel="keeps the fees" selected={!isSenior} onSelect={() => setTranche('junior')}
            capacityPct={53} capacityLabel="Sediment capacity filled"
            rows={[
              { label: 'Role', value: 'first-loss underwriter', tone: 'junior' },
              { label: 'Excess fees', value: 'all retained' },
              { label: 'NAV per share', value: 'floats with the pool' },
            ]}
            footnote="You absorb losses first. In exchange you keep all excess fees and the volatility risk premium." />
        </div>

        <div className="dp__ticket">
          <Panel accent={accent} eyebrow={isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment'} title={isSenior ? 'Senior · fixed variance-priced coupon' : 'Junior · levered, first-loss'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="dp__field">
                <span className="dp__fieldlabel">Amount in</span>
                <div className="dp__input">
                  <input type="text" inputMode="decimal" value={amount.toLocaleString('en-US')}
                    onChange={(e) => { const v = Number(e.target.value.replace(/[^0-9.]/g, '')); setAmount(Number.isFinite(v) ? v : 0); }} />
                  <span className="tok">tUSDC</span>
                </div>
                <div className="dp__chips">
                  {[500, 1000, 2000, 5000].map((v) => (
                    <button key={v} className="dp__chip" onClick={() => setAmount(v)}>{fmtUsd(v, 0)}</button>
                  ))}
                </div>
              </div>

              <div className="dp__summary">
                <div className="dp__line dp__line--em">
                  <span className="k">Shares out (est.)</span>
                  <span className="v" style={{ color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)' }}>
                    <NumberTicker value={shares} decimals={2} /> {isSenior ? 'beWETH' : 'seWETH'}
                  </span>
                </div>
                <div className="dp__line"><span className="k">Pairs with</span><span className="v">≈ {(amount / livePrice).toFixed(4)} tWETH @ {fmtUsd(livePrice, 0)}</span></div>
                <div className="dp__line"><span className="k">Settles</span><span className="v">next epoch boundary</span></div>
              </div>

              <div className={`dp__cover ${isSenior ? '' : 'j'}`}>
                {isSenior ? <ShieldCheck /> : <Flame />}
                <p>{isSenior
                  ? 'Your principal is covered by the Sediment layer before any impairment can reach you.'
                  : 'You are underwriting volatility. You absorb the first dollar of impermanent loss — and keep every excess fee.'}</p>
              </div>

              <Button variant={accent} size="lg" fullWidth disabled={depDisabled} onClick={depAction}>{depLabel}</Button>
              {depTx
                ? <div className="dp__deptx">Deposit submitted · <a href={txUrl(depTx)} target="_blank" rel="noreferrer">{shortAddr(depTx)} ↗</a></div>
                : err
                  ? <div className="dp__err">{err}</div>
                  : <div className="dp__foot">Withdrawals are requested, then settle at the next epoch boundary.</div>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
