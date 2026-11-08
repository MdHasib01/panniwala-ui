import * as React from 'react';
import { Plus, Search, CheckCircle2, XCircle, MapPin, Phone, Truck, Clock3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Badge } from '@/src/admin/components/ui/badge';
import { Input } from '@/src/admin/components/ui/input';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/admin/components/ui/table';
import { useSocket, useSocketEvent } from '../context/socket';
import { useDebounced, useFetch } from '../hooks/use-fetch';
import { EmptyState, PageHeader, Pagination, UserAvatar, UserStatusBadge } from '../components/shared';
import { formatDate, timeAgo } from '../lib/format';
import type { Paginated, User } from '../lib/types';
import { UserDialog, UserRowMenu, useUserActions } from './users';

function PendingApprovals({ onChanged }: { onChanged: () => void }) {
  const { data, setData, loading, refetch } = useFetch<Paginated<User>>('/users', { role: 'supplier', status: 'pending', limit: 50 });
  useSocketEvent('user:new', refetch);
  const drop = (id: string) => {
    setData((d) => (d ? { ...d, items: d.items.filter((x) => x._id !== id), total: d.total - 1 } : d));
    onChanged();
  };
  const actions = useUserActions((u) => drop(u._id), drop);

  if (loading && !data) return <Skeleton className="h-40 rounded-xl" />;
  if (!data?.items.length) return null;

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="size-4 text-amber-500" /> Awaiting approval
          <Badge variant="secondary">{data.total}</Badge>
        </CardTitle>
        <CardDescription>New suppliers can't receive orders until you approve them.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((s) => (
          <div key={s._id} className="grid gap-3 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <UserAvatar name={s.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.supplier?.businessName || s.name}</p>
                <p className="text-muted-foreground truncate text-xs">{s.name} · {s.email}</p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">{timeAgo(s.createdAt)}</span>
            </div>
            <div className="text-muted-foreground grid gap-1 text-sm">
              {s.phone && <span className="flex items-center gap-2"><Phone className="size-3.5" /> {s.phone}</span>}
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                <span className="line-clamp-2">{s.supplier?.serviceAreas?.length ? s.supplier.serviceAreas.join(', ') : 'No areas listed'}</span>
              </span>
              {s.supplier?.tradeLicense && <span className="text-xs">License: {s.supplier.tradeLicense}</span>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => actions.setStatus(s, 'active')}><CheckCircle2 /> Approve</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => actions.suspend(s)}><XCircle /> Reject</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SuppliersPage() {
  const { onlineIds } = useSocket();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const debounced = useDebounced(search);
  const [dialog, setDialog] = React.useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  React.useEffect(() => setPage(1), [debounced]);

  const { data, setData, loading, error, refetch } = useFetch<Paginated<User>>('/users', { role: 'supplier', page, limit: 15, search: debounced });

  const upsert = (u: User) =>
    setData((d) => {
      if (!d) return d;
      if (u.role !== 'supplier') return { ...d, items: d.items.filter((x) => x._id !== u._id) };
      const exists = d.items.some((x) => x._id === u._id);
      return exists ? { ...d, items: d.items.map((x) => (x._id === u._id ? { ...x, ...u } : x)) } : { ...d, items: [u, ...d.items], total: d.total + 1 };
    });
  const actions = useUserActions(upsert, (id) => setData((d) => (d ? { ...d, items: d.items.filter((x) => x._id !== id), total: d.total - 1 } : d)));

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Approve delivery partners and see how they're performing."
        actions={<Button onClick={() => setDialog({ open: true, user: null })}><Plus /> Add supplier</Button>}
      />

      <PendingApprovals onChanged={refetch} />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input placeholder="Search business, name or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        {loading && !data ? (
          <div className="grid gap-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : error ? (
          <EmptyState title="Couldn't load suppliers" description={error} action={<Button onClick={refetch}>Retry</Button>} />
        ) : !data?.items.length ? (
          <EmptyState icon={Truck} title="No suppliers yet" description="Suppliers can sign up at /admin/register, or you can add one here." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Supplier</TableHead>
                  <TableHead className="hidden lg:table-cell">Service areas</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Delivered / assigned</TableHead>
                  <TableHead className="hidden xl:table-cell">Joined</TableHead>
                  <TableHead className="w-12 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={s.supplier?.businessName || s.name} online={onlineIds.has(s._id)} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.supplier?.businessName || s.name}</p>
                          <p className="text-muted-foreground truncate text-xs">{s.name} · {s.phone || s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-72 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(s.supplier?.serviceAreas ?? []).slice(0, 3).map((a) => <Badge key={a} variant="secondary" className="max-w-40 truncate">{a}</Badge>)}
                        {(s.supplier?.serviceAreas?.length ?? 0) > 3 && <Badge variant="outline">+{s.supplier!.serviceAreas!.length - 3}</Badge>}
                        {!s.supplier?.serviceAreas?.length && <span className="text-muted-foreground text-sm">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><UserStatusBadge status={s.status} /></TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">{s.deliveredCount ?? 0} / {s.assignedCount ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">{formatDate(s.createdAt, false)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <UserRowMenu user={s} onEdit={() => setDialog({ open: true, user: s })} actions={actions} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>

      <UserDialog
        open={dialog.open}
        initial={dialog.user}
        defaultRole="supplier"
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSaved={(u) => {
          upsert(u);
          refetch();
        }}
      />
    </>
  );
}
