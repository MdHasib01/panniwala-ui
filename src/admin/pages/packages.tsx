'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, Loader2, Package as PackageIcon, Star, Award } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Badge } from '@/src/admin/components/ui/badge';
import { Input } from '@/src/admin/components/ui/input';
import { Label } from '@/src/admin/components/ui/label';
import { Switch } from '@/src/admin/components/ui/switch';
import { Textarea } from '@/src/admin/components/ui/textarea';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/admin/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/admin/components/ui/dialog';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { packageImage } from '@/src/lib/packages-api';
import { useFetch } from '@/src/lib/use-fetch';
import { EmptyState, PageHeader, useConfirm } from '../components/shared';
import { formatCurrency } from '../lib/format';
import type { Package, PackageIcon as IconName } from '@/src/lib/models';

type FormState = {
  slug: string;
  title: string;
  subtitle: string;
  volume: string;
  price: string;
  regularPrice: string;
  unit: string;
  iconName: IconName;
  features: string;
  depositRequired: boolean;
  depositAmount: string;
  popular: boolean;
  bestValue: boolean;
  image: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  slug: '',
  title: '',
  subtitle: '',
  volume: '',
  price: '',
  regularPrice: '',
  unit: '',
  iconName: 'droplets',
  features: '',
  depositRequired: false,
  depositAmount: '0',
  popular: false,
  bestValue: false,
  image: '',
  sortOrder: '0',
  isActive: true,
};

