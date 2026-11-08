import * as React from 'react';
import { api } from '@/src/lib/api';

type Query = Record<string, string | number | boolean | undefined | null>;

/**
 * Tiny data-fetching hook: refetches whenever `path` or `query` change.
 * `setData` allows optimistic/realtime updates without a round trip.
 */
export function useFetch<T>(path: string | null, query?: Query) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(!!path);
  const [nonce, setNonce] = React.useState(0);
  const queryKey = JSON.stringify(query ?? {});

  React.useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<T>(path, JSON.parse(queryKey))
      .then((res) => !cancelled && setData(res))
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, queryKey, nonce]);

  const refetch = React.useCallback(() => setNonce((n) => n + 1), []);
  return { data, setData, error, loading, refetch };
}

/** Debounces a fast-changing value (e.g. a search box). */
export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
