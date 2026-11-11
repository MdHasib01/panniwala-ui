'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLocations } from '@/src/lib/areas-api';
import { SUPPLIER_WINDOWS, WEEKDAYS } from '@/src/lib/delivery-windows';
import type { SupplierWindow, ZoneAvailability } from '@/src/lib/models';

const ALL_DAYS = WEEKDAYS.map((d) => d.day);
const ALL_WINDOWS = SUPPLIER_WINDOWS.map((w) => w.key);
const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors',
        on ? 'border-primary bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'
      )}
    >
      {on && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

/**
 * Which zones a supplier can deliver to, and when: windows (morning/afternoon/evening)
 * and weekdays per zone. Auto-select uses this when nobody lists the customer's
 * exact area. Controlled; `lang` picks Bengali (supplier site) or English (admin).
 */
export function AvailabilityPicker({
  value,
  onChange,
  lang = 'bn',
}: {
  value: ZoneAvailability[];
  onChange: (next: ZoneAvailability[]) => void;
  lang?: 'bn' | 'en';
}) {
  // Only live zones (the bundled offline fallback has no real ids to save).
  const zones = useLocations().zones.filter((z) => isObjectId(z._id));
  const en = lang === 'en';
  const byZone = new Map(value.map((a) => [a.zone, a]));

  const update = (zone: string, next: ZoneAvailability | null) => {
    const rest = value.filter((a) => a.zone !== zone);
    onChange(next ? [...rest, next] : rest);
  };
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  if (!zones.length) {
    return <p className="text-muted-foreground text-sm">{en ? 'No delivery zones yet.' : 'এখনো কোনো জোন নেই।'}</p>;
  }

  return (
    <div className="space-y-2.5">
      {zones.map((z) => {
        const entry = byZone.get(z._id);
        const label = en ? z.nameEn : z.name;
        return (
          <div key={z._id} className={cn('rounded-xl border p-3', entry && 'border-primary/40 bg-primary/5')}>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="accent-primary h-4 w-4"
                checked={!!entry}
                onChange={(e) =>
                  update(z._id, e.target.checked ? { zone: z._id, windows: [...ALL_WINDOWS], days: [...ALL_DAYS] } : null)
                }
              />
              <span className="text-sm font-semibold">{label}</span>
              {!en && z.nameEn && z.nameEn !== z.name && <span className="text-muted-foreground text-xs">{z.nameEn}</span>}
            </label>

            {entry && (
              <div className="mt-3 space-y-2.5 pl-6.5">
                <div className="flex flex-wrap gap-1.5">
                  {SUPPLIER_WINDOWS.map((w) => (
                    <Chip
                      key={w.key}
                      on={entry.windows.includes(w.key)}
                      onClick={() => update(z._id, { ...entry, windows: toggle<SupplierWindow>(entry.windows, w.key) })}
                    >
                      {en ? w.labelEn : w.label}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => (
                    <Chip key={d.day} on={entry.days.includes(d.day)} onClick={() => update(z._id, { ...entry, days: toggle(entry.days, d.day) })}>
                      {en ? d.labelEn : d.label}
                    </Chip>
                  ))}
                </div>
                {(!entry.windows.length || !entry.days.length) && (
                  <p className="text-xs text-amber-600">
                    {en ? 'Pick at least one time and one day, or this zone will not be saved.' : 'অন্তত একটি সময় ও একটি দিন বাছাই করুন, নাহলে এই জোন সেভ হবে না।'}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
