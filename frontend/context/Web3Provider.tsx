'use client';

import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter, projectId, networks } from '@/config';

const queryClient = new QueryClient();

const metadata = {
  name: 'Unistrata',
  description: 'A liquidity pool, priced as a capital structure — Bedrock (senior) / Sediment (junior).',
  url: 'https://unistrata.app',
  icons: ['/strata-mark.svg'],
};

// Initialize Reown AppKit once at module load (dark, mineral theme to match the brand).
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  themeMode: 'dark',
  themeVariables: { '--w3m-accent': '#4E97A6', '--w3m-border-radius-master': '2px' },
  features: { analytics: false, email: false, socials: [] },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
