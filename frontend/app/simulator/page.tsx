import type { Metadata } from 'next';
import { Simulator } from '@/components/screens/Simulator';

export const metadata: Metadata = { title: 'Simulator' };

export default function Page() {
  return <Simulator />;
}
