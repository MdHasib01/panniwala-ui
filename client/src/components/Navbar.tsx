import React, { useState } from 'react';
import { BrandLogo } from '@/src/components/BrandLogo';
import { Button } from '@/src/components/ui/button';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { Phone, ShoppingBag, Menu, X, ShieldCheck, Clock } from 'lucide-react';

interface NavbarProps {
  customLogoUrl: string | null;
  onOpenOrder: () => void;
  onOpenCustomizer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  customLogoUrl,
  onOpenOrder,
  onOpenCustomizer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'প্যাকেজ সমূহ', href: '#packages' },
    { label: 'বিশুদ্ধতা প্রক্রিয়া', href: '#purity' },
    { label: 'সার্ভিস এরিয়া', href: '#areas' },
    { label: 'রিভিউ', href: '#reviews' },
    { label: 'প্রশ্নোত্তর', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-cyan-900 via-cyan-800 to-sky-900 text-white text-[12px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-cyan-500/30 px-2 py-0.5 rounded-full text-cyan-200 text-[11px] font-semibold border border-cyan-400/30">
              <Clock className="w-3 h-3" /> এক্সপ্রেস ডেলিভারি
            </span>
            <span className="hidden sm:inline text-slate-200">
              ঢাকা ও চট্টগ্রামে ১ ঘণ্টার মধ্যে বিশুদ্ধ পানির জার পৌঁছে দেওয়া হয়
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 focus:outline-none">
            <BrandLogo customLogoUrl={customLogoUrl} size="md" />
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {navLinks.map((link) => (
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
        <div className="flex items-center gap-2.5">
          {/* Hotline Call Button */}
          <a
            id="nav-call-btn"
            href={`tel:${HOTLINE_TEL}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-600" />
            <span>{HOTLINE_NUMBER}</span>
          </a>


          {/* Order CTA Button */}
          <Button
            id="nav-order-now-btn"
            onClick={onOpenOrder}
            className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 font-semibold px-4 sm:px-5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডার করুন</span>
          </Button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-cyan-700 hover:bg-cyan-50/60"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-600" />
              কল দিন: {HOTLINE_NUMBER}
            </a>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCustomizer();
            }}
            className="w-full text-center text-xs text-cyan-600 py-2 hover:underline"
          >
            📸 আপনার লোগো ও ছবি আপলোড করুন
          </button>
        </div>
      )}
    </header>
  );
};
