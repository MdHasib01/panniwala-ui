import React from 'react';
import { Reveal, RevealItem } from '@/src/components/motion/Reveal';
import { CountUp } from '@/src/components/motion/CountUp';
import { CheckCircle2 } from 'lucide-react';

const STATS = [
  { to: 25000, suffix: '+', label: 'সফল জার ডেলিভারি', desc: 'খুলনা সিটির বিভিন্ন এলাকায়' },
  { to: 12500, suffix: '+', label: 'নিয়মিত গ্রাহক পরিবার', desc: 'বাসা ও অফিসের বিশ্বস্ত পছন্দ' },
  { to: 35, suffix: ' মিনিট', label: 'গড় ডেলিভারি সময়', desc: 'জরুরি প্রয়োজনে দ্রুততম সেবা' },
  { to: 100, suffix: '%', label: 'BSTI অনুমোদিত মান', desc: 'প্রতি ব্যাচ ল্যাব দ্বারা পরীক্ষিত' },
];

const PROMISES = [
  'BSTI অনুমোদিত বিশুদ্ধতার মান',
  '১ ঘণ্টায় ফ্রি হোম ডেলিভারি',
  'TDS ও pH সার্বক্ষণিক টেস্টেড',
  'ক্যাশ অন ডেলিভারি ও বিকাশ',
];

export const QuickStats: React.FC = () => {
  return (
    // Ground continues the hero's water and settles into the page canvas.
    <section aria-label="এক নজরে পানি ওয়ালা" className="relative bg-[linear-gradient(to_bottom,#cfeaf6,#e7f4fa_45%,#f5fafc)] pt-10 pb-16 sm:pt-14 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal as="ul" className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:divide-x divide-accent/15">
          {STATS.map((s) => (
            <RevealItem as="li" key={s.label} className="px-2 sm:px-6 first:pl-0">
              <CountUp
                to={s.to}
                suffix={s.suffix}
                className="block font-display text-[2.1rem] sm:text-5xl font-bold tracking-[-0.02em] text-ink leading-none"
              />
              <span className="mt-3 block text-sm sm:text-base font-bold text-ink">{s.label}</span>
              <span className="mt-0.5 block text-xs sm:text-sm text-ink-soft">{s.desc}</span>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal as="ul" className="mt-12 sm:mt-14 flex flex-wrap gap-2.5" stagger={0.05} delay={0.15}>
          {PROMISES.map((text) => (
            <RevealItem
              as="li"
              key={text}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-surface/80 ring-1 ring-hairline text-xs sm:text-sm font-medium text-ink"
            >
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              {text}
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
