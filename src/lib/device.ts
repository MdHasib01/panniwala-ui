/**
 * Identifies this browser so the server can recognise the same person across
 * guest orders and after they sign in. Browsers don't expose a MAC address; this
 * random id lives in localStorage and is sent with every API call (X-Device-Id).
 * Guest orders are also remembered here until the person signs in, when the
 * server moves the orders placed on this device onto their account.
 */

const DEVICE_KEY = 'pw_device_id';
const GUEST_ORDERS_KEY = 'pw_guest_orders';
const MAX_GUEST_ORDERS = 50;

let memoryId: string | null = null;

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** This browser's device id (created on first use). Empty during server rendering. */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id || !/^[A-Za-z0-9-]{8,64}$/.test(id)) {
      id = newId();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // storage unavailable (private mode) — keep one id for this page session
    memoryId ??= newId();
    return memoryId;
  }
}

export interface GuestOrder {
  orderNumber: string;
  phone: string;
  placedAt: string;
}

export function getGuestOrders(): GuestOrder[] {
  try {
    const list = JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) || '[]');
    return Array.isArray(list) ? list.filter((o) => o && typeof o.orderNumber === 'string') : [];
  } catch {
    return [];
  }
}

/** Remembers an order placed without signing in, so it can be tracked from this device. */
export function rememberGuestOrder(orderNumber: string, phone: string) {
  try {
    const list = getGuestOrders().filter((o) => o.orderNumber !== orderNumber);
    list.unshift({ orderNumber, phone, placedAt: new Date().toISOString() });
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(list.slice(0, MAX_GUEST_ORDERS)));
  } catch {
    // storage unavailable — the order can still be tracked by number + phone
  }
}

/** After signing in the orders belong to the account, so the guest list is no longer needed. */
export function clearGuestOrders() {
  try {
    localStorage.removeItem(GUEST_ORDERS_KEY);
  } catch {
    // ignore
  }
}
