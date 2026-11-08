import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Droplets, Loader2, ShieldCheck, Truck, MessagesSquare, User as UserIcon, Store } from 'lucide-react';
import logo from '@/src/assets/logo.png';
import { KHULNA_AREAS } from '@/src/data/packages';
import { Button } from '@/src/admin/components/ui/button';
import { Input } from '@/src/admin/components/ui/input';
import { Label } from '@/src/admin/components/ui/label';
import { Checkbox } from '@/src/admin/components/ui/checkbox';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/lib/auth';

function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-background grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <Link to="/" className="flex items-center gap-2 self-start font-semibold">
          <img src={logo} alt="" className="size-8 object-contain" />
          Pani Wala
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-900 lg:sticky lg:top-0 lg:block lg:h-svh">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,white_0,transparent_35%),radial-gradient(circle_at_80%_70%,#67e8f9_0,transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-end gap-8 p-12 text-white">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Droplets className="size-7" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight">Pure water, delivered on time.</h2>
            <p className="max-w-md text-white/75">
              Manage orders, suppliers and customers in one place — with live order updates and instant chat.
            </p>
          </div>
          <ul className="grid gap-3 text-sm text-white/85">
            <li className="flex items-center gap-3"><ShieldCheck className="size-4" /> Role-based access for admins, suppliers and customers</li>
            <li className="flex items-center gap-3"><Truck className="size-4" /> Assign and track every delivery in realtime</li>
            <li className="flex items-center gap-3"><MessagesSquare className="size-4" /> Built-in support chat</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Sign in" description="Enter your email and password to access your dashboard.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/admin/register" className="text-primary font-medium underline-offset-4 hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register, registerSupplier } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = React.useState<'user' | 'supplier'>(() =>
    new URLSearchParams(window.location.search).get('as') === 'supplier' ? 'supplier' : 'user'
  );
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', password: '', businessName: '', tradeLicense: '' });
  const [areas, setAreas] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const phone = form.phone.replace(/[\s-]/g, '');
      if (type === 'supplier') {
        await registerSupplier({
          name: form.name,
          email: form.email,
          phone,
          password: form.password,
          businessName: form.businessName,
          tradeLicense: form.tradeLicense || undefined,
          serviceAreas: areas,
        });
        toast.success('Supplier account created', { description: 'An admin will review and approve your account.' });
      } else {
        await register({ name: form.name, email: form.email, phone: phone || undefined, password: form.password });
        toast.success('Account created — welcome to Pani Wala!');
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create an account"
      description={type === 'supplier' ? 'Join as a delivery partner and start receiving orders.' : 'Track your orders and chat with our team.'}
    >
      <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1" role="tablist">
        {([
          { value: 'user', label: 'Customer', icon: UserIcon },
          { value: 'supplier', label: 'Supplier', icon: Store },
        ] as const).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={type === t.value}
            onClick={() => setType(t.value)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              type === t.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Full name" htmlFor="name">
          <Input id="name" autoComplete="name" value={form.name} onChange={set('name')} required minLength={2} />
        </Field>
        {type === 'supplier' && (
          <Field label="Business name" htmlFor="businessName">
            <Input id="businessName" value={form.businessName} onChange={set('businessName')} required minLength={2} />
          </Field>
        )}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        </Field>
        <Field label={type === 'supplier' ? 'Mobile number' : 'Mobile number (optional)'} htmlFor="phone">
          <Input id="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={set('phone')} required={type === 'supplier'} />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
          <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required minLength={6} />
        </Field>

        {type === 'supplier' && (
          <>
            <Field label="Trade license no. (optional)" htmlFor="tradeLicense">
              <Input id="tradeLicense" value={form.tradeLicense} onChange={set('tradeLicense')} />
            </Field>
            <div className="grid gap-2">
              <Label>Service areas</Label>
              <div className="grid max-h-44 gap-2 overflow-y-auto rounded-lg border p-3">
                {KHULNA_AREAS.map((area) => (
                  <label key={area} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={areas.includes(area)}
                      onCheckedChange={(v) => setAreas((prev) => (v ? [...prev, area] : prev.filter((a) => a !== area)))}
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {type === 'supplier' ? 'Apply as supplier' : 'Create account'}
        </Button>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link to="/admin/login" className="text-primary font-medium underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
