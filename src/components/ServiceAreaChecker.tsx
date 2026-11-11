import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Button } from '@/src/components/ui/button';
import { MapPin, Search, CheckCircle2, Clock, ChevronLeft, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { HOTLINE_NUMBER, HOTLINE_TEL, toBengaliNumber } from '@/src/data/packages';
import { secondaryName, useLocations } from '@/src/lib/areas-api';
import { groupByZone, useLocationSearch } from '@/src/lib/location-search';
import type { Location } from '@/src/lib/models';
import { cn } from '@/src/lib/utils';

export const ServiceAreaChecker: React.FC<{ onOpenOrder: () => void }> = ({ onOpenOrder }) => {
  const { areas, zones } = useLocations();
  const { search, similar } = useLocationSearch(areas, zones);
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  // What the visitor checked: a location they picked, or free text that matched nothing.
  const [checked, setChecked] = useState<{ query: string; location: Location | null } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => (searchQuery.trim() ? search(searchQuery, 6) : []), [search, searchQuery]);
  const showSuggestions = focused && suggestions.length > 0 && checked?.query !== searchQuery;
  const didYouMean = useMemo(
    () => (checked && !checked.location ? similar({ nameEn: checked.query, nameBn: checked.query }, 3) : []),
    [checked, similar]
  );
  const zoneName = useMemo(() => new Map(zones.map((z) => [z._id, z.name])), [zones]);
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

  const choose = (loc: Location) => {
    setSearchQuery(loc.name);
    setChecked({ query: loc.name, location: loc });
    setFocused(false);
  };

  // Close the suggestion list when clicking elsewhere.
  useEffect(() => {
    if (!focused) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [focused]);

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

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // A highlighted suggestion wins; otherwise the best fuzzy match, if any.
    const pick = showSuggestions ? suggestions[active] : search(q, 1)[0];
    if (pick) return choose(pick);
    setChecked({ query: q, location: null });
    setFocused(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  const found = checked?.location;

  return (
    <section id="areas" className="pt-10 sm:pt-14 pb-16 sm:pb-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeader
          eyebrow="সার্ভিস কাভারেজ জোন"
          title="আমরা যেখানে দ্রুততম সেবা পৌঁছে দিই"
          subtitle="আমাদের ডেডিকেটেড বাইক ও ভ্যান ডেলিভারি টিম সার্বক্ষণিক প্রস্তুত থাকে যাতে অর্ডার পাওয়ার কিছুক্ষণের মধ্যেই আপনার দরজায় পানি পৌঁছে দেওয়া যায়।"
          className="mb-12"
        />

        {/* Quick Search Tool */}
        <div className="max-w-xl mx-auto mb-14">
          <div ref={boxRef} className="relative">
            <form onSubmit={handleCheck} className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-300 shadow-md">
              <div className="relative flex-1 flex items-center pl-3">
                <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mr-2" />
                <input
                  type="text"
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-controls="area-suggestions"
                  aria-autocomplete="list"
                  placeholder="আপনার এলাকার নাম লিখুন (যেমন: সোনাডাঙ্গা, Boyra, খালিশপুর, Nirala...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActive(0);
                    setFocused(true);
                  }}
                  onFocus={() => setFocused(true)}
                  onKeyDown={onKeyDown}
                  className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                className="btn-shine bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs sm:text-sm px-5 rounded-xl shrink-0"
              >
                <Search className="w-4 h-4 mr-1 sm:inline hidden" />
                <span>চেক করুন</span>
              </Button>
            </form>

            {/* Live fuzzy suggestions */}
            {showSuggestions && (
              <ul
                id="area-suggestions"
                role="listbox"
                className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
              >
                {suggestions.map((loc, i) => (
                  <li
                    key={loc._id}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(loc)}
                    className={cn('flex cursor-pointer items-center gap-3 px-4 py-2', i === active && 'bg-cyan-50')}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">{loc.name}</span>
                      {secondaryName(loc) && <span className="block text-xs text-slate-500">{secondaryName(loc)}</span>}
                    </span>
                    {loc.zone && zoneName.get(loc.zone) && (
                      <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">
                        {zoneName.get(loc.zone)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Area result alert */}
          {found && (
            <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  অভিনন্দন! <strong>{found.name}</strong>
                  {found.zone && zoneName.get(found.zone) ? ` (${zoneName.get(found.zone)})` : ''} এলাকায় আমাদের এক্সপ্রেস ডেলিভারি সচল রয়েছে।
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
          {checked && !found && (
            <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-900 animate-in fade-in space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>&quot;{checked.query}&quot;</strong> এখনো আমাদের তালিকায় নেই। নিশ্চিত হতে কল দিন:{' '}
                  <a href={`tel:${HOTLINE_TEL}`} className="font-bold underline">{HOTLINE_NUMBER}</a>
                </span>
              </div>
              {didYouMean.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pl-6">
                  <span>আপনি কি খুঁজছেন:</span>
                  {didYouMean.map((loc) => (
                    <button
                      key={loc._id}
                      type="button"
                      onClick={() => choose(loc)}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                        onClick={() => choose(a)}
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
