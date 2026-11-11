import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Location, Zone } from './models';

/**
 * Fuzzy location search (Fuse.js) over the cached location list.
 *
 * Every name is folded before matching so common spelling differences don't
 * matter: Unicode NFC, Bengali digits -> ASCII, invisible joiners and hasanta
 * dropped, long/short vowels and the three s/n letters merged, ং == ঙ, and
 * English lowercased with punctuation removed. Fuse's typo-tolerant matching
 * handles the rest ("boira" -> Boyra, "gollamary" -> Gollamari).
 */
const BN_FOLD: [RegExp, string][] = [
  [/[​-‍﻿ঁ্]/g, ''], // joiners, chandrabindu, hasanta
  [/ং/g, 'ঙ'], // ং -> ঙ
  [/[শষ]/g, 'স'], // শ ষ -> স
  [/ণ/g, 'ন'], // ণ -> ন
  [/ী/g, 'ি'], // ী -> ি
  [/ূ/g, 'ু'], // ূ -> ু
  [/ঈ/g, 'ই'], // ঈ -> ই
  [/ঊ/g, 'উ'], // ঊ -> উ
  [/ড়|ড়/g, 'র'], // ড় -> র
  [/ঢ়|ঢ়/g, 'র'], // ঢ় -> র
  [/য়|য়/g, 'য'], // য় -> য
  [/জ/g, 'য'], // জ -> য (same sound)
];

export function normalizeLoc(text?: string | null): string {
  if (!text) return '';
  let s = text.normalize('NFC').toLowerCase();
  s = s.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
  for (const [rx, to] of BN_FOLD) s = s.replace(rx, to);
  return s
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Words too common in place names to suggest a duplicate on their own (already folded). */
const GENERIC_WORDS = new Set(
  ['bazar', 'bazaar', 'road', 'more', 'residential', 'area', 'housing', 'estate', 'avenue', 'para', 'ghat', 'upazila', 'zone', 'phase', 'market', 'বাজার', 'রোড', 'মোড়', 'আবাসিক', 'এলাকা', 'ঘাট', 'উপজেলা', 'জোন'].map(normalizeLoc)
);

type Doc = { loc: Location; bn: string; en: string; aliases: string[]; zone: string };

export type LocationSearch = {
  /** Best matches first; with an empty query, every location in list order. */
  search: (query: string, limit?: number) => Location[];
  /** Existing locations that look like the proposed one (to avoid duplicates). */
  similar: (draft: { nameEn?: string; nameBn?: string; aliases?: string[] }, limit?: number) => Location[];
};

export function createLocationSearch(areas: Location[], zones: Zone[]): LocationSearch {
  const zoneName = new Map(zones.map((z) => [z._id, `${z.nameEn} ${z.nameBn ?? ''}`]));
  const docs: Doc[] = areas.map((loc) => ({
    loc,
    bn: normalizeLoc(loc.nameBn ?? (loc.nameEn ? '' : loc.name)),
    en: normalizeLoc(loc.nameEn),
    aliases: loc.aliases.map(normalizeLoc),
    zone: normalizeLoc(loc.zone ? zoneName.get(loc.zone) : ''),
  }));
  const fuse = new Fuse(docs, {
    keys: [
      { name: 'bn', weight: 2 },
      { name: 'en', weight: 2 },
      { name: 'aliases', weight: 1.5 },
      { name: 'zone', weight: 0.4 },
    ],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.4,
    minMatchCharLength: 1,
  });

  const run = (query: string) => {
    const q = normalizeLoc(query);
    return q ? fuse.search(q) : [];
  };

  return {
    search(query, limit = 50) {
      if (!normalizeLoc(query)) return areas.slice(0, limit);
      return run(query)
        .slice(0, limit)
        .map((r) => r.item.loc);
    },
    similar(draft, limit = 5) {
      const best = new Map<string, { loc: Location; score: number }>();
      const consider = (query: string, maxScore: number, penalty = 0) => {
        for (const r of run(query)) {
          const score = (r.score ?? 1) + penalty;
          if ((r.score ?? 1) > maxScore) continue;
          const prev = best.get(r.item.loc._id);
          if (!prev || score < prev.score) best.set(r.item.loc._id, { loc: r.item.loc, score });
        }
      };
      for (const name of [draft.nameEn, draft.nameBn, ...(draft.aliases ?? [])]) {
        const q = normalizeLoc(name);
        if (q.length < 2) continue;
        consider(q, 0.4);
        // Long names dilute the match ("Sonadanga Residential"), so also try each
        // distinctive word on its own, but only near-exact hits count.
        const words = q.split(' ').filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w));
        if (q.includes(' ')) for (const w of words) consider(w, 0.1, 0.1);
      }
      return [...best.values()]
        .sort((a, b) => a.score - b.score)
        .slice(0, limit)
        .map((b) => b.loc);
    },
  };
}

/** Memoized `createLocationSearch` for components. */
export function useLocationSearch(areas: Location[], zones: Zone[]): LocationSearch {
  return useMemo(() => createLocationSearch(areas, zones), [areas, zones]);
}

/** Groups locations by zone (in zone order); locations without a zone come last. */
export function groupByZone(areas: Location[], zones: Zone[]): { zone: Zone | null; areas: Location[] }[] {
  const groups = zones.map((zone) => ({ zone, areas: areas.filter((a) => a.zone === zone._id) }));
  const known = new Set(zones.map((z) => z._id));
  const rest = areas.filter((a) => !a.zone || !known.has(a.zone));
  return [...groups.filter((g) => g.areas.length), ...(rest.length ? [{ zone: null, areas: rest }] : [])];
}
