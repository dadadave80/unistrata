'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Landing } from '@/components/screens/Landing';
import { Deposit } from '@/components/screens/Deposit';
import { Withdraw } from '@/components/screens/Withdraw';
import { Observatory } from '@/components/screens/Observatory';
import { Simulator } from '@/components/screens/Simulator';
import { useHookState } from '@/lib/useHookState';

export default function Page() {
  const [screen, setScreen] = React.useState('landing');
  const live = useHookState(); // real hook NAVs (30s refetch) with the verified-snapshot fallback
  const [sweepKey, setSweepKey] = React.useState(0);

  // The ambient "live core" mirrors the real on-chain capital structure — no fabricated drift.
  const core = { seniorNav: live.bedrockNav, juniorNav: live.sedimentNav, sweepKey };
  const scaleMax = Math.round((live.bedrockNav + live.sedimentNav) * 1.3) || 30000;

  // "Run a settlement" replays the decorative waterfall sweep over the real NAVs (no value mutation).
  const runSettlement = React.useCallback(() => setSweepKey((k) => k + 1), []);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!document.hidden && (screen === 'landing' || screen === 'observatory')) runSettlement();
      t = setTimeout(loop, 9000);
    };
    t = setTimeout(loop, 5000);
    return () => clearTimeout(t);
  }, [screen, runSettlement]);

  const nav = (s: string) => { setScreen(s); window.scrollTo({ top: 0 }); };

  let view: React.ReactNode;
  if (screen === 'deposit') view = <Deposit />;
  else if (screen === 'withdraw') view = <Withdraw />;
  else if (screen === 'observatory') view = <Observatory core={core} onSettle={runSettlement} />;
  else if (screen === 'simulator') view = <Simulator />;
  else view = <Landing core={core} onSettle={runSettlement} onNav={nav} />;

  return (
    <AppShell screen={screen} onNav={nav} seniorNav={core.seniorNav} juniorNav={core.juniorNav} scaleMax={scaleMax} sweepKey={core.sweepKey}>
      {view}
    </AppShell>
  );
}
