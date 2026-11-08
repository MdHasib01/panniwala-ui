import type { Metadata } from 'next';
import HomePage from '@/src/views/Home';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Page() {
  return <HomePage />;
}
