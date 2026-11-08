import { Suspense } from 'react';
import { RegisterPage } from '@/src/account/AuthPages';
import { Spinner } from '@/src/account/ui';

export default function Page() {
  // Reads ?as=supplier and ?next=, so it renders on the client.
  return (
    <Suspense fallback={<Spinner className="min-h-[60vh] items-center" />}>
      <RegisterPage />
    </Suspense>
  );
}
