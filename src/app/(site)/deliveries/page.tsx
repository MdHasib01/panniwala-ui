import DeliveriesPage from '@/src/account/Deliveries';
import { RequireAuth } from '@/src/account/ui';

export default function Page() {
  return (
    <RequireAuth roles={['supplier']}>
      <DeliveriesPage />
    </RequireAuth>
  );
}
