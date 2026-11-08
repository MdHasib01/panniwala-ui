import type { Metadata } from 'next';
import { OverviewPage } from '@/src/admin/pages/overview';

export const metadata: Metadata = { title: 'Overview' };

export default function Page() {
  return <OverviewPage />;
}
