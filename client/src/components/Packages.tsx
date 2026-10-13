import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import { WATER_PACKAGES, toBengaliNumber, HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { WaterPackage } from '@/src/types';
import { boldNumbers } from '@/src/lib/utils';
import { useScrollProgress, useIsDesktop, useReduced } from '@/src/lib/motion';
import { Button } from '@/src/components/ui/button';
import { Check, Droplets, Zap, Sparkles, Building2, CalendarCheck, ArrowRight, Phone, Star, BadgePercent } from 'lucide-react';

interface PackagesProps {
  onSelectPackage: (pkg: WaterPackage) => void;
}

/** Below this much horizontal overflow a pinned rail would hold a still screen, so it scrolls natively instead. */
const MIN_TRAVEL = 140;

const ICONS = { zap: Zap, sparkles: Sparkles, building: Building2, droplets: Droplets } as const;

const SectionHeading: React.FC = () => (
  <div>
    <h2 id="packages-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-ink leading-[1.1]">
      আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন
    </h2>
    <p className="mt-4 text-sm sm:text-base text-ink-soft leading-relaxed max-w-md">
      বাসা-বাড়ি, অফিস বা বাণিজ্যিক প্রতিষ্ঠানের জন্য সাশ্রয়ী মূল্যে <strong className="font-bold text-ink">১০০%</strong> বিশুদ্ধ
      পানি। কোনো লুকানো চার্জ নেই, সম্পূর্ণ ফ্রি হোম ডেলিভারি।
    </p>
  </div>
);

const CorporateNote: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`rounded-[28px] bg-ink text-white p-6 sm:p-7 flex flex-col justify-between gap-6 ${className ?? ''}`}>
    <div className="space-y-3">
      <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
        <Building2 className="w-5 h-5" />
      </span>
      <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug">
        কর্পোরেট অফিস, ফ্যাক্টরি বা ইভেন্টের জন্য বাল্ক রেট?
      </h3>
      <p className="text-sm text-white/75 leading-relaxed">
        আমাদের প্রতিনিধি সরাসরি আপনার অফিসে গিয়ে ফ্রি ট্রায়াল ও ডিসপেনসার সেটআপ করে দেবেন।
      </p>
    </div>
    <a
      href={`tel:${HOTLINE_TEL}`}
      className="inline-flex items-center justify-between gap-2 h-12 px-5 rounded-xl text-sm font-bold text-ink bg-white hover:bg-water transition-colors duration-150 active:scale-[0.98]"
    >
      <span>কর্পোরেট হটলাইনে কল দিন</span>
      <ArrowRight className="w-4 h-4" />
    </a>
  </div>
);

