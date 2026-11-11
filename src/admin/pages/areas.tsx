'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertTriangle, Check, Clock, Layers, Loader2, MapPin, MapPinPlus, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Badge } from '@/src/admin/components/ui/badge';
import { Input } from '@/src/admin/components/ui/input';
import { Label } from '@/src/admin/components/ui/label';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/admin/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/admin/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/admin/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/admin/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/admin/components/ui/table';
import { api } from '@/src/lib/api';
import { invalidateAreas, secondaryName } from '@/src/lib/areas-api';
import { createLocationSearch } from '@/src/lib/location-search';
import { useSocketEvent } from '@/src/lib/socket';
import { useFetch } from '@/src/lib/use-fetch';
import type { ManagedArea, ManagedZone, PendingAreaRequest } from '@/src/lib/models';
import { RequestDetails } from '../components/area-requests';
import { EmptyState, PageHeader, UserStatusBadge, useConfirm } from '../components/shared';
import { formatDate, timeAgo } from '../lib/format';

type ManageResponse = { items: ManagedArea[]; zones: ManagedZone[]; requests: PendingAreaRequest[] };

const NO_ZONE = 'none';
const ALL = 'all';
const splitAliases = (text: string) =>
  text
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

/* --------------------------- Supplier requests --------------------------- */

