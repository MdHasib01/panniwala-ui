import type { Metadata } from 'next';
import { PackagesPage } from '@/src/admin/pages/packages';

export const metadata: Metadata = { title: 'Packages' };

export default function Page() {
  return <PackagesPage />;
}
