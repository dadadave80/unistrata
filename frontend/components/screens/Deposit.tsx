'use client';

import React from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useReadContracts, useWriteContract, useSignTypedData, usePublicClient, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Panel } from '@/components/Panel';
import { TrancheCard } from '@/components/TrancheCard';
import { NumberTicker } from '@/components/NumberTicker';
import { ShieldCheck, Flame, LogOut } from 'lucide-react';
import { HOOK_ADDRESS, TOKEN0, TOKEN1, TOKEN_WETH, TOKEN_USDC, BEDROCK_TOKEN, SEDIMENT_TOKEN, erc20Abi, hookAbi, CHAIN_ID, txUrl } from '@/lib/contracts';
import { buildErc20Permit, splitSig, permitDeadline } from '@/lib/eip2612';
import { fmtUsd, shortAddr } from '@/lib/format';
import { usePoolPrice } from '@/lib/usePoolPrice';
import { useHookState } from '@/lib/useHookState';

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

// Keep only digits and a single decimal point so the value is always a clean parseUnits string.
function sanitizeDecimal(v: string): string {
  const c = v.replace(/[^0-9.]/g, '');
  const dot = c.indexOf('.');
  return dot === -1 ? c : c.slice(0, dot + 1) + c.slice(dot + 1).replace(/\./g, '');
}

