import type { Metadata } from 'next';
import { AdminNotFound } from '@/src/admin/AdminProviders';

export const metadata: Metadata = { title: 'Page not found' };

/** Unknown dashboard URLs show a 404 inside the dashboard shell. */
export default function Page() {
  return <AdminNotFound />;
}
