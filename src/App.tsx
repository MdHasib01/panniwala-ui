import React, { useState, useEffect } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { Hero } from '@/src/components/Hero';
import { QuickStats } from '@/src/components/QuickStats';
import { Packages } from '@/src/components/Packages';
import { ServiceAreaChecker } from '@/src/components/ServiceAreaChecker';
import { Testimonials } from '@/src/components/Testimonials';
import { Faq } from '@/src/components/Faq';
import { Footer } from '@/src/components/Footer';
import { MobileStickyBar } from '@/src/components/MobileStickyBar';
import { OrderModal } from '@/src/components/OrderModal';
import { AssetCustomizerModal } from '@/src/components/AssetCustomizerModal';
import { FloatingWhatsApp } from '@/src/components/FloatingWhatsApp';
import { WaterPackage } from '@/src/types';

export default function App() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WaterPackage | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Custom logo and hero image state loaded from localStorage
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [customHeroUrl, setCustomHeroUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('paniwala_custom_logo');
      const savedHero = localStorage.getItem('paniwala_custom_hero');
      if (savedLogo) setCustomLogoUrl(savedLogo);
      if (savedHero) setCustomHeroUrl(savedHero);
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }, []);

  const handleOpenOrder = (pkg?: WaterPackage) => {
    if (pkg) {
      setSelectedPackage(pkg);
    }
    setIsOrderModalOpen(true);
  };

  const handleCloseOrder = () => {
    setIsOrderModalOpen(false);
  };

  const handleSaveAssets = (logo: string | null, hero: string | null) => {
    setCustomLogoUrl(logo);
    setCustomHeroUrl(hero);
    try {
      if (logo) {
        localStorage.setItem('paniwala_custom_logo', logo);
      } else {
        localStorage.removeItem('paniwala_custom_logo');
      }

      if (hero) {
        localStorage.setItem('paniwala_custom_hero', hero);
      } else {
        localStorage.removeItem('paniwala_custom_hero');
      }
    } catch (e) {
      console.warn('Storage save error', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        customLogoUrl={customLogoUrl}
        onOpenOrder={() => handleOpenOrder()}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with proper Call & Order CTAs */}
        <Hero
          customHeroUrl={customHeroUrl}
          onOpenOrder={() => handleOpenOrder()}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />

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
      <Footer
        customLogoUrl={customLogoUrl}
        onOpenOrder={() => handleOpenOrder()}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Fixed WhatsApp Support Logo (Bottom Right) */}
      <FloatingWhatsApp />

      {/* Mobile-first bottom persistent sticky bar */}
      <MobileStickyBar onOpenOrder={() => handleOpenOrder()} />

      {/* Interactive Quick Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrder}
        selectedPackage={selectedPackage}
      />

      {/* Logo & Hero Image Customizer Modal */}
      <AssetCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        customLogoUrl={customLogoUrl}
        customHeroUrl={customHeroUrl}
        onSaveAssets={handleSaveAssets}
      />
    </div>
  );
}
