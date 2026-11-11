import React, { useRef, useState } from 'react';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toBengaliNumber } from '@/src/data/packages';

export const Testimonials: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const scrollToCard = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    });
  };

  const reviews = [
    {
      name: 'তানভীর আহমেদ',
      role: 'অফিসের গ্রাহক',
      text: 'আমাদের অফিসে প্রতিদিন প্রায় ৬টি করে জার লাগে। পানি ওয়ালার সবচেয়ে বড় সুবিধা হলো সময়মতো ডেলিভারি এবং জারগুলো দেখতেও অত্যন্ত ঝকঝকে ও পরিষ্কার। স্বাদ শতভাগ প্রাকৃতিক।',
      rating: 5,
      area: 'কেডিএ এভিনিউ, খুলনা',
      avatarBg: 'bg-blue-600',
      initials: 'তা',
    },
    {
      name: 'সাবরিনা ইয়াসমিন',
      role: 'গৃহিণী',
      text: 'বাচ্চাদের জন্য পানির ব্যাপারে সবসময় চিন্তিত থাকতাম। পানি ওয়ালার টিডিএস মিটার টেস্ট করে দেখেছি সবসময় ৩২ থেকে ৩৫ এর মধ্যে থাকে। কোনো গন্ধ নেই। আর লিফট ছাড়া চারতলায়ও হাসিমুখে পানি দিয়ে যায়।',
      rating: 5,
      area: 'সোনাডাঙ্গা আবাসিক, খুলনা',
      avatarBg: 'bg-emerald-600',
      initials: 'সা',
    },
    {
      name: 'মাহফুজুর রহমান',
      role: 'ক্যাফে ও রেস্টুরেন্ট ওনার',
      text: 'ফুড অ্যান্ড বেভারেজ বিজনেসে পানির পিউরিটি সবচেয়ে জরুরি। পানি ওয়ালা আমাদের নিয়মিত সাপ্লাই দেয়। তাদের নিরাপদ ও বিশুদ্ধ পানির বিশ্বস্ত সরবরাহ আমাদের মানসিক শান্তি দিয়েছে।',
      rating: 5,
      area: 'খালিশপুর, খুলনা',
      avatarBg: 'bg-indigo-600',
      initials: 'মা',
    },
    {
      name: 'বাসার গ্রাহক',
      role: 'পরিবারের জন্য পানি',
      text: 'বাসার জন্য ২০ লিটারের জার নেওয়াটা বেশ সুবিধাজনক। ভারী জার বহনের চিন্তা নেই, দরজায় পানি পৌঁছে যায়। পরিবারের দৈনন্দিন পানির ব্যবস্থা এখন অনেক সহজ।',
      rating: 5,
      area: 'সোনাডাঙ্গা, খুলনা',
      avatarBg: 'bg-teal-600',
      initials: 'বা',
    },
    {
      name: 'অফিসের গ্রাহক',
      role: 'অফিসে পানি সরবরাহ',
      text: 'অফিসে নিয়মিত পানির প্রয়োজন হয়। এক জায়গা থেকে জার নেওয়ার সুবিধায় বারবার নতুন সরবরাহকারী খুঁজতে হয় না। অর্ডার দেওয়া এবং যোগাযোগ করাও সহজ।',
      rating: 5,
      area: 'কেডিএ এভিনিউ, খুলনা',
      avatarBg: 'bg-sky-600',
      initials: 'অ',
    },
    {
      name: 'নিয়মিত গ্রাহক',
      role: 'নিয়মিত জার রিফিল',
      text: 'পানি শেষ হওয়ার আগেই নতুন জারের অর্ডার দিই। খালি জার বদলে ভর্তি জার নেওয়ার ব্যবস্থা বেশ সহজ। ব্যস্ত দিনের মধ্যে পানির জন্য আলাদা সময় বের করতে হয় না।',
      rating: 5,
      area: 'বয়রা, খুলনা',
      avatarBg: 'bg-violet-600',
      initials: 'নি',
    },
  ];

  return (
    <section id="reviews" className="pt-6 sm:pt-8 pb-16 sm:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          title="১২,৫০০+ পরিবার ও প্রতিষ্ঠানের নির্ভরযোগ্য সঙ্গী"
          className="mb-4 sm:mb-6"
        />

        {/* Mobile: horizontal snap carousel · md+: grid */}
        <div className="relative">
        {activeIndex > 0 && (
          <button
            type="button"
            aria-label="আগের রিভিউ"
            onClick={() => scrollToCard(activeIndex - 1)}
            className="md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 active:bg-sky-50 active:text-sky-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {activeIndex < reviews.length - 1 && (
          <button
            type="button"
            aria-label="পরের রিভিউ"
            onClick={() => scrollToCard(activeIndex + 1)}
            className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 active:bg-sky-50 active:text-sky-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:pb-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all w-[84%] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-200/70">
                <div
                  className={`w-10 h-10 rounded-full ${rev.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}
                >
                  {rev.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                    {rev.name}
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {rev.role} • {rev.area}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Mobile carousel indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`রিভিউ ${toBengaliNumber(i + 1)}`}
              onClick={() => scrollToCard(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
