import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Package,
  MapPin,
  Star,
  HelpCircle,
  PackageSearch,
  Phone,
  LogIn,
  UserPlus,
  Store,
  LogOut,
  ChevronRight,
  Clock3,
  type LucideIcon,
} from 'lucide-react';
import { HOTLINE_NUMBER, HOTLINE_TEL, WHATSAPP_NUMBER } from '@/src/data/packages';
import { useAuth } from '@/src/lib/auth';
import { ROLE_LABEL_BN, initialsOf } from '@/src/site/context';
import { useAccountLinks } from '@/src/components/Navbar';

const SHORTCUTS: { to: string; label: string; icon: LucideIcon; tone: string }[] = [
  { to: '/#packages', label: 'প্যাকেজ', icon: Package, tone: 'bg-cyan-50 text-cyan-700' },
  { to: '/#areas', label: 'সার্ভিস এরিয়া', icon: MapPin, tone: 'bg-emerald-50 text-emerald-700' },
  { to: '/#reviews', label: 'রিভিউ', icon: Star, tone: 'bg-amber-50 text-amber-700' },
  { to: '/#faq', label: 'প্রশ্নোত্তর', icon: HelpCircle, tone: 'bg-violet-50 text-violet-700' },
  { to: '/orders', label: 'অর্ডার ট্র্যাক', icon: PackageSearch, tone: 'bg-sky-50 text-sky-700' },
];

/**
 * Bottom-sheet drawer opened from the "More" tab of the mobile bottom nav.
 * Holds the account card, section shortcuts, contact options and log out.
 */
export const MoreDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const accountLinks = useAccountLinks();
  const navigate = useNavigate();
  // Keep mounted during the close animation.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি পানি ওয়ালা সম্পর্কে জানতে চাই।')}`;
  const shortcuts = user?.role === 'supplier' ? SHORTCUTS.filter((s) => s.to !== '/orders') : SHORTCUTS;

  return (
    <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="আরও অপশন">
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl transition-transform duration-250 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle + close */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-5 pt-2.5 pb-2">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">আরও অপশন</h2>
            <button onClick={onClose} aria-label="বন্ধ করুন" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {/* Account */}
          {user ? (
            <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-base font-bold">{initialsOf(user.name)}</span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{user.supplier?.businessName || user.name}</p>
                  <p className="truncate text-xs text-cyan-100">
                    {ROLE_LABEL_BN[user.role]} · {user.phone || user.email}
                  </p>
                </div>
              </div>
              {user.role === 'supplier' && user.status === 'pending' && (
                <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs">
                  <Clock3 className="h-3.5 w-3.5" /> অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় আছে
                </p>
              )}
              <div className="mt-3 grid gap-1.5">
                {accountLinks.map((l) => (
                  <Link key={l.to} to={l.to} onClick={onClose} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold hover:bg-white/20">
                    <l.icon className="h-4 w-4" />
                    <span className="flex-1">{l.label}</span>
                    {l.badge > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[11px] font-bold">{l.badge}</span>}
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <p className="font-bold text-slate-900">আপনার অ্যাকাউন্ট</p>
              <p className="mt-0.5 text-xs text-slate-600">লগইন করে অর্ডার ট্র্যাক করুন ও সাপোর্টের সাথে চ্যাট করুন।</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={onClose} className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-cyan-600 text-sm font-bold text-white">
                  <LogIn className="h-4 w-4" /> লগইন
                </Link>
                <Link to="/register" onClick={onClose} className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800">
                  <UserPlus className="h-4 w-4" /> রেজিস্টার
                </Link>
              </div>
              <Link to="/register?as=supplier" onClick={onClose} className="mt-2 flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-semibold text-cyan-800">
                <Store className="h-4 w-4" /> সাপ্লায়ার হিসেবে যোগ দিন
                <ChevronRight className="ml-auto h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Shortcuts */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">এক নজরে</p>
            <div className="grid grid-cols-3 gap-2">
              {shortcuts.map((s) => (
                <Link key={s.to} to={s.to} onClick={onClose} className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 text-center text-xs font-semibold text-slate-700 active:scale-[0.97] transition-transform">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">যোগাযোগ</p>
            <div className="grid gap-2">
              <a href={`tel:${HOTLINE_TEL}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white"><Phone className="h-4.5 w-4.5" /></span>
                <span className="flex-1">
                  <span className="block text-xs text-slate-500">হটলাইনে কল করুন</span>
                  <span className="block text-sm font-bold text-slate-900">{HOTLINE_NUMBER}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" /></svg>
                </span>
                <span className="flex-1">
                  <span className="block text-xs text-slate-500">হোয়াটসঅ্যাপে চ্যাট</span>
                  <span className="block text-sm font-bold text-slate-900">দ্রুত উত্তর পান</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            </div>
          </div>

          {user && (
            <button
              onClick={() => {
                onClose();
                logout();
                navigate('/');
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 text-sm font-bold text-rose-600"
            >
              <LogOut className="h-4 w-4" /> লগআউট
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
