'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2, Monitor, Moon, Sun } from 'lucide-react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/admin/components/ui/sidebar';
import { Separator } from '@/src/admin/components/ui/separator';
import { Button } from '@/src/admin/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/src/admin/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/admin/components/ui/tooltip';
import { cn } from '@/src/lib/utils';
import { AppSidebar } from './app-sidebar';
import { homePathFor, useAuth } from '@/src/lib/auth';
import { useSocket } from '@/src/lib/socket';
import { useTheme, type Theme } from '../context/theme';
import { NEXT_PARAM, Redirect, safeNextPath, withNext } from '@/src/lib/navigation';

const TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/orders': 'Orders',
  '/admin/chat': 'Messages',
  '/admin/packages': 'Packages',
  '/admin/users': 'Users',
  '/admin/suppliers': 'Suppliers',
  '/admin/areas': 'Areas',
  '/admin/profile': 'Profile',
};

export function FullPageLoader() {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <Loader2 className="text-primary size-7 animate-spin" />
    </div>
  );
}

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Change theme">
          {resolvedTheme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
          <DropdownMenuRadioItem value="light">
            <Sun /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ConnectionPill() {
  const { connected } = useSocket();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
            connected ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
          )}
        >
          <span className="relative flex size-2">
            {connected && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
            <span className={cn('relative inline-flex size-2 rounded-full', connected ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
          </span>
          {connected ? 'Live' : 'Offline'}
        </span>
      </TooltipTrigger>
      <TooltipContent>{connected ? 'Realtime updates are on' : 'Reconnecting to realtime server…'}</TooltipContent>
    </Tooltip>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Header label; the browser tab title comes from each page's `metadata` (src/app/admin).
  const title = TITLES[pathname] ?? 'Dashboard';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="bg-background/80 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur md:rounded-t-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <h2 className="truncate text-sm font-medium">{title}</h2>
          <div className="ml-auto flex items-center gap-2">
            <ConnectionPill />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Admin-only dashboard shell. Customers and suppliers are sent to their own pages
 * on the website. (The realtime socket is provided at the app root.)
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  if (loading) return <FullPageLoader />;
  if (!user) return <Redirect to={withNext('/admin/login', pathname)} fallback={<FullPageLoader />} />;
  if (user.role !== 'admin') return <Redirect to={homePathFor(user)} fallback={<FullPageLoader />} />;
  return <Shell>{children}</Shell>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const params = useSearchParams();
  if (loading) return <FullPageLoader />;
  if (user) {
    if (user.role !== 'admin') return <Redirect to={homePathFor(user)} fallback={<FullPageLoader />} />;
    const from = safeNextPath(params.get(NEXT_PARAM));
    return <Redirect to={from && from.startsWith('/admin') ? from : '/admin'} fallback={<FullPageLoader />} />;
  }
  return <>{children}</>;
}
