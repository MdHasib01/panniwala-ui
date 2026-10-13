import React from 'react';
import { BrandLogo } from '@/src/components/BrandLogo';
import { Button } from '@/src/components/ui/button';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { SECTION_NAV_ITEMS } from '@/src/data/navigation';
import { Phone, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOpenOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrder }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-cyan-900 via-cyan-800 to-sky-900 text-white text-[12px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-slate-200">
              খুলনা সিটিতে <strong className="font-bold text-white">১</strong> ঘণ্টার মধ্যে বিশুদ্ধ পানির জার পৌঁছে দেওয়া হয়
            </span>
            <span className="sm:hidden text-slate-200">
              <strong className="font-bold text-white">১</strong> ঘণ্টার মধ্যে ফ্রি হোম ডেলিভারি
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="flex items-center gap-1 text-cyan-200 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span className="font-bold text-white">{HOTLINE_NUMBER}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
        <div className="flex items-center gap-6 min-w-0">
          <a href="#" className="flex items-center gap-2 focus:outline-none min-w-0">
            <BrandLogo size="md" />
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {SECTION_NAV_ITEMS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-cyan-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-600 hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile: compact round call button (navigation lives in the bottom bar) */}
          <a
            id="nav-call-icon-btn"
            href={`tel:${HOTLINE_TEL}`}
            aria-label={`কল করুন ${HOTLINE_NUMBER}`}
            className="sm:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-50 to-sky-100 text-cyan-700 ring-1 ring-cyan-200/70 shadow-xs active:scale-90 transition-transform"
          >
            <span className="absolute inset-0 rounded-full ring-2 ring-cyan-400/40 animate-ping pointer-events-none" />
            <Phone className="relative w-4.5 h-4.5" strokeWidth={2.2} />
          </a>

          {/* Hotline Call Button */}
          <a
            id="nav-call-btn"
            href={`tel:${HOTLINE_TEL}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-600" />
            <span className="font-bold text-slate-900">{HOTLINE_NUMBER}</span>
          </a>

          {/* Order CTA Button (mobile uses the bottom bar's center order button) */}
          <Button
            id="nav-order-now-btn"
            onClick={onOpenOrder}
            className="hidden md:inline-flex bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 font-semibold px-5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডার করুন</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
