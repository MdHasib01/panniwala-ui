/**
 * The delivery details from the last order placed on this device, so the next order
 * starts filled in. Signed-in customers also get their area/address saved to the
 * profile by the server; this covers guests and the name/phone used on the order.
 */
export interface SavedDetails {
  name: string;
  phone: string;
  area: string;
  address: string;
}

const KEY = 'pw_order_details';

export function loadSavedDetails(): Partial<SavedDetails> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return {};
    const out: Partial<SavedDetails> = {};
    for (const k of ['name', 'phone', 'area', 'address'] as const) {
      if (typeof data[k] === 'string' && data[k].trim()) out[k] = data[k];
    }
    return out;
  } catch {
    return {};
  }
}

export function saveDetails(details: SavedDetails) {
  try {
    localStorage.setItem(KEY, JSON.stringify(details));
  } catch {
    // storage unavailable (private mode) — details just won't be remembered
  }
}
