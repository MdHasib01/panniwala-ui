import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, LogOut, Check, Clock3, ShieldCheck } from 'lucide-react';
import { KHULNA_AREAS } from '@/src/data/packages';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '@/src/lib/auth';
import type { User } from '@/src/lib/models';
import { ROLE_LABEL_BN, initialsOf } from '@/src/site/context';
import { AccountHeader, AccountPage, Field, fieldClass } from './ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function DetailsForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const isSupplier = user.role === 'supplier';
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? '',
    area: user.area ?? '',
    address: user.address ?? '',
    businessName: user.supplier?.businessName ?? '',
    tradeLicense: user.supplier?.tradeLicense ?? '',
  });
  const [areas, setAreas] = useState<string[]>(user.supplier?.serviceAreas ?? []);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = form.phone.replace(/[\s-]/g, '');
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name: form.name, phone };
      if (isSupplier) Object.assign(body, { businessName: form.businessName, tradeLicense: form.tradeLicense, serviceAreas: areas });
      else Object.assign(body, { area: form.area, address: form.address });
      const { user: updated } = await api.patch<{ user: User }>('/auth/me', body);
      setUser(updated);
      toast.success('প্রোফাইল সেভ হয়েছে');
    } catch (err) {
      toast.error((err as Error).message);
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
          <Field label="মোবাইল নম্বর" htmlFor="p-phone">
            <input id="p-phone" type="tel" inputMode="tel" className={fieldClass} value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="ইমেইল" htmlFor="p-email" hint="ইমেইল পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন">
            <input id="p-email" className={fieldClass} value={user.email} disabled />
          </Field>
          {isSupplier ? (
            <Field label="প্রতিষ্ঠানের নাম" htmlFor="p-biz">
              <input id="p-biz" className={fieldClass} value={form.businessName} onChange={set('businessName')} required minLength={2} />
            </Field>
          ) : (
            <Field label="এলাকা" htmlFor="p-area">
              <select id="p-area" className={fieldClass} value={form.area} onChange={set('area')}>
                <option value="">এলাকা নির্বাচন করুন</option>
                {KHULNA_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          )}
        </div>
        {isSupplier ? (
          <>
            <Field label="ট্রেড লাইসেন্স নং" htmlFor="p-lic">
              <input id="p-lic" className={fieldClass} value={form.tradeLicense} onChange={set('tradeLicense')} />
            </Field>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-slate-700">ডেলিভারি এলাকা</p>
              <div className="flex flex-wrap gap-2">
                {KHULNA_AREAS.map((area) => {
                  const on = areas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setAreas((p) => (on ? p.filter((a) => a !== area) : [...p, area]))}
                      className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold', on ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-200 bg-white text-slate-600')}
                    >
                      {on && <Check className="h-3 w-3" />}
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
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
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <AccountPage>
      <AccountHeader title="প্রোফাইল" />
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 p-5 text-white">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">{initialsOf(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{user.supplier?.businessName || user.name}</p>
            <p className="truncate text-sm text-cyan-100">{user.email}</p>
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
            navigate('/');
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 text-sm font-bold text-rose-600"
        >
          <LogOut className="h-4 w-4" /> লগআউট
        </button>
      </div>
    </AccountPage>
  );
}
