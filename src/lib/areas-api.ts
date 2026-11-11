import { useEffect, useState } from 'react';
import defaults from '@/src/data/locations.default.json';
import type { Location, Zone } from './models';
import { api } from './api';

export type LocationData = { areas: Location[]; zones: Zone[] };

/** The bundled defaults, shaped like the API's answer (seed ids stand in for ids). */
const FALLBACK: LocationData = {
  zones: defaults.zones.map((z, i) => ({
    _id: z.seedId,
    name: z.nameBn || z.nameEn,
    nameEn: z.nameEn,
    nameBn: z.nameBn,
    minMinutes: z.minMinutes,
    maxMinutes: z.maxMinutes,
    sortOrder: i,
  })),
  areas: defaults.areas.map((a, i) => ({
    _id: a.seedId,
    name: a.nameBn || a.nameEn,
    nameEn: a.nameEn,
    nameBn: a.nameBn,
    aliases: a.aliases,
    zone: a.zone,
    sortOrder: i,
  })),
};

/**
 * Delivery locations and zones managed from the admin dashboard. Like packages,
 * the bundled list renders immediately and the live list replaces it once the API
 * answers (or stays if the API is unreachable).
 */
let cache: LocationData | null = null;
let inflight: Promise<LocationData> | null = null;
const listeners = new Set<(data: LocationData) => void>();

function loadLocations(): Promise<LocationData> {
  if (cache) return Promise.resolve(cache);
  inflight ??= api
    .get<{ items: Location[]; zones: Zone[] }>('/areas')
    .then(({ items, zones }) => {
      cache = { areas: items.map((a) => ({ ...a, aliases: a.aliases ?? [], zone: a.zone ?? null })), zones: zones ?? [] };
      return cache;
    })
    .catch(() => FALLBACK)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Call after an admin changes locations or zones so every open picker reloads them. */
export function invalidateAreas() {
  cache = null;
  loadLocations().then((data) => listeners.forEach((fn) => fn(data)));
}

export function useLocations(): LocationData {
  const [data, setData] = useState<LocationData>(cache ?? FALLBACK);
  useEffect(() => {
    let alive = true;
    const update = (d: LocationData) => alive && setData(d);
    listeners.add(update);
    loadLocations().then(update);
    return () => {
      alive = false;
      listeners.delete(update);
    };
  }, []);
  return data;
}

/** Display names of every location (what users and orders store). */
export function useAreas(): string[] {
  return useLocations().areas.map((a) => a.name);
}

/** Comparison key matching the server's: NFC, no invisible joiners, single-spaced, case-insensitive. */
export const areaKey = (name: string) =>
  name
    .normalize('NFC')
    .replace(/[​-‍﻿]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

/** "English" under a Bengali display name, if the two differ. */
export const secondaryName = (l: { name: string; nameEn?: string }) => (l.nameEn && l.nameEn !== l.name ? l.nameEn : undefined);
