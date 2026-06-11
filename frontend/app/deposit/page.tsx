import type { Metadata } from 'next';
import { Deposit } from '@/components/screens/Deposit';

export const metadata: Metadata = { title: 'Deposit' };

export default function Page() {
  return <Deposit />;
}