function RequestsCard({ requests, onDecided }: { requests: PendingAreaRequest[]; onDecided: () => void }) {
  const [busy, setBusy] = React.useState<string | null>(null);

  const decide = async (r: PendingAreaRequest, status: 'approved' | 'rejected') => {
    setBusy(r._id);
    try {
      await api.patch(`/users/${r.supplier._id}`, { areaDecisions: [{ id: r._id, status }] });
      if (status === 'approved') invalidateAreas();
      toast.success(status === 'approved' ? `“${r.name}” added to the locations` : `“${r.name}” rejected`);
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
          Approving adds the location (with the names and zone the supplier proposed) to every location list and to that supplier's service areas. You can
          edit it afterwards. New suppliers' requests can also be decided while approving them on the{' '}
          <Link href="/admin/suppliers" className="underline">Suppliers</Link> page.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {requests.map((r) => (
          <div key={r._id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.name}</p>
              <RequestDetails request={r} />
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

/* ---------------------------- Location dialog ---------------------------- */

type LocationForm = { nameEn: string; nameBn: string; aliases: string; zone: string };

function LocationDialog({
  open,
  area,
  data,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** null = add a new location. */
  area: ManagedArea | null;
  data: ManageResponse;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<LocationForm>({ nameEn: '', nameBn: '', aliases: '', zone: NO_ZONE });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setForm({
      nameEn: area?.nameEn ?? '',
      // A location from before English names: its name is the Bengali one.
      nameBn: area ? (area.nameBn ?? (area.nameEn ? '' : area.name)) : '',
      aliases: (area?.aliases ?? []).join(', '),
      zone: area?.zone ?? NO_ZONE,
    });
  }, [open, area]);

  const searcher = React.useMemo(
    () => createLocationSearch(data.items.filter((a) => a._id !== area?._id), data.zones),
    [data, area]
  );
  const lookalikes = React.useMemo(
    () => searcher.similar({ nameEn: form.nameEn, nameBn: form.nameBn, aliases: splitAliases(form.aliases) }, 4),
    [searcher, form.nameEn, form.nameBn, form.aliases]
  );

  const set = (k: keyof LocationForm) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      nameEn: form.nameEn.trim(),
      nameBn: form.nameBn.trim(),
      aliases: splitAliases(form.aliases),
      zone: form.zone === NO_ZONE ? null : form.zone,
    };
    try {
      if (area) await api.patch(`/areas/${area._id}`, body);
      else await api.post('/areas', body);
      invalidateAreas();
      toast.success(area ? 'Location updated' : `“${body.nameBn || body.nameEn}” added`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{area ? 'Edit location' : 'Add location'}</DialogTitle>
          <DialogDescription>
            The Bengali name is shown when there is one, otherwise the English name.
            {area && ' If the shown name changes, suppliers and customers using this location get the new name automatically; past orders keep the old one.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="loc-en">English name *</Label>
              <Input id="loc-en" value={form.nameEn} onChange={set('nameEn')} required minLength={2} maxLength={120} placeholder="e.g. Sonadanga R/A" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="loc-bn">Bengali name</Label>
              <Input id="loc-bn" value={form.nameBn} onChange={set('nameBn')} maxLength={120} placeholder="ঐচ্ছিক" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loc-aliases">Similar names</Label>
            <Input id="loc-aliases" value={form.aliases} onChange={set('aliases')} placeholder="Comma separated, e.g. Shonadanga, সোনাডাঙা" />
            <p className="text-muted-foreground text-xs">Other spellings people type. Optional, up to 5; fuzzy search finds near matches anyway.</p>
          </div>
          <div className="grid gap-2">
            <Label>Zone</Label>
            <Select value={form.zone} onValueChange={(zone) => setForm((f) => ({ ...f, zone }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ZONE}>No zone</SelectItem>
                {data.zones.map((z) => <SelectItem key={z._id} value={z._id}>{z.name}{z.nameBn ? ` · ${z.nameEn}` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {lookalikes.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
              <p className="mb-1.5 flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-4" /> Similar locations already exist
              </p>
              <ul className="text-muted-foreground grid gap-0.5 text-xs">
                {lookalikes.map((l) => (
                  <li key={l._id}>
                    {l.name}
                    {secondaryName(l) && ` · ${secondaryName(l)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || form.nameEn.trim().length < 2}>
              {saving && <Loader2 className="animate-spin" />} {area ? 'Save' : 'Add location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Zone dialog ------------------------------ */

function ZoneDialog({ open, zone, onOpenChange, onSaved }: { open: boolean; zone: ManagedZone | null; onOpenChange: (o: boolean) => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({ nameEn: '', nameBn: '', minMinutes: '30', maxMinutes: '45' });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setForm({
      nameEn: zone?.nameEn ?? '',
      nameBn: zone?.nameBn ?? '',
      minMinutes: String(zone?.minMinutes ?? 30),
      maxMinutes: String(zone?.maxMinutes ?? 45),
    });
  }, [open, zone]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { nameEn: form.nameEn.trim(), nameBn: form.nameBn.trim(), minMinutes: Number(form.minMinutes), maxMinutes: Number(form.maxMinutes) };
    if (body.minMinutes > body.maxMinutes) return toast.error('Minimum time cannot be more than the maximum');
    setSaving(true);
    try {
      if (zone) await api.patch(`/zones/${zone._id}`, body);
      else await api.post('/zones', body);
      invalidateAreas();
      toast.success(zone ? 'Zone updated' : `“${body.nameBn || body.nameEn}” added`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{zone ? 'Edit zone' : 'Add zone'}</DialogTitle>
          <DialogDescription>Zones group locations into the coverage cards on the website. Assign locations to a zone from the Locations tab.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="zone-en">English name *</Label>
            <Input id="zone-en" value={form.nameEn} onChange={set('nameEn')} required minLength={2} maxLength={120} placeholder="e.g. Sonadanga & Boyra Zone" autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zone-bn">Bengali name</Label>
            <Input id="zone-bn" value={form.nameBn} onChange={set('nameBn')} maxLength={120} placeholder="ঐচ্ছিক" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="zone-min">Delivery from (min)</Label>
              <Input id="zone-min" type="number" min={0} max={600} value={form.minMinutes} onChange={set('minMinutes')} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zone-max">Delivery to (min)</Label>
              <Input id="zone-max" type="number" min={0} max={600} value={form.maxMinutes} onChange={set('maxMinutes')} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} {zone ? 'Save' : 'Add zone'}
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
  const [zoneFilter, setZoneFilter] = React.useState(ALL);
  const [tab, setTab] = React.useState('locations');
  const [editing, setEditing] = React.useState<{ area: ManagedArea | null } | null>(null);
  const [editingZone, setEditingZone] = React.useState<{ zone: ManagedZone | null } | null>(null);

  const zoneById = React.useMemo(() => new Map((data?.zones ?? []).map((z) => [z._id, z])), [data]);
  const searcher = React.useMemo(() => createLocationSearch(data?.items ?? [], data?.zones ?? []), [data]);

  const items = React.useMemo(() => {
    const list = (search.trim() ? searcher.search(search, 500) : (data?.items ?? [])) as ManagedArea[];
    if (zoneFilter === ALL) return list;
    if (zoneFilter === NO_ZONE) return list.filter((a) => !a.zone || !zoneById.has(a.zone));
    return list.filter((a) => a.zone === zoneFilter);
  }, [data, search, searcher, zoneFilter, zoneById]);

  const missingEnglish = (data?.items ?? []).filter((a) => !a.nameEn).length;

  const removeArea = async (a: ManagedArea) => {
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

  const removeZone = async (z: ManagedZone) => {
    const ok = await confirm({
      title: `Remove “${z.name}”?`,
      description: `Its card disappears from the website.${z.areaCount ? ` Its ${z.areaCount} location${z.areaCount > 1 ? 's stay' : ' stays'} available, just without a zone.` : ''}`,
      confirmText: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/zones/${z._id}`);
      invalidateAreas();
      toast.success(`“${z.name}” removed`);
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const loadingView = <div className="grid gap-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>;
  const errorView = <EmptyState title="Couldn't load locations" description={error ?? ''} action={<Button onClick={refetch}>Retry</Button>} />;

  return (
    <>
      <PageHeader title="Locations" description="The locations customers can order to and suppliers can serve, grouped into delivery zones." />

      {data && <RequestsCard requests={data.requests} onDecided={refetch} />}

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="locations"><MapPin /> Locations {data && <Badge variant="secondary">{data.items.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="zones"><Layers /> Zones {data && <Badge variant="secondary">{data.zones.length}</Badge>}</TabsTrigger>
        </TabsList>

        {/* ------------------------------ Locations ------------------------------ */}
        <TabsContent value="locations">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
              <div className="relative w-full lg:max-w-xs">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input placeholder="Search (English, বাংলা, typos ok)" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-full lg:w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All zones</SelectItem>
                  <SelectItem value={NO_ZONE}>No zone</SelectItem>
                  {(data?.zones ?? []).map((z) => <SelectItem key={z._id} value={z._id}>{z.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="lg:ml-auto" disabled={!data} onClick={() => setEditing({ area: null })}>
                <Plus /> Add location
              </Button>
            </div>
            {missingEnglish > 0 && (
              <p className="flex items-center gap-2 border-b bg-amber-500/5 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3.5" /> {missingEnglish} location{missingEnglish > 1 ? 's have' : ' has'} no English name yet. Edit them to add one.
              </p>
            )}

            {loading && !data ? loadingView : error ? errorView : !items.length ? (
              <EmptyState
                icon={MapPin}
                title={search || zoneFilter !== ALL ? 'No matching locations' : 'No locations yet'}
                description={search || zoneFilter !== ALL ? 'Try another search or zone.' : 'Add the first delivery location.'}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Location</TableHead>
                    <TableHead className="hidden lg:table-cell">Similar names</TableHead>
                    <TableHead className="hidden md:table-cell">Zone</TableHead>
                    <TableHead className="text-right">Suppliers</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Customers</TableHead>
                    <TableHead className="w-12 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="pl-4">
                        <span className="flex items-start gap-2">
                          <MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                          <span className="min-w-0 whitespace-normal">
                            <span className="block font-medium">{a.name}</span>
                            {a.nameEn ? (
                              secondaryName(a) && <span className="text-muted-foreground block text-xs">{secondaryName(a)}</span>
                            ) : (
                              <Badge variant="outline" className="mt-0.5 border-amber-500/40 text-amber-600 dark:text-amber-400">English name missing</Badge>
                            )}
                            <span className="text-muted-foreground block text-xs md:hidden">{a.zone ? zoneById.get(a.zone)?.name : ''}</span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden max-w-56 text-xs whitespace-normal lg:table-cell">{a.aliases.join(', ') || '—'}</TableCell>
                      <TableCell className="hidden max-w-48 whitespace-normal md:table-cell">
                        {a.zone && zoneById.get(a.zone) ? <span className="text-sm">{zoneById.get(a.zone)!.name}</span> : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{a.supplierCount}</TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">{a.customerCount}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setEditing({ area: a })}><Pencil /> Edit</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => removeArea(a)}><Trash2 /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* -------------------------------- Zones -------------------------------- */}
        <TabsContent value="zones">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex items-center gap-3 border-b p-4">
              <p className="text-muted-foreground text-sm">Each zone with locations is shown as a coverage card on the website.</p>
              <Button className="ml-auto shrink-0" disabled={!data} onClick={() => setEditingZone({ zone: null })}>
                <Plus /> Add zone
              </Button>
            </div>
            {loading && !data ? loadingView : error ? errorView : !data?.zones.length ? (
              <EmptyState icon={Layers} title="No zones yet" description="Add a zone, then assign locations to it." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Zone</TableHead>
                    <TableHead>Delivery time</TableHead>
                    <TableHead className="text-right">Locations</TableHead>
                    <TableHead className="hidden md:table-cell">Added</TableHead>
                    <TableHead className="w-12 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.zones.map((z) => (
                    <TableRow key={z._id}>
                      <TableCell className="pl-4 whitespace-normal">
                        <span className="block font-medium">{z.name}</span>
                        {secondaryName(z) && <span className="text-muted-foreground block text-xs">{secondaryName(z)}</span>}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm"><Clock className="text-muted-foreground size-3.5" /> {z.minMinutes}–{z.maxMinutes} min</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <button type="button" className="hover:underline" onClick={() => (setZoneFilter(z._id), setSearch(''), setTab('locations'))}>{z.areaCount}</button>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(z.createdAt, false)}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setEditingZone({ zone: z })}><Pencil /> Edit</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => removeZone(z)}><Trash2 /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {data && (
        <LocationDialog
          open={!!editing}
          area={editing?.area ?? null}
          data={data}
          onOpenChange={(o) => !o && setEditing(null)}
          onSaved={refetch}
        />
      )}
      <ZoneDialog open={!!editingZone} zone={editingZone?.zone ?? null} onOpenChange={(o) => !o && setEditingZone(null)} onSaved={refetch} />
    </>
  );
}
