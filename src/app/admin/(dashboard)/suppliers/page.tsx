import type { Metadata } from 'next';
import { SuppliersPage } from '@/src/admin/pages/suppliers';

export const metadata: Metadata = { title: 'Suppliers' };

export default function Page() {
  return <SuppliersPage />;
}
