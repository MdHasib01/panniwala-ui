import React, { useRef, useState } from 'react';
import { toBengaliNumber } from '@/src/data/packages';
import { usePackages } from '@/src/lib/packages-api';
import { WaterPackage } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { SectionHeader } from '@/src/components/SectionHeader';
import {
  CircleCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PackagesProps {
  onSelectPackage: (pkg: WaterPackage) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const packages = usePackages();
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

  const getTheme = (pkg: WaterPackage) => {
    if (pkg.popular) {
      return {
        card: 'border-sky-200 shadow-lg shadow-sky-500/10 ring-1 ring-sky-300/50',
        panel: 'from-sky-100 via-cyan-50 to-white',
        badge: 'bg-sky-600 text-white',
        button: 'btn-shine [--shine-glow:2_132_199] bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/25',
      };
    }
    if (pkg.bestValue) {
      return {
        card: 'border-emerald-200 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-300/50',
        panel: 'from-emerald-100 via-teal-50 to-white',
        badge: 'bg-emerald-600 text-white',
        button: 'btn-shine [--shine-glow:5_150_105] bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25',
      };
    }
    return {
      card: 'border-slate-200 shadow-sm hover:border-slate-300',
      panel: 'from-slate-100 via-slate-50 to-white',
      badge: 'bg-slate-900 text-white',
      button: 'btn-shine [--shine-glow:15_23_42] bg-slate-900 hover:bg-slate-800 text-white shadow-sm',
    };
  };

  return (
    <section id="packages" className="py-10 sm:py-14 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          eyebrow="পানির প্যাকেজ ও মূল্যতালিকা"
          title="আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন"
          className="mb-3 sm:mb-5"
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
          onScroll={handleScroll}
          className="relative flex md:grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pt-2 pb-4 md:pb-2 md:pt-2 items-stretch max-w-6xl -mx-4 px-4 md:mx-auto md:px-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {packages.map((pkg) => {
            const theme = getTheme(pkg);
            const ribbon = pkg.popular ? '★ সবচেয়ে জনপ্রিয়' : pkg.bestValue ? '⚡ সেরা ভ্যালু' : null;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-3xl bg-white border p-2.5 transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-xl group w-[84%] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink ${theme.card}`}
              >
                {/* Image panel */}
                <div className={`relative rounded-[20px] bg-gradient-to-br ${theme.panel} h-[150px] md:h-[180px] flex items-center justify-center overflow-hidden`}>
                  <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-white/70 blur-2xl pointer-events-none" />
                  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/50 blur-2xl pointer-events-none" />

                  {ribbon && (
                    <span className={`absolute top-3 left-3 z-20 inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${theme.badge}`}>
                      {ribbon}
                    </span>
                  )}

                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="max-h-[120px] md:max-h-[150px] w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105 select-none relative z-10 mt-4"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="px-2.5 pt-4 pb-1.5 flex flex-col flex-1 gap-4">
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
                    className={`mt-auto w-full h-12 rounded-2xl font-bold text-sm transition-all flex items-center justify-between pl-5 pr-1.5 ${theme.button}`}
                  >
                    <span>অর্ডার নিশ্চিত করুন</span>
                    <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
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
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
