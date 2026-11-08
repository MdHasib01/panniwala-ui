import type { OrderStatus, PaymentMethod, Role, UserStatus } from './types';

const taka = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatCurrency = (n: number) => `৳${taka.format(n || 0)}`;
export const formatNumber = (n: number) => taka.format(n || 0);

export function formatDate(iso?: string, withTime = true) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 45) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)}d ago`;
  return formatDate(iso, false);
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25',
    dot: 'bg-blue-500',
  },
  assigned: {
    label: 'Assigned',
    className: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25',
    dot: 'bg-violet-500',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    className: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
    dot: 'bg-cyan-500',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25',
    dot: 'bg-rose-500',
  },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

export const USER_STATUS_META: Record<UserStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25' },
  pending: { label: 'Pending approval', className: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25' },
  suspended: { label: 'Suspended', className: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25' },
};

export const ROLE_META: Record<Role, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-primary/12 text-primary border-primary/25' },
  supplier: { label: 'Supplier', className: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25' },
  user: { label: 'Customer', className: 'bg-secondary text-secondary-foreground' },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: 'Cash on delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
};
