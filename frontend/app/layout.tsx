import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/context/Web3Provider';
import { ShellProvider } from '@/context/Shell';

export const metadata: Metadata = {
  title: {
    default: 'Unistrata — a liquidity pool, priced as a capital structure',
    template: '%s · Unistrata',
  },
  description: 'Bedrock (senior) earns a variance-priced coupon (0–50% APR); Sediment (junior) underwrites the volatility. Oracle-free, Reactive settlement.',
  icons: { icon: '/strata-mark.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <ShellProvider>{children}</ShellProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
