'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { NEXT_PARAM, Redirect, safeNextPath } from '@/src/lib/navigation';
import { toast } from 'sonner';
import { Loader2, LogIn, Store, UserRound, Droplets, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { homePathFor, useAuth } from '@/src/lib/auth';
import type { User } from '@/src/lib/models';
import { authErrorBn, isBdPhone, normalizeBdPhone } from '@/src/lib/phone';
import { Field, Spinner, fieldClass } from './ui';
import { AreaPicker, emptySelection, toAreaBody, type AreaSelection } from './AreaPicker';

function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden px-4 pt-6 pb-28 sm:pt-12 md:pb-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-600/30">
            <Droplets className="h-7 w-7" />
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">{children}</div>
      </div>
    </div>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={cn(fieldClass, 'pr-11')} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
}

/** Where to go once signed in: back to the page that asked for login (`?next=`), or the role's home. */
function useAuthDestination() {
  const params = useSearchParams();
  const from = safeNextPath(params.get(NEXT_PARAM));
  return (user: User) => {
    const fromPath = from?.split(/[?#]/)[0];
    // Only honour `next` when it's a page this role may open.
    const allowed =
      fromPath &&
      (user.role === 'admin'
        ? fromPath.startsWith('/admin')
        : !fromPath.startsWith('/admin') && !(user.role === 'supplier' && fromPath === '/orders'));
    return allowed ? from! : homePathFor(user);
  };
}

function useAfterAuth() {
  const router = useRouter();
  const destination = useAuthDestination();
  return (user: User) => router.replace(destination(user));
}

/**
 * Signed-in users don't see the login / sign-up forms. This also fires right after a
 * successful sign-in (before the router has moved on), so it must pick the same
 * destination as `useAfterAuth`.
 */
function GuestGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const destination = useAuthDestination();
  const spinner = <Spinner className="min-h-[60vh] items-center" />;
  if (loading) return spinner;
  if (user) return <Redirect to={destination(user)} fallback={spinner} />;
  return <>{children}</>;
}

export function LoginPage() {
  const { login } = useAuth();
  const afterAuth = useAfterAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // A phone number is normalised (e.g. +880…) — anything with "@" is treated as an email.
      const id = identifier.includes('@') ? identifier.trim() : normalizeBdPhone(identifier);
      const user = await login(id, password);
      toast.success(`স্বাগতম, ${user.name.split(' ')[0]}!`);
      afterAuth(user);
    } catch (err) {
      setError(authErrorBn((err as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GuestGate>
      <AuthCard title="লগইন করুন" subtitle="গ্রাহক ও সাপ্লায়ার — একই লগইন">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="মোবাইল নম্বর অথবা ইমেইল" htmlFor="identifier">
            <input id="identifier" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="01XXXXXXXXX অথবা you@example.com" className={fieldClass} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </Field>
          <Field label="পাসওয়ার্ড" htmlFor="password">
            <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-shine flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 font-bold text-white shadow-md shadow-cyan-600/25 hover:bg-cyan-700 disabled:opacity-60">
            {submitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <LogIn className="h-4.5 w-4.5" />}
            লগইন
          </button>
        </form>
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
          <p>
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/register" className="font-bold text-cyan-700 hover:underline">নতুন অ্যাকাউন্ট খুলুন</Link>
          </p>
          <p>
            <Link href="/register?as=supplier" className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-cyan-700">
              <Store className="h-4 w-4" /> সাপ্লায়ার হিসেবে যোগ দিন
            </Link>
          </p>
        </div>
      </AuthCard>
    </GuestGate>
  );
}

export function RegisterPage() {
  const { register, registerSupplier } = useAuth();
  const afterAuth = useAfterAuth();
  const router = useRouter();
  const params = useSearchParams();
  const type: 'user' | 'supplier' = params.get('as') === 'supplier' ? 'supplier' : 'user';
  const setType = (value: 'user' | 'supplier') => {
    const next = new URLSearchParams(params.toString());
    if (value === 'supplier') next.set('as', 'supplier');
    else next.delete('as');
    const qs = next.toString();
    router.replace(qs ? `/register?${qs}` : '/register', { scroll: false });
  };
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', businessName: '', tradeLicense: '' });
  const [areas, setAreas] = useState<AreaSelection>(emptySelection());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phone = normalizeBdPhone(form.phone);
    const email = form.email.trim() || undefined;
    if (!isBdPhone(phone)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }
    setSubmitting(true);
    try {
      const user =
        type === 'supplier'
          ? await registerSupplier({ name: form.name, email, phone, password: form.password, businessName: form.businessName, tradeLicense: form.tradeLicense || undefined, ...toAreaBody(areas) })
          : await register({ name: form.name, email, phone, password: form.password });
      toast.success(type === 'supplier' ? 'আবেদন জমা হয়েছে!' : 'অ্যাকাউন্ট তৈরি হয়েছে!', {
        description: type === 'supplier' ? 'অ্যাডমিন অনুমোদন দিলেই আপনি ডেলিভারি অর্ডার পাবেন।' : 'পানি ওয়ালায় আপনাকে স্বাগতম।',
      });
      afterAuth(user);
    } catch (err) {
      setError(authErrorBn((err as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GuestGate>
      <AuthCard
        title={type === 'supplier' ? 'সাপ্লায়ার হিসেবে যোগ দিন' : 'নতুন অ্যাকাউন্ট'}
        subtitle={type === 'supplier' ? 'ডেলিভারি পার্টনার হয়ে নিয়মিত অর্ডার পান' : 'অর্ডার ট্র্যাক ও সাপোর্ট চ্যাটের জন্য'}
      >
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
          {([
            { value: 'user', label: 'গ্রাহক', icon: UserRound },
            { value: 'supplier', label: 'সাপ্লায়ার', icon: Store },
          ] as const).map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={type === t.value}
              onClick={() => setType(t.value)}
              className={cn(
                'flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-all',
                type === t.value ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="আপনার নাম" htmlFor="name">
            <input id="name" autoComplete="name" className={fieldClass} value={form.name} onChange={set('name')} required minLength={2} />
          </Field>
          {type === 'supplier' && (
            <Field label="প্রতিষ্ঠানের নাম" htmlFor="businessName">
              <input id="businessName" className={fieldClass} value={form.businessName} onChange={set('businessName')} required minLength={2} />
            </Field>
          )}
          <Field label="মোবাইল নম্বর" htmlFor="phone" hint="এই নম্বর দিয়েই লগইন করবেন">
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={fieldClass} value={form.phone} onChange={set('phone')} required />
          </Field>
          <Field label="ইমেইল (ঐচ্ছিক)" htmlFor="email">
            <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className={fieldClass} value={form.email} onChange={set('email')} />
          </Field>
          <Field label="পাসওয়ার্ড" htmlFor="password" hint="কমপক্ষে ৬ অক্ষর">
            <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set('password')} required minLength={6} />
          </Field>

          {type === 'supplier' && (
            <>
              <Field label="ট্রেড লাইসেন্স নং (ঐচ্ছিক)" htmlFor="tradeLicense">
                <input id="tradeLicense" className={fieldClass} value={form.tradeLicense} onChange={set('tradeLicense')} />
              </Field>
              <Field label="যেসব এলাকায় ডেলিভারি দিবেন" htmlFor="serviceAreas">
                <AreaPicker id="serviceAreas" value={areas} onChange={setAreas} />
              </Field>
            </>
          )}

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-shine flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 font-bold text-white shadow-md shadow-cyan-600/25 hover:bg-cyan-700 disabled:opacity-60">
            {submitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            {type === 'supplier' ? 'আবেদন জমা দিন' : 'অ্যাকাউন্ট খুলুন'}
          </button>
        </form>
        <p className="mt-5 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
          আগেই অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="font-bold text-cyan-700 hover:underline">লগইন করুন</Link>
        </p>
      </AuthCard>
    </GuestGate>
  );
}
