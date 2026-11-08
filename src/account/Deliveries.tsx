'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Truck, CheckCircle2, Banknote, Phone, MapPin, Navigation, Clock3, Loader2, StickyNote, MessageCircle, PackageCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '@/src/lib/auth';
import { useSocketEvent } from '@/src/lib/socket';
import { toBengaliNumber } from '@/src/data/packages';
import { bnDate, taka } from '@/src/lib/order-status';
import type { Order, OrderStatus, Paginated, StatsOverview } from '@/src/lib/models';
import { AccountHeader, AccountPage, EmptyCard, Spinner, StatusPill } from './ui';

type Tab = 'active' | 'done';
// pending/confirmed orders only reach a supplier when they're attached to them,
// so they count as assigned here (the server widens "assigned" the same way).
const TAB_STATUS: Record<Tab, OrderStatus[]> = {
  active: ['pending', 'confirmed', 'assigned', 'out_for_delivery'],
  done: ['delivered'],
};
const READY_TO_START: OrderStatus[] = ['pending', 'confirmed', 'assigned'];

function DeliveryCard({ order, onChange, canAct }: { order: Order; onChange: (o: Order) => void; canAct: boolean }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.customer.address}, ${order.customer.area}, Khulna`)}`;
  const toCollect = order.paymentMethod === 'cod' && order.paymentStatus !== 'paid';

  const move = async (status: OrderStatus) => {
    setBusy(true);
    try {
      const { order: updated } = await api.patch<{ order: Order }>(`/orders/${order._id}/status`, { status });
      onChange(updated);
      toast.success(status === 'delivered' ? 'ডেলিভারি সম্পন্ন হয়েছে' : 'ডেলিভারি শুরু হয়েছে');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <article className={cn('rounded-2xl border bg-white p-4 shadow-xs sm:p-5', order.status === 'out_for_delivery' ? 'border-cyan-300 ring-1 ring-cyan-200' : 'border-slate-200/80')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-cyan-700">#{order.orderNumber}</p>
          <p className="text-xs text-slate-500">{bnDate(order.createdAt)}</p>
        </div>
        <StatusPill status={READY_TO_START.includes(order.status) ? 'assigned' : order.status} />
      </div>

      {/* Customer */}
      <div className="mt-3 rounded-xl bg-slate-50 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{order.customer.name}</p>
            <p className="text-sm text-slate-600">{order.customer.phone}</p>
          </div>
          <a href={`tel:${order.customer.phone}`} aria-label="গ্রাহককে কল করুন" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Phone className="h-5 w-5" />
          </a>
        </div>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2.5 flex items-start gap-2 text-sm text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
          <span className="flex-1">
            {order.customer.address}, <span className="font-semibold">{order.customer.area}</span>
          </span>
          <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
        </a>
        {order.deliverySlot && (
          <p className="mt-1.5 flex items-start gap-2 text-xs text-slate-500">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {order.deliverySlot}
          </p>
        )}
        {order.notes && (
          <p className="mt-1.5 flex items-start gap-2 text-xs text-slate-500">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {order.notes}
          </p>
        )}
      </div>

      {/* Item + money */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
          {order.item.packageTitle} × {toBengaliNumber(order.item.quantity)}
        </p>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-slate-900">{taka(order.total)}</p>
          <p className={cn('text-[11px] font-semibold', toCollect ? 'text-amber-600' : 'text-emerald-600')}>
            {toCollect ? 'ক্যাশ সংগ্রহ করুন' : order.paymentStatus === 'paid' ? 'পরিশোধিত' : order.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'}
          </p>
        </div>
      </div>
      {!order.item.hasEmptyJar && order.item.jarDeposit > 0 && (
        <p className="mt-1 text-xs text-slate-500">খালি জার নেই — জার জামানত {taka(order.item.jarDeposit)} মোট বিলে যুক্ত</p>
      )}

      {/* Actions */}
      {canAct && READY_TO_START.includes(order.status) && (
        <button onClick={() => move('out_for_delivery')} disabled={busy} className="btn-shine mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 font-bold text-white shadow-md shadow-cyan-600/25 disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Truck className="h-5 w-5" />} ডেলিভারি শুরু করুন
        </button>
      )}
      {canAct && order.status === 'out_for_delivery' && (
        confirming ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setConfirming(false)} className="h-12 rounded-xl bg-slate-100 font-bold text-slate-700">ফিরে যান</button>
            <button onClick={() => move('delivered')} disabled={busy} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white disabled:opacity-60">
              {busy && <Loader2 className="h-5 w-5 animate-spin" />} নিশ্চিত করুন
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/25">
            <CheckCircle2 className="h-5 w-5" /> ডেলিভারি সম্পন্ন
          </button>
        )
      )}
    </article>
  );
}

export default function DeliveriesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('active');
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsOverview['totals'] | null>(null);
  const active = user?.status === 'active';

  const loadStats = useCallback(() => {
    api.get<StatsOverview>('/stats/overview').then((s) => setStats(s.totals)).catch(() => {});
  }, []);

  const load = useCallback(async (t: Tab) => {
    const res = await api.get<Paginated<Order>>('/orders', { status: TAB_STATUS[t].join(','), limit: 50 });
    setItems(res.items);
  }, []);

  useEffect(() => {
    setLoading(true);
    load(tab)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [tab, load]);
  useEffect(loadStats, [loadStats]);

  const upsert = (o: Order) => {
    setItems((prev) => {
      const mine = o.supplier?._id === user?._id;
      if (!mine || !TAB_STATUS[tab].includes(o.status)) return prev.filter((x) => x._id !== o._id);
      return prev.some((x) => x._id === o._id) ? prev.map((x) => (x._id === o._id ? o : x)) : [o, ...prev];
    });
    loadStats();
  };

  useSocketEvent<Order>('order:updated', upsert);
  useSocketEvent<{ _id: string }>('order:removed', ({ _id }) => {
    setItems((prev) => prev.filter((x) => x._id !== _id));
    loadStats();
  });

  return (
    <AccountPage>
      <AccountHeader title="আমার ডেলিভারি" subtitle={user?.supplier?.businessName || user?.name} />

      {!active && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">আপনার অ্যাকাউন্টটি অনুমোদনের অপেক্ষায়</p>
            <p className="mt-0.5 text-amber-800/90">অ্যাডমিন অনুমোদন দিলেই এখানে ডেলিভারি অর্ডার আসবে — আপনাকে সাথে সাথে জানানো হবে।</p>
            <Link href="/chat" className="mt-2 inline-flex items-center gap-1.5 font-bold text-amber-900 underline underline-offset-2">
              <MessageCircle className="h-4 w-4" /> সাপোর্টে মেসেজ করুন
            </Link>
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'চলমান', value: toBengaliNumber(stats?.inProgress ?? 0), icon: Truck, tone: 'bg-cyan-50 text-cyan-700' },
          { label: 'সম্পন্ন', value: toBengaliNumber(stats?.delivered ?? 0), icon: PackageCheck, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'মোট বিক্রি', value: taka(stats?.revenue ?? 0), icon: Banknote, tone: 'bg-violet-50 text-violet-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4">
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', s.tone)}>
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-2 truncate text-lg font-bold text-slate-900 sm:text-xl">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {([
          { value: 'active', label: 'চলমান ডেলিভারি' },
          { value: 'done', label: 'সম্পন্ন' },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn('h-10 rounded-lg text-sm font-bold transition-all', tab === t.value ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : !items.length ? (
        <EmptyCard
          icon={tab === 'active' ? Truck : PackageCheck}
          title={tab === 'active' ? 'এই মুহূর্তে কোনো ডেলিভারি নেই' : 'এখনো কোনো ডেলিভারি সম্পন্ন হয়নি'}
          description={tab === 'active' ? 'নতুন অর্ডার আপনাকে দেওয়া হলেই এখানে চলে আসবে।' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <DeliveryCard key={o._id} order={o} onChange={upsert} canAct={active} />
          ))}
        </div>
      )}
    </AccountPage>
  );
}
