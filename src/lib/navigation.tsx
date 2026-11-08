'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Client-side redirect for auth/role guards (the App Router equivalent of
 * React Router's `<Navigate replace />`). Renders `fallback` until the router moves on.
 */
export function Redirect({ to, fallback = null }: { to: string; fallback?: React.ReactNode }) {
  const router = useRouter();
  React.useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return <>{fallback}</>;
}

/** Query param that carries "come back here after signing in". */
export const NEXT_PARAM = 'next';

/** `/login?next=/chat` style link that brings the user back to `returnTo` after auth. */
export function withNext(path: string, returnTo: string) {
  return `${path}?${NEXT_PARAM}=${encodeURIComponent(returnTo)}`;
}

/** Reads `?next=` and only accepts same-site paths (never `//evil.com` or `https://…`). */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  return value;
}

/* ----------------------------- location.hash ----------------------------- */

// The App Router updates the URL with history.pushState/replaceState, which don't fire
// `hashchange`, so we announce those calls ourselves to keep `useHash` in sync.
const LOCATION_EVENT = 'pw:locationchange';
let historyPatched = false;

function patchHistory() {
  if (historyPatched || typeof window === 'undefined') return;
  historyPatched = true;
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method];
    window.history[method] = function (this: History, ...args: Parameters<History['pushState']>) {
      const result = original.apply(this, args);
      // Deferred: the router calls this while committing, where state updates aren't allowed.
      setTimeout(() => window.dispatchEvent(new Event(LOCATION_EVENT)), 0);
      return result;
    } as History['pushState'];
  }
}

function subscribe(onChange: () => void) {
  patchHistory();
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  window.addEventListener(LOCATION_EVENT, onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(LOCATION_EVENT, onChange);
  };
}

const getHash = () => window.location.hash;
const getServerHash = () => '';

/** Current `location.hash` (e.g. `#packages`), kept live across client navigations. */
export function useHash(): string {
  // Re-read on route changes too, in case the router skipped history calls.
  usePathname();
  return React.useSyncExternalStore(subscribe, getHash, getServerHash);
}
