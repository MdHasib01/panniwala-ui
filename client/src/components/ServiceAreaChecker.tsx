import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Reveal, RevealItem } from '@/src/components/motion/Reveal';
import { MapPin, Search, CheckCircle2, Clock } from 'lucide-react';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { boldNumbers } from '@/src/lib/utils';
import { EASE_OUT, useReduced } from '@/src/lib/motion';

const ZONES = [
  {
    name: 'সোনাডাঙ্গা ও বয়রা জোন',
    coverage: 'সোনাডাঙ্গা আবাসিক (১ম ও ২য় ফেজ), বয়রা, মুজগুন্নি, বৈকালী, রায়েরমহল ও আশেপাশের এলাকা',
    time: '২৫-৩৫ মিনিট',
  },
  {
    name: 'খালিশপুর ও দৌলতপুর জোন',
    coverage: 'খালিশপুর হাউজিং এস্টেট, বিআইডিসি রোড, দৌলতপুর বাজার, ফুলবাড়ীগেট, কুয়েট ও তেলিগাতী',
    time: '৩০-৪০ মিনিট',
  },
  {
    name: 'সদর ও রূপসা জোন',
    coverage: 'শিববাড়ি মোড়, কেডিএ এভিনিউ, নিরালা আ/এ, ময়লাপোতা, রয়্যাল মোড়, ডাকবাংলা, পিকচার প্যালেস, রূপসা ঘাট',
    time: '২৫-৩৫ মিনিট',
  },
];

const ZoneBody: React.FC<{ zone: (typeof ZONES)[number]; large?: boolean }> = ({ zone, large }) => (
  <>
    <div className="flex items-start justify-between gap-3">
      <h3 className={`font-display font-bold text-ink flex items-center gap-2 ${large ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
        <MapPin className={`${large ? 'w-6 h-6' : 'w-4 h-4'} text-accent shrink-0`} />
        {zone.name}
      </h3>
      <span className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent-wash px-2.5 py-1 rounded-lg shrink-0 tabular">
        <Clock className="w-3.5 h-3.5" /> {zone.time}
      </span>
    </div>
    <p className={`text-ink-soft leading-relaxed ${large ? 'text-sm sm:text-base max-w-lg' : 'text-xs sm:text-sm'}`}>
      {boldNumbers(zone.coverage, 'font-bold text-ink')}
    </p>
    <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink-soft">
      <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" /> সক্রিয় ডেলিভারি হাব
      </span>
      <span>ফ্রি হোম ডেলিভারি</span>
    </div>
  </>
);

export const ServiceAreaChecker: React.FC<{ onOpenOrder: () => void }> = ({ onOpenOrder }) => {
  const reduced = useReduced();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedArea, setCheckedArea] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setCheckedArea(searchQuery.trim());
  };

  const [main, ...rest] = ZONES;

  return (
    <section id="areas" aria-labelledby="areas-title" className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-14">
        {/* Copy and the checker */}
        <Reveal className="lg:col-span-5 space-y-6 lg:pt-6">
          <RevealItem>
            <h2 id="areas-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-ink leading-[1.1]">
              আপনার এলাকায় আমরা আছি
            </h2>
          </RevealItem>
          <RevealItem as="p" className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-md">
            ডেডিকেটেড বাইক ও ভ্যান ডেলিভারি টিম সার্বক্ষণিক প্রস্তুত, যাতে অর্ডারের কিছুক্ষণের মধ্যেই আপনার দরজায় পানি পৌঁছে যায়।
          </RevealItem>

          <RevealItem>
            <form
              onSubmit={handleCheck}
              className="flex gap-2 p-1.5 bg-canvas rounded-2xl ring-1 ring-hairline focus-within:ring-2 focus-within:ring-accent transition-shadow duration-150"
            >
              <label className="relative flex-1 flex items-center pl-3 min-w-0">
                <span className="sr-only">আপনার এলাকার নাম</span>
                <MapPin className="w-5 h-5 text-accent shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="এলাকার নাম লিখুন (যেমন: সোনাডাঙ্গা, বয়রা)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
                />
              </label>
              <Button type="submit" className="bg-accent hover:bg-accent-deep text-accent-ink font-semibold px-5 shrink-0">
                <Search className="w-4 h-4" />
                <span>চেক করুন</span>
              </Button>
            </form>
          </RevealItem>

          <AnimatePresence mode="wait">
            {checkedArea && (
              <motion.div
                key={checkedArea}
                role="status"
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="p-4 bg-accent-wash rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-ink"
              >
                <span className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span>
                    <strong>&quot;{checkedArea}&quot;</strong> এলাকায় আমাদের এক্সপ্রেস ডেলিভারি সচল রয়েছে।
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onOpenOrder}
                  className="shrink-0 h-10 px-4 rounded-xl bg-accent hover:bg-accent-deep text-accent-ink text-sm font-bold transition-colors duration-150 active:scale-[0.98]"
                >
                  অর্ডার করুন
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <RevealItem as="p" className="text-xs sm:text-sm text-ink-soft">
            তালিকায় এলাকা খুঁজে না পেলে কল দিন:{' '}
            <a href={`tel:${HOTLINE_TEL}`} className="font-bold text-accent underline underline-offset-4 decoration-accent/40 tabular">
              {HOTLINE_NUMBER}
            </a>
          </RevealItem>
        </Reveal>

        {/* Zones: one large plate wiped in, two smaller ones beneath */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
          <motion.div
            className="sm:col-span-2 relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#e4f3fa,#f5fafc)] ring-1 ring-hairline p-6 sm:p-8 space-y-4 min-h-[260px] flex flex-col justify-end"
            initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0% round 28px)' }}
            whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: reduced ? 0.4 : 1, ease: EASE_OUT }}
          >
            {/* Delivery radius rings around the hub */}
            <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute -top-24 -right-24 w-[420px] h-[420px] opacity-70">
              {[60, 110, 160, 200].map((r) => (
                <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#0873b1" strokeOpacity={0.12} strokeDasharray="4 6" />
              ))}
              <circle cx="200" cy="200" r="8" fill="#0873b1" />
              <circle cx="200" cy="200" r="16" fill="#0873b1" fillOpacity={0.15} />
            </svg>
            <div className="relative space-y-4">
              <ZoneBody zone={main} large />
            </div>
          </motion.div>

          <Reveal className="sm:col-span-2 grid sm:grid-cols-2 gap-5" stagger={0.08} delay={0.3}>
            {rest.map((zone) => (
              <RevealItem key={zone.name} className="rounded-[24px] bg-surface ring-1 ring-hairline shadow-e1 p-5 sm:p-6 space-y-3">
                <ZoneBody zone={zone} />
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};
