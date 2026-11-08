import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FullPageLoader, GuestOnly } from '@/src/admin/components/layout';
import { LoginPage } from '@/src/admin/pages/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default function Page() {
  // GuestOnly reads ?next= (where to return after signing in), so it renders on the client.
  return (
    <Suspense fallback={<FullPageLoader />}>
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    </Suspense>
  );
}
