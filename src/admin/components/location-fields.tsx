'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, MapPin, Search } from 'lucide-react';
import { Button } from '@/src/admin/components/ui/button';
import { Checkbox } from '@/src/admin/components/ui/checkbox';
import { Input } from '@/src/admin/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/admin/components/ui/popover';
import { areaKey, secondaryName, useLocations } from '@/src/lib/areas-api';
import { groupByZone, useLocationSearch } from '@/src/lib/location-search';
import { cn } from '@/src/lib/utils';

/** One location (by display name) with fuzzy search, in the dashboard's style. */
export function AdminLocationSelect({ id, value, onChange }: { id?: string; value: string; onChange: (name: string) => void }) {
  const { areas, zones } = useLocations();
  const { search } = useLocationSearch(areas, zones);
  const zoneName = React.useMemo(() => new Map(zones.map((z) => [z._id, z.name])), [zones]);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const results = React.useMemo(() => search(query, 50), [search, query]);
  const selected = areas.find((a) => areaKey(a.name) === areaKey(value));

  const pick = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={(o) => (setOpen(o), o || setQuery(''))}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value ? (selected?.name ?? value) : 'Select a location'}
            {selected && secondaryName(selected) && <span className="text-muted-foreground"> · {secondaryName(selected)}</span>}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
        <div className="relative border-b">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (results[0]) pick(results[0].name);
              }
            }}
            placeholder="Search in English or বাংলা…"
            className="h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto p-1">
          {value && !query && (
            <li>
              <button type="button" onClick={() => pick('')} className="text-muted-foreground hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-xs">
                Clear selection
              </button>
            </li>
          )}
          {!results.length && <li className="text-muted-foreground px-2 py-6 text-center text-sm">No matching location</li>}
          {results.map((loc) => (
            <li key={loc._id}>
              <button type="button" onClick={() => pick(loc.name)} className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm">
                <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{loc.name}</span>
                  {secondaryName(loc) && <span className="text-muted-foreground block truncate text-xs">{secondaryName(loc)}</span>}
                </span>
                {loc.zone && <span className="text-muted-foreground hidden max-w-32 truncate text-[11px] sm:inline">{zoneName.get(loc.zone)}</span>}
                {selected?._id === loc._id && <Check className="size-4 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/** Several locations (by display name): fuzzy search box over a checklist grouped by zone. */
export function AdminLocationChecklist({ value, onChange, className }: { value: string[]; onChange: (next: string[]) => void; className?: string }) {
  const { areas, zones } = useLocations();
  const { search } = useLocationSearch(areas, zones);
  const [query, setQuery] = React.useState('');
  const chosen = React.useMemo(() => new Set(value.map(areaKey)), [value]);
  const groups = React.useMemo(() => {
    const list = query.trim() ? search(query, 100) : areas;
    return query.trim() ? [{ zone: null, areas: list }] : groupByZone(list, zones);
  }, [areas, zones, search, query]);

  const toggle = (name: string, on: boolean) =>
    onChange(on ? [...value, name] : value.filter((v) => areaKey(v) !== areaKey(name)));

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search locations" className="pl-9" />
        </div>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{value.length} selected</span>
      </div>
      <div className="grid max-h-56 gap-3 overflow-y-auto rounded-lg border p-3">
        {!groups.some((g) => g.areas.length) && <p className="text-muted-foreground py-4 text-center text-sm">No matching location</p>}
        {groups.map(({ zone, areas: list }) =>
          list.length ? (
            <div key={zone?._id ?? 'all'} className="grid gap-1.5">
              {(zone || !query.trim()) && <p className="text-muted-foreground text-xs font-semibold">{zone?.name ?? 'No zone'}</p>}
              <div className="grid gap-1.5 sm:grid-cols-2">
                {list.map((a) => (
                  <label key={a._id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={chosen.has(areaKey(a.name))} onCheckedChange={(v) => toggle(a.name, !!v)} />
                    <span className="min-w-0 truncate">
                      {a.name}
                      {secondaryName(a) && <span className="text-muted-foreground text-xs"> · {secondaryName(a)}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