const toForm = (p: Package): FormState => ({
  slug: p.slug,
  title: p.title,
  subtitle: p.subtitle ?? '',
  volume: p.volume ?? '',
  price: String(p.price),
  regularPrice: p.regularPrice != null ? String(p.regularPrice) : '',
  unit: p.unit ?? '',
  iconName: p.iconName,
  features: (p.features ?? []).join('\n'),
  depositRequired: p.depositRequired,
  depositAmount: String(p.depositAmount ?? 0),
  popular: !!p.popular,
  bestValue: !!p.bestValue,
  image: p.image ?? '',
  sortOrder: String(p.sortOrder ?? 0),
  isActive: p.isActive,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function PackageDialog({
  open,
  initial,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  initial: Package | null;
  onOpenChange: (o: boolean) => void;
  onSaved: (p: Package) => void;
}) {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm(initial ? toForm(initial) : EMPTY);
      setError(null);
    }
  }, [open, initial]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const text = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value as never);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      subtitle: form.subtitle,
      volume: form.volume,
      price: Number(form.price),
      regularPrice: form.regularPrice === '' ? null : Number(form.regularPrice),
      unit: form.unit,
      iconName: form.iconName,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      depositRequired: form.depositRequired,
      depositAmount: form.depositRequired ? Number(form.depositAmount || 0) : 0,
      popular: form.popular,
      bestValue: form.bestValue,
      image: form.image,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
    };
    try {
      const { package: saved } = initial
        ? await api.patch<{ package: Package }>(`/packages/${initial._id}`, body)
        : await api.post<{ package: Package }>('/packages', body);
      onSaved(saved);
      toast.success(initial ? 'Package updated' : 'Package created');
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit package' : 'New package'}</DialogTitle>
          <DialogDescription>Changes appear on the website as soon as you save.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={text('title')} required />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" value={form.subtitle} onChange={text('subtitle')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={text('slug')} placeholder={slugify(form.title) || 'ro-20l-jar'} />
              <p className="text-muted-foreground text-xs">Lowercase letters, numbers and dashes.</p>
            </div>
            <div className="grid gap-2">
              <Label>Icon</Label>
              <Select value={form.iconName} onValueChange={(v) => set('iconName', v as IconName)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="droplets">Droplets</SelectItem>
                  <SelectItem value="sparkles">Sparkles</SelectItem>
                  <SelectItem value="zap">Zap</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (৳)</Label>
              <Input id="price" type="number" min={0} value={form.price} onChange={text('price')} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="regularPrice">Regular price (৳)</Label>
              <Input id="regularPrice" type="number" min={0} value={form.regularPrice} onChange={text('regularPrice')} placeholder="Optional — shown struck through" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="volume">Volume</Label>
              <Input id="volume" value={form.volume} onChange={text('volume')} placeholder="২০ লিটার" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={form.unit} onChange={text('unit')} placeholder="প্রতি জার" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="features">Features</Label>
              <Textarea id="features" rows={4} value={form.features} onChange={text('features')} placeholder="One feature per line" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" value={form.image} onChange={text('image')} placeholder="Leave empty to use the bundled artwork" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Display order</Label>
              <Input id="sortOrder" type="number" value={form.sortOrder} onChange={text('sortOrder')} />
            </div>
            {form.depositRequired && (
              <div className="grid gap-2">
                <Label htmlFor="depositAmount">Jar deposit (৳)</Label>
                <Input id="depositAmount" type="number" min={0} value={form.depositAmount} onChange={text('depositAmount')} />
              </div>
            )}
          </div>

          <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
            {([
              ['isActive', 'Visible on website'],
              ['depositRequired', 'Requires jar deposit'],
              ['popular', 'Mark as popular'],
              ['bestValue', 'Mark as best value'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                {label}
                <Switch checked={form[key]} onCheckedChange={(v) => set(key, v)} />
              </label>
            ))}
          </div>

          {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} {initial ? 'Save changes' : 'Create package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PackagesPage() {
  const { data, setData, loading, error, refetch } = useFetch<{ items: Package[] }>('/packages', { all: true });
  const confirm = useConfirm();
  const [dialog, setDialog] = React.useState<{ open: boolean; pkg: Package | null }>({ open: false, pkg: null });

  const replace = (p: Package) =>
    setData((d) => {
      if (!d) return d;
      const exists = d.items.some((x) => x._id === p._id);
      const items = exists ? d.items.map((x) => (x._id === p._id ? p : x)) : [...d.items, p];
      return { items: items.sort((a, b) => a.sortOrder - b.sortOrder) };
    });

  const toggleActive = async (p: Package, isActive: boolean) => {
    replace({ ...p, isActive });
    try {
      const { package: saved } = await api.patch<{ package: Package }>(`/packages/${p._id}`, { isActive });
      replace(saved);
    } catch (err) {
      replace(p);
      toast.error((err as Error).message);
    }
  };

  const remove = async (p: Package) => {
    if (!(await confirm({ title: `Delete “${p.title}”?`, description: 'Existing orders keep their details, but customers can no longer order this package. Consider hiding it instead.', confirmText: 'Delete', destructive: true }))) return;
    try {
      await api.delete(`/packages/${p._id}`);
      setData((d) => (d ? { items: d.items.filter((x) => x._id !== p._id) } : d));
      toast.success('Package deleted');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Packages"
        description="Manage the water packages and prices shown on the website."
        actions={
          <Button onClick={() => setDialog({ open: true, pkg: null })}>
            <Plus /> New package
          </Button>
        }
      />

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
        </div>
      ) : error ? (
        <Card><EmptyState title="Couldn't load packages" description={error} action={<Button onClick={refetch}>Retry</Button>} /></Card>
      ) : !data?.items.length ? (
        <Card>
          <EmptyState icon={PackageIcon} title="No packages yet" description="Create your first package to start taking orders." action={<Button onClick={() => setDialog({ open: true, pkg: null })}><Plus /> New package</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((p) => (
            <Card key={p._id} className={cn('gap-0 overflow-hidden py-0 transition-opacity', !p.isActive && 'opacity-60')}>
              <div className="relative aspect-[16/9] bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-950/40 dark:to-sky-900/30">
                <img src={packageImage(p.slug, p.image)} alt="" className="absolute inset-0 size-full object-contain p-4" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.popular && <Badge className="gap-1"><Star className="size-3" /> Popular</Badge>}
                  {p.bestValue && <Badge className="gap-1 bg-emerald-600 text-white"><Award className="size-3" /> Best value</Badge>}
                  {!p.isActive && <Badge variant="secondary">Hidden</Badge>}
                </div>
              </div>
              <CardContent className="grid flex-1 content-start gap-3 p-5">
                <div>
                  <h3 className="leading-snug font-semibold">{p.title}</h3>
                  {p.subtitle && <p className="text-muted-foreground mt-0.5 text-sm">{p.subtitle}</p>}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{formatCurrency(p.price)}</span>
                  {p.regularPrice ? <span className="text-muted-foreground text-sm line-through">{formatCurrency(p.regularPrice)}</span> : null}
                  {p.unit && <span className="text-muted-foreground text-sm">/ {p.unit}</span>}
                </div>
                {p.depositRequired && <p className="text-muted-foreground text-xs">Jar deposit {formatCurrency(p.depositAmount)} if no empty jar</p>}
                <ul className="grid gap-1.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="text-primary mt-0.5 size-4 shrink-0" /> {f}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-2 border-t p-4 [.border-t]:pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={p.isActive} onCheckedChange={(v) => toggleActive(p, v)} aria-label="Visible on website" />
                  Visible
                </label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setDialog({ open: true, pkg: p })}><Pencil /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Delete" className="text-destructive hover:text-destructive" onClick={() => remove(p)}><Trash2 /></Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <PackageDialog
        open={dialog.open}
        initial={dialog.pkg}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSaved={replace}
      />
    </>
  );
}
