'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Layers, ArrowDownToLine, ArrowUpFromLine, Wallet, SlidersHorizontal } from 'lucide-react';
import { StrataCore } from '@/components/StrataCore';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { fmtUsd, shortAddr } from '@/lib/format';

const NAV = [
  { href: '/', label: 'Thesis', Icon: Layers },
  { href: '/deposit', label: 'Deposit', Icon: ArrowDownToLine },
  { href: '/withdraw', label: 'Withdraw', Icon: ArrowUpFromLine },
  { href: '/portfolio', label: 'Portfolio', Icon: Wallet },
  { href: '/simulator', label: 'Simulator', Icon: SlidersHorizontal },
];

const shellCSS = `
.sx { display: grid; grid-template-columns: var(--rail-width) 1fr; min-height: 100vh; background: var(--bg-app); }
.sx__rail { border-right: 1px solid var(--hairline); background: var(--ink-950);
  display: flex; flex-direction: column; padding: 20px 14px; position: sticky; top: 0; height: 100vh; }
.sx__brand { display: flex; align-items: center; gap: 11px; padding: 4px 8px 22px; text-decoration: none; }
.sx__brand .wm { font-family: var(--font-display); font-weight: 500; font-size: 22px; letter-spacing: -0.02em; color: var(--text-primary); }
.sx__nav { display: flex; flex-direction: column; gap: 2px; }
.sx__item { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: var(--radius-md);
  font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--text-secondary);
  background: transparent; border: none; cursor: pointer; width: 100%; text-align: left; text-decoration: none;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.sx__item:hover { background: var(--surface-card); color: var(--text-primary); }
.sx__item[data-active="true"] { background: var(--surface-raised); color: var(--text-primary); box-shadow: inset 2px 0 0 0 var(--senior-500); }
.sx__item svg { flex: none; opacity: 0.85; }
.sx__sectlabel { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-tertiary); padding: 0 11px; margin: 18px 0 8px; }
.sx__spacer { flex: 1; }
.sx__live { border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; background: var(--ink-900); }
.sx__live .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.sx__live .ttl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); }
.sx__live .glyphrow { display: flex; align-items: center; gap: 10px; }
.sx__live .meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
.sx__live .meta b { color: var(--senior-200); font-weight: 500; }
.sx__main { min-width: 0; display: flex; flex-direction: column; }
.sx__topbar { height: var(--topbar-height); border-bottom: 1px solid var(--hairline);
  display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-8);
  position: sticky; top: 0; z-index: 5; background: color-mix(in oklab, var(--bg-app) 86%, transparent); backdrop-filter: blur(10px); }
.sx__crumb { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.04em; }
.sx__crumb b { color: var(--text-primary); font-weight: 500; }
.sx__content { padding: var(--space-9) var(--space-8); max-width: var(--maxw-wide); width: 100%; margin: 0 auto; }
@media (max-width: 880px) { .sx { grid-template-columns: 1fr; } .sx__rail { display: none; } }
`;

type Props = {
  seniorNav: number;
  juniorNav: number;
  scaleMax: number;
  sweepKey: number;
  children: React.ReactNode;
};

export function AppShell({ seniorNav, juniorNav, scaleMax, sweepKey, children }: Props) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const cur = NAV.find((n) => n.href === pathname) || NAV[0];

  return (
    <div className="sx">
      <style dangerouslySetInnerHTML={{ __html: shellCSS }} />
      <aside className="sx__rail">
        <Link href="/" className="sx__brand">
          <Image src="/strata-mark.svg" width={30} height={30} alt="Unistrata" />
          <span className="wm">Unistrata</span>
        </Link>
        <div className="sx__sectlabel">Protocol</div>
        <nav className="sx__nav">
          {NAV.map((n) => (
            <Link key={n.href} className="sx__item" data-active={pathname === n.href} href={n.href}>
              <n.Icon size={17} />{n.label}
            </Link>
          ))}
        </nav>
        <div className="sx__spacer" />
        <div className="sx__live">
          <div className="top">
            <span className="ttl">Live core</span>
            <Badge variant="live" live size="sm">Reactive</Badge>
          </div>
          <div className="glyphrow">
            <StrataCore glyph height={46} seniorNav={seniorNav} juniorNav={juniorNav} scaleMax={scaleMax} sweepKey={sweepKey} />
            <div className="meta">Bedrock <b>{fmtUsd(seniorNav, 1)}</b><br />Sediment <b>{fmtUsd(juniorNav, 1)}</b></div>
          </div>
        </div>
      </aside>

      <main className="sx__main">
        <header className="sx__topbar">
          <div className="sx__crumb">unistrata <span style={{ opacity: 0.4 }}>/</span> <b>{cur.label}</b></div>
          {isConnected
            ? <Button variant="secondary" size="sm" onClick={() => disconnect()}>{address ? shortAddr(address) : 'Disconnect'}</Button>
            : <Button variant="primary" size="sm" onClick={() => open()}>Connect wallet</Button>}
        </header>
        <div className="sx__content">{children}</div>
      </main>
    </div>
  );
}
