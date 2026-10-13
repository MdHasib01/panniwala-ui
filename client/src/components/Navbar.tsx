import React, { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { BrandLogo } from '@/src/components/BrandLogo';
import { Button } from '@/src/components/ui/button';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { SECTION_NAV_ITEMS } from '@/src/data/navigation';
import { EASE_OUT } from '@/src/lib/motion';
import { Phone, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOpenOrder: () => void;
}

/** Height of the announcement strip that slides away once the visitor scrolls. */
const STRIP_HEIGHT = 28;

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrder }) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40));

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-40"
      animate={{ y: scrolled ? -STRIP_HEIGHT : 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
    >
      {/* Top micro announcement strip */}
      <div className="h-7 bg-accent-deep text-white text-[12px] font-medium px-4 flex items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <span className="hidden sm:inline text-white/85">
            খুলনা সিটিতে ১ ঘণ্টার মধ্যে বিশুদ্ধ পানির জার পৌঁছে দেওয়া হয়
          </span>
          <span className="sm:hidden text-white/85">১ ঘণ্টার মধ্যে ফ্রি হোম ডেলিভারি</span>
          <a
            href={`tel:${HOTLINE_TEL}`}
            className="flex items-center gap-1 text-white hover:text-water transition-colors duration-150"
          >
            <Phone className="w-3 h-3" />
            <span className="font-semibold">{HOTLINE_NUMBER}</span>
          </a>
        </div>
      </div>

      {/* Main bar: transparent over the hero, frosted once the page moves */}
      <div className="relative">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-surface/90 backdrop-blur-xl border-b border-hairline shadow-e1"
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0">
            <a href="#top" className="flex items-center gap-2 min-w-0 rounded-xl">
              <BrandLogo size="md" />
            </a>

            {/* Desktop links */}
            <nav aria-label="প্রধান নেভিগেশন" className="hidden lg:flex items-center gap-6 ml-4">
              {SECTION_NAV_ITEMS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative py-1 text-sm font-medium text-ink-soft hover:text-ink transition-colors duration-150"
                >
                  {link.label}
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out-soft" />
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile: compact round call button (navigation lives in the bottom bar) */}
            <a
              id="nav-call-icon-btn"
              href={`tel:${HOTLINE_TEL}`}
              aria-label={`কল করুন ${HOTLINE_NUMBER}`}
              className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-accent-wash text-accent ring-1 ring-accent/15 active:scale-95 transition-transform duration-150"
            >
              <Phone className="w-4.5 h-4.5" strokeWidth={2.2} />
            </a>

            <a
              id="nav-call-btn"
              href={`tel:${HOTLINE_TEL}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs font-semibold text-ink bg-surface/80 hover:bg-surface ring-1 ring-hairline transition-colors duration-150"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span className="tabular">{HOTLINE_NUMBER}</span>
            </a>

            {/* Order CTA (mobile uses the bottom bar's centre order button) */}
            <Button
              id="nav-order-now-btn"
              onClick={onOpenOrder}
              className="hidden md:inline-flex h-10 bg-accent hover:bg-accent-deep text-accent-ink shadow-e2 font-semibold px-5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>অর্ডার করুন</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
