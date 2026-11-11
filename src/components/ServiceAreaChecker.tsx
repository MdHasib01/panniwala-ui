import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeader } from '@/src/components/SectionHeader';
import { MapPin, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { HOTLINE_NUMBER, HOTLINE_TEL, toBengaliNumber } from '@/src/data/packages';
import { useLocations } from '@/src/lib/areas-api';
import { groupByZone } from '@/src/lib/location-search';
import { LocationSearch } from '@/src/components/LocationSearch';
import type { Location } from '@/src/lib/models';
import { cn } from '@/src/lib/utils';

export const ServiceAreaChecker: React.FC<{ onOpenOrder: () => void }> = ({ onOpenOrder }) => {
  const { areas, zones } = useLocations();
  const [showAll, setShowAll] = useState(false);
  const [picked, setPicked] = useState<{ location: Location } | null>(null);
  const groups = useMemo(() => groupByZone(areas, zones), [areas, zones]);

  // Zone cards: delivery time and the locations each zone covers (managed from the admin dashboard).
  const zoneCards = useMemo(
    () =>
      zones
        .map((z) => ({
          id: z._id,
          name: z.name,
          time: `${toBengaliNumber(z.minMinutes)}-${toBengaliNumber(z.maxMinutes)} মিনিট`,
          coverage: areas.filter((a) => a.zone === z._id).map((a) => a.name),
        }))
        .filter((z) => z.coverage.length),
    [areas, zones]
  );

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
  }, [updateScrollState, zoneCards.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };

  return (
    <section id="areas" className="pt-6 sm:pt-8 pb-16 sm:pb-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeader
          title="আমরা যেখানে দ্রুততম সেবা পৌঁছে দিই"
          className="mb-4 sm:mb-6"
        />

        {/* Quick Search Tool */}
        <div className="max-w-xl mx-auto mb-14">
          <LocationSearch variant="section" onOpenOrder={onOpenOrder} picked={picked} />

          {/* Every location we deliver to, grouped by zone (managed from the admin dashboard) */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900"
            >
              সব এলাকা দেখুন ({toBengaliNumber(areas.length)}টি)
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAll && 'rotate-180')} />
            </button>
          </div>
          {showAll && (
            <div className="mt-3 space-y-3 animate-in fade-in">
              {groups.map(({ zone, areas: list }) => (
                <div key={zone?._id ?? 'none'}>
                  <p className="mb-1.5 text-center text-[11px] font-bold text-slate-500">{zone?.name ?? 'অন্যান্য এলাকা'}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {list.map((a) => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setPicked({ location: a })}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                      >
                        <MapPin className="w-3 h-3 text-cyan-600" />
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
          {zoneCards.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3 shrink-0 snap-start w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                  {zone.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md shrink-0">
                  <Clock className="w-3 h-3" /> {zone.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                {zone.coverage.join(', ')} ও আশেপাশের এলাকা
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
