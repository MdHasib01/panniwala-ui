'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Pencil, MessageSquare, Ban, CheckCircle2, Trash2, Loader2, Users as UsersIcon } from 'lucide-react';
import { Card } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Input } from '@/src/admin/components/ui/input';
import { Label } from '@/src/admin/components/ui/label';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/admin/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/admin/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/admin/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/admin/components/ui/table';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { invalidateAreas } from '@/src/lib/areas-api';
import { AdminLocationChecklist, AdminLocationSelect } from '../components/location-fields';
import { AreaRequestDecider, AreaRequestHistory, pendingRequests, toAreaDecisions, type AreaDecisions } from '../components/area-requests';
import { useAuth } from '@/src/lib/auth';
import { useSocket, useSocketEvent } from '@/src/lib/socket';
import { useDebounced, useFetch } from '@/src/lib/use-fetch';
import { EmptyState, PageHeader, Pagination, RoleBadge, UserAvatar, UserStatusBadge, useConfirm } from '../components/shared';
import { formatDate } from '../lib/format';
import type { Conversation, Paginated, Role, User, UserStatus } from '@/src/lib/models';

/* ------------------------------ User dialog ------------------------------ */

export function UserDialog({
  open,
  initial,
  defaultRole = 'user',
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  initial: User | null;
  defaultRole?: Role;
  onOpenChange: (o: boolean) => void;
  onSaved: (u: User) => void;
}) {
  const { user: me } = useAuth();
  const blank = { name: '', email: '', phone: '', password: '', role: defaultRole, status: 'active' as UserStatus, address: '', area: '', businessName: '', tradeLicense: '' };
  const [form, setForm] = React.useState(blank);
  const [areas, setAreas] = React.useState<string[]>([]);
  const [decisions, setDecisions] = React.useState<AreaDecisions>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setDecisions({});
    if (initial) {
      setForm({
        name: initial.name,
        email: initial.email,
        phone: initial.phone ?? '',
        password: '',
        role: initial.role,
        status: initial.status,
        address: initial.address ?? '',
        area: initial.area ?? '',
        businessName: initial.supplier?.businessName ?? '',
        tradeLicense: initial.supplier?.tradeLicense ?? '',
      });
      setAreas(initial.supplier?.serviceAreas ?? []);
    } else {
      setForm(blank);
      setAreas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const isSelf = initial?._id === me?._id;
  const text = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      status: form.status,
      address: form.address,
      area: form.area,
    };
    if (form.password) body.password = form.password;
    if (form.role === 'supplier') {
      body.businessName = form.businessName;
      body.tradeLicense = form.tradeLicense;
      body.serviceAreas = areas;
      if (Object.keys(decisions).length) body.areaDecisions = toAreaDecisions(decisions);
    }
    try {
      const { user } = initial
        ? await api.patch<{ user: User }>(`/users/${initial._id}`, body)
        : await api.post<{ user: User }>('/users', body);
      onSaved(user);
      if (Object.values(decisions).includes('approved')) invalidateAreas();
      toast.success(initial ? 'User updated' : 'User created');
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? `Edit ${initial.name}` : 'Add user'}</DialogTitle>
          <DialogDescription>{initial ? 'Update account details, role or status.' : 'Create an account for a customer, supplier or admin.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="u-name">Name</Label>
              <Input id="u-name" value={form.name} onChange={text('name')} required minLength={2} />
            </div>
            <div className="grid gap-2">
              {/* Admins sign in with email; customers & suppliers with their mobile number. */}
              <Label htmlFor="u-email">{form.role === 'admin' ? 'Email' : 'Email (optional)'}</Label>
              <Input id="u-email" type="email" value={form.email} onChange={text('email')} required={form.role === 'admin'} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="u-phone">{form.role === 'admin' ? 'Mobile (optional)' : 'Mobile'}</Label>
              <Input id="u-phone" type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={text('phone')} required={form.role !== 'admin'} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="u-password">{initial ? 'New password' : 'Password'}</Label>
              <Input id="u-password" type="password" value={form.password} onChange={text('password')} required={!initial} minLength={6} placeholder={initial ? 'Leave blank to keep' : ''} />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))} disabled={isSelf}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Customer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as UserStatus }))} disabled={isSelf}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role !== 'supplier' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="u-area">Area</Label>
                  <AdminLocationSelect id="u-area" value={form.area} onChange={(area) => setForm((f) => ({ ...f, area }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="u-address">Address</Label>
                  <Input id="u-address" value={form.address} onChange={text('address')} />
                </div>
              </>
            )}
          </div>

          {form.role === 'supplier' && (
            <div className="grid gap-4 rounded-xl border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="u-biz">Business name</Label>
                  <Input id="u-biz" value={form.businessName} onChange={text('businessName')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="u-lic">Trade license</Label>
                  <Input id="u-lic" value={form.tradeLicense} onChange={text('tradeLicense')} />
                </div>
              </div>
              {pendingRequests(initial?.supplier?.areaRequests).length > 0 && (
                <div className="grid gap-2">
                  <Label>Requested new areas</Label>
                  <p className="text-muted-foreground -mt-1 text-xs">Approved areas are added to the public list and to this supplier.</p>
                  <AreaRequestDecider requests={initial!.supplier!.areaRequests!} value={decisions} onChange={setDecisions} />
                </div>
              )}
              <div className="grid gap-2">
                <Label>Service areas</Label>
                <AdminLocationChecklist value={areas} onChange={setAreas} />
              </div>
              {(initial?.supplier?.areaRequests ?? []).some((r) => r.status !== 'pending') && (
                <div className="grid gap-2">
                  <Label>Area request history</Label>
                  <AreaRequestHistory requests={initial!.supplier!.areaRequests!} />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} {initial ? 'Save changes' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Shared actions ----------------------------- */

export function useUserActions(onUpdated: (u: User) => void, onDeleted: (id: string) => void) {
  const router = useRouter();
  const confirm = useConfirm();

  const setStatus = async (u: User, status: UserStatus) => {
    try {
      const { user } = await api.patch<{ user: User }>(`/users/${u._id}`, { status });
      onUpdated(user);
      toast.success(status === 'active' ? `${u.name} is now active` : status === 'suspended' ? `${u.name} suspended` : 'Status updated');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const message = async (u: User) => {
    try {
      const { conversation } = await api.post<{ conversation: Conversation }>('/chat/conversations', { userId: u._id });
      router.push(`/admin/chat?c=${conversation._id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async (u: User) => {
    if (!(await confirm({ title: `Delete ${u.name}?`, description: 'The account will be permanently removed. Their past orders are kept.', confirmText: 'Delete', destructive: true }))) return;
    try {
      await api.delete(`/users/${u._id}`);
      onDeleted(u._id);
      toast.success('User deleted');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const suspend = async (u: User) => {
    if (await confirm({ title: `Suspend ${u.name}?`, description: 'They will be signed out immediately and cannot log in until reactivated.', confirmText: 'Suspend', destructive: true })) {
      setStatus(u, 'suspended');
    }
  };

  return { setStatus, message, remove, suspend };
}

export function UserRowMenu({ user, onEdit, actions }: { user: User; onEdit: () => void; actions: ReturnType<typeof useUserActions> }) {
  const { user: me } = useAuth();
  const isSelf = me?._id === user._id;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEdit}><Pencil /> Edit</DropdownMenuItem>
        {user.role !== 'admin' && <DropdownMenuItem onClick={() => actions.message(user)}><MessageSquare /> Message</DropdownMenuItem>}
        {!isSelf && (
          <>
            <DropdownMenuSeparator />
            {user.status !== 'active' ? (
              <DropdownMenuItem onClick={() => actions.setStatus(user, 'active')}><CheckCircle2 /> {user.status === 'pending' ? 'Approve' : 'Reactivate'}</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => actions.suspend(user)}><Ban /> Suspend</DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onClick={() => actions.remove(user)}><Trash2 /> Delete</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------------------------- Page ---------------------------------- */

const ROLE_TABS: { value: Role | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'user', label: 'Customers' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'admin', label: 'Admins' },
];

export function UsersPage() {
  const { onlineIds } = useSocket();
  const [role, setRole] = React.useState<Role | 'all'>('all');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const debounced = useDebounced(search);
  const [dialog, setDialog] = React.useState<{ open: boolean; user: User | null }>({ open: false, user: null });

  React.useEffect(() => setPage(1), [role, debounced]);

  const { data, setData, loading, error, refetch } = useFetch<Paginated<User>>('/users', {
    page,
    limit: 15,
    role: role === 'all' ? undefined : role,
    search: debounced,
  });
  useSocketEvent('user:new', () => page === 1 && refetch());

  const upsert = (u: User) =>
    setData((d) => {
      if (!d) return d;
      const exists = d.items.some((x) => x._id === u._id);
      return exists
        ? { ...d, items: d.items.map((x) => (x._id === u._id ? { ...x, ...u } : x)) }
        : { ...d, items: [u, ...d.items], total: d.total + 1 };
    });
  const actions = useUserActions(upsert, (id) =>
    setData((d) => (d ? { ...d, items: d.items.filter((x) => x._id !== id), total: d.total - 1 } : d))
  );

  return (
    <>
      <PageHeader
        title="Users"
        description="Every customer, supplier and admin account."
        actions={<Button onClick={() => setDialog({ open: true, user: null })}><Plus /> Add user</Button>}
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="bg-muted inline-flex w-full rounded-lg p-0.5 sm:w-auto">
            {ROLE_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setRole(t.value)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none',
                  role === t.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {loading && !data ? (
          <div className="grid gap-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : error ? (
          <EmptyState title="Couldn't load users" description={error} action={<Button onClick={refetch}>Retry</Button>} />
        ) : !data?.items.length ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try a different filter or search." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">User</TableHead>
                  <TableHead className="hidden sm:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Orders</TableHead>
                  <TableHead className="hidden xl:table-cell">Joined</TableHead>
                  <TableHead className="w-12 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} online={onlineIds.has(u._id)} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="text-muted-foreground max-w-56 truncate text-xs">{u.email || u.phone}</p>
                          <div className="mt-1 flex gap-1 sm:hidden"><RoleBadge role={u.role} /></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><RoleBadge role={u.role} /></TableCell>
                    <TableCell className="hidden md:table-cell"><UserStatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">{u.phone || '—'}</TableCell>
                    <TableCell className="hidden text-right tabular-nums lg:table-cell">
                      {u.role === 'supplier' ? `${u.deliveredCount ?? 0}/${u.assignedCount ?? 0}` : u.orderCount ?? 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">{formatDate(u.createdAt, false)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <UserRowMenu user={u} onEdit={() => setDialog({ open: true, user: u })} actions={actions} />
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
        defaultRole={role === 'all' ? 'user' : role}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSaved={upsert}
      />
    </>
  );
}
