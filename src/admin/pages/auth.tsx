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
import { homePathFor, useAuth } from '@/src/lib/auth';

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
      if (user.role !== 'admin') {
        // Customers and suppliers use the website, not the dashboard.
        toast.info('The dashboard is for admins only', { description: 'Taking you to your account on the website.' });
        navigate(homePathFor(user), { replace: true });
        return;
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Admin sign in" description="This dashboard is for Pani Wala administrators.">
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
        Customer or supplier?{' '}
        <Link to="/login" className="text-primary font-medium underline-offset-4 hover:underline">Sign in on the website</Link>
      </p>
    </AuthShell>
  );
}
