import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ChatPage } from '@/src/admin/pages/chat';

export const metadata: Metadata = { title: 'Messages' };

export default function Page() {
  // Driven by query params (e.g. ?c=<id>), so it renders on the client.
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}
