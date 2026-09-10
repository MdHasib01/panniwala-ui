import React, { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { ChevronDown } from 'lucide-react';

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'পানির মান ও বিশুদ্ধতা কীভাবে যাচাই করা হয়?',
      a: 'আমরা বিএসটিআই (BSTI) অনুমোদিত স্ট্যান্ডার্ড BDS-1414 কঠোরভাবে অনুসরণ করি। আমাদের পানি ৭ স্তরের রিভার্স অসমোসিস (RO), ইউভি (UV) এবং ওজোনাইজেশনের মাধ্যমে প্রস্তুত করা হয়। প্রতিটি ব্যাচের TDS, pH এবং মাইক্রোবায়োলজি রিপোর্ট নিয়মিত ল্যাব দ্বারা পরীক্ষা করা হয়।',
    },
    {
      q: 'প্রথমবার অর্ডারে আমার কাছে খালি জার না থাকলে কী করতে হবে?',
      a: 'কোনো সমস্যা নেই! প্রথমবার নতুন সংযোগের জন্য জার প্রতি মাত্র ২০০ টাকা সিকিউরিটি ডিপোজিট নেওয়া হয়। পরবর্তীতে আপনি শুধুমাত্র পানির রিফিল চার্জ (৳৮০) দিয়ে খালি জার বদল করে ভর্তি জার নিতে পারবেন। আপনি যদি কখনো জার ফেরত দেন, তবে সম্পূর্ণ ডিপোজিটের টাকা ফেরত পেয়ে যাবেন।',
    },
    {
      q: 'হোম ডেলিভারির জন্য কি অতিরিক্ত কোনো চার্জ আছে?',
      a: 'না, আমাদের কোনো লুকানো বা অতিরিক্ত ডেলিভারি ফি নেই! আপনার বাসা বা অফিসে সম্পূর্ণ ফ্রিতে পানি পৌঁছে দেওয়া হয়।',
    },
    {
      q: 'আমাদের ভবনে লিফট নেই, ৪/৫ তলায় কি পানি তুলে দেওয়া হবে?',
      a: 'হ্যাঁ, অবশ্যই! আমাদের ডেলিভারি টিম অত্যন্ত দায়িত্বশীল। ভবনে লিফট না থাকলেও কোনো বাড়তি চার্জ ছাড়াই আপনার দরজায় পানি নিরাপদে পৌঁছে দেওয়া হবে।',
    },
    {
      q: 'অর্ডার করার পর কতক্ষণ সময়ের মধ্যে ডেলিভারি পাওয়া যাবে?',
      a: 'আমাদের গড় ডেলিভারি সময় ৩৫ থেকে ৫০ মিনিট। সাধারণত ১ ঘণ্টার মধ্যেই গ্রাহকের ঠিকানায় পানি পৌঁছে দেওয়া হয়। জরুরি প্রয়োজনে আমাদের হটলাইনে ফোন দিলে অগ্রাধিকার ভিত্তিতে দ্রুততম ডেলিভারি দেওয়া হয়।',
    },
    {
      q: 'কর্পোরেট অফিস ও নিয়মিত গ্রাহকদের জন্য কী সুবিধা রয়েছে?',
      a: 'কর্পোরেট অফিস, রেস্টুরেন্ট বা নিয়মিত মাসিক গ্রাহকদের জন্য আমরা পাইকারি বিশেষ রেট (জার প্রতি মাত্র ৳৭০), ফ্রি অটোমেটিক ওয়াটার ডিসপেনসার এবং নির্দিষ্ট শিডিউলে অটো-ডেলিভারি সুবিধা দিয়ে থাকি।',
    },
    {
      q: 'পেমেন্ট পদ্ধতি কী কী?',
      a: 'আপনি ক্যাশ অন ডেলিভারি (পণ্য বুঝে পেয়ে নগদ টাকা), অথবা ডেলিভারিম্যানের উপস্থিতিতে সরাসরি বিকাশ (bKash) ও নগদ (Nagad)-এর মাধ্যমে নিশ্চিন্তে বিল পরিশোধ করতে পারবেন।',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 space-y-3">
          <Badge variant="cyan" className="px-3 py-1 text-xs">
            সাধারণ জিজ্ঞাসা
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            পানি ওয়ালা সম্পর্কে আপনার মনে থাকা যে কোনো সাধারণ প্রশ্নের সহজ উত্তর এখানে পেয়ে যাবেন।
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-cyan-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-cyan-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-cyan-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
