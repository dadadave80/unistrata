'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useHookState } from '@/lib/useHookState';

type Core = { seniorNav: number; juniorNav: number; sweepKey: number };

type ShellValue = {
  /** Ambient "live core" — mirrors the real on-chain capital structure (no fabricated drift). */
  core: Core;
  /** Replay the decorative waterfall sweep over the real NAVs (no value mutation). */
  runSettlement: () => void;
  /** Navigate to a route path and scroll to top (e.g. nav('/deposit')). */
  nav: (path: string) => void;
};

const ShellContext = React.createContext<ShellValue | null>(null);

export function useShell(): ShellValue {
  const v = React.useContext(ShellContext);
  if (!v) throw new Error('useShell must be used within <ShellProvider>');
  return v;
}

/**
 * App-wide shell: owns the shared live-core state that both the sidebar glyph and the ambient
 * screens (Landing, Observatory) read, and renders the navigation chrome around every route.
 */
export function ShellProvider({ children }: { children: React.ReactNode }) {
  const live = useHookState(); // real hook NAVs (30s refetch) with the verified-snapshot fallback
  const [sweepKey, setSweepKey] = React.useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const core: Core = { seniorNav: live.bedrockNav, juniorNav: live.sedimentNav, sweepKey };
  const scaleMax = Math.round((live.bedrockNav + live.sedimentNav) * 1.3) || 30000;

  const runSettlement = React.useCallback(() => setSweepKey((k) => k + 1), []);
  // Navigate to a route path, scrolling to top (matches the old nav()'s unconditional scrollTo).
  const nav = React.useCallback((path: string) => {
    router.push(path);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }, [router]);

  // Idle waterfall sweep on the ambient pages only (Thesis + Observatory), mirroring the old page loop.
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!document.hidden && (pathname === '/' || pathname === '/observatory')) runSettlement();
      t = setTimeout(loop, 9000);
    };
    t = setTimeout(loop, 5000);
    return () => clearTimeout(t);
  }, [pathname, runSettlement]);

  const value: ShellValue = { core, runSettlement, nav };

  return (
    <ShellContext.Provider value={value}>
      <AppShell seniorNav={core.seniorNav} juniorNav={core.juniorNav} scaleMax={scaleMax} sweepKey={sweepKey}>
        {children}
      </AppShell>
    </ShellContext.Provider>
  );
}
