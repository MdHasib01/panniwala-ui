import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { MapPin, Search, CheckCircle2, Phone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';

export const ServiceAreaChecker: React.FC<{ onOpenOrder: () => void }> = ({ onOpenOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedArea, setCheckedArea] = useState<string | null>(null);

  const zones = [
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

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setCheckedArea(searchQuery);
  };

  return (
    <section id="areas" className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="cyan" className="px-3 py-1 text-xs">
            সার্ভিস কাভারেজ জোন
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            আমরা যেখানে দ্রুততম সেবা পৌঁছে দিই
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            আমাদের ডেডিকেটেড বাইক ও ভ্যান ডেলিভারি টিম সার্বক্ষণিক প্রস্তুত থাকে যাতে অর্ডার পাওয়ার কিছুক্ষণের মধ্যেই আপনার দরজায় পানি পৌঁছে দেওয়া যায়।
          </p>
        </div>

        {/* Quick Search Tool */}
        <div className="max-w-xl mx-auto mb-14">
          <form onSubmit={handleCheck} className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-300 shadow-md">
            <div className="relative flex-1 flex items-center pl-3">
              <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="আপনার এলাকার নাম লিখুন (যেমন: সোনাডাঙ্গা, বয়রা, খালিশপুর, নিরালা...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs sm:text-sm px-5 rounded-xl shrink-0"
            >
              <Search className="w-4 h-4 mr-1 sm:inline hidden" />
              <span>চেক করুন</span>
            </Button>
          </form>

          {/* Area result alert */}
          {checkedArea && (
            <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  অভিনন্দন! <strong>&quot;{checkedArea}&quot;</strong> এলাকায় আমাদের এক্সপ্রেস ডেলিভারি সচল রয়েছে।
                </span>
              </div>
              <button
                onClick={onOpenOrder}
                className="underline font-bold text-emerald-800 hover:text-emerald-950 shrink-0 ml-2 text-xs"
              >
                এখনই অর্ডার করুন →
              </button>
            </div>
          )}
        </div>

        {/* Zones Scroller */}
        <div className="relative">
          {canScrollLeft && (
            <button
              type="button"
              aria-label="আগের জোন"
              onClick={() => scrollByCard(-1)}
              className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              aria-label="পরের জোন"
              onClick={() => scrollByCard(1)}
              className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollerRef}
            onScroll={updateScrollState}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3 shrink-0 snap-start w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  {zone.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md">
                  <Clock className="w-3 h-3" /> {zone.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {zone.coverage}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold">● সক্রিয় ডেলিভারি হাব</span>
                <span>ফ্রি হোম ডেলিভারি</span>
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            আপনার এলাকা তালিকায় খুঁজে না পেলে আমাদের কাস্টমার কেয়ারে কল দিন:{' '}
            <a href={`tel:${HOTLINE_TEL}`} className="font-bold text-cyan-700 underline">
              {HOTLINE_NUMBER}
            </a>
          </p>
        </div>

      </div>
    </section>
  );
};
