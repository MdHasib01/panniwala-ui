'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/src/components/BrandLogo';
import { Button } from '@/src/components/ui/button';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import {
  Phone,
  ShoppingBag,
  LogIn,
  ChevronDown,
  Package,
  Truck,
  MessageCircle,
  UserRound,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/src/lib/auth';
import { useSocket } from '@/src/lib/socket';
import { ROLE_LABEL_BN, initialsOf } from '@/src/site/context';

interface NavbarProps {
  onOpenOrder: () => void;
}

export const navLinks = [
  { label: 'প্যাকেজ সমূহ', to: '/#packages' },
  { label: 'সার্ভিস এরিয়া', to: '/#areas' },
  { label: 'রিভিউ', to: '/#reviews' },
  { label: 'প্রশ্নোত্তর', to: '/#faq' },
];

/** Signed-in account shortcuts for the current role. */
export function useAccountLinks() {
  const { user } = useAuth();
  const { unreadChats } = useSocket();
  if (!user) return [];
  if (user.role === 'admin') {
    return [{ to: '/admin', label: 'অ্যাডমিন ড্যাশবোর্ড', icon: LayoutDashboard, badge: 0 }];
  }
  return [
    user.role === 'supplier'
      ? { to: '/deliveries', label: 'আমার ডেলিভারি', icon: Truck, badge: 0 }
      : { to: '/orders', label: 'আমার অর্ডার', icon: Package, badge: 0 },
    { to: '/chat', label: 'মেসেজ', icon: MessageCircle, badge: unreadChats },
    { to: '/profile', label: 'প্রোফাইল', icon: UserRound, badge: 0 },
  ];
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const links = useAccountLinks();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <LogIn className="w-4 h-4 text-cyan-600" />
        লগইন
      </Link>
    );
  }

  const unread = links.reduce((n, l) => n + l.badge, 0);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 hover:bg-slate-50 transition-colors"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-xs font-bold text-cyan-700">
          {initialsOf(user.name)}
          {unread > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />}
        </span>
        <span className="max-w-28 truncate text-sm font-semibold text-slate-800">{user.name.split(' ')[0]}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-900">{user.supplier?.businessName || user.name}</p>
            <p className="truncate text-xs text-slate-500">
              {ROLE_LABEL_BN[user.role]} · {user.phone || user.email}
            </p>
          </div>
          <div className="p-1.5">
            {links.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
              >
                <l.icon className="w-4 h-4 text-cyan-600" />
                <span className="flex-1">{l.label}</span>
                {l.badge > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{l.badge}</span>
                )}
              </Link>
            ))}
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
                router.push('/');
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact account entry point for the mobile top bar (the rest lives in the bottom nav). */
function MobileAccountButton() {
  const { user } = useAuth();
  const { unreadChats } = useSocket();
  if (!user) {
    return (
      <Link
        href="/login"
        className="md:hidden inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100"
      >
        <LogIn className="w-4 h-4" />
        লগইন
      </Link>
    );
  }
  return (
    <Link
      href={user.role === 'admin' ? '/admin' : '/profile'}
      aria-label="আমার অ্যাকাউন্ট"
      className="md:hidden relative flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-sm font-bold text-cyan-700"
    >
      {initialsOf(user.name)}
      {unreadChats > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />}
    </Link>
  );
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrder }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-cyan-900 via-cyan-800 to-sky-900 text-white text-[12px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-slate-200">
              খুলনা সিটিতে ১ ঘণ্টার মধ্যে বিশুদ্ধ পানির জার পৌঁছে দেওয়া হয়
            </span>
            <span className="sm:hidden text-slate-200">
              ১ ঘণ্টার মধ্যে ফ্রি হোম ডেলিভারি
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="flex items-center gap-1 text-cyan-200 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span className="font-semibold">{HOTLINE_NUMBER}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 focus:outline-none">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className="text-sm font-medium text-slate-600 hover:text-cyan-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-600 hover:after:w-full after:transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Hotline Call Button */}
          <a
            id="nav-call-btn"
            href={`tel:${HOTLINE_TEL}`}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-600" />
            <span>{HOTLINE_NUMBER}</span>
          </a>

          {/* Order CTA Button (on mobile it lives in the bottom nav) */}
          <Button
            id="nav-order-now-btn"
            onClick={onOpenOrder}
            className="btn-shine hidden md:inline-flex bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 font-semibold px-4 sm:px-5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডার করুন</span>
          </Button>

          <AccountMenu />
          <MobileAccountButton />
        </div>
      </div>
    </header>
  );
};
