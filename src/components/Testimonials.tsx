import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { Reveal, RevealItem } from '@/src/components/motion/Reveal';
import { Star, BadgeCheck } from 'lucide-react';
import { boldNumbers } from '@/src/lib/utils';
import { useScrollProgress, useReduced } from '@/src/lib/motion';

const REVIEWS = [
  {
    name: 'সাবরিনা ইয়াসমিন',
    role: 'গৃহিণী',
    text: 'বাচ্চাদের জন্য পানির ব্যাপারে সবসময় চিন্তিত থাকতাম। পানি ওয়ালার টিডিএস মিটার টেস্ট করে দেখেছি সবসময় ৩২ থেকে ৩৫ এর মধ্যে থাকে। কোনো গন্ধ নেই। আর লিফট ছাড়া চারতলায়ও হাসিমুখে পানি দিয়ে যায়।',
    area: 'সোনাডাঙ্গা আবাসিক, খুলনা',
    initials: 'সা',
  },
  {
    name: 'তানভীর আহমেদ',
    role: 'অ্যাডমিন ম্যানেজার',
    text: 'আমাদের অফিসে প্রতিদিন প্রায় ৬টি করে জার লাগে। পানি ওয়ালার সবচেয়ে বড় সুবিধা হলো সময়মতো ডেলিভারি এবং জারগুলো দেখতেও অত্যন্ত ঝকঝকে ও পরিষ্কার। স্বাদ শতভাগ প্রাকৃতিক।',
    area: 'কেডিএ এভিনিউ, খুলনা',
    initials: 'তা',
  },
  {
    name: 'ইঞ্জিনিয়ার রেজওয়ানুল হক',
    role: 'সফটওয়্যার আর্কিটেক্ট',
    text: 'ইলেকট্রিক পাম্পের কম্বো অফারটি নিয়েছিলাম। এক চার্জে অনায়াসে ৪টি জার চলে যায়। বারবার জার উল্টানোর ঝামেলা থেকে মুক্তি পেয়েছি। কাস্টমার সার্ভিসও অসাধারণ!',
    area: 'বয়রা, খুলনা',
    initials: 'রে',
  },
  {
    name: 'মাহফুজুর রহমান',
    role: 'ক্যাফে ও রেস্টুরেন্ট ওনার',
    text: 'ফুড অ্যান্ড বেভারেজ বিজনেসে পানির পিউরিটি সবচেয়ে জরুরি। পানি ওয়ালা আমাদের নিয়মিত সাপ্লাই দেয়। তাদের সার্ভিস ও বিএসটিআই সার্টিফিকেট আমাদের মানসিক শান্তি দিয়েছে।',
    area: 'খালিশপুর, খুলনা',
    initials: 'মা',
  },
];

const Stars: React.FC = () => (
  <div className="flex items-center gap-0.5 text-accent" aria-label="৫ এর মধ্যে ৫ রেটিং">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-current" />
    ))}
  </div>
);

const Person: React.FC<{ review: (typeof REVIEWS)[number]; large?: boolean }> = ({ review, large }) => (
  <div className="flex items-center gap-3">
    <span
      className={`rounded-full bg-accent-wash text-accent font-bold flex items-center justify-center shrink-0 ${
        large ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'
      }`}
    >
      {review.initials}
    </span>
    <div className="min-w-0">
      <p className="text-sm font-bold text-ink flex items-center gap-1">
        {review.name}
        <BadgeCheck className="w-4 h-4 text-accent shrink-0" />
      </p>
      <p className="text-xs text-ink-soft truncate">
        {review.role}, {review.area}
      </p>
    </div>
  </div>
);

export const Testimonials: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start end', 'end start'] });
  const quoteY = useTransform(scrollYProgress, [0, 1], [-40, 60]);
  const [featured, ...rest] = REVIEWS;

  return (
    <section id="reviews" ref={ref} aria-labelledby="reviews-title" className="py-20 sm:py-28 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <RevealItem as="h2" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-ink leading-[1.1]">
            <span id="reviews-title">১২,৫০০+ পরিবার ও প্রতিষ্ঠানের নির্ভরযোগ্য সঙ্গী</span>
          </RevealItem>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Featured voice */}
          <Reveal className="lg:col-span-7">
            <RevealItem as="article" className="relative rounded-[32px] bg-surface ring-1 ring-hairline shadow-e2 p-7 sm:p-10 overflow-hidden">
              <motion.span
                aria-hidden="true"
                className="absolute -top-6 right-6 font-display text-[11rem] leading-none text-accent/10 select-none"
                style={reduced ? undefined : { y: quoteY }}
              >
                &ldquo;
              </motion.span>
              <Stars />
              <blockquote className="relative mt-5 font-display text-xl sm:text-2xl lg:text-[1.7rem] leading-[1.45] text-ink font-medium">
                {boldNumbers(featured.text, 'font-bold text-accent')}
              </blockquote>
              <div className="mt-8">
                <Person review={featured} large />
              </div>
            </RevealItem>
          </Reveal>

          {/* Compact voices */}
          <Reveal className="lg:col-span-5 space-y-4" stagger={0.08} delay={0.1}>
            {rest.map((rev) => (
              <RevealItem as="article" key={rev.name} className="rounded-[24px] bg-surface/70 ring-1 ring-hairline p-5 sm:p-6">
                <p className="text-sm text-ink leading-relaxed">{boldNumbers(rev.text, 'font-bold')}</p>
                <div className="mt-4">
                  <Person review={rev} />
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};
