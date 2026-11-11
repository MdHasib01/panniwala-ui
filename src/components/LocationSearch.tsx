'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, MapPin, Search, ShoppingBag } from 'lucide-react';
import { HOTLINE_NUMBER, HOTLINE_TEL, toBengaliNumber } from '@/src/data/packages';
import { secondaryName, setPickedArea, useLocations } from '@/src/lib/areas-api';
import { useLocationSearch } from '@/src/lib/location-search';
import type { Location } from '@/src/lib/models';
import { cn } from '@/src/lib/utils';

type Variant = 'hero' | 'section' | 'panel';

/**
 * "Do you deliver to my area?" search: fuzzy suggestions while typing (Bengali or
 * English, typos ok), then a green result with the zone and delivery time and an
 * order button, or an amber "not yet" with look-alike suggestions. The picked
 * location is remembered so the order form starts with it.
 *
 *  - hero:    large field for the home page hero
 *  - section: the service-area section's field with a "check" button
 *  - panel:   compact, for the navbar dropdown
 */
export function LocationSearch({
  variant = 'section',
  onOpenOrder,
  autoFocus,
  placeholder,
  className,
  picked,
}: {
  /** Picks a location from outside (e.g. a chip); a new object each time re-picks it. */
  picked?: { location: Location } | null;
  variant?: Variant;
  onOpenOrder: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const { areas, zones } = useLocations();
  const { search, similar } = useLocationSearch(areas, zones);
  const zoneById = useMemo(() => new Map(zones.map((z) => [z._id, z])), [zones]);

  const listId = `${useId()}-suggestions`;
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  // What was checked: a location that was picked, or free text that matched nothing.
  const [checked, setChecked] = useState<{ query: string; location: Location | null } | null>(null);

  const suggestions = useMemo(() => (query.trim() ? search(query, 6) : []), [search, query]);
  const showSuggestions = focused && suggestions.length > 0 && checked?.query !== query;
  const didYouMean = useMemo(
    () => (checked && !checked.location ? similar({ nameEn: checked.query, nameBn: checked.query }, 3) : []),
    [checked, similar]
  );

  const choose = (loc: Location) => {
    setQuery(loc.name);
    setChecked({ query: loc.name, location: loc });
    setFocused(false);
    setPickedArea(loc.name);
  };

  useEffect(() => {
    if (picked) choose(picked.location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  useEffect(() => {
    if (!focused) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [focused]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // A highlighted suggestion wins; otherwise the best fuzzy match, if any.
    const pick = showSuggestions ? suggestions[active] : search(q, 1)[0];
    if (pick) return choose(pick);
    setChecked({ query: q, location: null });
    setFocused(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') return setFocused(false);
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
  };

  const found = checked?.location ?? null;
  const zone = found?.zone ? zoneById.get(found.zone) : undefined;
  const big = variant === 'hero';

  return (
    <div className={cn('text-left', className)}>
      <div ref={boxRef} className="relative">
        <form
          onSubmit={onSubmit}
          className={cn(
            'flex items-center gap-2 bg-white transition-shadow',
            big && 'p-1.5 rounded-2xl border border-slate-300 shadow-lg shadow-cyan-900/5 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/15',
            variant === 'section' && 'p-1.5 rounded-2xl border border-slate-300 shadow-md',
            variant === 'panel' && 'p-1 rounded-xl border border-slate-200 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20'
          )}
        >
          <div className="relative flex flex-1 items-center pl-3 min-w-0">
            <MapPin className={cn('shrink-0 mr-2 text-cyan-600', big ? 'w-5 h-5' : 'w-4 h-4')} />
            <input
              type="text"
              role="combobox"
              aria-label="আপনার এলাকা খুঁজুন"
              aria-expanded={showSuggestions}
              aria-controls={listId}
              aria-autocomplete="list"
              autoFocus={autoFocus}
              placeholder={placeholder ?? 'আপনার এলাকার নাম লিখুন (যেমন: সোনাডাঙ্গা, Boyra, নিরালা...)'}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                setFocused(true);
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={onKeyDown}
              className={cn(
                'w-full min-w-0 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none',
                big ? 'h-11 text-[15px]' : 'h-9 text-sm'
              )}
            />
          </div>
          <button
            type="submit"
            className={cn(
              'btn-shine inline-flex shrink-0 items-center justify-center gap-1.5 bg-cyan-600 font-semibold text-white transition-colors hover:bg-cyan-700',
              big ? 'h-11 rounded-xl px-4 sm:px-5 text-sm' : variant === 'section' ? 'h-9 rounded-xl px-5 text-xs sm:text-sm' : 'h-9 w-9 rounded-lg'
            )}
            aria-label="চেক করুন"
          >
            <Search className="w-4 h-4" />
            {variant !== 'panel' && <span className={cn(big && 'hidden sm:inline')}>চেক করুন</span>}
          </button>
        </form>

        {/* Live fuzzy suggestions */}
        {showSuggestions && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
          >
            {suggestions.map((loc, i) => {
              const zn = loc.zone ? zoneById.get(loc.zone)?.name : undefined;
              return (
                <li
                  key={loc._id}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(loc)}
                  className={cn('flex cursor-pointer items-center gap-3 px-4 py-2', i === active && 'bg-cyan-50')}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{loc.name}</span>
                    {secondaryName(loc) && <span className="block truncate text-xs text-slate-500">{secondaryName(loc)}</span>}
                  </span>
                  {zn && variant !== 'panel' && (
                    <span className="hidden max-w-40 shrink-0 truncate rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">{zn}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Result */}
      {found && (
        <div className="mt-3 flex flex-col gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 animate-in fade-in sm:text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              অভিনন্দন! <strong>{found.name}</strong> এলাকায় আমাদের এক্সপ্রেস ডেলিভারি সচল রয়েছে।
              {zone && (
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-emerald-800 sm:text-xs">
                  <span>{zone.name}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {toBengaliNumber(zone.minMinutes)}-{toBengaliNumber(zone.maxMinutes)} মিনিটে ডেলিভারি
                  </span>
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenOrder}
            className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 sm:text-sm"
          >
            <ShoppingBag className="h-4 w-4" /> এখনই অর্ডার করুন
          </button>
        </div>
      )}
      {checked && !found && (
        <div className="mt-3 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 animate-in fade-in sm:text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>&quot;{checked.query}&quot;</strong> এখনো আমাদের তালিকায় নেই। নিশ্চিত হতে কল দিন:{' '}
              <a href={`tel:${HOTLINE_TEL}`} className="font-bold underline">{HOTLINE_NUMBER}</a>
            </span>
          </div>
          {didYouMean.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pl-6">
              <span>আপনি কি খুঁজছেন:</span>
              {didYouMean.map((loc) => (
                <button
                  key={loc._id}
                  type="button"
                  onClick={() => choose(loc)}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
