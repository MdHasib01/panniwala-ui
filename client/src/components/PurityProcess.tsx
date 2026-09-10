import React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Microscope,
  Sparkles,
  FlaskConical,
  Award,
  Filter
} from 'lucide-react';

export const PurityProcess: React.FC = () => {
  const steps = [
    {
      num: '১',
      title: 'মাইক্রন সেডিমেন্ট ফিল্টার',
      desc: 'পানিতে থাকা দৃশ্যমান সূক্ষ্ম বালুকণা, ধূলিকণা ও অন্যান্য ভাসমান পদার্থ সম্পূর্ণ দূর করে।',
      icon: Filter,
    },
    {
      num: '২',
      title: 'অ্যাক্টিভেটেড কার্বন ফিল্টার',
      desc: 'পানির স্বাভাবিক স্বাদ অক্ষুণ্ণ রেখে অপ্রীতিকর গন্ধ, অতিরিক্ত ক্লোরিন ও কীটনাশক অপসারণ করে।',
      icon: Droplets,
    },
    {
      num: '৩',
      title: 'রিভার্স অসমোসিস (RO) মেমব্রেন',
      desc: '০.০০০১ মাইক্রন মেমব্রেনের মাধ্যমে ক্ষতিকর ভারী ধাতু যেমন আর্সেনিক, সীসা ও লবণ দূর করে।',
      icon: Microscope,
    },
    {
      num: '৪',
      title: 'আল্ট্রাভায়োলেট (UV) স্টেরিলাইজার',
      desc: 'উচ্চ ক্ষমতার UV রশ্মির মাধ্যমে পানিতে থাকা ক্ষতিকর ব্যাকটেরিয়া ও ভাইরাসের ডিএনএ ধ্বংস করে।',
      icon: Sparkles,
    },
    {
      num: '৫',
      title: 'ওজোনাইজেশন (Ozonation)',
      desc: 'অক্সিজেন প্রযুক্তির সাহায্যে পানিকে দীর্ঘদিন প্রাকৃতিকভাবে সতেজ ও জীবাণুমুক্ত রাখে।',
      icon: ShieldCheck,
    },
    {
      num: '৬',
      title: 'ন্যাচারাল মিনারেল রি-অ্যাডিং',
      desc: 'মানবদেহের জন্য উপকারী ক্যালসিয়াম ও ম্যাগনেসিয়াম খনিজ সঠিক মাত্রায় নিশ্চিত করা হয়।',
      icon: FlaskConical,
    },
    {
      num: '৭',
      title: 'অটোমেটেড জার স্যানিটাইজিং',
      desc: '৭০ ডিগ্রি তাপে স্বয়ংক্রিয় জেট ওয়াশারে প্রতিটি জার পরিষ্কার করে এয়ার-টাইট সিল করা হয়।',
      icon: Award,
    },
  ];

  return (
    <section id="purity" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="cyan" className="px-3 py-1 text-xs">
            কোয়ালিটি ও বিশুদ্ধতার নিশ্চয়তা
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            আমাদের ৭ স্তরের আধুনিক পরিশোধন প্রযুক্তি
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            প্রতিটি ফোঁটা পানি যাতে আপনার পরিবারের সুস্বাস্থ্য নিশ্চিত করে, সেজন্য আমরা বিশ্বমানের ওয়াটার ট্রিটমেন্ট প্রটোকল অনুসরণ করি।
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-cyan-400 transition-all hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 font-mono">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}

          {/* Quality summary card */}
          <div className="bg-gradient-to-br from-cyan-600 to-sky-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg shadow-cyan-900/10">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                ল্যাবরেটরি টেস্টেড ও BSTI অনুমোদিত
              </h3>
              <p className="text-xs text-cyan-100 leading-relaxed">
                প্রতিদিন ডেলিভারির পূর্বে আমাদের ইন-হাউজ ল্যাবে পানির TDS, pH ও মাইক্রোবায়োলজি টেস্ট সম্পন্ন করা হয়।
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
              <span>স্ট্যান্ডার্ড BDS-1414</span>
              <span className="bg-white text-cyan-900 px-2 py-0.5 rounded-md text-[10px]">
                PASS
              </span>
            </div>
          </div>
        </div>

        {/* Lab Metrics Strip */}
        <div className="mt-12 bg-slate-50/80 rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 text-center">
            🔬 পানি ওয়ালা ল্যাব টেস্ট প্যারামিটার রিপোর্ট
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">TDS (টোটাল ডিসলভড সলিডস)</span>
              <p className="text-lg font-bold text-cyan-700 mt-1">৩০ - ৪৫ ppm</p>
              <span className="text-[10px] text-emerald-600 font-semibold">আদর্শ স্বাদ ও মান</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">pH ব্যালেন্স</span>
              <p className="text-lg font-bold text-cyan-700 mt-1">৭.২ - ৭.৫</p>
              <span className="text-[10px] text-emerald-600 font-semibold">নিরপেক্ষ ক্ষারহীন</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">কলিফর্ম ও ই-কোলাই</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">০ (শূন্য)</p>
              <span className="text-[10px] text-emerald-600 font-semibold">১০০% ব্যাকটেরিয়ামুক্ত</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">ক্লোরিন ও আর্সেনিক</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">০.০০ mg/L</p>
              <span className="text-[10px] text-emerald-600 font-semibold">সম্পূর্ণ নিরাপদ</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
