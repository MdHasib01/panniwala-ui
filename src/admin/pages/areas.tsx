import * as React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Loader2, MapPin, MapPinPlus, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Badge } from '@/src/admin/components/ui/badge';
import { Input } from '@/src/admin/components/ui/input';
import { Label } from '@/src/admin/components/ui/label';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/admin/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/admin/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/admin/components/ui/table';
import { api } from '@/src/lib/api';
import { invalidateAreas } from '@/src/lib/areas-api';
import { useSocketEvent } from '@/src/lib/socket';
import { useFetch } from '@/src/lib/use-fetch';
import type { ManagedArea, PendingAreaRequest } from '@/src/lib/models';
import { EmptyState, PageHeader, UserStatusBadge, useConfirm } from '../components/shared';
import { formatDate, timeAgo } from '../lib/format';

type ManageResponse = { items: ManagedArea[]; requests: PendingAreaRequest[] };

/* --------------------------- Supplier requests --------------------------- */

function RequestsCard({ requests, onDecided }: { requests: PendingAreaRequest[]; onDecided: () => void }) {
  const [busy, setBusy] = React.useState<string | null>(null);

  const decide = async (r: PendingAreaRequest, status: 'approved' | 'rejected') => {
    setBusy(r._id);
    try {
      await api.patch(`/users/${r.supplier._id}`, { areaDecisions: [{ id: r._id, status }] });
      if (status === 'approved') invalidateAreas();
      toast.success(status === 'approved' ? `“${r.name}” added to the area list` : `“${r.name}” rejected`);
      onDecided();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (!requests.length) return null;
  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinPlus className="size-4 text-amber-500" /> Requested by suppliers
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>
          Approving adds the area to every area list (website, order form, supplier sign-up) and to that supplier's service areas.
          New suppliers' requests can also be decided while approving them on the <Link to="/admin/suppliers" className="underline">Suppliers</Link> page.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {requests.map((r) => (
          <div key={r._id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.name}</p>
              <p className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
                <span className="truncate">{r.supplier.businessName || r.supplier.name}</span>
                {r.supplier.phone && <span>· {r.supplier.phone}</span>}
                <span>· {timeAgo(r.requestedAt)}</span>
                {r.supplier.status !== 'active' && <UserStatusBadge status={r.supplier.status} />}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" disabled={busy === r._id} onClick={() => decide(r, 'approved')}>
                {busy === r._id ? <Loader2 className="animate-spin" /> : <Check />} Approve
              </Button>
              <Button size="sm" variant="outline" disabled={busy === r._id} onClick={() => decide(r, 'rejected')}>
                <X /> Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Rename dialog ----------------------------- */

function RenameDialog({ area, onOpenChange, onSaved }: { area: ManagedArea | null; onOpenChange: (o: boolean) => void; onSaved: () => void }) {
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => setName(area?.name ?? ''), [area]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area) return;
    setSaving(true);
    try {
      await api.patch(`/areas/${area._id}`, { name });
      invalidateAreas();
      toast.success('Area renamed');
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!area} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename area</DialogTitle>
          <DialogDescription>Suppliers serving it and customers who saved it get the new name automatically. Past orders keep the old one.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="area-name">Name</Label>
            <Input id="area-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || name.trim() === area?.name}>
              {saving && <Loader2 className="animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export function AreasPage() {
  const confirm = useConfirm();
  const { data, loading, error, refetch } = useFetch<ManageResponse>('/areas/manage');
  useSocketEvent('user:new', refetch);
  useSocketEvent('area:request', refetch);

  const [search, setSearch] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [renaming, setRenaming] = React.useState<ManagedArea | null>(null);

  const items = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.items ?? []).filter((a) => !q || a.name.toLowerCase().includes(q));
  }, [data, search]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/areas', { name: newName });
      invalidateAreas();
      toast.success(`“${newName.trim()}” added`);
      setNewName('');
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (a: ManagedArea) => {
    const affected = [
      a.supplierCount && `${a.supplierCount} supplier${a.supplierCount > 1 ? 's' : ''}' service areas`,
      a.customerCount && `${a.customerCount} customer profile${a.customerCount > 1 ? 's' : ''}`,
    ].filter(Boolean);
    const ok = await confirm({
      title: `Remove “${a.name}”?`,
      description: `It disappears from the website, order form and sign-up${affected.length ? `, and is removed from ${affected.join(' and ')}` : ''}. Past orders and suppliers' request history keep the name.`,
      confirmText: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/areas/${a._id}`);
      invalidateAreas();
      toast.success(`“${a.name}” removed`);
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Delivery areas" description="The areas customers can order to and suppliers can serve." />

      {data && <RequestsCard requests={data.requests} onDecided={refetch} />}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <form onSubmit={add} className="flex w-full gap-2 lg:max-w-md">
            <Input placeholder="New area name" value={newName} onChange={(e) => setNewName(e.target.value)} minLength={2} maxLength={120} required />
            <Button type="submit" disabled={adding} className="shrink-0">
              {adding ? <Loader2 className="animate-spin" /> : <Plus />} Add area
            </Button>
          </form>
          <div className="relative w-full lg:ml-auto lg:max-w-xs">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input placeholder="Search areas" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {loading && !data ? (
          <div className="grid gap-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
        ) : error ? (
          <EmptyState title="Couldn't load areas" description={error} action={<Button onClick={refetch}>Retry</Button>} />
        ) : !items.length ? (
          <EmptyState icon={MapPin} title={search ? 'No matching areas' : 'No areas yet'} description={search ? 'Try another search.' : 'Add the first delivery area above.'} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Area</TableHead>
                <TableHead className="text-right">Suppliers</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Customers</TableHead>
                <TableHead className="hidden md:table-cell">Added</TableHead>
                <TableHead className="w-12 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="pl-4">
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                      <span className="whitespace-normal">{a.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.supplierCount}</TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">{a.customerCount}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(a.createdAt, false)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setRenaming(a)}><Pencil /> Rename</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => remove(a)}><Trash2 /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <RenameDialog area={renaming} onOpenChange={(o) => !o && setRenaming(null)} onSaved={refetch} />
    </>
  );
}
