import React from 'react';
import { WATER_PACKAGES } from '@/src/data/packages';
import { WaterPackage } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/card';
import { Check, Droplets, Zap, Sparkles, Building2, ShoppingBag, ArrowRight } from 'lucide-react';

interface PackagesProps {
  onSelectPackage: (pkg: WaterPackage) => void;
}

export const Packages: React.FC<PackagesProps> = ({ onSelectPackage }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Droplets className="w-5 h-5 text-cyan-600" />;
    }
  };

  return (
    <section id="packages" className="py-16 sm:py-24 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <Badge variant="cyan" className="px-3 py-1 text-xs">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {WATER_PACKAGES.map((pkg) => {
            const isPopular = pkg.popular;
            const isBestValue = pkg.bestValue;

            return (
              <Card
                key={pkg.id}
                className={`relative flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  isPopular
                    ? 'border-2 border-cyan-500 ring-4 ring-cyan-100/50 shadow-md bg-white'
                    : isBestValue
                    ? 'border-2 border-emerald-500 ring-4 ring-emerald-100/50 shadow-md bg-white'
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                {/* Popular / Best Value Ribbon */}
                {isPopular && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                    <span className="bg-cyan-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm tracking-wide">
                      ★ সবচেয়ে জনপ্রিয়
                    </span>
                  </div>
                )}
                {isBestValue && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm tracking-wide">
                      ⚡ সেরা ভ্যালু কম্বো
                    </span>
                  </div>
                )}

                <div>
                  <CardHeader className="p-6 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        {getIcon(pkg.iconName)}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        {pkg.volume}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold text-slate-900 pt-2 leading-snug">
                      {pkg.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      {pkg.subtitle}
                    </CardDescription>

                    {/* Price section */}
                    <div className="pt-3 pb-1 border-b border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ৳{pkg.price}
                        </span>
                        {pkg.regularPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            ৳{pkg.regularPrice}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">
                          / {pkg.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        ✓ ফ্রি ডোরস্টেপ ডেলিভারি অন্তর্ভুক্ত
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-2">
                    <ul className="space-y-2.5">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {pkg.depositRequired && (
                      <div className="mt-4 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900">
                        খালি জার না থাকলে প্রথমবার ৳{pkg.depositAmount} সিকিউরিটি ডিপোজিট প্রযোজ্য (ফেরতযোগ্য)।
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="p-6 pt-0">
                  <Button
                    id={`order-package-${pkg.id}`}
                    onClick={() => onSelectPackage(pkg)}
                    className={`w-full font-bold text-sm h-11 rounded-xl transition-all ${
                      isPopular
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20'
                        : isBestValue
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    <span>অর্ডার নির্বাচন করুন</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Note banner */}
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
