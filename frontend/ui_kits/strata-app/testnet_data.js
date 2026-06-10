/* Unistrata — REAL live testnet data (Unichain Sepolia 1301 + Reactive Lasna 5318007).
   A committed snapshot of the deployed hook's on-chain state + the verified spike event trail, plus a
   best-effort live refresh (eth_call over JSON-RPC) that updates the snapshot when the RPC is reachable.
   This is the genuine end-to-end deployment — see REACTIVE.md for the full trail. */
(function () {
  const HOOK = '0x721480297Fbe8fb1FD72FDab3887D87e59Dcd840';   // UnistrataHook (Unichain Sepolia 1301)
  const RSC = '0x3d156B6E1568A24Cd6977c9FE29F53CF5D741d34';    // UnistrataReactive (Lasna 5318007)
  const RPC = 'https://sepolia.unichain.org';                  // public origin RPC (read-only)

  // --- on-chain snapshot (captured live; refresh() updates it) ---
  const pool = {
    pair: 'tWETH / tUSDC',
    bedrockNav: 12000,        // hook.bedrockNav()  / 1e18  ($, WAD numéraire)
    sedimentNav: 13510,       // hook.sedimentNav() / 1e18  (grew — Sediment kept the swap fees)
    tvl: 25510,
    epoch: 1,                 // hook.epochId() — advanced 0→1 by the emergency settlement
    epochLengthH: 24,
    varAcc: 6000000,          // hook.varAcc() — realized-variance accumulator
    spikeThreshold: 4000000,  // RSC trigger — varAcc crossed this → emergencySettle
    coupon: 0,                // hook.bedrockRate() — epoch 0 had no prior variance to price from
  };

  // --- verified spike circuit-breaker trail (newest first); see REACTIVE.md ---
  const events = [
    { time: 'blk 54247954', kind: 'emergency', epoch: 1, chain: 'Reactive ⇄ Unichain', tx: '0x4faab03f…d56b0',
      message: 'Vol spike → <span class="em">emergencySettle()</span> executed; epoch 0 closed early, rolled to epoch 1 (EmergencySettled + EpochSettled)' },
    { time: 'Lasna', kind: 'reactive', epoch: 0, chain: 'Reactive Lasna', tx: 'RSC 0x3d156B…',
      message: 'Reactive Network <span class="fn">react()</span> fired → Callback(emergencySettle) emitted (1 callback, Reactscan)' },
    { time: 'blk 54247942', kind: 'info', epoch: 0, chain: 'Unichain Sepolia', tx: '0xe07d6c49…',
      message: 'varAcc <span class="em">6,000,000</span> crossed the 4,000,000 emergency trigger → UnistrataObservation emitted' },
    { time: 'deploy', kind: 'reactive', epoch: 0, chain: 'Reactive Lasna', tx: '0xb6f7239e…',
      message: 'RSC subscribed → CRON heartbeat + UnistrataObservation (<span class="fn">2 Subscribe events, 0 failed</span>)' },
    { time: 'setup', kind: 'settle', epoch: 0, chain: 'Unichain Sepolia', tx: '0xb5552794…',
      message: 'Funded hook + RSC via callback proxy (both 0x1) → deposits to Bedrock + Sediment' },
  ];

  // realized-variance gauge: varAcc as a multiple of the emergency trigger (1.0× = trigger).
  const volRatio = pool.varAcc / pool.spikeThreshold; // 1.5× — spike exceeded the trigger

  const api = {
    addresses: { hook: HOOK, rsc: RSC, weth: '0x911EcAEde6A8AE982851000C019b063A8688d9DB', usdc: '0x4C63d215C51B82A401Bb11236349d7Ef12F1B3B4' },
    chains: { origin: 'Unichain Sepolia 1301', reactive: 'Reactive Lasna 5318007' },
    rpc: RPC,
    pool,
    events,
    volRatio,
    core: { seniorNav: pool.bedrockNav, juniorNav: pool.sedimentNav },

    // best-effort live refresh — updates the snapshot if the RPC is reachable (CORS permitting).
    async refresh() {
      const call = async (selector) => {
        const r = await fetch(RPC, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: HOOK, data: selector }, 'latest'] }),
        });
        const j = await r.json();
        return j.result;
      };
      try {
        const [bn, sn, ep, va] = await Promise.all([
          call('0xc4f7998f'), call('0xd837af4f'), call('0xaa9bbc0c'), call('0x39be0684'),
        ]);
        if (bn) pool.bedrockNav = Math.round(Number(BigInt(bn)) / 1e18);
        if (sn) pool.sedimentNav = Math.round(Number(BigInt(sn)) / 1e18);
        if (ep) pool.epoch = Number(BigInt(ep));
        if (va) pool.varAcc = Number(BigInt(va));
        pool.tvl = pool.bedrockNav + pool.sedimentNav;
        api.volRatio = pool.varAcc / pool.spikeThreshold;
        api.core = { seniorNav: pool.bedrockNav, juniorNav: pool.sedimentNav };
        window.dispatchEvent(new CustomEvent('strata:testnet', { detail: api }));
        return true;
      } catch (e) {
        return false; // offline / CORS-blocked → the committed snapshot stands
      }
    },
  };

  window.StrataTestnet = api;
})();
