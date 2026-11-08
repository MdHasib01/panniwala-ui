import { Suspense } from 'react';
import { LoginPage } from '@/src/account/AuthPages';
import { Spinner } from '@/src/account/ui';

export default function Page() {
  // Reads ?next= (where to return after signing in), so it renders on the client.
  return (
    <Suspense fallback={<Spinner className="min-h-[60vh] items-center" />}>
      <LoginPage />
    </Suspense>
  );
}
