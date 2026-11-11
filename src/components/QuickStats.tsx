'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Truck, Users, ShieldCheck, Clock } from 'lucide-react';

const numberFormat = new Intl.NumberFormat('bn-BD');
const COUNT_DURATION = 3200;
const COUNT_STAGGER = 140;

const stats = [
  {
    icon: Truck,
    value: 25000,
    suffix: '+',
    label: 'সফল জার ডেলিভারি',
    desc: 'খুলনা সিটির বিভিন্ন এলাকায়',
  },
  {
    icon: Users,
    value: 12500,
    suffix: '+',
    label: 'নিয়মিত গ্রাহক পরিবার',
    desc: 'বাসা ও অফিসের বিশ্বস্ত পছন্দ',
  },
  {
    icon: Clock,
    value: 35,
    suffix: ' মিনিট',
    label: 'গড় ডেলিভারি সময়',
    desc: 'জরুরি প্রয়োজনে দ্রুততম সেবা',
  },
  {
    icon: ShieldCheck,
    value: 100,
    suffix: '% বিশুদ্ধ',
    label: 'নিরাপদ ও বিশ্বস্ত সরবরাহ',
    desc: 'প্রতি ব্যাচ ল্যাব দ্বারা পরীক্ষিত',
  },
];

const TOTAL_DURATION = COUNT_DURATION + COUNT_STAGGER * (stats.length - 1);

export const QuickStats: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [elapsed, setElapsed] = useState(TOTAL_DURATION);

  useEffect(() => {
    const section = sectionRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!section || reducedMotion.matches || !('IntersectionObserver' in window)) return;

    let frame = 0;
    setElapsed(0);

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const startedAt = performance.now();

      const animate = (now: number) => {
        const time = Math.min(now - startedAt, TOTAL_DURATION);
        setElapsed(time);
        if (time < TOTAL_DURATION) frame = requestAnimationFrame(animate);
      };

      frame = requestAnimationFrame(animate);
    }, { threshold: 0.25 });

    const finish = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      cancelAnimationFrame(frame);
      setElapsed(TOTAL_DURATION);
    };

    observer.observe(section);
    reducedMotion.addEventListener('change', finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener('change', finish);
    };
  }, []);
  return (
    <section ref={sectionRef} className="py-10 bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const progress = Math.min(Math.max((elapsed - idx * COUNT_STAGGER) / COUNT_DURATION, 0), 1);
            const easedProgress = (1 - Math.cos(Math.PI * progress)) / 2;
            return (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 p-3 rounded-2xl transition-all hover:bg-slate-50"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-1">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  <span aria-hidden="true">{numberFormat.format(Math.round(stat.value * easedProgress))}{stat.suffix}</span>
                  <span className="sr-only">{numberFormat.format(stat.value)}{stat.suffix}</span>
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
