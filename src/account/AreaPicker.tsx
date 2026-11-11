import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Clock3, MapPin, Plus, Search, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toBengaliNumber } from '@/src/data/packages';
import { areaKey, secondaryName, useLocations } from '@/src/lib/areas-api';
import { useLocationSearch } from '@/src/lib/location-search';
import type { NewLocation } from '@/src/lib/models';

/** A supplier's picks: listed locations (by display name) plus new ones for the admin to approve. */
export type AreaSelection = { areas: string[]; newAreas: NewLocation[] };

export const emptySelection = (areas: string[] = []): AreaSelection => ({ areas, newAreas: [] });

/** Request body fields for /auth/register/supplier and PATCH /auth/me. */
export const toAreaBody = (s: AreaSelection) => ({ serviceAreas: s.areas, newAreas: s.newAreas });

const HAS_BENGALI = /[ঀ-৿]/;
const fieldClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none';

/**
 * Supplier service-area picker: fuzzy-search the approved list (Bengali or
 * English) and pick several, or propose a missing location with its English
 * name (required), Bengali name, similar names and zone. Before a new one is
 * added, look-alike locations are offered so suppliers pick those instead of
 * creating duplicates. New locations go to the admin as requests.
 */
export function AreaPicker({ id, value, onChange }: { id?: string; value: AreaSelection; onChange: (next: AreaSelection) => void }) {
  const { areas, zones } = useLocations();
  const { search, similar } = useLocationSearch(areas, zones);
  const zoneName = useMemo(() => new Map(zones.map((z) => [z._id, z.name])), [zones]);

  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState<(NewLocation & { aliasText: string }) | null>(null);

  const selected = useMemo(() => new Set(value.areas.map(areaKey)), [value.areas]);
  const results = useMemo(() => search(query, 60), [search, query]);
  const q = query.trim().replace(/\s+/g, ' ');
  const exact = q && areas.some((a) => [a.name, a.nameEn, a.nameBn, ...a.aliases].some((n) => n && areaKey(n) === areaKey(q)));
  const canCreate = q.length >= 2 && !exact;
  const rowCount = results.length + (canCreate ? 1 : 0);
  const total = value.areas.length + value.newAreas.length;

  const close = () => {
    setOpen(false);
    setQuery('');
    setDraft(null);
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
    if (open && !draft) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, draft, listId]);

  const toggle = (name: string) =>
    onChange({
      ...value,
      areas: selected.has(areaKey(name)) ? value.areas.filter((a) => areaKey(a) !== areaKey(name)) : [...value.areas, name],
    });
  const removeNew = (i: number) => onChange({ ...value, newAreas: value.newAreas.filter((_, j) => j !== i) });

  const startDraft = () => {
    const bn = HAS_BENGALI.test(q);
    setDraft({ nameEn: bn ? '' : q, nameBn: bn ? q : '', aliasText: '', zone: null });
  };

  const draftAliases = (text: string) =>
    text
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);

  const lookalikes = useMemo(
    () => (draft ? similar({ nameEn: draft.nameEn, nameBn: draft.nameBn, aliases: draftAliases(draft.aliasText) }) : []),
    [draft, similar]
  );
  const draftValid = !!draft && draft.nameEn.trim().length >= 2;

  const pickExisting = (name: string) => {
    if (!selected.has(areaKey(name))) onChange({ ...value, areas: [...value.areas, name] });
    setDraft(null);
    setQuery('');
    searchRef.current?.focus();
  };

  const addDraft = () => {
    if (!draft || !draftValid) return;
    const proposal: NewLocation = {
      nameEn: draft.nameEn.trim(),
      nameBn: draft.nameBn?.trim() || undefined,
      aliases: draftAliases(draft.aliasText),
      zone: draft.zone || null,
    };
    const keys = [proposal.nameEn, proposal.nameBn].filter(Boolean).map((n) => areaKey(n!));
    // Same name as a listed location: just select that one.
    const same = areas.find((a) => [a.name, a.nameEn, a.nameBn, ...a.aliases].some((n) => n && keys.includes(areaKey(n))));
    if (same) return pickExisting(same.name);
    const dup = value.newAreas.some((n) => keys.includes(areaKey(n.nameEn)) || (n.nameBn && keys.includes(areaKey(n.nameBn))));
    if (!dup) onChange({ ...value, newAreas: [...value.newAreas, proposal] });
    setDraft(null);
    setQuery('');
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rowCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault(); // never submit the surrounding form from here
      if (canCreate && active === results.length) startDraft();
      else if (results[active]) toggle(results[active].name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  // Enter inside the mini form adds the location instead of submitting the page's form.
  const onDraftKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDraft();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraft(null);
    }
  };

  return (
    <div ref={rootRef} className="space-y-2">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : (setActive(0), setOpen(true)))}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-[15px] transition-colors',
          open ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'
        )}
      >
        <span className={cn('truncate', total ? 'font-semibold text-slate-900' : 'text-slate-400')}>
          {total ? `${toBengaliNumber(total)}টি এলাকা নির্বাচিত` : 'এলাকা নির্বাচন করুন'}
        </span>
        <ChevronDown className={cn('h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {total > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.areas.map((v) => (
            <span key={v} className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 py-1 pr-1 pl-2.5 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-200">
              <span className="truncate">{v}</span>
              <button type="button" onClick={() => toggle(v)} aria-label={`${v} বাদ দিন`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-cyan-700 hover:bg-cyan-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {value.newAreas.map((n, i) => (
            <span
              key={`new-${n.nameEn}`}
              title="অনুমোদনের অপেক্ষায়"
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-50 py-1 pr-1 pl-2.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
            >
              <Clock3 className="h-3 w-3 shrink-0" />
              <span className="truncate">{n.nameBn || n.nameEn}</span>
              <button type="button" onClick={() => removeNew(i)} aria-label={`${n.nameEn} বাদ দিন`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {value.newAreas.length > 0 && <p className="text-xs text-amber-700">হলুদ চিহ্নিত নতুন এলাকাগুলো অ্যাডমিন অনুমোদন দিলে তালিকায় যুক্ত হবে।</p>}

      {open && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          {draft ? (
            <div className="space-y-3 p-3.5" onKeyDown={onDraftKey}>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setDraft(null)} aria-label="ফিরে যান" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-bold text-slate-800">নতুন এলাকা যোগ করুন</p>
              </div>

              {lookalikes.length > 0 && (
                <div className="rounded-lg bg-cyan-50/70 p-2.5 ring-1 ring-cyan-100">
                  <p className="mb-1.5 text-xs font-semibold text-cyan-900">এগুলোর কোনোটা? (Did you mean)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lookalikes.map((l) => (
                      <button
                        key={l._id}
                        type="button"
                        onClick={() => pickExisting(l.name)}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-100"
                      >
                        <MapPin className="h-3 w-3" />
                        {l.name}
                        {secondaryName(l) && <span className="font-normal text-slate-500">· {secondaryName(l)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  ইংরেজি নাম (English) <span className="text-rose-500">*</span>
                </span>
                <input
                  autoFocus
                  className={fieldClass}
                  value={draft.nameEn}
                  onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
                  placeholder="e.g. Sonadanga R/A"
                  maxLength={120}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">বাংলা নাম (ঐচ্ছিক)</span>
                <input className={fieldClass} value={draft.nameBn ?? ''} onChange={(e) => setDraft({ ...draft, nameBn: e.target.value })} placeholder="যেমন: সোনাডাঙ্গা আবাসিক" maxLength={120} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">মিলে যায় এমন অন্য নাম (ঐচ্ছিক)</span>
                <input className={fieldClass} value={draft.aliasText} onChange={(e) => setDraft({ ...draft, aliasText: e.target.value })} placeholder="কমা দিয়ে আলাদা করুন, যেমন: Shonadanga, সোনাডাঙা" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">জোন (ঐচ্ছিক)</span>
                <select className={fieldClass} value={draft.zone ?? ''} onChange={(e) => setDraft({ ...draft, zone: e.target.value || null })}>
                  <option value="">জোন জানা নেই</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z._id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setDraft(null)} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
                  বাতিল
                </button>
                <button type="button" disabled={!draftValid} onClick={addDraft} className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-50">
                  যোগ করুন
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative border-b border-slate-100">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="search"
                  role="combobox"
                  aria-expanded
                  aria-controls={listId}
                  aria-activedescendant={active < rowCount ? `${listId}-${active}` : undefined}
                  placeholder="এলাকা খুঁজুন (বাংলা / English) বা নতুন লিখুন…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onSearchKey}
                  className="h-11 w-full bg-transparent pr-3 pl-10 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <ul id={listId} role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto overscroll-contain py-1">
                {rowCount === 0 && <li className="px-3.5 py-6 text-center text-sm text-slate-500">এই নামে কোনো এলাকা নেই</li>}
                {results.map((loc, i) => {
                  const on = selected.has(areaKey(loc.name));
                  const en = secondaryName(loc);
                  return (
                    <li
                      key={loc._id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={on}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => toggle(loc.name)}
                      className={cn('flex cursor-pointer items-center gap-3 px-3.5 py-2', i === active && 'bg-cyan-50')}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          on ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300 bg-white'
                        )}
                      >
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm', on ? 'font-bold text-cyan-800' : 'font-medium text-slate-800')}>{loc.name}</span>
                        {en && <span className="block text-xs text-slate-500">{en}</span>}
                      </span>
                      {loc.zone && zoneName.get(loc.zone) && (
                        <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">{zoneName.get(loc.zone)}</span>
                      )}
                    </li>
                  );
                })}
                {canCreate && (
                  <li
                    id={`${listId}-${results.length}`}
                    role="option"
                    aria-selected={false}
                    onMouseEnter={() => setActive(results.length)}
                    onClick={startDraft}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 border-t border-slate-100 px-3.5 py-2.5 text-sm font-semibold text-cyan-700',
                      active === results.length && 'bg-cyan-50'
                    )}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-100">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">“{q}” তালিকায় নেই? নতুন এলাকা হিসেবে যোগ করুন</span>
                  </li>
                )}
              </ul>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-2 py-2">
                <button
                  type="button"
                  onClick={() => onChange(emptySelection())}
                  disabled={!total}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-40"
                >
                  সব মুছুন
                </button>
                <button type="button" onClick={close} className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-700">
                  সম্পন্ন
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
