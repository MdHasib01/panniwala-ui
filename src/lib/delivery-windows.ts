import type { DeliveryWindow, SupplierWindow } from './models';

/**
 * Delivery windows in Bangladesh time; must match server/src/models/delivery-windows.js.
 * Suppliers mark which windows they cover per zone; customers pick one when ordering.
 */
export const SUPPLIER_WINDOWS: { key: SupplierWindow; label: string; labelEn: string }[] = [
  { key: 'morning', label: 'সকাল (৯টা - ১২টা)', labelEn: 'Morning 9–12' },
  { key: 'afternoon', label: 'দুপুর (২টা - ৫টা)', labelEn: 'Afternoon 2–5' },
  { key: 'evening', label: 'সন্ধ্যা (৬টা - ৯টা)', labelEn: 'Evening 6–9' },
];

/** 0 = Sunday … 6 = Saturday */
export const WEEKDAYS: { day: number; label: string; labelEn: string }[] = [
  { day: 6, label: 'শনি', labelEn: 'Sat' },
  { day: 0, label: 'রবি', labelEn: 'Sun' },
  { day: 1, label: 'সোম', labelEn: 'Mon' },
  { day: 2, label: 'মঙ্গল', labelEn: 'Tue' },
  { day: 3, label: 'বুধ', labelEn: 'Wed' },
  { day: 4, label: 'বৃহঃ', labelEn: 'Thu' },
  { day: 5, label: 'শুক্র', labelEn: 'Fri' },
];

export interface DeliverySlotOption {
  key: 'today-express' | 'today-evening' | 'tomorrow-morning' | 'tomorrow-afternoon';
  day: 'today' | 'tomorrow';
  window: DeliveryWindow;
  /** Stored on the order as `deliverySlot` and shown to the supplier. */
  label: string;
}

/** What a customer can pick when ordering. */
export const DELIVERY_SLOTS: DeliverySlotOption[] = [
  { key: 'today-express', day: 'today', window: 'express', label: 'আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)' },
  { key: 'today-evening', day: 'today', window: 'evening', label: 'আজ সন্ধ্যায় (৬টা - ৯টা)' },
  { key: 'tomorrow-morning', day: 'tomorrow', window: 'morning', label: 'আগামীকাল সকাল (৯টা - ১২টা)' },
  { key: 'tomorrow-afternoon', day: 'tomorrow', window: 'afternoon', label: 'আগামীকাল দুপুর (২টা - ৫টা)' },
];

/** Short English summary of a supplier's zone availability, e.g. "Morning, Evening · Sat–Thu". */
export function describeAvailability(windows: string[], days: number[]): string {
  const w = SUPPLIER_WINDOWS.filter((x) => windows.includes(x.key)).map((x) => x.labelEn.split(' ')[0]);
  const d = days.length === 7 ? 'every day' : WEEKDAYS.filter((x) => days.includes(x.day)).map((x) => x.labelEn).join(', ');
  return `${w.join(', ')} · ${d}`;
}
