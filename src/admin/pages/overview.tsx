import * as React from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Banknote,
  ShoppingBag,
  Clock,
  Truck,
  Users,
  Store,
  CheckCircle2,
  Droplets,
  ArrowRight,
  MessagesSquare,
} from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/src/admin/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/admin/components/ui/table';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../context/auth';
import { useSocketEvent } from '../context/socket';
import { useFetch } from '../hooks/use-fetch';
import { EmptyState, OrderStatusBadge, PageHeader, StatCard } from '../components/shared';
import { ORDER_STATUSES, ORDER_STATUS_META, formatCurrency, formatNumber, timeAgo } from '../lib/format';
import type { StatsOverview } from '../lib/types';

type Metric = 'orders' | 'revenue' | 'jars';
const METRICS: { key: Metric; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'jars', label: 'Jars' },
];

function TrendChart({ series }: { series: StatsOverview['series'] }) {
  const [metric, setMetric] = React.useState<Metric>('orders');
  const config = {
    [metric]: { label: METRICS.find((m) => m.key === metric)!.label, color: 'var(--chart-1)' },
  } satisfies ChartConfig;
  const total = series.reduce((s, d) => s + d[metric], 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Last 14 days</CardTitle>
        <CardDescription>
          {metric === 'revenue' ? `${formatCurrency(total)} delivered revenue` : `${formatNumber(total)} ${metric}`}
        </CardDescription>
        <CardAction>
          <div className="bg-muted inline-flex rounded-lg p-0.5" role="tablist" aria-label="Chart metric">
            {METRICS.map((m) => (
              <button
                key={m.key}
                role="tab"
                aria-selected={metric === m.key}
                onClick={() => setMetric(m.key)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  metric === m.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${metric})`} stopOpacity={0.28} />
                <stop offset="95%" stopColor={`var(--color-${metric})`} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={metric === 'revenue' ? 56 : 32}
              allowDecimals={false}
              tickFormatter={(v: number) => (metric === 'revenue' ? `৳${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}` : String(v))}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(v) => new Date(String(v)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{config[metric].label}</span>
                      <span className="font-mono font-medium tabular-nums">
                        {metric === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey={metric}
              type="monotone"
              stroke={`var(--color-${metric})`}
              strokeWidth={2}
              fill="url(#fillMetric)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function StatusBreakdown({ counts, total }: { counts: StatsOverview['statusCounts']; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order status</CardTitle>
        <CardDescription>{formatNumber(total)} orders all-time</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {ORDER_STATUSES.map((s) => {
          const n = counts[s] || 0;
          const pct = total ? (n / total) * 100 : 0;
          return (
            <div key={s} className="grid gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', ORDER_STATUS_META[s].dot)} />
                  {ORDER_STATUS_META[s].label}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {n} <span className="text-xs">({Math.round(pct)}%)</span>
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div className={cn('h-full rounded-full transition-all', ORDER_STATUS_META[s].dot)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RankedList({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: { key: string; name: string; value: number; sub: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No data yet</p>
        ) : (
          <ul className="grid gap-4">
            {rows.map((r) => (
              <li key={r.key} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{r.name}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">{r.sub}</span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${(r.value / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentOrders({ orders, showSupplier }: { orders: StatsOverview['recentOrders']; showSupplier: boolean }) {
  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="pb-4">
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Updates in realtime</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">
              View all <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="New orders will appear here the moment they're placed." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Order</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              {showSupplier && <TableHead className="hidden lg:table-cell">Supplier</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell className="pl-6">
                  <Link to={`/admin/orders?open=${o._id}`} className="font-medium hover:underline">
                    {o.orderNumber}
                  </Link>
                  <p className="text-muted-foreground text-xs">{timeAgo(o.createdAt)}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="font-medium">{o.customer.name}</p>
                  <p className="text-muted-foreground max-w-48 truncate text-xs">{o.customer.area}</p>
                </TableCell>
                {showSupplier && (
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {o.supplier?.supplier?.businessName || o.supplier?.name || '—'}
                  </TableCell>
                )}
                <TableCell>
                  <OrderStatusBadge status={o.status} />
                </TableCell>
                <TableCell className="pr-6 text-right font-medium tabular-nums">{formatCurrency(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch<StatsOverview>('/stats/overview');

  // Refresh numbers when orders change anywhere (debounced to absorb bursts).
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const scheduleRefetch = React.useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(refetch, 600);
  }, [refetch]);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  useSocketEvent('order:new', scheduleRefetch);
  useSocketEvent('order:updated', scheduleRefetch);
  useSocketEvent('user:new', scheduleRefetch);

  if (!user) return null;
  const firstName = user.name.split(' ')[0];
  const role = user.role;

  const header = (
    <PageHeader
      title={`Hello, ${firstName} 👋`}
      description={
        role === 'admin'
          ? "Here's what's happening with Pani Wala today."
          : role === 'supplier'
            ? 'Your deliveries at a glance.'
            : 'Track your water orders and talk to our team.'
      }
      actions={
        role === 'user' ? (
          <Button asChild>
            <Link to="/">
              <Droplets /> Order water
            </Link>
          </Button>
        ) : role === 'admin' ? (
          <Button variant="outline" asChild>
            <Link to="/admin/chat">
              <MessagesSquare /> Open inbox
            </Link>
          </Button>
        ) : null
      }
    />
  );

  if (loading && !data) return <>{header}<OverviewSkeleton /></>;
  if (error || !data) {
    return (
      <>
        {header}
        <Card>
          <EmptyState title="Couldn't load the dashboard" description={error || undefined} action={<Button onClick={refetch}>Retry</Button>} />
        </Card>
      </>
    );
  }

  const t = data.totals;

  const cards =
    role === 'admin'
      ? [
          <StatCard key="rev" label="Revenue (delivered)" value={formatCurrency(t.revenue)} hint={`${formatNumber(t.jarsDelivered)} jars delivered`} icon={Banknote} tone="emerald" />,
          <StatCard key="ord" label="Orders" value={formatNumber(t.orders)} hint={`${t.today} placed today`} icon={ShoppingBag} />,
          <StatCard key="pen" label="Needs action" value={formatNumber(t.pending)} hint={`${t.inProgress} out for delivery / assigned`} icon={Clock} tone="amber" />,
          <StatCard key="usr" label="Customers & suppliers" value={`${formatNumber(t.users || 0)} / ${t.activeSuppliers || 0}`} hint={t.pendingSuppliers ? `${t.pendingSuppliers} supplier${t.pendingSuppliers > 1 ? 's' : ''} awaiting approval` : 'All suppliers reviewed'} icon={Users} tone="violet" />,
        ]
      : role === 'supplier'
        ? [
            <StatCard key="act" label="Active deliveries" value={t.inProgress} hint="Assigned or on the way" icon={Truck} tone="amber" />,
            <StatCard key="del" label="Delivered" value={formatNumber(t.delivered)} hint={`${formatNumber(t.jarsDelivered)} jars`} icon={CheckCircle2} tone="emerald" />,
            <StatCard key="rev" label="Collected value" value={formatCurrency(t.revenue)} hint="From delivered orders" icon={Banknote} />,
            <StatCard key="tod" label="Assigned today" value={t.today} hint={`${formatNumber(t.orders)} all-time`} icon={Store} tone="violet" />,
          ]
        : [
            <StatCard key="ord" label="Total orders" value={formatNumber(t.orders)} icon={ShoppingBag} />,
            <StatCard key="act" label="In progress" value={t.pending + t.inProgress} hint="Pending, assigned or on the way" icon={Truck} tone="amber" />,
            <StatCard key="del" label="Delivered" value={formatNumber(t.delivered)} icon={CheckCircle2} tone="emerald" />,
            <StatCard key="spent" label="Total spent" value={formatCurrency(t.revenue)} hint="On delivered orders" icon={Banknote} tone="violet" />,
          ];

  return (
    <>
      {header}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards}</div>

      {role !== 'user' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <TrendChart series={data.series} />
          <StatusBreakdown counts={data.statusCounts} total={t.orders} />
        </div>
      )}

      <div className={cn('grid gap-4', role === 'admin' && 'xl:grid-cols-3')}>
        <div className={cn(role === 'admin' && 'xl:col-span-2')}>
          <RecentOrders orders={data.recentOrders} showSupplier={role === 'admin'} />
        </div>
        {role === 'admin' && (
          <div className="grid content-start gap-4">
            <RankedList
              title="Top packages"
              description="By jars sold (excl. cancelled)"
              rows={data.topPackages.map((p) => ({ key: p.name, name: p.name, value: p.quantity, sub: `${p.quantity} jars` }))}
            />
            <RankedList
              title="Top suppliers"
              description="By completed deliveries"
              rows={(data.topSuppliers || []).map((s) => ({ key: s._id, name: s.name, value: s.delivered, sub: `${s.delivered} delivered` }))}
            />
          </div>
        )}
      </div>
    </>
  );
}
