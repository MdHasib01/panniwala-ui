import * as React from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Input } from '@/src/admin/components/ui/input';
import { Label } from '@/src/admin/components/ui/label';
import { Checkbox } from '@/src/admin/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/admin/components/ui/select';
import { api } from '@/src/lib/api';
import { KHULNA_AREAS } from '@/src/data/packages';
import { useAuth } from '@/src/lib/auth';
import { PageHeader, RoleBadge, UserAvatar, UserStatusBadge } from '../components/shared';
import { formatDate } from '../lib/format';
import type { User } from '@/src/lib/models';

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [form, setForm] = React.useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    area: user?.area ?? '',
    address: user?.address ?? '',
    businessName: user?.supplier?.businessName ?? '',
    tradeLicense: user?.supplier?.tradeLicense ?? '',
  });
  const [areas, setAreas] = React.useState<string[]>(user?.supplier?.serviceAreas ?? []);
  const [saving, setSaving] = React.useState(false);
  if (!user) return null;
  const isSupplier = user.role === 'supplier';
  const text = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        phone: form.phone.replace(/[\s-]/g, ''),
        area: form.area,
        address: form.address,
      };
      if (isSupplier) Object.assign(body, { businessName: form.businessName, tradeLicense: form.tradeLicense, serviceAreas: areas });
      const { user: updated } = await api.patch<{ user: User }>('/auth/me', body);
      setUser(updated);
      toast.success('Profile saved');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="contents">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>{isSupplier ? 'Used by the team when assigning deliveries.' : 'Used to pre-fill your orders.'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={form.name} onChange={text('name')} required minLength={2} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-email">Email</Label>
            <Input id="p-email" value={user.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-phone">Mobile</Label>
            <Input id="p-phone" value={form.phone} onChange={text('phone')} placeholder="01XXXXXXXXX" />
          </div>
          {!isSupplier && (
            <div className="grid gap-2">
              <Label>Area</Label>
              <Select value={form.area || undefined} onValueChange={(v) => setForm((f) => ({ ...f, area: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select your area" /></SelectTrigger>
                <SelectContent>
                  {KHULNA_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {!isSupplier && (
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="p-address">Address</Label>
              <Input id="p-address" value={form.address} onChange={text('address')} placeholder="House, road, flat" />
            </div>
          )}
          {isSupplier && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="p-biz">Business name</Label>
                <Input id="p-biz" value={form.businessName} onChange={text('businessName')} required minLength={2} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="p-lic">Trade license</Label>
                <Input id="p-lic" value={form.tradeLicense} onChange={text('tradeLicense')} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Service areas</Label>
                <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                  {KHULNA_AREAS.map((a) => (
                    <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox checked={areas.includes(a)} onCheckedChange={(v) => setAreas((p) => (v ? [...p, a] : p.filter((x) => x !== a)))} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-end border-t [.border-t]:pt-6">
          <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirmPw) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/auth/me/password', { currentPassword: current, newPassword: next });
      toast.success('Password updated');
      setCurrent('');
      setNext('');
      setConfirmPw('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="contents">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Use at least 6 characters.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pw-current">Current password</Label>
            <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-new">New password</Label>
            <Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input id="pw-confirm" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required minLength={6} />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t [.border-t]:pt-6">
          <Button type="submit" variant="outline" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Update password</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageHeader title="Profile" description="Manage your account details and password." />
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar name={user.name} className="size-14 text-base" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{user.supplier?.businessName || user.name}</p>
            <p className="text-muted-foreground truncate text-sm">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
            <span className="text-muted-foreground text-xs">Member since {formatDate(user.createdAt, false)}</span>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}
