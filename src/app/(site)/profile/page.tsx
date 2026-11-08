import ProfilePage from '@/src/account/Profile';
import { RequireAuth } from '@/src/account/ui';

export default function Page() {
  return (
    <RequireAuth roles={['user', 'supplier']}>
      <ProfilePage />
    </RequireAuth>
  );
}
