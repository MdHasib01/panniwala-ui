import React, { useRef, useState } from 'react';
import { WATER_PACKAGES, toBengaliNumber } from '@/src/data/packages';
import { WaterPackage } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Check,
  Building2,
  CalendarCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PackagesProps {
  onSelectPackage: (pkg: WaterPackage) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const scrollToCard = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    });
  };

  const getCardBorderClass = (pkg: WaterPackage) => {
    if (pkg.popular) {
      return 'border-2 border-sky-400 ring-4 ring-sky-100/50 shadow-md bg-white';
    }
    if (pkg.bestValue) {
      return 'border-2 border-emerald-500 ring-4 ring-emerald-100/50 shadow-md bg-white';
    }
    return 'border-2 border-slate-200/90 hover:border-slate-300 shadow-sm bg-white';
  };

  const getButtonClass = (pkg: WaterPackage) => {
    if (pkg.popular) {
      return 'bg-[#0284c7] hover:bg-sky-600 text-white shadow-md shadow-sky-500/25';
    }
    if (pkg.bestValue) {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25';
    }
    return 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-sm';
  };

  return (
    <section id="packages" className="py-16 sm:py-24 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <Badge variant="cyan" className="px-3 py-1 text-xs font-semibold">
            পানির প্যাকেজ ও মূল্যতালিকা
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            বাসা-বাড়ি, অফিস বা বাণিজ্যিক প্রতিষ্ঠানের জন্য সাশ্রয়ী মূল্যে ১০০% বিশুদ্ধ পানি। কোনো লুকানো চার্জ নেই, সম্পূর্ণ ফ্রি হোম ডেলিভারি!
          </p>
        </div>

        {/* Packages Grid */}
        {/* Mobile: horizontal snap carousel · md+: 3-column grid */}
        <div className="relative">
        {activeIndex > 0 && (
          <button
            type="button"
            aria-label="আগের প্যাকেজ"
            onClick={() => scrollToCard(activeIndex - 1)}
            className="md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 active:bg-sky-50 active:text-sky-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {activeIndex < WATER_PACKAGES.length - 1 && (
          <button
            type="button"
            aria-label="পরের প্যাকেজ"
            onClick={() => scrollToCard(activeIndex + 1)}
            className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 active:bg-sky-50 active:text-sky-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="relative flex md:grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pt-5 pb-4 md:pb-0 md:pt-3 items-stretch max-w-6xl -mx-4 px-4 md:mx-auto md:px-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {WATER_PACKAGES.map((pkg) => {
            const isPopular = pkg.popular;
            const isBestValue = pkg.bestValue;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-[26px] transition-all duration-300 md:hover:shadow-2xl md:hover:-translate-y-1.5 group w-[84%] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink ${getCardBorderClass(pkg)}`}
              >
                {/* Popular / Best Value Ribbon */}
                {isPopular && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center z-30 pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-[#0284c7] text-white text-[11px] sm:text-xs font-bold px-3.5 py-1 rounded-full shadow-md shadow-sky-500/30 border border-white/90 tracking-wide">
                      ★ সবচেয়ে জনপ্রিয়
                    </span>
                  </div>
                )}
                {isBestValue && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center z-30 pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] sm:text-xs font-bold px-3.5 py-1 rounded-full shadow-md shadow-emerald-600/30 border border-white/90 tracking-wide">
                      ⚡ সেরা ভ্যালু প্যাক
                    </span>
                  </div>
                )}

                {/* Top Half: Product Image Area */}
                <div className="relative pt-5 md:pt-6 px-4 flex items-center justify-center h-[100px] md:h-[140px] bg-gradient-to-b from-sky-50/40 via-cyan-50/20 to-transparent rounded-t-[24px] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(14,165,233,0.08),transparent)] pointer-events-none" />
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="max-h-[85px] md:max-h-[125px] w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 select-none relative z-10"
                    loading="lazy"
                  />
                </div>

                {/* Bottom Half: Details & Ordering */}
                <div className="p-4 pt-2 flex flex-col flex-1 justify-between gap-3">

                  {/* Upper details */}
                  <div className="space-y-2">
                    {/* Title and Price */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {pkg.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-sans">
                          ৳{toBengaliNumber(pkg.price)}
                        </span>
                        {pkg.regularPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            ৳{toBengaliNumber(pkg.regularPrice)}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">
                          / {pkg.unit}
                        </span>
                      </div>
                    </div>

                    {/* Features List (3 points) */}
                    <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      {pkg.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Button */}
                  <div>
                    <Button
                      id={`order-package-${pkg.id}`}
                      onClick={() => onSelectPackage(pkg)}
                      className={`w-full font-bold text-sm h-10 md:h-11 rounded-xl transition-all flex items-center justify-center gap-1.5 ${getButtonClass(pkg)}`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>অর্ডার নিশ্চিত করুন</span>
                    </Button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Mobile carousel indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-2">
          {WATER_PACKAGES.map((pkg, i) => (
            <button
              key={pkg.id}
              type="button"
              aria-label={`প্যাকেজ ${toBengaliNumber(i + 1)}`}
              onClick={() => scrollToCard(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Corporate Note banner */}
        <div className="mt-8 md:mt-12p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                কর্পোরেট অফিস, ফ্যাক্টরি বা ইভেন্টের জন্য বিশেষ বাল্ক রেট প্রয়োজন?
              </h4>
              <p className="text-xs text-slate-500">
                আমাদের প্রতিনিধি সরাসরি আপনার অফিসে গিয়ে ফ্রি ট্রায়াল ও ডিসপেনসার সেটআপ করে দেবেন।
              </p>
            </div>
          </div>
          <a
            href="tel:+8801700123456"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
          >
            <span>কর্পোরেট হটলাইনে কল দিন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
