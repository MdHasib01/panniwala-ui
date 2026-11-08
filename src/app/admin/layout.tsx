import type { Metadata } from 'next';
import { AdminProviders } from '@/src/admin/AdminProviders';

export const metadata: Metadata = {
  title: { template: '%s · Pani Wala Dashboard', default: 'Pani Wala Dashboard' },
  robots: { index: false, follow: false },
};

/** Everything under /admin — admins only (see the (dashboard) layout). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
