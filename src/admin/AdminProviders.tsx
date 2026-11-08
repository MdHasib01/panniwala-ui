'use client';

import * as React from 'react';
import Link from 'next/link';
import { Toaster } from '@/src/admin/components/ui/sonner';
import { TooltipProvider } from '@/src/admin/components/ui/tooltip';
import { Button } from '@/src/admin/components/ui/button';
import { ThemeProvider } from './context/theme';
import { ConfirmProvider, EmptyState } from './components/shared';

/** Unknown /admin/* page, rendered inside the dashboard shell. */
export function AdminNotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="This dashboard page doesn't exist."
      action={<Button asChild><Link href="/admin">Back to overview</Link></Button>}
    />
  );
}

/**
 * Wraps everything under /admin (see src/app/admin/layout.tsx). Admins only — the
 * dashboard layout redirects everyone else to their pages on the website. Auth and
 * the socket come from the app root. Next.js code-splits the dashboard per route,
 * so the landing page stays lightweight.
 */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ConfirmProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ConfirmProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
