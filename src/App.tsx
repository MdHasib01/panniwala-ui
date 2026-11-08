import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { OrderModal } from '@/src/components/OrderModal';
import { FloatingWhatsApp } from '@/src/components/FloatingWhatsApp';
import { BottomNav } from '@/src/components/BottomNav';
import { MoreDrawer } from '@/src/components/MoreDrawer';
import { SiteContext } from '@/src/site/context';
import { WaterPackage } from '@/src/types';

/** Scrolls to `#hash` targets (also across routes) and to the top on page changes. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // The target section may mount a frame later when coming from another page.
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tries++ < 20) requestAnimationFrame(tick);
    };
    tick();
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
    </div>
  );
}

/**
 * Website shell shared by the landing page and the customer/supplier pages
 * (orders, deliveries, chat, profile). On mobile it behaves like an app: a
 * bottom tab bar with a "More" drawer replaces the top hamburger menu.
 */
export default function App() {
  const { pathname } = useLocation();
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

  // The chat page is a full-height app screen: no footer or floating button.
  const isChat = pathname === '/chat';

  return (
    <SiteContext.Provider value={site}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
        <ScrollManager />

        {/* Top Navbar */}
        <Navbar onOpenOrder={() => openOrder()} />

        {/* Page content */}
        <main className="flex-1">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>

        {!isChat && <Footer />}

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
