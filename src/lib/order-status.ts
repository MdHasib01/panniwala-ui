import { ClipboardList, House, ThumbsUp, Truck, UserRound, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from './models';
import { toBengaliNumber } from '@/src/data/packages';

/** Bangla order-status labels and pill styles for the customer/supplier site. */
export const ORDER_STATUS_BN: Record<OrderStatus, { label: string; pill: string; dot: string }> = {
  pending: { label: 'অপেক্ষমাণ', pill: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  confirmed: { label: 'নিশ্চিত হয়েছে', pill: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  assigned: { label: 'সাপ্লায়ার নির্ধারিত', pill: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  out_for_delivery: { label: 'ডেলিভারিতে আছে', pill: 'bg-cyan-50 text-cyan-700 ring-cyan-200', dot: 'bg-cyan-500' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'বাতিল', pill: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
};

/** The happy-path steps shown in the order progress tracker. */
export const ORDER_STEPS: { status: OrderStatus; label: string; icon: LucideIcon }[] = [
  { status: 'pending', label: 'অর্ডার গৃহীত', icon: ClipboardList },
  { status: 'confirmed', label: 'নিশ্চিত', icon: ThumbsUp },
  { status: 'assigned', label: 'সাপ্লায়ার', icon: UserRound },
  { status: 'out_for_delivery', label: 'পথে আছে', icon: Truck },
  { status: 'delivered', label: 'পৌঁছেছে', icon: House },
];

export const taka = (n: number) => `৳${toBengaliNumber(Math.round(n || 0))}`;

export function bnDate(iso?: string, withTime = true) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('bn-BD', {
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

export function bnTime(iso: string) {
  return new Date(iso).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
}
