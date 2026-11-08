import type { Metadata } from 'next';
import { UsersPage } from '@/src/admin/pages/users';

export const metadata: Metadata = { title: 'Users' };

export default function Page() {
  return <UsersPage />;
}
