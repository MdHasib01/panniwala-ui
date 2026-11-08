import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Package, PackageSearch, Plus, Phone, Truck, Loader2, MapPin, Search, LogIn, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '@/src/lib/auth';
import { useSocketEvent } from '@/src/lib/socket';
import { toBengaliNumber } from '@/src/data/packages';
import { bnDate, taka } from '@/src/lib/order-status';
import type { Order, OrderStatus, Paginated } from '@/src/lib/models';
import { useSite } from '@/src/site/context';
import { AccountHeader, AccountPage, EmptyCard, OrderProgress, Spinner, StatusPill, fieldClass } from './ui';

const ACTIVE: OrderStatus[] = ['pending', 'confirmed', 'assigned', 'out_for_delivery'];
type Filter = 'active' | 'done' | 'all';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'active', label: 'চলমান' },
  { value: 'done', label: 'সম্পন্ন' },
  { value: 'all', label: 'সব' },
];
const statusQuery = (f: Filter) => (f === 'active' ? ACTIVE.join(',') : f === 'done' ? 'delivered,cancelled' : undefined);
const matches = (f: Filter, s: OrderStatus) => f === 'all' || (f === 'active' ? ACTIVE.includes(s) : !ACTIVE.includes(s));

function OrderCard({ order, onChange }: { order: Order; onChange: (o: Order) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const supplier = order.supplier;

  const cancel = async () => {
    setBusy(true);
    try {
      const { order: updated } = await api.patch<{ order: Order }>(`/orders/${order._id}/status`, { status: 'cancelled', note: 'Cancelled by customer' });
      onChange(updated);
      toast.success('অর্ডার বাতিল করা হয়েছে');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-cyan-700">#{order.orderNumber}</p>
          <p className="text-xs text-slate-500">{bnDate(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{order.item.packageTitle}</p>
          <p className="text-xs text-slate-500">
            {toBengaliNumber(order.item.quantity)} টি · {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'}
          </p>
        </div>
        <p className="shrink-0 text-base font-bold text-slate-900">{taka(order.total)}</p>
      </div>

      {order.status !== 'cancelled' && (
        <div className="mt-4">
          <OrderProgress status={order.status} />
        </div>
      )}

      {supplier && (order.status === 'assigned' || order.status === 'out_for_delivery') && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white"><Truck className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">ডেলিভারি দিচ্ছেন</p>
            <p className="truncate text-sm font-bold text-slate-900">{supplier.supplier?.businessName || supplier.name}</p>
          </div>
          {supplier.phone && (
            <a href={`tel:${supplier.phone}`} className="flex h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-cyan-700 ring-1 ring-cyan-200">
              <Phone className="h-4 w-4" /> কল
            </a>
          )}
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {order.customer.address}, {order.customer.area}
      </p>

      {canCancel && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm text-slate-600">অর্ডারটি বাতিল করবেন?</span>
              <button onClick={() => setConfirming(false)} className="h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">না</button>
              <button onClick={cancel} disabled={busy} className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-sm font-bold text-white disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} হ্যাঁ, বাতিল
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700">
              <XCircle className="h-4 w-4" /> অর্ডার বাতিল করুন
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/** Guests can still follow an order with its number and phone. */
function TrackOrder() {
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderNumber: string; status: OrderStatus; total: number; createdAt: string; item: { packageTitle: string; quantity: number } } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const num = number.trim().toUpperCase().replace(/^#/, '');
      const { order } = await api.get<{ order: NonNullable<typeof result> }>(`/orders/track/${encodeURIComponent(num.startsWith('PW-') ? num : `PW-${num}`)}`, { phone: phone.replace(/[\s-]/g, '') });
      setResult(order);
    } catch {
      setError('এই অর্ডার নম্বর ও মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountPage>
      <AccountHeader title="অর্ডার ট্র্যাক করুন" subtitle="অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে খুঁজুন" />
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="অর্ডার নম্বর" placeholder="অর্ডার নম্বর (যেমন: PW-123456)" className={fieldClass} value={number} onChange={(e) => setNumber(e.target.value)} required />
          <input aria-label="মোবাইল নম্বর" type="tel" inputMode="tel" placeholder="মোবাইল নম্বর" className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Search className="h-4.5 w-4.5" />} খুঁজুন
        </button>
        {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">{error}</p>}
      </form>

      {result && (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-cyan-700">#{result.orderNumber}</p>
              <p className="text-xs text-slate-500">{bnDate(result.createdAt)}</p>
            </div>
            <StatusPill status={result.status} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {result.item.packageTitle} × {toBengaliNumber(result.item.quantity)} — {taka(result.total)}
          </p>
          {result.status !== 'cancelled' && <div className="mt-4"><OrderProgress status={result.status} /></div>}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 p-5 text-white">
        <p className="font-bold">সব অর্ডার এক জায়গায় দেখতে চান?</p>
        <p className="mt-1 text-sm text-cyan-100">লগইন করে অর্ডার করলে লাইভ আপডেট পাবেন ও সাপোর্টের সাথে চ্যাট করতে পারবেন।</p>
        <div className="mt-4 flex gap-2">
          <Link to="/login" state={{ from: { pathname: '/orders' } }} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-bold text-cyan-800">
            <LogIn className="h-4 w-4" /> লগইন
          </Link>
          <Link to="/register" className="flex h-11 flex-1 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white ring-1 ring-white/30">
            রেজিস্টার
          </Link>
        </div>
      </div>
    </AccountPage>
  );
}

function CustomerOrders() {
  const { openOrder } = useSite();
  const [filter, setFilter] = useState<Filter>('active');
  const [items, setItems] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (f: Filter, p: number) => {
    const res = await api.get<Paginated<Order>>('/orders', { status: statusQuery(f), page: p, limit: 10 });
    setItems((prev) => (p === 1 ? res.items : [...prev, ...res.items.filter((o) => !prev.some((x) => x._id === o._id))]));
    setPage(res.page);
    setPages(res.pages);
  }, []);

  useEffect(() => {
    setLoading(true);
    load(filter, 1)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [filter, load]);

  const upsert = (o: Order) =>
    setItems((prev) => {
      const exists = prev.some((x) => x._id === o._id);
      if (!matches(filter, o.status)) return prev.filter((x) => x._id !== o._id);
      return exists ? prev.map((x) => (x._id === o._id ? o : x)) : [o, ...prev];
    });

  // Live updates: new orders from the order form and status changes by the team.
  useSocketEvent<Order>('order:new', upsert);
  useSocketEvent<Order>('order:updated', upsert);
  useSocketEvent<{ _id: string }>('order:removed', ({ _id }) => setItems((prev) => prev.filter((x) => x._id !== _id)));

  return (
    <AccountPage>
      <AccountHeader
        title="আমার অর্ডার"
        subtitle="অর্ডারের অবস্থা লাইভ আপডেট হয়"
        action={
          <button onClick={() => openOrder()} className="hidden h-10 items-center gap-1.5 rounded-xl bg-cyan-600 px-4 text-sm font-bold text-white hover:bg-cyan-700 sm:inline-flex">
            <Plus className="h-4 w-4" /> নতুন অর্ডার
          </button>
        }
      />

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'h-9 rounded-full px-4 text-sm font-bold transition-colors',
              filter === f.value ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : !items.length ? (
        <EmptyCard
          icon={filter === 'active' ? Package : PackageSearch}
          title={filter === 'active' ? 'কোনো চলমান অর্ডার নেই' : 'কোনো অর্ডার পাওয়া যায়নি'}
          description="লগইন থাকা অবস্থায় করা অর্ডারগুলো এখানে দেখাবে।"
          action={
            <button onClick={() => openOrder()} className="flex h-11 items-center gap-1.5 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white">
              <Plus className="h-4 w-4" /> এখনই অর্ডার করুন
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <OrderCard key={o._id} order={o} onChange={upsert} />
          ))}
          {page < pages && (
            <button
              onClick={async () => {
                setLoadingMore(true);
                await load(filter, page + 1).catch((err) => toast.error(err.message));
                setLoadingMore(false);
              }}
              disabled={loadingMore}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} আরও দেখুন
            </button>
          )}
        </div>
      )}
    </AccountPage>
  );
}

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="min-h-[60vh] items-center" />;
  if (!user) return <TrackOrder />;
  if (user.role === 'supplier') return <Navigate to="/deliveries" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/orders" replace />;
  return <CustomerOrders />;
}
