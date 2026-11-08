import React from 'react';
import { Button } from '@/src/components/ui/button';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import heroImage from '@/src/assets/hero-image.png';
import { Phone, ShoppingBag } from 'lucide-react';

interface HeroProps {
  onOpenOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOrder }) => {
  const heroSrc = heroImage;

  return (
    <section id="hero" className="relative overflow-hidden pt-6 sm:pt-14 pb-6 sm:pb-14 lg:py-20 bg-gradient-to-b from-cyan-50/60 via-sky-50/30 to-white">
      {/* Background soft ambient water waves */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.18),rgba(255,255,255,0))] pointer-events-none" />

      {/* Subtle grid overlay, faded out toward the edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(8,145,178,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(8,145,178,0.18) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 35%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 35%, #000 40%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text & Primary CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.2] tracking-tight">
              বাসা ও অফিসের জন্য{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700">
                ১০০% বিশুদ্ধ ও নিরাপদ
              </span>{' '}
              খাবার পানি
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              RO ও UV ফিল্টারকৃত ল্যাব-পরীক্ষিত পানি, খুলনা শহরে ফ্রি হোম ডেলিভারি।
            </p>

            {/* Primary CTAs with mobile-first tap sizes */}
            <div className="pt-2 flex flex-row items-stretch justify-center lg:justify-start gap-3">
              {/* Order CTA */}
              <Button
                id="hero-order-cta"
                size="lg"
                onClick={onOpenOrder}
                className="btn-shine flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/40 px-3 sm:px-8 py-3.5 rounded-xl transition-all"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1 shrink-0" />
                <span>অর্ডার করুন — ৳৪০</span>
              </Button>

              {/* Direct Call CTA */}
              <a
                id="hero-call-cta"
                href={`tel:${HOTLINE_TEL}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-6 py-3.5 rounded-xl border-2 border-slate-300 hover:border-cyan-600 bg-white text-slate-800 hover:text-cyan-700 font-bold text-sm shadow-xs transition-all whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>কল করুন<span className="hidden sm:inline">: {HOTLINE_NUMBER}</span></span>
              </a>

            </div>
          </div>

          {/* Right Column: Hero Visual Showcase without square border */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Ambient Water Aura Glow */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-cyan-400/25 via-sky-300/20 to-blue-500/15 rounded-full blur-3xl -z-10 scale-95 pointer-events-none" />

            {/* Hero Image Container - Seamless floating display without any square border */}
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg flex items-center justify-center py-0 sm:py-4">
              
              {/* Main Hero Image from asset */}
              <img
                src={heroSrc}
                alt="পানি ওয়ালা ১০০% বিশুদ্ধ খাবার পানি"
                className="w-full h-auto max-h-[520px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.03] select-none"
              />


            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

