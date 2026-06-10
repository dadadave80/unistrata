/* global React */
(function () {
const { Button, Badge, Panel, Stat, TrancheCard, NumberTicker } = window.StrataDesignSystem_8a0ec2;
const DP = window.StrataData;

const FAUCET = { usdc: 10000 };
const COOLDOWN_S = 8 * 3600; // 8h, matches the epoch
const WKEY = 'unistrata.wallet';

const hex = (n) => '0x' + Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const trunc = (h) => h.slice(0, 6) + '…' + h.slice(-4);
const hms = (t) => {
  t = Math.max(0, Math.floor(t));
  const p = (x) => String(x).padStart(2, '0');
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
};
function loadWallet() {
  try { return JSON.parse(localStorage.getItem(WKEY)) || null; } catch (e) { return null; }
}

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
.dp__input .tok .d { width: 8px; height: 8px; border-radius: 50%; background: var(--senior-400); }
.dp__chips { display: flex; gap: 7px; flex-wrap: wrap; }
.dp__chip { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); background: var(--surface-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 9px; cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out); }
.dp__chip:hover { border-color: var(--border-strong); color: var(--text-primary); }
.dp__chip--max { color: var(--senior-200); border-color: var(--senior-800); }
.dp__summary { display: flex; flex-direction: column; gap: 1px; background: var(--hairline); border-radius: var(--radius-md); overflow: hidden; }
.dp__line { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-sunken); }
.dp__line .k { font-family: var(--font-sans); font-size: 13.5px; color: var(--text-secondary); }
.dp__line .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); }
.dp__line--em .v { font-size: 18px; }
.dp__cover { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; background: var(--senior-950);
  border: 1px solid var(--senior-800); border-radius: var(--radius-md); }
.dp__cover svg { width: 16px; height: 16px; color: var(--senior-300); flex: none; margin-top: 1px; }
.dp__cover p { font-family: var(--font-sans); font-size: 12.5px; color: var(--senior-100); line-height: 1.5; }
.dp__cover.j { background: var(--junior-950); border-color: var(--junior-800); }
.dp__cover.j svg { color: var(--junior-300); }
.dp__cover.j p { color: var(--junior-100); }
.dp__foot { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align: center; line-height: 1.6; }

/* ---- Faucet ---- */
.dp__faucet { margin-bottom: var(--space-7); }
.dp__faucetbody { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); flex-wrap: wrap; }
.dp__faucetbal { display: flex; align-items: center; gap: var(--space-6); flex-wrap: wrap; }
.dp__wallet { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12.5px; color: var(--text-secondary);
  background: var(--bg-sunken); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 6px 12px; }
