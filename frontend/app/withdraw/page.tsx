import type { Metadata } from 'next';
import { Withdraw } from '@/components/screens/Withdraw';

export const metadata: Metadata = { title: 'Withdraw' };

export default function Page() {
  return <Withdraw />;
}
