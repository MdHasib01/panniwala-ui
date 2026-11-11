import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { areaKey, secondaryName, useLocations } from '@/src/lib/areas-api';
import { useLocationSearch } from '@/src/lib/location-search';
import { HOTLINE_NUMBER } from '@/src/data/packages';

/**
 * Pick one delivery location with fuzzy search (Bengali or English, typos are
 * fine). Each row shows the Bengali name, the English name under it and its zone.
 * `value` / `onChange` use the location's display name, which is what users and
 * orders store.
 */
export function LocationSelect({
  id,
  value,
  onChange,
  placeholder = 'এলাকা নির্বাচন করুন',
  allowClear = false,
  className,
}: {
  id?: string;
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}) {
  const { areas, zones } = useLocations();
  const { search } = useLocationSearch(areas, zones);
  const zoneName = useMemo(() => new Map(zones.map((z) => [z._id, z.name])), [zones]);

  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const selected = useMemo(() => areas.find((a) => areaKey(a.name) === areaKey(value)), [areas, value]);
  const results = useMemo(() => search(query, 60), [search, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const pick = (name: string) => {
    onChange(name);
    close();
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, listId]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) pick(results[active].name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const sub = selected ? secondaryName(selected) : undefined;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : (setActive(0), setOpen(true)))}
        className={cn(
          'flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2 text-left text-[15px] transition-colors',
          open ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
          {value ? (
            <span className="min-w-0">
              <span className="block truncate font-semibold text-slate-900">{selected?.name ?? value}</span>
              {sub && <span className="block truncate text-xs text-slate-500">{sub}</span>}
            </span>
          ) : (
            <span className="truncate text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={cn('h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
          <div className="relative border-b border-slate-100">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="search"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
              placeholder="বাংলা বা English-এ এলাকার নাম লিখুন…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
              className="h-11 w-full bg-transparent pr-3 pl-10 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {allowClear && value && !query && (
              <li
                role="option"
                aria-selected={false}
                onClick={() => pick('')}
                className="cursor-pointer px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                নির্বাচন মুছুন
              </li>
            )}
            {results.length === 0 && (
              <li className="px-3.5 py-6 text-center text-sm text-slate-500">
                এই নামে কোনো এলাকা পাওয়া যায়নি। কল দিন: <span className="font-bold">{HOTLINE_NUMBER}</span>
              </li>
            )}
            {results.map((loc, i) => {
              const on = selected?._id === loc._id;
              const en = secondaryName(loc);
              return (
                <li
                  key={loc._id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={on}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(loc.name)}
                  className={cn('flex cursor-pointer items-center gap-3 px-3.5 py-2', i === active && 'bg-cyan-50')}
                >
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm', on ? 'font-bold text-cyan-800' : 'font-semibold text-slate-800')}>{loc.name}</span>
                    {en && <span className="block text-xs text-slate-500">{en}</span>}
                  </span>
                  {loc.zone && zoneName.get(loc.zone) && (
                    <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">
                      {zoneName.get(loc.zone)}
                    </span>
                  )}
                  {on && <Check className="h-4 w-4 shrink-0 text-cyan-600" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
