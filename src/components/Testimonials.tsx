import React from 'react';
import { useCarousel } from '@/src/lib/use-carousel';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toBengaliNumber } from '@/src/data/packages';

export const Testimonials: React.FC = () => {
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

  const { scrollerRef, activeIndex, canScrollLeft, canScrollRight, scrollByCard, scrollToCard } = useCarousel(reviews.length);

  return (
    <section id="reviews" className="pt-6 sm:pt-8 pb-16 sm:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          title="১২,৫০০+ পরিবার ও প্রতিষ্ঠানের নির্ভরযোগ্য সঙ্গী"
          className="mb-4 sm:mb-6"
        />

        {/* Horizontal snap scroller on all screen sizes (same as the location zones) */}
        <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="আগের রিভিউ"
            onClick={() => scrollByCard(-1)}
            className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="পরের রিভিউ"
            onClick={() => scrollByCard(1)}
            className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div
          ref={scrollerRef}
          className="flex gap-4 sm:gap-6 items-stretch overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto pb-2 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between shrink-0 snap-start w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
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
              className={`h-2 rounded-full ${
                activeIndex === i ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
