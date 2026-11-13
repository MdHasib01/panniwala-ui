import React from 'react';
import { useCarousel } from '@/src/lib/use-carousel';
import { toBengaliNumber } from '@/src/data/packages';
import { usePackages } from '@/src/lib/packages-api';
import { WaterPackage } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { SectionHeader } from '@/src/components/SectionHeader';
import {
  CircleCheck,
  Star,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PackagesProps {
  onSelectPackage: (pkg: WaterPackage) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const packages = usePackages();
  const { scrollerRef, activeIndex, scrollToCard } = useCarousel(packages.length, 'center');

  const theme = {
    card: 'border-sky-200 shadow-sm',
    panel: 'from-sky-100 via-cyan-50 to-white',
    badge: 'bg-sky-600 text-white shadow-sky-600/30',
  };

  return (
    <section id="packages" className="pt-6 sm:pt-8 pb-10 sm:pb-14 bg-slate-50/70 relative isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          title="আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন"
          className="mb-2 sm:mb-3"
        />

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
        {activeIndex < packages.length - 1 && (
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
          className="relative flex md:grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pt-5 pb-4 md:pb-2 md:pt-5 items-stretch max-w-6xl -mx-4 px-4 md:mx-auto md:px-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {packages.map((pkg) => {
            const ribbon = pkg.popular
              ? { icon: Star, label: 'সবচেয়ে জনপ্রিয়' }
              : pkg.bestValue
                ? { icon: Zap, label: 'সেরা ভ্যালু' }
                : null;
            const RibbonIcon = ribbon?.icon;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-3xl bg-white border w-[84%] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink ${theme.card}`}
              >
                {/* Badge — on the card's top edge, aligned left */}
                {ribbon && RibbonIcon && (
                  <div className="absolute inset-x-0 -top-3 z-30 flex justify-start pl-5 pointer-events-none">
                    <span className={`inline-flex items-center gap-1.5 h-6 whitespace-nowrap text-[11px] font-semibold tracking-wide px-3 rounded-full shadow-sm ${theme.badge}`}>
                      <RibbonIcon className="w-3 h-3" strokeWidth={2.5} fill="currentColor" />
                      {ribbon.label}
                    </span>
                  </div>
                )}

                {/* Image panel */}
                <div className={`relative rounded-t-[23px] bg-gradient-to-br ${theme.panel} h-[190px] md:h-[230px] flex items-center justify-center overflow-hidden`}>
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="max-h-[165px] md:max-h-[205px] w-auto object-contain select-none"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Details */}
                <div className="relative z-10 px-5 pt-4 pb-5 flex flex-col flex-1 gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug [font-family:var(--font-hind-siliguri),'Hind_Siliguri',sans-serif]">
                      {pkg.title}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-3xl font-bold text-slate-900 tracking-tight [font-family:var(--font-hind-siliguri),'Hind_Siliguri',sans-serif]">
                        ৳{toBengaliNumber(pkg.price)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ {pkg.unit}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-[13px] text-slate-600">
                    {pkg.features.slice(0, 3).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <CircleCheck className="w-[18px] h-[18px] shrink-0 text-slate-500" strokeWidth={1.75} />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    id={`order-package-${pkg.id}`}
                    onClick={() => onSelectPackage(pkg)}
                    className="mt-auto w-full h-12 rounded-2xl font-bold text-sm transition-colors flex items-center justify-between pl-5 pr-1.5 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                  >
                    <span>অর্ডার নিশ্চিত করুন</span>
                    <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Mobile carousel indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-2">
          {packages.map((pkg, i) => (
            <button
              key={pkg.id}
              type="button"
              aria-label={`প্যাকেজ ${toBengaliNumber(i + 1)}`}
              onClick={() => scrollToCard(i)}
              className={`h-2 rounded-full ${
                activeIndex === i ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
