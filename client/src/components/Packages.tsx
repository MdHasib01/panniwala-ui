import React from 'react';
import { WATER_PACKAGES, toBengaliNumber, HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { WaterPackage } from '@/src/types';
import { boldNumbers } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Check,
  Droplets,
  Zap,
  Sparkles,
  Building2,
  CalendarCheck,
  ArrowRight,
  Phone
} from 'lucide-react';

interface PackagesProps {
  onSelectPackage: (pkg: WaterPackage) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'building':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Droplets className="w-4 h-4 text-cyan-600 fill-cyan-500/30" />;
    }
  };

  const getIconContainerStyle = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return 'bg-amber-50 text-amber-500 border border-amber-200';
      case 'sparkles':
        return 'bg-indigo-50 text-indigo-500 border border-indigo-200';
      case 'building':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      default:
        return 'bg-sky-50 text-sky-600 border border-sky-200';
    }
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
            বাসা-বাড়ি, অফিস বা বাণিজ্যিক প্রতিষ্ঠানের জন্য সাশ্রয়ী মূল্যে <strong className="font-bold text-slate-900">১০০%</strong> বিশুদ্ধ পানি। কোনো লুকানো চার্জ নেই, সম্পূর্ণ ফ্রি হোম ডেলিভারি!
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-3 items-stretch max-w-6xl mx-auto">
          {WATER_PACKAGES.map((pkg) => {
            const isPopular = pkg.popular;
            const isBestValue = pkg.bestValue;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-[26px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 group ${getCardBorderClass(pkg)}`}
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
                <div className="relative pt-7 pb-2 px-4 flex items-center justify-center min-h-[210px] bg-gradient-to-b from-sky-50/40 via-cyan-50/20 to-transparent rounded-t-[24px] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(14,165,233,0.08),transparent)] pointer-events-none" />
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="max-h-[195px] w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 select-none relative z-10"
                    loading="lazy"
                  />
                </div>

                {/* Bottom Half: Details & Ordering */}
                <div className="p-5 pt-3 flex flex-col flex-1 justify-between space-y-4">
                  
                  {/* Upper details */}
                  <div className="space-y-3">
                    {/* Meta Row: Icon + Volume Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getIconContainerStyle(pkg.iconName)}`}>
                        {getIcon(pkg.iconName)}
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        {pkg.volume}
                      </span>
                    </div>

                    {/* Title and Subtitle */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {pkg.subtitle}
                      </p>
                    </div>

                    {/* Price and Free Delivery row */}
                    <div className="pt-1 pb-1">
                      {pkg.isCustomPricing ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 tracking-tight font-sans">
                            কাস্টম
                          </span>
                          {pkg.unit && (
                            <span className="text-xs text-slate-500 font-medium">
                              / {pkg.unit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 tracking-tight font-sans">
                            ৳{toBengaliNumber(pkg.price)}
                          </span>
                          {pkg.regularPrice && (
                            <span className="text-sm font-bold text-slate-400 line-through">
                              ৳{toBengaliNumber(pkg.regularPrice)}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-medium">
                            / {pkg.unit}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                        <span>ফ্রি ডেলিভারি (নির্দিষ্ট এলাকায়)</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{boldNumbers(feat, 'font-bold text-slate-900')}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Amber Deposit Box */}
                    {pkg.depositRequired && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
                        খালি জার বা নতুন জার নিতে হলে <strong className="font-bold text-amber-950">৳১০০</strong> ডিপোজিট/ রিফান্ডেবল জামানত প্রয়োজন (প্রযোজ্য ক্ষেত্রে)।
                      </div>
                    )}
                  </div>

                  {/* Order or Call CTA Button */}
                  <div className="pt-2">
                    {pkg.callOnly ? (
                      <a
                        id={`call-package-${pkg.id}`}
                        href={`tel:${HOTLINE_TEL}`}
                        className="w-full font-bold text-sm h-11 rounded-xl transition-all flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white shadow-sm hover:shadow-md active:scale-[0.99]"
                      >
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <span>কল করুন: <strong className="font-bold">{HOTLINE_NUMBER}</strong></span>
                      </a>
                    ) : (
                      <Button
                        id={`order-package-${pkg.id}`}
                        onClick={() => onSelectPackage(pkg)}
                        className={`w-full font-bold text-sm h-11 rounded-xl transition-all flex items-center justify-center gap-1.5 ${getButtonClass(pkg)}`}
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>অর্ডার নিশ্চিত করুন</span>
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Note banner */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
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
