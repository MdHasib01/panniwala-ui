import { areaKey, useAreas } from '@/src/lib/areas-api';
import { MultiSelect } from './MultiSelect';

/** Splits picked names into listed areas and new ones that need admin approval. */
export function splitAreas(picked: string[], options: readonly string[]) {
  const listed = new Set(options.map(areaKey));
  return {
    serviceAreas: picked.filter((a) => listed.has(areaKey(a))),
    newAreas: picked.filter((a) => !listed.has(areaKey(a))),
  };
}

/**
 * Supplier service-area picker: search the approved list, pick several, or add an
 * area that's missing. New areas are sent to the admin as requests and only join
 * the shared list once approved.
 */
export function AreaPicker({ id, value, onChange }: { id?: string; value: string[]; onChange: (next: string[]) => void }) {
  const areas = useAreas();
  return (
    <MultiSelect
      id={id}
      options={areas}
      value={value}
      onChange={onChange}
      creatable
      placeholder="এলাকা নির্বাচন করুন"
      searchPlaceholder="এলাকা খুঁজুন বা নতুন লিখুন…"
      unit="টি এলাকা নির্বাচিত"
      emptyText="এই নামে কোনো এলাকা নেই"
      createLabel={(q) => <>“{q}” নতুন এলাকা হিসেবে যোগ করুন</>}
      customLabel="অনুমোদন বাকি"
      customHint="হলুদ চিহ্নিত নতুন এলাকাগুলো অ্যাডমিন অনুমোদন দিলে তালিকায় যুক্ত হবে।"
    />
  );
}
