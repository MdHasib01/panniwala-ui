import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal, RevealItem } from '@/src/components/motion/Reveal';
import { Plus, Phone } from 'lucide-react';
import { boldNumbers } from '@/src/lib/utils';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { EASE_OUT, useReduced } from '@/src/lib/motion';

const FAQS = [
  {
    q: 'পানির মান ও বিশুদ্ধতা কীভাবে যাচাই করা হয়?',
    a: 'আমরা বিএসটিআই (BSTI) অনুমোদিত স্ট্যান্ডার্ড BDS-1414 কঠোরভাবে অনুসরণ করি। আমাদের পানি ৭ স্তরের রিভার্স অসমোসিস (RO), ইউভি (UV) এবং ওজোনাইজেশনের মাধ্যমে প্রস্তুত করা হয়। প্রতিটি ব্যাচের TDS, pH এবং মাইক্রোবায়োলজি রিপোর্ট নিয়মিত ল্যাব দ্বারা পরীক্ষা করা হয়।',
  },
  {
    q: 'প্রথমবার অর্ডারে আমার কাছে খালি জার না থাকলে কী করতে হবে?',
    a: 'কোনো সমস্যা নেই! প্রথমবার নতুন সংযোগের জন্য জার প্রতি মাত্র ২০০ টাকা সিকিউরিটি ডিপোজিট নেওয়া হয়। পরবর্তীতে আপনি শুধুমাত্র পানির রিফিল চার্জ (৳৪০) দিয়ে খালি জার বদল করে ভর্তি জার নিতে পারবেন। আপনি যদি কখনো জার ফেরত দেন, তবে সম্পূর্ণ ডিপোজিটের টাকা ফেরত পেয়ে যাবেন।',
  },
  {
    q: 'হোম ডেলিভারির জন্য কি অতিরিক্ত কোনো চার্জ আছে?',
    a: 'না, আমাদের কোনো লুকানো বা অতিরিক্ত ডেলিভারি ফি নেই! আপনার বাসা বা অফিসে সম্পূর্ণ ফ্রিতে পানি পৌঁছে দেওয়া হয়।',
  },
  {
    q: 'আমাদের ভবনে লিফট নেই, ৪/৫ তলায় কি পানি তুলে দেওয়া হবে?',
    a: 'হ্যাঁ, অবশ্যই! আমাদের ডেলিভারি টিম অত্যন্ত দায়িত্বশীল। ভবনে লিফট না থাকলেও কোনো বাড়তি চার্জ ছাড়াই আপনার দরজায় পানি নিরাপদে পৌঁছে দেওয়া হবে।',
  },
  {
    q: 'অর্ডার করার পর কতক্ষণ সময়ের মধ্যে ডেলিভারি পাওয়া যাবে?',
    a: 'আমাদের গড় ডেলিভারি সময় ৩৫ থেকে ৫০ মিনিট। সাধারণত ১ ঘণ্টার মধ্যেই গ্রাহকের ঠিকানায় পানি পৌঁছে দেওয়া হয়। জরুরি প্রয়োজনে আমাদের হটলাইনে ফোন দিলে অগ্রাধিকার ভিত্তিতে দ্রুততম ডেলিভারি দেওয়া হয়।',
  },
  {
    q: 'কর্পোরেট অফিস ও নিয়মিত গ্রাহকদের জন্য কী সুবিধা রয়েছে?',
    a: 'কর্পোরেট অফিস, রেস্টুরেন্ট বা নিয়মিত মাসিক গ্রাহকদের জন্য আমরা পাইকারি বিশেষ কাস্টম রেট, ফ্রি অটোমেটিক ওয়াটার ডিসপেনসার এবং নির্দিষ্ট শিডিউলে অটো-ডেলিভারি সুবিধা দিয়ে থাকি। হটলাইনে কল করে সরাসরি কাস্টম কোটেশন নেওয়া যাবে।',
  },
  {
    q: 'পেমেন্ট পদ্ধতি কী কী?',
    a: 'আপনি ক্যাশ অন ডেলিভারি (পণ্য বুঝে পেয়ে নগদ টাকা), অথবা ডেলিভারিম্যানের উপস্থিতিতে সরাসরি বিকাশ (bKash) ও নগদ (Nagad)-এর মাধ্যমে নিশ্চিন্তে বিল পরিশোধ করতে পারবেন।',
  },
];

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduced = useReduced();

  return (
    <section id="faq" aria-labelledby="faq-title" className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 space-y-5">
            <h2 id="faq-title" className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-ink leading-[1.1]">
              সচরাচর জিজ্ঞাসিত প্রশ্ন
            </h2>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              আপনার প্রশ্নের উত্তর এখানে না পেলে সরাসরি আমাদের সাথে কথা বলুন।
            </p>
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl ring-1 ring-hairline hover:ring-accent/40 text-sm font-bold text-ink transition-shadow duration-150 active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-accent" />
              <span className="tabular">{HOTLINE_NUMBER}</span>
            </a>
          </div>
        </div>

        <Reveal as="ul" className="lg:col-span-8 divide-y divide-hairline border-y border-hairline" stagger={0.04}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${idx}`;
            return (
              <RevealItem as="li" key={faq.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-ink hover:text-accent transition-colors duration-150"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-[transform,background-color,color] duration-200 ease-out-soft ${
                      isOpen ? 'rotate-45 bg-accent text-accent-ink' : 'bg-accent-wash text-accent'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.28, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-sm sm:text-base text-ink-soft leading-relaxed">
                        {boldNumbers(faq.a, 'font-bold text-ink')}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};
