import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Magnetic } from '@/src/components/motion/Magnetic';
import { Reveal, RevealItem } from '@/src/components/motion/Reveal';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { useScrollProgress, useReduced } from '@/src/lib/motion';
import jarImage from '@/src/assets/package1.png';
import { Phone, ShoppingBag } from 'lucide-react';

interface FinalCtaProps {
  onOpenOrder: () => void;
}

/**
 * The close: the jar beside the page is full, so the page fills too and holds on
 * one action. Copy greets on arrival and never fades out.
 */
export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenOrder }) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start end', 'end end'] });
  const waterY = useTransform(scrollYProgress, [0.25, 1], ['85%', '0%']);
  const jarY = useTransform(scrollYProgress, [0.25, 1], [60, 0]);

  return (
    <section
      id="order-now"
      ref={ref}
      aria-labelledby="order-now-title"
      className="relative overflow-hidden bg-canvas min-h-svh flex flex-col"
    >
      <div className="relative z-30 max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 text-center">
        <Reveal className="space-y-5">
          <RevealItem as="h2" className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.025em] text-ink leading-[1.08]">
            <span id="order-now-title">জার ভরে গেছে। এবার আপনার দরজায়।</span>
          </RevealItem>
          <RevealItem as="p" className="text-base sm:text-lg text-ink-soft max-w-xl mx-auto">
            ২০ লিটার বিশুদ্ধ পানির জার মাত্র <strong className="font-bold text-ink">৳৪০</strong>। খুলনা সিটিতে{' '}
            <strong className="font-bold text-ink">১</strong> ঘণ্টার মধ্যে ফ্রি হোম ডেলিভারি।
          </RevealItem>
          <RevealItem className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Magnetic>
              <Button
                id="final-order-cta"
                size="lg"
                onClick={onOpenOrder}
                className="bg-accent hover:bg-accent-deep text-accent-ink font-bold text-base px-9 shadow-e3"
              >
                <ShoppingBag className="w-5 h-5" />
                অর্ডার করুন
              </Button>
            </Magnetic>
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="inline-flex items-center gap-2 h-13 px-6 rounded-xl text-sm font-bold text-ink hover:text-accent transition-colors duration-150"
            >
              <Phone className="w-4 h-4 text-accent" />
              <span>
                অথবা কল করুন <span className="tabular">{HOTLINE_NUMBER}</span>
              </span>
            </a>
          </RevealItem>
        </Reveal>
      </div>

      {/* The jar settles into the water as the page fills */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] mt-4">
        <motion.img
          src={jarImage}
          alt=""
          draggable={false}
          className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-[min(82vw,460px)] h-auto select-none z-10 drop-shadow-[0_24px_30px_rgba(8,64,100,0.2)]"
          style={reduced ? undefined : { y: jarY }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[30%] z-20"
          style={reduced ? undefined : { y: waterY }}
        >
          <div className="absolute -top-[30px] left-0 w-full h-8 overflow-hidden">
            <div className={`flex w-[200%] h-full ${reduced ? '' : 'animate-wave-x'}`}>
              {[0, 1].map((k) => (
                <svg key={k} viewBox="0 0 1440 32" preserveAspectRatio="none" className="w-1/2 h-full">
                  <path d="M0 18 C 240 2, 480 2, 720 18 S 1200 32, 1440 18 L1440 32 L0 32 Z" fill="rgba(159,214,238,0.6)" />
                  <path d="M0 18 C 240 2, 480 2, 720 18 S 1200 32, 1440 18" fill="none" stroke="#fff" strokeWidth="2" />
                </svg>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(159,214,238,0.6),#cfeaf6_45%,#bfe2f2)]" />
        </motion.div>
      </div>
    </section>
  );
};
