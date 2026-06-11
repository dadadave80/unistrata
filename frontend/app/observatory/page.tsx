import type { Metadata } from 'next';
import { Observatory } from '@/components/screens/Observatory';

export const metadata: Metadata = { title: 'Observatory' };

export default function Page() {
  return <Observatory />;
}
