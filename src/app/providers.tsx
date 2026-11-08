'use client';

import * as React from 'react';
import { AuthProvider } from '@/src/lib/auth';
import { SocketProvider } from '@/src/lib/socket';

/** One session + one realtime socket shared by the website and the dashboard. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  );
}
