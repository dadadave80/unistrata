import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/context/Web3Provider';

export const metadata: Metadata = {
  title: 'Unistrata — a liquidity pool, priced as a capital structure',
  description: 'Bedrock (senior) earns a fixed variance-priced coupon; Sediment (junior) underwrites the volatility. Oracle-free, Reactive settlement.',
  icons: { icon: '/strata-mark.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
