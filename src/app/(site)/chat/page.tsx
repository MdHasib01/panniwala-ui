import SupportChatPage from '@/src/account/SupportChat';
import { RequireAuth } from '@/src/account/ui';

export default function Page() {
  return (
    <RequireAuth roles={['user', 'supplier']}>
      <SupportChatPage />
    </RequireAuth>
  );
}
