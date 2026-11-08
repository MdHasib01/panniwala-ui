import { useEffect, useState } from 'react';
import { KHULNA_AREAS } from '@/src/data/packages';
import { api } from './api';

/**
 * Delivery areas managed from the admin dashboard. Like packages, the bundled
 * list renders immediately and the live list replaces it once the API answers
 * (or stays if the API is unreachable).
 */
let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;
const listeners = new Set<(areas: string[]) => void>();

function loadAreas(): Promise<string[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= api
    .get<{ items: { name: string }[] }>('/areas')
    .then(({ items }) => {
      cache = items.map((a) => a.name);
      return cache;
    })
    .catch(() => KHULNA_AREAS)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Call after an admin changes the list so every open picker reloads it. */
export function invalidateAreas() {
  cache = null;
  loadAreas().then((areas) => listeners.forEach((fn) => fn(areas)));
}

export function useAreas(): string[] {
  const [areas, setAreas] = useState<string[]>(cache ?? KHULNA_AREAS);
  useEffect(() => {
    let alive = true;
    const update = (a: string[]) => alive && setAreas(a);
    listeners.add(update);
    loadAreas().then(update);
    return () => {
      alive = false;
      listeners.delete(update);
    };
  }, []);
  return areas;
}

/** Comparison key matching the server's: trimmed, single-spaced, case-insensitive. */
export const areaKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
