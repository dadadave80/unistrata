'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Landing } from '@/components/screens/Landing';
import { Deposit } from '@/components/screens/Deposit';
import { Observatory } from '@/components/screens/Observatory';
import { Simulator } from '@/components/screens/Simulator';
import { TESTNET } from '@/lib/testnet';

// Seed the ambient "live core" from the real on-chain snapshot.
const SENIOR0 = TESTNET.pool.bedrockNav;
const JUNIOR0 = TESTNET.pool.sedimentNav;
const SCALE_MAX = Math.round((SENIOR0 + JUNIOR0) * 1.3);

type Core = { seniorNav: number; juniorNav: number; sweepKey: number };

export default function Page() {
  const [screen, setScreen] = React.useState('landing');
  const [core, setCore] = React.useState<Core>({ seniorNav: SENIOR0, juniorNav: JUNIOR0, sweepKey: 0 });

  // a gentle decorative settlement so the Core reads as alive (Bedrock holds, Sediment accretes fees)
  const runSettlement = React.useCallback(() => {
    setCore((c) => ({
      seniorNav: c.seniorNav,
      juniorNav: c.juniorNav + 120 + Math.random() * 180,
      sweepKey: c.sweepKey + 1,
    }));
  }, []);

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
  else if (screen === 'observatory') view = <Observatory core={core} onSettle={runSettlement} />;
  else if (screen === 'simulator') view = <Simulator />;
  else view = <Landing core={core} onSettle={runSettlement} onNav={nav} />;

  return (
    <AppShell screen={screen} onNav={nav} seniorNav={core.seniorNav} juniorNav={core.juniorNav} scaleMax={SCALE_MAX} sweepKey={core.sweepKey}>
      {view}
    </AppShell>
  );
}
