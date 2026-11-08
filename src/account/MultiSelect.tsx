import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toBengaliNumber } from '@/src/data/packages';

/**
 * Searchable multi-select. Selected options are listed first; the order is
 * re-sorted when the panel opens or the search changes (not on every tick),
 * so an option doesn't jump out from under the pointer while you click.
 */
export function MultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'নির্বাচন করুন',
  searchPlaceholder = 'খুঁজুন…',
  unit = 'টি নির্বাচিত',
  emptyText = 'কিছু পাওয়া যায়নি',
}: {
  id?: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  unit?: string;
  emptyText?: string;
}) {
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pinned, setPinned] = useState<string[]>(value);
  const [active, setActive] = useState(0);

  const selected = useMemo(() => new Set(value), [value]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? options.filter((o) => o.toLowerCase().includes(q)) : [...options];
    const top = new Set(pinned);
    return [...matches.filter((o) => top.has(o)), ...matches.filter((o) => !top.has(o))];
  }, [options, query, pinned]);

  const openPanel = () => {
    setPinned(value);
    setActive(0);
    setOpen(true);
  };

  const closePanel = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closePanel();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  const toggle = (option: string) => onChange(selected.has(option) ? value.filter((v) => v !== option) : [...value, option]);

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault(); // never submit the surrounding form from here
      if (visible[active]) toggle(visible[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePanel();
    }
  };

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, listId]);

  return (
    <div ref={rootRef} className="space-y-2">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? closePanel() : openPanel())}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-[15px] transition-colors',
          open ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'
        )}
      >
        <span className={cn('truncate', value.length ? 'font-semibold text-slate-900' : 'text-slate-400')}>
          {value.length ? `${toBengaliNumber(value.length)}${unit}` : placeholder}
        </span>
        <ChevronDown className={cn('h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <div className="relative border-b border-slate-100">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="search"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPinned(value);
                setActive(0);
              }}
              onKeyDown={onSearchKey}
              className="h-11 w-full bg-transparent pr-3 pl-10 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <ul id={listId} role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {visible.length === 0 && <li className="px-3.5 py-6 text-center text-sm text-slate-500">{emptyText}</li>}
            {visible.map((option, i) => {
              const on = selected.has(option);
              return (
                <li
                  key={option}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={on}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => toggle(option)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-sm',
                    i === active ? 'bg-cyan-50' : '',
                    on ? 'font-semibold text-cyan-800' : 'text-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      on ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300 bg-white'
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-2 py-2">
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={!value.length}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-40"
            >
              সব মুছুন
            </button>
            <button type="button" onClick={closePanel} className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-700">
              সম্পন্ন
            </button>
          </div>
        </div>
      )}

      {!open && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="inline-flex max-w-full items-center gap-1 rounded-full bg-cyan-50 py-1 pr-1 pl-3 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-200">
              <span className="truncate">{v}</span>
              <button
                type="button"
                onClick={() => toggle(v)}
                aria-label={`${v} বাদ দিন`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-cyan-700 hover:bg-cyan-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
