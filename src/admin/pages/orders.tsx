import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Package as PackageIcon,
  Truck,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  StickyNote,
  ShoppingBag,
} from 'lucide-react';
import { Card } from '@/src/admin/components/ui/card';
import { Input } from '@/src/admin/components/ui/input';
import { Button } from '@/src/admin/components/ui/button';
import { Label } from '@/src/admin/components/ui/label';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { Separator } from '@/src/admin/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/admin/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/admin/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/admin/components/ui/table';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '../context/auth';
import { useSocketEvent } from '../context/socket';
import { useDebounced, useFetch } from '../hooks/use-fetch';
import { EmptyState, OrderStatusBadge, PageHeader, Pagination, useConfirm } from '../components/shared';
import {
  ORDER_STATUSES,
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABEL,
  formatCurrency,
  formatDate,
  timeAgo,
} from '../lib/format';
import type { Order, OrderStatus, Paginated, PaymentStatus, User } from '../lib/types';

const PAGE_SIZE = 15;

function supplierLabel(o: Order) {
  return o.supplier?.supplier?.businessName || o.supplier?.name;
}

/* ----------------------------- Details sheet ----------------------------- */

function DetailRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="text-sm break-words">{children}</div>
      </div>
    </div>
  );
}

function OrderSheet({
  order,
  onOpenChange,
  onChanged,
  onDeleted,
  suppliers,
}: {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onChanged: (o: Order) => void;
  onDeleted: (id: string) => void;
  suppliers: User[];
}) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [busy, setBusy] = React.useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<{ order: Order }>, success: string) => {
    setBusy(key);
    try {
      const { order: updated } = await fn();
      onChanged(updated);
      toast.success(success);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (!order || !user) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const setStatus = (status: OrderStatus, note?: string) =>
    run('status', () => api.patch(`/orders/${order._id}/status`, { status, note }), `Marked as ${ORDER_STATUS_META[status].label.toLowerCase()}`);

  const isAdmin = user.role === 'admin';
  const isSupplier = user.role === 'supplier';
  const closed = order.status === 'delivered' || order.status === 'cancelled';
  const subtotal = order.item.unitPrice * order.item.quantity;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">{order.orderNumber}</SheetTitle>
            <OrderStatusBadge status={order.status} />
          </div>
          <SheetDescription>Placed {formatDate(order.createdAt)}</SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 p-4">
          {/* Actions */}
          {isAdmin && (
            <div className="grid gap-4 rounded-xl border p-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={order.status} onValueChange={(v) => setStatus(v as OrderStatus)} disabled={!!busy}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} disabled={s === 'assigned' && !order.supplier}>
                        {ORDER_STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Select
                  value={order.supplier?._id ?? 'none'}
                  disabled={!!busy || closed}
                  onValueChange={(v) =>
                    run('assign', () => api.patch(`/orders/${order._id}/assign`, { supplierId: v === 'none' ? null : v }), v === 'none' ? 'Supplier removed' : 'Supplier assigned')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assign a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {order.supplier && !suppliers.some((s) => s._id === order.supplier!._id) && (
                      <SelectItem value={order.supplier._id}>{supplierLabel(order)}</SelectItem>
                    )}
                    {suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.supplier?.businessName || s.name}
                        {s.supplier?.serviceAreas?.length ? (
                          <span className="text-muted-foreground ml-1 text-xs">· {s.supplier.serviceAreas.slice(0, 2).join(', ')}</span>
                        ) : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {suppliers.length === 0 && <p className="text-muted-foreground text-xs">No active suppliers yet — approve one under Suppliers.</p>}
              </div>
              <div className="grid gap-2">
                <Label>Payment</Label>
                <Select
                  value={order.paymentStatus}
                  disabled={!!busy}
                  onValueChange={(v) => run('pay', () => api.patch(`/orders/${order._id}`, { paymentStatus: v as PaymentStatus }), 'Payment status updated')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isSupplier && !closed && (
            <div className="grid gap-2">
              {order.status === 'assigned' && (
                <Button size="lg" disabled={!!busy || user.status !== 'active'} onClick={() => setStatus('out_for_delivery')}>
                  {busy ? <Loader2 className="animate-spin" /> : <Truck />} Start delivery
                </Button>
              )}
              {order.status === 'out_for_delivery' && (
                <Button
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                  disabled={!!busy}
                  onClick={async () => {
                    if (await confirm({ title: 'Mark as delivered?', description: `Confirm ${order.item.quantity} × ${order.item.packageTitle} was handed to ${order.customer.name}.`, confirmText: 'Delivered' })) {
                      setStatus('delivered');
                    }
                  }}
                >
                  {busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Mark delivered
                </Button>
              )}
            </div>
          )}

          {user.role === 'user' && ['pending', 'confirmed'].includes(order.status) && (
            <Button
              variant="outline"
              className="text-destructive"
              disabled={!!busy}
              onClick={async () => {
                if (await confirm({ title: 'Cancel this order?', description: 'This cannot be undone.', confirmText: 'Cancel order', destructive: true })) {
                  setStatus('cancelled', 'Cancelled by customer');
                }
              }}
            >
              <XCircle /> Cancel order
            </Button>
          )}

          {/* Item */}
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Item</h3>
            <div className="bg-muted/50 grid gap-2 rounded-xl p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span>
                  {order.item.packageTitle} <span className="text-muted-foreground">× {order.item.quantity}</span>
                </span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {order.item.jarDeposit > 0 && (
                <div className="text-muted-foreground flex justify-between">
                  <span>Jar deposit</span>
                  <span className="tabular-nums">{formatCurrency(order.item.jarDeposit)}</span>
                </div>
              )}
              <div className="text-muted-foreground flex justify-between">
                <span>Delivery</span>
                <span>{order.deliveryCharge ? formatCurrency(order.deliveryCharge) : 'Free'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Customer</h3>
            <div className="grid gap-3">
              <DetailRow icon={Phone} label={order.customer.name}>
                <a href={`tel:${order.customer.phone}`} className="text-primary hover:underline">{order.customer.phone}</a>
              </DetailRow>
              <DetailRow icon={MapPin} label={order.customer.area}>{order.customer.address}</DetailRow>
              {order.deliverySlot && <DetailRow icon={Clock} label="Delivery slot">{order.deliverySlot}</DetailRow>}
              <DetailRow icon={CreditCard} label="Payment">
                {PAYMENT_METHOD_LABEL[order.paymentMethod]} ·{' '}
                <span className={cn(order.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                  {order.paymentStatus}
                </span>
              </DetailRow>
              {order.notes && <DetailRow icon={StickyNote} label="Notes">{order.notes}</DetailRow>}
              {!isSupplier && order.supplier && (
                <DetailRow icon={Truck} label="Supplier">
                  {supplierLabel(order)}
                  {order.supplier.phone && <span className="text-muted-foreground"> · {order.supplier.phone}</span>}
                </DetailRow>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">Timeline</h3>
            <ol className="relative ml-1.5 grid gap-4 border-l pl-5">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className={cn('ring-background absolute top-1 -left-[25px] size-2.5 rounded-full ring-4', ORDER_STATUS_META[h.status].dot)} />
                  <p className="text-sm font-medium">{ORDER_STATUS_META[h.status].label}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(h.at)}
                    {h.by?.name && ` · ${h.by.name}`}
                  </p>
                  {h.note && <p className="text-muted-foreground mt-0.5 text-xs">{h.note}</p>}
                </li>
              ))}
            </ol>
          </div>

          {isAdmin && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive justify-self-start"
              onClick={async () => {
                if (!(await confirm({ title: `Delete ${order.orderNumber}?`, description: 'The order will be permanently removed.', confirmText: 'Delete', destructive: true }))) return;
                try {
                  await api.delete(`/orders/${order._id}`);
                  toast.success('Order deleted');
                  onDeleted(order._id);
                } catch (err) {
                  toast.error((err as Error).message);
                }
              }}
            >
              <Trash2 /> Delete order
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* --------------------------------- Page --------------------------------- */

export function OrdersPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = React.useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search);
  const isAdmin = user?.role === 'admin';

  React.useEffect(() => setPage(1), [status, debouncedSearch, supplierFilter]);

  const { data, setData, loading, error, refetch } = useFetch<Paginated<Order>>('/orders', {
    page,
    limit: PAGE_SIZE,
    status: status === 'all' ? undefined : status,
    search: debouncedSearch,
    supplier: isAdmin && supplierFilter !== 'all' ? supplierFilter : undefined,
  });

  const { data: supplierData } = useFetch<Paginated<User>>(isAdmin ? '/users' : null, {
    role: 'supplier',
    status: 'active',
    limit: 100,
  });
  const suppliers = supplierData?.items ?? [];

  // Selected order: driven by ?open=<id> so links from toasts/overview work.
  const openId = params.get('open');
  const [selected, setSelected] = React.useState<Order | null>(null);
  React.useEffect(() => {
    if (!openId) {
      setSelected(null);
      return;
    }
    const local = data?.items.find((o) => o._id === openId);
    if (local) {
      setSelected(local);
      return;
    }
    api
      .get<{ order: Order }>(`/orders/${openId}`)
      .then(({ order }) => setSelected(order))
      .catch((err) => {
        toast.error(err.message);
        setParams({}, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const openOrder = (o: Order) => {
    setSelected(o);
    setParams({ open: o._id });
  };
  const closeOrder = () => setParams({}, { replace: true });

  const upsert = React.useCallback(
    (o: Order) => {
      setData((d) => (d ? { ...d, items: d.items.map((x) => (x._id === o._id ? o : x)) } : d));
      setSelected((s) => (s?._id === o._id ? o : s));
    },
    [setData]
  );

  // Realtime
  useSocketEvent<Order>('order:new', (o) => {
    const matches = status === 'all' || status === o.status;
    if (page === 1 && matches && !debouncedSearch) {
      setData((d) => (d ? { ...d, items: [o, ...d.items].slice(0, PAGE_SIZE), total: d.total + 1 } : d));
    }
  });
  useSocketEvent<Order>('order:updated', (o) => {
    const inList = data?.items.some((x) => x._id === o._id);
    if (inList) upsert(o);
    else if (user?.role === 'supplier' && page === 1) refetch(); // newly assigned to me
  });
  useSocketEvent<{ _id: string }>('order:removed', ({ _id }) => {
    setData((d) => (d ? { ...d, items: d.items.filter((x) => x._id !== _id), total: Math.max(0, d.total - 1) } : d));
    if (selected?._id === _id) closeOrder();
  });

  const tabs: (OrderStatus | 'all')[] =
    user?.role === 'supplier' ? ['all', 'assigned', 'out_for_delivery', 'delivered'] : ['all', ...ORDER_STATUSES];

  return (
    <>
      <PageHeader
        title={user?.role === 'supplier' ? 'My deliveries' : user?.role === 'user' ? 'My orders' : 'Orders'}
        description={
          isAdmin
            ? 'Review incoming orders, assign suppliers and track every delivery.'
            : user?.role === 'supplier'
              ? 'Orders assigned to you. Update the status as you deliver.'
              : 'Every order you placed while signed in.'
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="grid gap-3 border-b p-4">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {tabs.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                  status === s ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {s === 'all' ? 'All' : ORDER_STATUS_META[s].label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input placeholder="Search order #, name, phone or area" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {isAdmin && (
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All suppliers</SelectItem>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.supplier?.businessName || s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {loading && !data ? (
          <div className="grid gap-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Couldn't load orders" description={error} action={<Button onClick={refetch}>Retry</Button>} />
        ) : !data?.items.length ? (
          <EmptyState icon={ShoppingBag} title="No orders found" description={search || status !== 'all' ? 'Try a different filter or search.' : 'Orders will show up here in realtime.'} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Item</TableHead>
                    {isAdmin && <TableHead className="hidden xl:table-cell">Supplier</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((o) => (
                    <TableRow key={o._id} className="cursor-pointer" onClick={() => openOrder(o)}>
                      <TableCell className="pl-4">
                        <p className="font-medium">{o.orderNumber}</p>
                        <p className="text-muted-foreground text-xs">{timeAgo(o.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{o.customer.name}</p>
                        <p className="text-muted-foreground max-w-56 truncate text-xs">
                          {o.customer.phone} · {o.customer.area}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="max-w-52 truncate">{o.item.packageTitle}</p>
                        <p className="text-muted-foreground text-xs">Qty {o.item.quantity}</p>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="hidden xl:table-cell">
                          {supplierLabel(o) ?? <span className="text-muted-foreground">Unassigned</span>}
                        </TableCell>
                      )}
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right font-medium tabular-nums">{formatCurrency(o.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {data.items.map((o) => (
                <li key={o._id}>
                  <button className="hover:bg-muted/50 grid w-full gap-2 p-4 text-left" onClick={() => openOrder(o)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{o.orderNumber}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <PackageIcon className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {o.item.quantity} × {o.item.packageTitle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">
                        {o.customer.name} · <span className="text-muted-foreground">{o.customer.area}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(o.total)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>

      <OrderSheet
        order={openId ? selected : null}
        onOpenChange={(open) => !open && closeOrder()}
        onChanged={upsert}
        onDeleted={(id) => {
          setData((d) => (d ? { ...d, items: d.items.filter((x) => x._id !== id), total: d.total - 1 } : d));
          closeOrder();
        }}
        suppliers={suppliers}
      />
    </>
  );
}