const PackageCard: React.FC<{ pkg: WaterPackage; onSelect: (pkg: WaterPackage) => void }> = ({ pkg, onSelect }) => {
  const Icon = ICONS[pkg.iconName] ?? Droplets;
  const featured = pkg.popular || pkg.bestValue;

  return (
    <article
      className={`group relative h-full flex flex-col rounded-[28px] bg-surface shadow-e2 transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-1 hover:shadow-e3 ${
        featured ? 'ring-2 ring-accent' : 'ring-1 ring-hairline'
      }`}
    >
      {(pkg.popular || pkg.bestValue) && (
        <span
          className={`absolute -top-3.5 left-6 z-10 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shadow-e1 ${
            pkg.popular ? 'bg-accent text-accent-ink' : 'bg-ink text-white'
          }`}
        >
          {pkg.popular ? <Star className="w-3.5 h-3.5 fill-current" /> : <BadgePercent className="w-3.5 h-3.5" />}
          {pkg.popular ? 'সবচেয়ে জনপ্রিয়' : 'সেরা ভ্যালু প্যাক'}
        </span>
      )}

      {/* Product */}
      <div className="relative m-2 mb-0 rounded-[22px] bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,#d6eef8,#eef7fb_70%)] flex items-center justify-center h-[176px] overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          loading="lazy"
          draggable={false}
          className="max-h-[160px] w-auto object-contain select-none transition-transform duration-300 ease-out-soft group-hover:scale-[1.04]"
        />
      </div>

      <div className="p-5 pt-4 flex flex-col flex-1 gap-4">
        <div className="flex items-center justify-between">
          <span className="w-9 h-9 rounded-xl bg-accent-wash text-accent flex items-center justify-center">
            <Icon className="w-4.5 h-4.5" />
          </span>
          <span className="text-xs font-bold px-3 py-1 bg-canvas ring-1 ring-hairline text-ink rounded-lg">{pkg.volume}</span>
        </div>

        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-ink leading-snug">{pkg.title}</h3>
          <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{pkg.subtitle}</p>
        </div>

        <div>
          {pkg.isCustomPricing ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-ink tracking-tight">কাস্টম</span>
              {pkg.unit && <span className="text-xs text-ink-soft font-medium">/ {pkg.unit}</span>}
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[2rem] font-bold text-ink tracking-tight tabular leading-none">
                ৳{toBengaliNumber(pkg.price)}
              </span>
              {pkg.regularPrice && (
                <span className="text-sm font-semibold text-ink-soft line-through tabular">৳{toBengaliNumber(pkg.regularPrice)}</span>
              )}
              <span className="text-xs text-ink-soft font-medium">/ {pkg.unit}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent mt-1.5">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>ফ্রি ডেলিভারি (নির্দিষ্ট এলাকায়)</span>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-ink-soft pt-3 border-t border-hairline">
          {pkg.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <span className="leading-snug">{boldNumbers(feat, 'font-bold text-ink')}</span>
            </li>
          ))}
        </ul>

        {pkg.depositRequired && (
          <p className="p-2.5 rounded-xl bg-accent-wash text-[11px] text-ink leading-snug">
            খালি জার বা নতুন জার নিতে হলে <strong className="font-bold">৳১০০</strong> রিফান্ডেবল জামানত প্রয়োজন (প্রযোজ্য ক্ষেত্রে)।
          </p>
        )}

        <div className="mt-auto pt-1">
          {pkg.callOnly ? (
            <a
              id={`call-package-${pkg.id}`}
              href={`tel:${HOTLINE_TEL}`}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-ink hover:bg-accent-deep text-white text-sm font-bold transition-colors duration-150 active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              <span>
                কল করুন <span className="tabular">{HOTLINE_NUMBER}</span>
              </span>
            </a>
          ) : (
            <Button
              id={`order-package-${pkg.id}`}
              onClick={() => onSelect(pkg)}
              className={`w-full h-11 font-bold ${
                featured ? 'bg-accent hover:bg-accent-deep text-accent-ink' : 'bg-ink hover:bg-accent-deep text-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              অর্ডার করুন
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

/** A rail item that settles in (opacity floor 0.55) as the rail carries it into view. */
const RailItem: React.FC<{
  p: MotionValue<number> | null;
  settleAt: number;
  className?: string;
  children: React.ReactNode;
}> = ({ p, settleAt, className, children }) => {
  const fallback = useMotionValue(1);
  const source = p ?? fallback;
  const opacity = useTransform(source, [settleAt - 0.14, settleAt], [0.55, 1]);
  const y = useTransform(source, [settleAt - 0.14, settleAt], [18, 0]);
  const animate = p && settleAt > 0;
  return (
    <motion.div className={`shrink-0 ${className ?? ''}`} style={animate ? { opacity, y } : undefined}>
      {children}
    </motion.div>
  );
};

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const isDesktop = useIsDesktop();
  const reduced = useReduced();
  const railMode = isDesktop && !reduced;

  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [settle, setSettle] = useState<number[]>([]);
  const pinned = railMode && travel > MIN_TRAVEL;

  const scrollYProgress = useScrollProgress({ target: sectionRef, offset: ['start start', 'end end'] });
  const travelMV = useMotionValue(0);
  const x = useTransform(() => -scrollYProgress.get() * travelMV.get());

  // Measure the real overflow (never assume it) and where each item enters view.
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!railMode || !rail) {
      setTravel(0);
      return;
    }
    const measure = () => {
      const vw = window.innerWidth;
      const t = Math.max(0, rail.scrollWidth - vw);
      setTravel(t);
      travelMV.set(t);
      setSettle(
        Array.from(rail.children).map((child) => {
          const left = (child as HTMLElement).offsetLeft;
          return t > 0 ? (left - vw * 0.82) / t : 0;
        })
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [railMode]);

  const p = pinned ? scrollYProgress : null;
  const items = [
    ...(railMode ? [{ key: 'heading', className: 'w-[clamp(320px,28vw,440px)] self-center pr-6', node: <SectionHeading /> }] : []),
    ...WATER_PACKAGES.map((pkg) => ({
      key: pkg.id,
      className: 'w-[82vw] max-w-[360px] lg:w-[clamp(330px,24vw,390px)] lg:max-w-none snap-center',
      node: <PackageCard pkg={pkg} onSelect={onSelectPackage} />,
    })),
    ...(railMode ? [{ key: 'corporate', className: 'w-[clamp(300px,22vw,360px)]', node: <CorporateNote className="h-full" /> }] : []),
  ];

  const rail = (
    <div
      ref={railRef}
      className={`flex items-stretch gap-5 lg:gap-8 pt-5 pb-6 px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] ${
        pinned ? 'w-max' : 'overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      }`}
    >
      {items.map((item, i) => (
        <RailItem key={item.key} p={p} settleAt={settle[i] ?? 0} className={item.className}>
          {item.node}
        </RailItem>
      ))}
    </div>
  );

  return (
    <section
      id="packages"
      ref={sectionRef}
      aria-labelledby="packages-title"
      data-pinned={pinned ? '' : undefined}
      className="relative bg-canvas"
      style={pinned ? { height: `calc(100svh + ${travel}px)` } : undefined}
    >
      {/* One tree for both modes, so the measured rail node survives the switch to pinned */}
      <div className={pinned ? 'sticky top-0 h-svh overflow-hidden flex flex-col justify-center pt-16' : 'py-20 sm:py-28'}>
        {!railMode && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <SectionHeading />
          </div>
        )}
        <motion.div style={pinned ? { x } : undefined}>{rail}</motion.div>
        {!railMode && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <CorporateNote />
          </div>
        )}
      </div>
    </section>
  );
};
