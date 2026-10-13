import React, { useState } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { Hero } from '@/src/components/Hero';
import { QuickStats } from '@/src/components/QuickStats';
import { Packages } from '@/src/components/Packages';
import { ServiceAreaChecker } from '@/src/components/ServiceAreaChecker';
import { Testimonials } from '@/src/components/Testimonials';
import { Faq } from '@/src/components/Faq';
import { Footer } from '@/src/components/Footer';
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
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <Navbar onOpenOrder={() => handleOpenOrder()} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with proper Call & Order CTAs */}
        <Hero onOpenOrder={() => handleOpenOrder()} />

        {/* Quick Trust Statistics */}
        <QuickStats />

        {/* Packages & Pricing Table */}
        <Packages onSelectPackage={(pkg) => handleOpenOrder(pkg)} />

        {/* Delivery Service Area Checker */}
        <ServiceAreaChecker onOpenOrder={() => handleOpenOrder()} />

        {/* Customer Reviews & Social Proof */}
        <Testimonials />

        {/* Frequently Asked Questions */}
        <Faq />
      </main>

      {/* Footer */}
      <Footer />

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
