import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrdersPage } from '@/src/admin/pages/orders';

export const metadata: Metadata = { title: 'Orders' };

export default function Page() {
  // Driven by query params (e.g. ?open=<id>), so it renders on the client.
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
