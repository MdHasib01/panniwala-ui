import React from 'react';
import { Truck, Users, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export const QuickStats: React.FC = () => {
  const stats = [
    {
      icon: Truck,
      value: '২৫,০০০+',
      label: 'সফল জার ডেলিভারি',
      desc: 'ঢাকা ও চট্টগ্রামের বিভিন্ন এলাকায়',
    },
    {
      icon: Users,
      value: '১২,৫০০+',
      label: 'নিয়মিত গ্রাহক পরিবার',
      desc: 'বাসা ও অফিসের বিশ্বস্ত পছন্দ',
    },
    {
      icon: Clock,
      value: '৩৫ মিনিট',
      label: 'গড় ডেলিভারি সময়',
      desc: 'জরুরি প্রয়োজনে দ্রুততম সেবা',
    },
    {
      icon: ShieldCheck,
      value: '১০০% বিশুদ্ধ',
      label: 'BSTI অনুমোদিত মান',
      desc: 'প্রতি ব্যাচ ল্যাব দ্বারা পরীক্ষিত',
    },
  ];

  return (
    <section className="py-10 bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 p-3 rounded-2xl transition-all hover:bg-slate-50"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-1">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {stat.label}
                </span>
                <span className="text-xs text-slate-500">
                  {stat.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
