import type { Metadata } from 'next';
import { AreasPage } from '@/src/admin/pages/areas';

export const metadata: Metadata = { title: 'Areas' };

export default function Page() {
  return <AreasPage />;
}
