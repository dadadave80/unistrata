/* Unistrata — mock protocol data + scenario engine.
   Exposes window.StrataData. No backend; every screen is demoable. */
(function () {
  const P0 = 3400;            // ETH start price
  const TVL = 2_400_000;
  const SENIOR0 = 1_620_000;  // 67%
  const JUNIOR0 = 780_000;    // 33%
  const SCALE_MAX = 2_600_000;
  const N = 73;               // hourly points across 72h

  // 50/50 ETH/USDC mechanics, all values indexed to 100 at t0.
  const hodlIdx = r => 50 * (1 + r);          // value of holding initial halves
  const lpIdxNoFee = r => 100 * Math.sqrt(r); // constant-product LP value

  function build(name, priceFn) {
    const price = [], hodl = [], lp = [], senior = [], junior = [];
    const seniorNav = [], juniorNav = [];
    let feeAcc = 0, premiumAcc = 0, couponAcc = 0;
    let prevP = P0;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const P = priceFn(t, i);
      const r = P / P0;
      // junior's edge: a steady risk premium plus volatility fees it keeps in full.
      // Kept deliberately smaller than impermanent loss so a crash COMPRESSES junior.
      feeAcc += (Math.abs(P - prevP) / P0) * 0.04;   // excess fees scale with realized vol
      premiumAcc += 0.00050;                          // steady premium per hour
      couponAcc += 0.072 * (1 / 8760);                // 7.2% APR senior coupon, hourly
      prevP = P;

      // Pool NAV: impermanent-loss curve (sqrt) + what junior earns. Senior is
      // protected first (takes its principal + coupon); junior is the residual.
      const poolNav = TVL * (Math.sqrt(r) + premiumAcc + feeAcc);
      const sNav = Math.min(poolNav, SENIOR0 * (1 + couponAcc));
      const jNav = Math.max(0, poolNav - sNav);

      price.push(P);
      hodl.push(hodlIdx(r));
      lp.push(lpIdxNoFee(r) + feeAcc * 10);          // vanilla LP keeps only a thin fee share
      senior.push((sNav / SENIOR0) * 100);
      junior.push((jNav / JUNIOR0) * 100);
      seniorNav.push(sNav);
      juniorNav.push(jNav);
    }
    return { name, price, series: { hodl, lp, senior, junior }, seniorNav, juniorNav };
  }

  const scenarios = {
    calm: build('Calm', (t, i) => P0 * (1 + 0.025 * Math.sin(i / 4) + 0.012 * Math.sin(i / 1.7))),
    trend: build('Trend', (t, i) => P0 * (1 + 0.16 * t + 0.018 * Math.sin(i / 3))),
    crash: build('Crash', (t, i) => {
      // 3400 → 2040 (−40%) over the first ~40h, recover to 2720 by 72h
      let mult;
      if (t < 0.55) mult = 1 - (0.40) * (t / 0.55);
      else mult = 0.60 + 0.20 * ((t - 0.55) / 0.45);
      return P0 * mult * (1 + 0.012 * Math.sin(i / 2.2));
    }),
  };

  const epochs = (() => {
    // recent settlement ledger
    return [
      { time: '2d 04:11', kind: 'emergency', epoch: 47,
        message: 'Vol spike on Reactive Network → <span class="em">emergencySettle()</span> executed, epoch 47 closed early',
        tx: '0x7a3f…e201', chain: 'Reactive ⇄ Ethereum' },
      { time: '16:00:02', kind: 'settle', epoch: 46,
        message: 'Waterfall ran → coupon <span class="fn">accrued to Bedrock</span> (7.0%), Sediment took residual fees',
        tx: '0x1c9d…0a4f', chain: 'Ethereum' },
      { time: '15:59:48', kind: 'reactive', epoch: 46,
        message: 'Reactive callback armed → watching σ² against 0.85%/day emergency trigger',
        tx: '0x44b2…9fe3', chain: 'Reactive Network' },
      { time: '08:00:01', kind: 'settle', epoch: 45,
        message: 'Waterfall ran → Bedrock coupon paid in full, Sediment premium +3.8%',
        tx: '0xa1e7…22c8', chain: 'Ethereum' },
      { time: '00:00:00', kind: 'settle', epoch: 44,
        message: 'Epoch opened → coupon repriced from realized vol: σ² = 0.41%/day',
        tx: '0x9f02…b71d', chain: 'Ethereum' },
      { time: '-8:00:03', kind: 'info', epoch: 43,
        message: 'Tick observation window closed → 480 price samples ingested',
        tx: '0x3 db…7c10', chain: 'Ethereum' },
    ];
  })();

  window.StrataData = {
    P0, TVL, SENIOR0, JUNIOR0, SCALE_MAX, N,
    // REAL Phase-5 money-chart data (sim/out/*.json); synthetic build() is the offline fallback.
    scenarios: window.StrataSimData || scenarios,
    // REAL verified spike event trail from the live testnet deployment (fallback: mock ledger).
    events: (window.StrataTestnet && window.StrataTestnet.events) || epochs,
    // REAL live hook state on Unichain Sepolia (NAV / epoch / varAcc) for the Observatory.
    live: window.StrataTestnet || null,
    pool: {
      pair: 'ETH / USDC', tvl: TVL, senior: SENIOR0, junior: JUNIOR0,
      splitSenior: 0.675, splitJunior: 0.325,
      epoch: 47, epochLengthH: 8, secondsLeft: 11529,
      seniorApr: 7.2, juniorApr: 23.4, vol: 0.41, volEwma: 0.47,
      coverage: 1_840_000,
    },
    fmtUsd(n, dp = 0) {
      if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
      if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(dp) + 'K';
      return '$' + n.toFixed(dp);
    },
  };
})();
