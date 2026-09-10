import React from 'react';
import { Button } from '@/src/components/ui/button';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import heroImage from '@/src/assets/hero-image.png';
import {
  Phone,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Truck,
} from 'lucide-react';

interface HeroProps {
  customHeroUrl?: string | null;
  onOpenOrder: () => void;
  onOpenCustomizer?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  customHeroUrl,
  onOpenOrder,
  onOpenCustomizer,
}) => {
  const heroSrc = customHeroUrl || heroImage;

  return (
    <section className="relative overflow-hidden pt-6 pb-14 lg:py-20 bg-gradient-to-b from-cyan-50/60 via-sky-50/30 to-white">
      {/* Background soft ambient water waves */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.18),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text & Primary CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-cyan-200/80 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-900">
                ঢাকা ও চট্টগ্রামের বিশ্বস্ত বিশুদ্ধ পানির সরবরাহকারী
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.2] tracking-tight">
              বাসা ও অফিসের জন্য{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700">
                ১০০% বিশুদ্ধ ও নিরাপদ
              </span>{' '}
              খাবার পানি
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              <strong className="text-slate-800 font-semibold">পানি ওয়ালা</strong> নিয়ে এসেছে ৭ স্তরের রিভার্স অসমোসিস (RO) ও আল্ট্রাভায়োলেট (UV) ফিল্টারকৃত ল্যাব-পরীক্ষিত মিনারেল পানি। লিফট ছাড়া ৪/৫ তলায়ও হাসিমুখে ফ্রি হোম ডেলিভারি!
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto lg:mx-0 text-left pt-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>BSTI অনুমোদিত বিশুদ্ধতার মান</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১ ঘণ্টার দ্রুত ফ্রি হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>TDS ও pH সার্বক্ষণিক টেস্টেড</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি ও বিকাশ</span>
              </div>
            </div>

            {/* Primary CTAs with mobile-first tap sizes */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5">
              {/* Order CTA */}
              <Button
                id="hero-order-cta"
                size="lg"
                onClick={onOpenOrder}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-base shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/40 px-8 py-3.5 rounded-xl transition-all"
              >
                <ShoppingBag className="w-5 h-5 mr-1" />
                <span>অনলাইনে অর্ডার করুন — মাত্র ৳৮০</span>
              </Button>

              {/* Direct Call CTA */}
              <a
                id="hero-call-cta"
                href={`tel:${HOTLINE_TEL}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-300 hover:border-cyan-600 bg-white text-slate-800 hover:text-cyan-700 font-bold text-sm shadow-xs transition-all"
              >
                <Phone className="w-4 h-4 text-cyan-600" />
                <span>কল করুন: {HOTLINE_NUMBER}</span>
              </a>

            </div>

            {/* Live Trust Notice */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-cyan-600" />
                <span>আজকের ডেলিভারি চালু আছে</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>১০০% রিফান্ড গ্যারান্টি</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase without square border */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Ambient Water Aura Glow */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-cyan-400/25 via-sky-300/20 to-blue-500/15 rounded-full blur-3xl -z-10 scale-95 pointer-events-none" />

            {/* Hero Image Container - Seamless floating display without any square border */}
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg flex items-center justify-center py-4">
              
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