export function Deposit() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();

  const [tranche, setTranche] = React.useState<'senior' | 'junior'>('senior');
  // Keep the entered amount as a sanitized decimal STRING (single dot) — fed straight to parseUnits, never
  // round-tripped through JS Number, which loses precision on large/edge inputs (review #6).
  const [amountStr, setAmountStr] = React.useState('2000');
  const amount = Number(amountStr) || 0; // numeric form for UI math (shares estimate, chips, balance gate)
  const [depTx, setDepTx] = React.useState<string | null>(null);
  const [depBusy, setDepBusy] = React.useState<false | 'sign' | 'deposit'>(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [faucetBusy, setFaucetBusy] = React.useState(false);
  const [faucetTx, setFaucetTx] = React.useState<string | null>(null);

  const isSenior = tranche === 'senior';
  const accent = isSenior ? 'senior' : 'junior';
  // Live pool price (tUSDC per tWETH) from the v4 PoolManager's slot0 — never a hardcoded 3000, which
  // would mis-pair the deposit legs once the pool moves off the seed price (review #17). Falls back to
  // the seed price only while the read is loading.
  const livePrice = usePoolPrice() ?? 3000;
  const live = useHookState(); // live tranche NAVs (bedrockNav = senior claim, sedimentNav = junior residual)
  const client = usePublicClient({ chainId: CHAIN_ID });
  const walletChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  // live token balances of the connected wallet — EIP-2612 needs no standing allowance, so none is read.
  const ZERO = '0x0000000000000000000000000000000000000000';
  const { data: bals, refetch: refetchBals } = useReadContracts({
    contracts: [
      { address: TOKEN_USDC, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
      { address: TOKEN_WETH, abi: erc20Abi, functionName: 'balanceOf', args: [address ?? ZERO], chainId: CHAIN_ID },
    ],
    query: { enabled: isConnected },
  });
  const usdcBal = bals && bals[0].status === 'success' ? Number(formatUnits(bals[0].result as bigint, 6)) : 0;
  const wethBal = bals && bals[1].status === 'success' ? Number(formatUnits(bals[1].result as bigint, 18)) : 0;

  // Tranche share supplies → live NAV/share (the hook mints minted = depositValue·supply/nav).
  const { data: supplies } = useReadContracts({
    contracts: [
      { address: BEDROCK_TOKEN, abi: erc20Abi, functionName: 'totalSupply', chainId: CHAIN_ID },
      { address: SEDIMENT_TOKEN, abi: erc20Abi, functionName: 'totalSupply', chainId: CHAIN_ID },
    ],
    query: { refetchInterval: 30_000 },
  });
  const beSupply = supplies && supplies[0].status === 'success' ? Number(formatUnits(supplies[0].result as bigint, 18)) : 0;
  const seSupply = supplies && supplies[1].status === 'success' ? Number(formatUnits(supplies[1].result as bigint, 18)) : 0;
  // Live NAV/share per tranche; fall back to ~1 while reads load or before the first deposit.
  const beNavPerShare = beSupply > 0 && live.bedrockNav > 0 ? live.bedrockNav / beSupply : 1;
  const seNavPerShare = seSupply > 0 && live.sedimentNav > 0 ? live.sedimentNav / seSupply : 1;
  const navPerShare = isSenior ? beNavPerShare : seNavPerShare;

  // The deposit pulls BOTH legs: the entered tUSDC + a price-matched tWETH leg. The hook mints shares off
  // the numéraire value of BOTH legs, so the estimate counts both (≈ 2× the entered amount) at the LIVE
  // NAV/share — not the entered amount at a hardcoded share price (review #2/#3).
  const wethPaired = amount / livePrice;
  const depositValueUsd = amount + wethPaired * livePrice;
  const shares = navPerShare > 0 ? depositValueUsd / navPerShare : 0;

  // Testnet faucet — DemoERC20.mint is permissionless, so the wallet mints to itself.
  // Mints 10,000 tUSDC (+ tWETH so a balanced deposit actually works).
  async function claimFaucet() {
    if (!address) { open(); return; }
    setFaucetBusy(true); setErr(null); setFaucetTx(null);
    try {
      await writeContractAsync({ address: TOKEN_USDC, abi: erc20Abi, functionName: 'mint', args: [address, parseUnits('10000', 6)], chainId: CHAIN_ID });
      const tx = await writeContractAsync({ address: TOKEN_WETH, abi: erc20Abi, functionName: 'mint', args: [address, parseUnits('10', 18)], chainId: CHAIN_ID });
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
      // Ensure the wallet is on Unichain Sepolia before signing — each EIP-2612 domain is pinned to
      // CHAIN_ID + the token, so signing on another chain produces a signature the hook can't verify (#4).
      if (walletChainId !== CHAIN_ID) await switchChainAsync({ chainId: CHAIN_ID });
      if (!client) throw new Error('No RPC client for the configured chain.');
      // The "Amount in" field is denominated in tUSDC; pair it with ~balanced tWETH at the LIVE pool price.
      // Map each leg to token0/token1 BY IDENTITY (the pool sorts tokens by address) so the permits always
      // line up with the on-chain currency0/currency1 — a re-deploy that reorders tokens can't break it.
      const usdcAmount = parseUnits(amountStr.replace(/\.$/, '') || '0', 6); // tUSDC, 6 dec (clean string, no Number round-trip)
      const wethAmount = parseUnits((amount / livePrice).toFixed(18), 18); // tWETH, 18 dec (live-priced)
      const amount0Max = (TOKEN0 as string) === TOKEN_USDC ? usdcAmount : wethAmount;
      const amount1Max = (TOKEN1 as string) === TOKEN_USDC ? usdcAmount : wethAmount;
      const deadline = permitDeadline();

      // Sign one EIP-2612 permit per leg, granting the hook a just-in-time allowance (gasless, no approve).
      // Read each token's name + current nonce fresh so the EIP-712 domain matches and the nonce is never
      // stale. token0/token1 are independent contracts with independent nonces.
      setDepBusy('sign');
      const signLeg = async (token: `0x${string}`, value: bigint) => {
        const [name, nonce] = await Promise.all([
          client.readContract({ address: token, abi: erc20Abi, functionName: 'name' }) as Promise<string>,
          client.readContract({ address: token, abi: erc20Abi, functionName: 'nonces', args: [address] }) as Promise<bigint>,
        ]);
        const p = buildErc20Permit({ tokenName: name, token, chainId: CHAIN_ID, owner: address, spender: HOOK_ADDRESS, value, nonce, deadline });
        const signature = await signTypedDataAsync({ domain: p.domain, types: p.types, primaryType: p.primaryType, message: p.message });
        return splitSig(signature);
      };
      const sig0 = await signLeg(TOKEN0, amount0Max);
      const sig1 = await signLeg(TOKEN1, amount1Max);

      // Slippage bound: revert if the live-priced mint would fall >3% below the displayed estimate
      // (guards against price drift / a sandwich between sign and execution). 0 if the estimate is unknown.
      const minSharesOut = shares > 0 ? parseUnits((shares * 0.97).toFixed(18), 18) : 0n;

      // The hook uses each permit to grant itself an allowance, deposits, and mints shares to us.
      setDepBusy('deposit');
      const tx = await writeContractAsync({
        address: HOOK_ADDRESS, abi: hookAbi, functionName: 'depositWithPermit',
        args: [isSenior, amount0Max, amount1Max, minSharesOut, deadline, sig0, sig1], chainId: CHAIN_ID,
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
  else if (depBusy === 'sign') { depLabel = 'Sign 2 permits in wallet…'; depDisabled = true; }
  else if (depBusy === 'deposit') { depLabel = 'Confirm deposit in wallet…'; depDisabled = true; }
  else if (usdcBal < amount) { depLabel = `Need ${Math.ceil(amount).toLocaleString()} tUSDC — claim test tokens`; depDisabled = true; }
  else if (wethBal < wethPaired) { depLabel = `Need ${wethPaired.toFixed(3)} tWETH — claim test tokens`; depDisabled = true; }
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
                ? <span className="dp__deptx">Minted 10,000 tUSDC + 10 tWETH · <a href={txUrl(faucetTx)} target="_blank" rel="noreferrer">{shortAddr(faucetTx)} ↗</a></span>
                : <p className="dp__helper">Claim mints 10,000 tUSDC + 10 tWETH to your wallet (DemoERC20, permissionless). A deposit pulls BOTH tokens (full-range LP), so you need each.</p>}
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
          {/* Sediment (junior) sits ON TOP of Bedrock in the strata — it absorbs the first loss, so it
              leads here, mirroring the capital-structure visual. */}
          <TrancheCard tranche="junior" apr="absorbs IL" aprLabel="keeps the fees" selected={!isSenior} onSelect={() => setTranche('junior')}
            capacityPct={53} capacityLabel="Sediment capacity filled"
            rows={[
              { label: 'Role', value: 'first-loss underwriter', tone: 'junior' },
              { label: 'Excess fees', value: 'all retained' },
              { label: 'NAV per share', value: `${seNavPerShare.toFixed(4)} · floats` },
            ]}
            footnote="You absorb losses first. In exchange you keep all excess fees and the volatility risk premium." />
          <TrancheCard tranche="senior" apr="7.2%" selected={isSenior} onSelect={() => setTranche('senior')}
            capacityPct={47} capacityLabel="Bedrock capacity filled"
            rows={[
              { label: 'Coverage ratio', value: '$13.5K Sediment below you', tone: 'senior' },
              { label: 'NAV per share', value: `${beNavPerShare.toFixed(4)} (protected)` },
              { label: 'Coupon priced from', value: 'realized σ²' },
            ]}
            footnote="Protected from impermanent loss until the Sediment layer is exhausted. Coupon repriced every epoch." />
        </div>

        <div className="dp__ticket">
          <Panel accent={accent} eyebrow={isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment'} title={isSenior ? 'Senior · fixed variance-priced coupon' : 'Junior · levered, first-loss'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="dp__field">
                <span className="dp__fieldlabel">Amount in</span>
                <div className="dp__input">
                  <input type="text" inputMode="decimal" value={amountStr}
                    onChange={(e) => setAmountStr(sanitizeDecimal(e.target.value))} />
                  <span className="tok">tUSDC</span>
                </div>
                <div className="dp__chips">
                  {[500, 1000, 2000, 5000].map((v) => (
                    <button key={v} className="dp__chip" onClick={() => setAmountStr(String(v))}>{fmtUsd(v, 0)}</button>
                  ))}
                </div>
              </div>

              <div className="dp__summary">
                <div className="dp__line dp__line--em">
                  <span className="k">Shares out (est.)</span>
                  <span className="v" style={{ color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)' }}>
                    <NumberTicker value={shares} decimals={2} /> {isSenior ? 'BEDR' : 'SEDI'}
                  </span>
                </div>
                <div className="dp__line"><span className="k">Pairs with</span><span className="v">≈ {wethPaired.toFixed(4)} tWETH @ {fmtUsd(livePrice, 0)}</span></div>
                <div className="dp__line"><span className="k">Total deposit</span><span className="v">≈ {fmtUsd(depositValueUsd, 0)} (both legs)</span></div>
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
