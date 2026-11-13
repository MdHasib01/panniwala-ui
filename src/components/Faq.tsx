import React, { useState } from 'react';
import { SectionHeader } from '@/src/components/SectionHeader';
import { ChevronDown } from 'lucide-react';

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'পানি ওয়ালা কেন বেছে নেবেন?',
      a: 'পানি ওয়ালা নিরাপদ ও বিশুদ্ধ পানির বিশ্বস্ত সরবরাহকারী। বাসা ও অফিসের দৈনন্দিন পানির চাহিদা পূরণে আমরা যত্নের সঙ্গে আপনার দরজায় পানি পৌঁছে দিই।',
    },
    {
      q: 'প্রথমবার অর্ডারে আমার কাছে খালি জার না থাকলে কী করতে হবে?',
      a: 'কোনো সমস্যা নেই! খালি জার না থাকলেও প্রথমবার অর্ডার করতে পারবেন। অর্ডারের সময় নতুন জার প্রয়োজন জানিয়ে দিন। আপনার বেছে নেওয়া প্যাকেজের মূল্য অনুযায়ী বিল পরিশোধ করবেন।',
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
      a: 'কর্পোরেট অফিস, রেস্টুরেন্ট বা নিয়মিত মাসিক গ্রাহকদের জন্য আমরা পাইকারি বিশেষ রেট (জার প্রতি মাত্র ৳৩৫), ফ্রি অটোমেটিক ওয়াটার ডিসপেনসার এবং নির্দিষ্ট শিডিউলে অটো-ডেলিভারি সুবিধা দিয়ে থাকি।',
    },
    {
      q: 'পেমেন্ট পদ্ধতি কী কী?',
      a: 'আপনি ক্যাশ অন ডেলিভারি (পণ্য বুঝে পেয়ে নগদ টাকা), অথবা ডেলিভারিম্যানের উপস্থিতিতে সরাসরি বিকাশ (bKash) ও নগদ (Nagad)-এর মাধ্যমে নিশ্চিন্তে বিল পরিশোধ করতে পারবেন।',
    },
  ];

  return (
    <section id="faq" className="pt-6 sm:pt-8 pb-16 sm:pb-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          title="সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর"
          className="mb-4 sm:mb-6"
        />

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-cyan-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${
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
