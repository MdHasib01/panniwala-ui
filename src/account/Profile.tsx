'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, LogOut, Clock3, ShieldCheck } from 'lucide-react';
import { useAreas } from '@/src/lib/areas-api';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '@/src/lib/auth';
import type { AreaRequest, User } from '@/src/lib/models';
import { authErrorBn, isBdPhone, normalizeBdPhone } from '@/src/lib/phone';
import { ROLE_LABEL_BN, initialsOf } from '@/src/site/context';
import { AccountHeader, AccountPage, Field, fieldClass } from './ui';
import { AreaPicker, splitAreas } from './AreaPicker';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

const REQUEST_STATUS_BN: Record<AreaRequest['status'], { label: string; pill: string }> = {
  pending: { label: 'অনুমোদনের অপেক্ষায়', pill: 'bg-amber-50 text-amber-700 ring-amber-200' },
  approved: { label: 'অনুমোদিত', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  rejected: { label: 'বাতিল', pill: 'bg-rose-50 text-rose-600 ring-rose-200' },
};

const dateBn = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Every area this supplier has asked to add, newest first — kept even after a decision. */
function AreaRequestHistory({ requests }: { requests: AreaRequest[] }) {
  if (!requests.length) return null;
  const sorted = [...requests].sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt));
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">নতুন এলাকার অনুরোধ</p>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {sorted.map((r) => {
          const meta = REQUEST_STATUS_BN[r.status];
          return (
            <li key={r._id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">
                  অনুরোধ: {dateBn(r.requestedAt)}
                  {r.decidedAt && ` · সিদ্ধান্ত: ${dateBn(r.decidedAt)}`}
                </p>
              </div>
              <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1', meta.pill)}>{meta.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DetailsForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const isSupplier = user.role === 'supplier';
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? '',
    email: user.email ?? '',
    area: user.area ?? '',
    address: user.address ?? '',
    businessName: user.supplier?.businessName ?? '',
    tradeLicense: user.supplier?.tradeLicense ?? '',
  });
  const [areas, setAreas] = useState<string[]>(user.supplier?.serviceAreas ?? []);
  const areaOptions = useAreas();
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Phone is required (it's the login); email is optional and can be cleared.
    const phone = normalizeBdPhone(form.phone);
    if (!isBdPhone(phone)) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name: form.name, phone, email: form.email.trim() };
      if (isSupplier) Object.assign(body, { businessName: form.businessName, tradeLicense: form.tradeLicense, ...splitAreas(areas, areaOptions) });
      else Object.assign(body, { area: form.area, address: form.address });
      const { user: updated } = await api.patch<{ user: User }>('/auth/me', body);
      setUser(updated);
      // New areas became requests; keep only the approved ones selected.
      if (isSupplier) setAreas(updated.supplier?.serviceAreas ?? []);
      toast.success('প্রোফাইল সেভ হয়েছে');
    } catch (err) {
      toast.error(authErrorBn((err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title={isSupplier ? 'ব্যবসার তথ্য' : 'ব্যক্তিগত তথ্য'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="নাম" htmlFor="p-name">
            <input id="p-name" className={fieldClass} value={form.name} onChange={set('name')} required minLength={2} />
          </Field>
          <Field label="মোবাইল নম্বর" htmlFor="p-phone" hint="এই নম্বর দিয়ে লগইন করবেন">
            <input id="p-phone" type="tel" inputMode="tel" className={fieldClass} value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" required />
          </Field>
          <Field label="ইমেইল (ঐচ্ছিক)" htmlFor="p-email" hint="দিলে ইমেইল দিয়েও লগইন করতে পারবেন">
            <input id="p-email" type="email" inputMode="email" className={fieldClass} value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </Field>
          {isSupplier ? (
            <Field label="প্রতিষ্ঠানের নাম" htmlFor="p-biz">
              <input id="p-biz" className={fieldClass} value={form.businessName} onChange={set('businessName')} required minLength={2} />
            </Field>
          ) : (
            <Field label="এলাকা" htmlFor="p-area">
              <select id="p-area" className={fieldClass} value={form.area} onChange={set('area')}>
                <option value="">এলাকা নির্বাচন করুন</option>
                {areaOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          )}
        </div>
        {isSupplier ? (
          <>
            <Field label="ট্রেড লাইসেন্স নং" htmlFor="p-lic">
              <input id="p-lic" className={fieldClass} value={form.tradeLicense} onChange={set('tradeLicense')} />
            </Field>
            <Field label="ডেলিভারি এলাকা" htmlFor="p-areas" hint="তালিকায় না থাকলে নতুন এলাকার নাম লিখে যোগ করুন">
              <AreaPicker id="p-areas" value={areas} onChange={setAreas} />
            </Field>
            <AreaRequestHistory requests={user.supplier?.areaRequests ?? []} />
          </>
        ) : (
          <Field label="ঠিকানা" htmlFor="p-address" hint="অর্ডার করার সময় স্বয়ংক্রিয়ভাবে বসে যাবে">
            <input id="p-address" className={fieldClass} value={form.address} onChange={set('address')} placeholder="বাসা নং, রোড, ফ্ল্যাট" />
          </Field>
        )}
        <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-700 disabled:opacity-60 sm:w-auto sm:px-8">
          {saving && <Loader2 className="h-4.5 w-4.5 animate-spin" />} সেভ করুন
        </button>
      </form>
    </Section>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me/password', { currentPassword: current, newPassword: next });
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে');
      setCurrent('');
      setNext('');
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(/incorrect/i.test(msg) ? 'বর্তমান পাসওয়ার্ড সঠিক নয়' : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="পাসওয়ার্ড পরিবর্তন">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="বর্তমান পাসওয়ার্ড" htmlFor="pw-cur">
            <input id="pw-cur" type="password" autoComplete="current-password" className={fieldClass} value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </Field>
          <Field label="নতুন পাসওয়ার্ড" htmlFor="pw-new" hint="কমপক্ষে ৬ অক্ষর">
            <input id="pw-new" type="password" autoComplete="new-password" className={fieldClass} value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} />
          </Field>
        </div>
        <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60 sm:w-auto sm:px-8">
          {saving && <Loader2 className="h-4.5 w-4.5 animate-spin" />} পাসওয়ার্ড আপডেট
        </button>
      </form>
    </Section>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;

  return (
    <AccountPage>
      <AccountHeader title="প্রোফাইল" />
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 p-5 text-white">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">{initialsOf(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{user.supplier?.businessName || user.name}</p>
            <p className="truncate text-sm text-cyan-100">{[user.phone, user.email].filter(Boolean).join(' · ')}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
              {user.role === 'supplier' && user.status === 'pending' ? <Clock3 className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {ROLE_LABEL_BN[user.role]}
              {user.role === 'supplier' && (user.status === 'pending' ? ' · অনুমোদনের অপেক্ষায়' : ' · সক্রিয়')}
            </p>
          </div>
        </div>

        <DetailsForm user={user} />
        <PasswordForm />

        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 text-sm font-bold text-rose-600"
        >
          <LogOut className="h-4 w-4" /> লগআউট
        </button>
      </div>
    </AccountPage>
  );
}
