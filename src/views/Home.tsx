import React from 'react';
import { Hero } from '@/src/components/Hero';
import { QuickStats } from '@/src/components/QuickStats';
import { Packages } from '@/src/components/Packages';
import { ServiceAreaChecker } from '@/src/components/ServiceAreaChecker';
import { Testimonials } from '@/src/components/Testimonials';
import { Faq } from '@/src/components/Faq';
import { useSite } from '@/src/site/context';

export default function HomePage() {
  const { openOrder } = useSite();
  return (
    <>
      {/* Hero Section with proper Call & Order CTAs */}
      <Hero onOpenOrder={() => openOrder()} />

      {/* Quick Trust Statistics */}
      <QuickStats />

      {/* Packages & Pricing Table */}
      <Packages onSelectPackage={(pkg) => openOrder(pkg)} />

      {/* Delivery Service Area Checker */}
      <ServiceAreaChecker onOpenOrder={() => openOrder()} />

      {/* Customer Reviews & Social Proof */}
      <Testimonials />

      {/* Frequently Asked Questions */}
      <Faq />
    </>
  );
}
