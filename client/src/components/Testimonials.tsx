import React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { boldNumbers } from '@/src/lib/utils';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'তানভীর আহমেদ',
      role: 'অ্যাডমিন ম্যানেজার, কেডিএ এভিনিউ',
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
      name: 'ইঞ্জিনিয়ার রেজওয়ানুল হক',
      role: 'সফটওয়্যার আর্কিটেক্ট',
      text: 'ইলেকট্রিক পাম্পের কম্বো অফারটি নিয়েছিলাম। এক চার্জে অনায়াসে ৪টি জার চলে যায়। বারবার জার উল্টানোর ঝামেলা থেকে মুক্তি পেয়েছি। কাস্টমার সার্ভিসও অসাধারণ!',
      rating: 5,
      area: 'বয়রা, খুলনা',
      avatarBg: 'bg-cyan-600',
      initials: 'রে',
    },
    {
      name: 'মাহফুজুর রহমান',
      role: 'ক্যাফে ও রেস্টুরেন্ট ওনার',
      text: 'ফুড অ্যান্ড বেভারেজ বিজনেসে পানির পিউরিটি সবচেয়ে জরুরি। পানি ওয়ালা আমাদের নিয়মিত সাপ্লাই দেয়। তাদের সার্ভিস ও বিএসটিআই সার্টিফিকেট আমাদের মানসিক শান্তি দিয়েছে।',
      rating: 5,
      area: 'খালিশপুর, খুলনা',
      avatarBg: 'bg-indigo-600',
      initials: 'মা',
    },
  ];

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="cyan" className="px-3 py-1 text-xs">
            গ্রাহক অভিজ্ঞতা
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            ১২,৫০০+ পরিবার ও প্রতিষ্ঠানের নির্ভরযোগ্য সঙ্গী
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            আমাদের সেবা গ্রহণকারী সম্মানিত গ্রাহকদের মূল্যবান মতামত জেনে নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &quot;{boldNumbers(rev.text, 'font-bold text-slate-900')}&quot;
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
    </section>
  );
};
