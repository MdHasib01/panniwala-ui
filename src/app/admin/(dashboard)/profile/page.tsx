import type { Metadata } from 'next';
import { ProfilePage } from '@/src/admin/pages/profile';

export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <ProfilePage />;
}
