import React, { useState } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { Hero } from '@/src/components/Hero';
import { QuickStats } from '@/src/components/QuickStats';
import { PurityProcess } from '@/src/components/PurityProcess';
import { Packages } from '@/src/components/Packages';
import { ServiceAreaChecker } from '@/src/components/ServiceAreaChecker';
import { Testimonials } from '@/src/components/Testimonials';
import { Faq } from '@/src/components/Faq';
import { FinalCta } from '@/src/components/FinalCta';
import { Footer } from '@/src/components/Footer';
import { JarProgress } from '@/src/components/JarProgress';
import { MobileBottomNav } from '@/src/components/MobileBottomNav';
import { OrderModal } from '@/src/components/OrderModal';
import { FloatingWhatsApp } from '@/src/components/FloatingWhatsApp';
import { WaterPackage } from '@/src/types';

export default function App() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WaterPackage | null>(null);

  const handleOpenOrder = (pkg?: WaterPackage) => {
    if (pkg) {
      setSelectedPackage(pkg);
    }
    setIsOrderModalOpen(true);
  };

  const handleCloseOrder = () => {
    setIsOrderModalOpen(false);
  };

  return (
    <div id="top" className="min-h-screen bg-canvas text-ink flex flex-col font-sans antialiased">
      {/* Fixed top bar: announcement strip slides away on scroll */}
      <Navbar onOpenOrder={() => handleOpenOrder()} />

      <main className="flex-1">
        {/* Layered hero: the jar settles into rising water */}
        <Hero onOpenOrder={() => handleOpenOrder()} />

        {/* Proof that ticks up on arrival */}
        <QuickStats />

        {/* The peak: murky water clears through 7 filter stages */}
        <PurityProcess />

        {/* Packages on a horizontal rail */}
        <Packages onSelectPackage={(pkg) => handleOpenOrder(pkg)} />

        {/* Delivery service area checker */}
        <ServiceAreaChecker onOpenOrder={() => handleOpenOrder()} />

        {/* Customer reviews */}
        <Testimonials />

        {/* Frequently asked questions */}
        <Faq />

        {/* The close: the jar is full, one action */}
        <FinalCta onOpenOrder={() => handleOpenOrder()} />
      </main>

      <Footer />

      {/* Signature move: reading progress fills a jar (wide desktop) */}
      <JarProgress />

      {/* Fixed WhatsApp Support Logo (Bottom Right) */}
      <FloatingWhatsApp />

      {/* Mobile bottom tab navigation with "More" sidebar */}
      <MobileBottomNav onOpenOrder={() => handleOpenOrder()} />

      {/* Interactive Quick Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrder}
        selectedPackage={selectedPackage}
      />
    </div>
  );
}
