'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { OrderModal } from '@/src/components/OrderModal';
import { FloatingWhatsApp } from '@/src/components/FloatingWhatsApp';
import { BottomNav } from '@/src/components/BottomNav';
import { MoreDrawer } from '@/src/components/MoreDrawer';
import { SiteContext } from '@/src/site/context';
import { useHash } from '@/src/lib/navigation';
import { WaterPackage } from '@/src/types';

/** Scrolls to `#hash` targets (also across routes) and to the top on page changes. */
function ScrollManager() {
  const pathname = usePathname();
  const hash = useHash();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // The target section may mount a frame later when coming from another page.
    let tries = 0;
    let frame = 0;
    const tick = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tries++ < 20) frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

/**
 * Website shell shared by the landing page and the customer/supplier pages
 * (orders, deliveries, chat, profile). On mobile it behaves like an app: a
 * bottom tab bar with a "More" drawer replaces the top hamburger menu.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WaterPackage | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const openOrder = useCallback((pkg?: WaterPackage) => {
    if (pkg) setSelectedPackage(pkg);
    setIsMoreOpen(false);
    setIsOrderModalOpen(true);
  }, []);
  const openMore = useCallback(() => setIsMoreOpen(true), []);
  const site = useMemo(() => ({ openOrder, openMore }), [openOrder, openMore]);

  // Close the drawer whenever the route changes.
  useEffect(() => setIsMoreOpen(false), [pathname]);

  // No footer on the full-height chat screen or on the focused login / sign-up screens.
  const hideFooter = ['/chat', '/login', '/register'].includes(pathname);

  // The footer is desktop-only, so on mobile reserve room for the fixed bottom nav —
  // except on pages that already pad themselves for it (account pages, chat).
  const selfPadded = ['/chat', '/login', '/register', '/orders', '/deliveries', '/profile'].includes(pathname);

  return (
    <SiteContext.Provider value={site}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
        <ScrollManager />

        {/* Top Navbar */}
        <Navbar onOpenOrder={() => openOrder()} />

        {/* Page content */}
        <main className={selfPadded ? 'flex-1' : 'flex-1 pb-20 md:pb-0'}>{children}</main>

        {!hideFooter && <Footer />}

        {/* Fixed WhatsApp Support Logo (Bottom Right) — landing page only; account pages have chat */}
        {pathname === '/' && <FloatingWhatsApp />}

        {/* Mobile app-style bottom navigation + "More" drawer */}
        <BottomNav />
        <MoreDrawer open={isMoreOpen} onClose={() => setIsMoreOpen(false)} />

        {/* Interactive Quick Order Modal */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          selectedPackage={selectedPackage}
        />

        <Toaster position="top-center" richColors closeButton />
      </div>
    </SiteContext.Provider>
  );
}