.dp__wallet .d { width: 7px; height: 7px; border-radius: 50%; background: var(--senior-400); box-shadow: 0 0 8px 0 var(--senior-400); flex: none; }
.dp__wallet button { background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 0; display: inline-flex; }
.dp__wallet button:hover { color: var(--text-secondary); }
.dp__wallet button svg { width: 14px; height: 14px; }
.dp__bal { display: flex; flex-direction: column; gap: 3px; }
.dp__bal .k { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.dp__bal .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums lining-nums; font-size: 19px; font-weight: 500; color: var(--text-primary); display: flex; align-items: baseline; gap: 5px; }
.dp__bal .v small { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
.dp__helper { font-family: var(--font-sans); font-size: 13px; color: var(--text-tertiary); max-width: 52ch; line-height: 1.5; }
.dp__drip { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11.5px; color: var(--senior-200);
  background: var(--senior-950); border: 1px solid var(--senior-800); border-radius: var(--radius-sm); padding: 7px 11px; }
.dp__drip svg { width: 14px; height: 14px; color: var(--senior-300); flex: none; }
.dp__drip a { color: var(--senior-300); border-bottom: 1px dotted var(--senior-700); }
.dp__drip a:hover { color: var(--senior-200); }
.dp__balline { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.dp__balline .wb { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
.dp__balline .wb b { color: var(--text-secondary); font-weight: 500; }
.dp__deptx { display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--font-mono); font-size: 11px; color: var(--senior-200); line-height: 1.5; text-align: center; }
.dp__deptx svg { width: 13px; height: 13px; color: var(--senior-300); flex: none; }
.dp__deptx a { color: var(--senior-300); border-bottom: 1px dotted var(--senior-700); }
@media (max-width: 1000px){ .dp__grid{ grid-template-columns: 1fr; } .dp__ticket{ position: static; } }
`;

function Deposit() {
  React.useEffect(() => {
    if (document.getElementById('dp-css')) return;
    const e = document.createElement('style'); e.id = 'dp-css'; e.textContent = depositCSS; document.head.appendChild(e);
    if (window.lucide) window.lucide.createIcons();
  }, []);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const [tranche, setTranche] = React.useState('senior');
  const [amount, setAmount] = React.useState(25000);
  const [wallet, setWallet] = React.useState(loadWallet);   // null = disconnected
  const [claiming, setClaiming] = React.useState(false);
  const [drip, setDrip] = React.useState(null);             // last faucet claim
  const [depTx, setDepTx] = React.useState(null);           // last deposit
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    try { if (wallet) localStorage.setItem(WKEY, JSON.stringify(wallet)); else localStorage.removeItem(WKEY); } catch (e) {}
  }, [wallet]);

  const isSenior = tranche === 'senior';
  const sharePrice = isSenior ? 1.0234 : 1.1871;
  const shares = amount / sharePrice;
  const accent = isSenior ? 'senior' : 'junior';

  const cooldownLeft = wallet && wallet.lastClaim ? Math.max(0, COOLDOWN_S - Math.floor((now - wallet.lastClaim) / 1000)) : 0;
  const onCooldown = cooldownLeft > 0;

  const connect = () => { setDepTx(null); setWallet({ address: hex(40), usdc: 0, lastClaim: 0 }); };
  const disconnect = () => { setWallet(null); setDrip(null); setDepTx(null); };
  const claim = () => {
    if (claiming || onCooldown) return;
    setClaiming(true);
    setTimeout(() => {
      const tx = trunc(hex(40));
      setWallet((w) => ({ ...w, usdc: w.usdc + FAUCET.usdc, lastClaim: Date.now() }));
      setDrip({ tx });
      setClaiming(false);
    }, 850);
  };
  const doDeposit = () => {
    const amt = amount;
    setWallet((w) => ({ ...w, usdc: w.usdc - amt }));
    setDepTx({ amt, shares: amt / sharePrice, ticker: isSenior ? 'BEDR' : 'SEDI', layer: isSenior ? 'Bedrock' : 'Sediment', tx: trunc(hex(40)) });
  };

  // deposit button state machine
  let depLabel, depDisabled = false, depAction = doDeposit;
  if (!wallet) { depLabel = 'Connect wallet to deposit'; depAction = connect; }
  else if (!(amount > 0)) { depLabel = 'Enter an amount'; depDisabled = true; }
  else if (amount > wallet.usdc) { depLabel = 'Insufficient test USDC — claim above'; depDisabled = true; }
  else { depLabel = isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment'; }

  const claimLabel = claiming ? 'Dripping…' : onCooldown ? `Next claim ${hms(cooldownLeft)}` : 'Claim test tokens';

  return (
    <div>
      <div className="dp__head">
        <div className="dp__title">Choose your layer</div>
        <p className="dp__sub">The same instrument, two temperaments. Bedrock is the senior layer — fixed coupon, protected first. Sediment is the junior layer — levered yield in exchange for absorbing loss first.</p>
      </div>

      <div className="dp__faucet">
        <Panel
          eyebrow="Testnet faucet"
          title="Fund your test wallet"
          actions={wallet
            ? <Button variant="secondary" size="sm" disabled={claiming || onCooldown} onClick={claim} icon={<i data-lucide="droplets"></i>}>{claimLabel}</Button>
            : <Button variant="secondary" size="sm" onClick={connect} icon={<i data-lucide="wallet"></i>}>Connect wallet</Button>}
        >
          {wallet ? (
            <div className="dp__faucetbody">
              <div className="dp__faucetbal">
                <Badge variant="neutral" size="sm">Unichain Sepolia</Badge>
                <span className="dp__wallet">
                  <span className="d"></span>{trunc(wallet.address)}
                  <button title="Disconnect" onClick={disconnect}><i data-lucide="log-out"></i></button>
                </span>
                <div className="dp__bal"><span className="k">Test USDC</span><span className="v"><NumberTicker value={wallet.usdc} decimals={0} /> <small>USDC</small></span></div>
              </div>
              {drip
                ? <span className="dp__drip"><i data-lucide="check-circle-2"></i> Dripped 10,000 USDC · <a href="#" onClick={(e) => e.preventDefault()}>{drip.tx} ↗</a></span>
                : <span className="dp__helper">Each claim drips 10,000 test USDC. 8-hour cooldown per wallet.</span>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <Badge variant="neutral" size="sm">Unichain Sepolia · testnet</Badge>
              <p className="dp__helper">Connect a wallet to claim test USDC, then deposit to a layer below. Nothing here touches mainnet — these tokens have no value.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="dp__grid">
        <div className="dp__cards">
          <TrancheCard tranche="senior" apr="7.2%" selected={isSenior} onSelect={() => setTranche('senior')}
            capacityPct={81} capacityLabel="Bedrock capacity filled"
            rows={[
              { label: 'Coverage ratio', value: '$1.84M Sediment below you', tone: 'senior' },
              { label: 'Capacity remaining', value: '$310K' },
              { label: 'Coupon priced from', value: 'σ² = 0.41%/day' },
            ]}
            footnote="Protected from impermanent loss until the Sediment layer is exhausted. Coupon repriced every epoch." />
          <TrancheCard tranche="junior" apr="23.4%" aprLabel="trailing 30d APR" selected={!isSenior} onSelect={() => setTranche('junior')}
            capacityPct={62} capacityLabel="Sediment capacity filled"
            rows={[
              { label: 'Risk premium earned', value: '+4.1% this epoch', tone: 'junior' },
              { label: 'Excess fees', value: 'all retained' },
              { label: 'Leverage on pool', value: '≈ 3.1×' },
            ]}
            footnote="You absorb losses first. In exchange you keep all excess fees and the volatility risk premium." />
        </div>

        <div className="dp__ticket">
          <Panel accent={accent} eyebrow={isSenior ? 'Deposit to Bedrock' : 'Deposit to Sediment'} title={isSenior ? 'Fixed coupon · 7.2% this epoch' : 'Levered yield · 23.4% trailing'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="dp__field">
                <div className="dp__balline">
                  <span className="dp__fieldlabel">Amount in</span>
                  {wallet && <span className="wb">Wallet <b>{wallet.usdc.toLocaleString('en-US')}</b> USDC</span>}
                </div>
                <div className="dp__input">
                  <input type="text" inputMode="decimal" value={amount.toLocaleString('en-US')}
                    onChange={(e) => { const v = Number(e.target.value.replace(/[^0-9.]/g, '')); setAmount(Number.isFinite(v) ? v : 0); }} />
                  <span className="tok"><span className="d" style={{ background: 'var(--paper-300)' }} />USDC</span>
                </div>
                <div className="dp__chips">
                  {[10000, 25000, 50000, 100000].map(v => (
                    <button key={v} className="dp__chip" onClick={() => setAmount(v)}>{DP.fmtUsd(v, 0)}</button>
                  ))}
                  {wallet && wallet.usdc > 0 && (
                    <button className="dp__chip dp__chip--max" onClick={() => setAmount(Math.floor(wallet.usdc))}>Max</button>
                  )}
                </div>
              </div>

              <div className="dp__summary">
                <div className="dp__line dp__line--em">
                  <span className="k">Shares out</span>
                  <span className="v" style={{ color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)' }}>
                    <NumberTicker value={shares} decimals={2} /> {isSenior ? 'BEDR' : 'SEDI'}
                  </span>
                </div>
                <div className="dp__line"><span className="k">Share price</span><span className="v">{sharePrice.toFixed(4)} USDC</span></div>
                <div className="dp__line"><span className="k">{isSenior ? 'Projected coupon (8h epoch)' : 'Projected premium (8h epoch)'}</span>
                  <span className="v" style={{ color: isSenior ? 'var(--senior-200)' : 'var(--junior-200)' }}>
                    +{DP.fmtUsd(amount * (isSenior ? 0.072 : 0.234) / (365 * 3), 0)}
                  </span></div>
                <div className="dp__line"><span className="k">Settles</span><span className="v">epoch 48</span></div>
              </div>

              <div className={`dp__cover ${isSenior ? '' : 'j'}`}>
                <i data-lucide={isSenior ? 'shield-check' : 'flame'}></i>
                <p>{isSenior
                  ? 'Your principal is covered by $1.84M of Sediment capital before any impairment can reach you.'
                  : 'You are underwriting volatility. You absorb the first dollar of impermanent loss — and keep every excess fee.'}</p>
              </div>

              <Button variant={accent} size="lg" fullWidth disabled={depDisabled} onClick={depAction}>
                {depLabel}
              </Button>
              {depTx
                ? <div className="dp__deptx"><i data-lucide="check-circle-2"></i> Deposited {depTx.amt.toLocaleString('en-US')} USDC → {depTx.shares.toFixed(2)} {depTx.ticker} to {depTx.layer} · <a href="#" onClick={(e) => e.preventDefault()}>{depTx.tx} ↗</a></div>
                : <div className="dp__foot">Withdrawals are requested, then settle at the next epoch boundary.<br />Request withdrawal — settles at epoch 48.</div>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

window.Deposit = Deposit;
})();
