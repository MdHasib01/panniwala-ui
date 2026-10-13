import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { KineticLines } from '@/src/components/motion/KineticLines';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { useScrollProgress, EASE_OUT, useFinePointer, useIsDesktop, useReduced } from '@/src/lib/motion';
import heroImage from '@/src/assets/hero-image.png';
import { Phone, ShoppingBag } from 'lucide-react';

interface HeroProps {
  onOpenOrder: () => void;
}

const HEADLINE = [
  'বাসা ও অফিসের জন্য',
  <span className="text-accent">১০০% বিশুদ্ধ ও নিরাপদ</span>,
  'খাবার পানি',
];

/** Bubbles drawn as rings; far ones are small and faint, near ones large. */
const FAR_BUBBLES = [
  { left: '8%', top: '30%', size: 10 },
  { left: '22%', top: '72%', size: 6 },
  { left: '46%', top: '18%', size: 8 },
  { left: '58%', top: '64%', size: 12 },
  { left: '74%', top: '22%', size: 7 },
  { left: '88%', top: '52%', size: 10 },
  { left: '94%', top: '14%', size: 6 },
];

const NEAR_BUBBLES = [
  { left: '52%', top: '44%', size: 22 },
  { left: '70%', top: '74%', size: 14 },
  { left: '63%', top: '30%', size: 18 },
  { left: '81%', top: '62%', size: 26 },
  { left: '90%', top: '24%', size: 12 },
];

const Bubble: React.FC<{ left: string; top: string; size: number; className?: string }> = ({
  left,
  top,
  size,
  className,
}) => (
  <span
    className={`absolute rounded-full border bg-white/30 ${className ?? ''}`}
    style={{ left, top, width: size, height: size }}
  />
);

/** Wave crest on top of the water plane: two periods wide so it can loop seamlessly. */
const WaveCrest: React.FC<{ animated: boolean }> = ({ animated }) => (
  <div className="absolute -top-[38px] left-0 w-full h-10 overflow-hidden">
    <div className={`flex w-[200%] h-full ${animated ? 'animate-wave-x' : ''}`}>
      {[0, 1].map((k) => (
        <svg key={k} viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-1/2 h-full" aria-hidden="true">
          <path
            d="M0 22 C 180 4, 360 4, 540 20 S 900 38, 1080 20 S 1320 6, 1440 22 L1440 40 L0 40 Z"
            fill="rgba(159, 214, 238, 0.55)"
          />
          <path
            d="M0 22 C 180 4, 360 4, 540 20 S 900 38, 1080 20 S 1320 6, 1440 22"
            fill="none"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="2"
          />
        </svg>
      ))}
    </div>
  </div>
);

export const Hero: React.FC<HeroProps> = ({ onOpenOrder }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReduced();
  const fine = useFinePointer();
  const pinned = isDesktop && !reduced;

  // Pinned desktop stage: progress across the sticky travel.
  const pinP = useScrollProgress({ target: sectionRef, offset: ['start start', 'end end'] });
  // Flow layout (mobile): progress while the hero scrolls away.
  const flowP = useScrollProgress({ target: sectionRef, offset: ['start start', 'end start'] });
  const p: MotionValue<number> = pinned ? pinP : flowP;

  // Plane speeds differ by 10 to 30% between neighbours; copy rides the scroll.
  const backY = useTransform(p, [0, 1], [0, pinned ? -50 : -30]);
  const backScale = useTransform(p, [0, 1], [1, 1.06]);
  const farY = useTransform(p, [0, 1], [0, pinned ? -110 : -60]);
  const jarY = useTransform(p, [0, 1], [0, pinned ? 96 : 70]);
  const jarScale = useTransform(p, [0, 1], [1, 0.92]);
  const waterY = useTransform(p, [0, 1], pinned ? ['93%', '0%'] : ['0%', '-30%']);
  const nearY = useTransform(p, [0, 1], [0, pinned ? -230 : -120]);
  const copyY = useTransform(p, [0, 0.9], [0, pinned ? -70 : 0]);
  const copyOpacity = useTransform(p, [0.5, 0.82], [1, pinned ? 0 : 1]);
  const beatOpacity = useTransform(p, [0.5, 0.64], [0, 1]);
  const beatY = useTransform(p, [0.5, 0.64], [22, 0]);

  // Subtle pointer tilt on the jar (fine pointers only).
  const tiltX = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const onPointerMove = (e: React.PointerEvent) => {
    if (!fine || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(nx * 10);
    tiltX.set(-ny * 8);
  };
  const onPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const move = !reduced;

  return (
    <section
      ref={sectionRef}
      aria-label="পানি ওয়ালা"
      className={`relative ${pinned ? 'h-[175vh]' : ''}`}
    >
      <div
        className={`${pinned ? 'sticky top-0 h-svh' : 'relative min-h-svh'} overflow-hidden bg-canvas`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {/* Plane 0: light and glow, furthest back */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={move ? { y: backY, scale: backScale } : undefined}
        >
          <div className="absolute -top-40 right-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(120,198,232,0.42),rgba(245,250,252,0)_68%)]" />
          <div className="absolute top-[20%] -left-40 w-[50vw] h-[50vw] max-w-[640px] max-h-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(207,234,246,0.9),rgba(245,250,252,0)_70%)]" />
          {/* Caustic light lines */}
          <svg className="absolute inset-x-0 top-0 w-full h-[70%] opacity-50" viewBox="0 0 1440 600" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M-20 ${120 + i * 110} C 300 ${60 + i * 110}, 520 ${200 + i * 110}, 820 ${120 + i * 110} S 1260 ${40 + i * 110}, 1460 ${140 + i * 110}`}
                fill="none"
                stroke="rgba(8,115,177,0.07)"
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </motion.div>

        {/* Plane 1: far bubbles */}
        <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={move ? { y: farY } : undefined}>
          {FAR_BUBBLES.map((b, i) => (
            <Bubble key={i} {...b} className="border-accent/15" />
          ))}
        </motion.div>

        {/* Content grid: copy (left) and jar (right) */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full pt-[112px] lg:pt-[92px] pb-16 lg:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 lg:h-full lg:items-center">
            {/* Copy rides at scroll speed and steps aside for the second beat */}
            <motion.div
              className="lg:col-span-6 relative z-20 space-y-6"
              style={pinned ? { y: copyY, opacity: copyOpacity } : undefined}
            >
              <motion.p
                className="inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-surface/80 ring-1 ring-hairline text-xs font-semibold text-ink"
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-accent/50 animate-ping" />
                  <span className="relative h-2 w-2 rounded-full bg-accent" />
                </span>
                খুলনা শহরের বিশ্বস্ত বিশুদ্ধ পানির সরবরাহকারী
              </motion.p>

              <KineticLines
                lines={HEADLINE}
                className="font-display text-[2.35rem] leading-[1.08] sm:text-5xl lg:text-[3.9rem] xl:text-[4.4rem] font-bold tracking-[-0.02em] text-ink"
              />

              <motion.p
                className="text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed"
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.45 }}
              >
                ৭ ধাপে RO ও UV ফিল্টার করা, ল্যাব-পরীক্ষিত পানি। ২০ লিটার জার মাত্র{' '}
                <strong className="font-bold text-ink">৳৪০</strong>, খুলনায়{' '}
                <strong className="font-bold text-ink">১</strong> ঘণ্টায় ফ্রি ডেলিভারি।
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.55 }}
              >
                <Button
                  id="hero-order-cta"
                  size="lg"
                  onClick={onOpenOrder}
                  className="bg-accent hover:bg-accent-deep text-accent-ink font-bold text-base px-8 shadow-e3"
                >
                  <ShoppingBag className="w-5 h-5" />
                  অর্ডার করুন
                </Button>
                <a
                  id="hero-call-cta"
                  href={`tel:${HOTLINE_TEL}`}
                  className="inline-flex items-center justify-center gap-2 h-13 px-6 rounded-xl bg-surface/85 ring-1 ring-hairline hover:ring-accent/40 text-ink font-bold text-sm transition-[box-shadow,background-color] duration-150 active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 text-accent" />
                  <span>
                    কল করুন <span className="tabular">{HOTLINE_NUMBER}</span>
                  </span>
                </a>
              </motion.div>
            </motion.div>

            {/* Plane 2: the jar, between the far bubbles and the water surface */}
            <motion.div
              className="lg:col-span-6 relative z-10 flex items-center justify-center"
              style={move ? { y: jarY, scale: jarScale } : undefined}
            >
              <motion.div
                className="w-[78%] sm:w-[60%] lg:w-full max-w-[540px] [perspective:1000px]"
                initial={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
              >
                <motion.img
                  src={heroImage}
                  alt="পানি ওয়ালা ২০ লিটার বিশুদ্ধ পানির জার"
                  draggable={false}
                  className="w-full h-auto max-h-[64svh] object-contain select-none drop-shadow-[0_30px_40px_rgba(8,64,100,0.22)]"
                  style={fine && !reduced ? { rotateX: tiltX, rotateY: tiltY } : undefined}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Plane 3: the water surface rises in front of the jar's base */}
        <motion.div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 z-20 pointer-events-none ${pinned ? 'h-[62%]' : 'h-[22%]'}`}
          style={move ? { y: waterY } : undefined}
        >
          <WaveCrest animated={move} />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(159,214,238,0.42),rgba(190,226,242,0.7)_40%,#cfeaf6_82%)]" />
        </motion.div>

        {/* Plane 4: near bubbles inside the water, fastest layer */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[60%] z-20 pointer-events-none"
          style={move ? { y: nearY } : undefined}
        >
          {NEAR_BUBBLES.map((b, i) => (
            <Bubble key={i} {...b} className="border-white/80" />
          ))}
        </motion.div>

        {/* Second beat, set in the water once it has risen */}
        {pinned && (
          <motion.div
            className="absolute inset-x-0 bottom-[12%] z-30 pointer-events-none"
            style={{ opacity: beatOpacity, y: beatY }}
          >
            <div className="max-w-7xl mx-auto px-8">
              <p className="font-display text-4xl xl:text-5xl font-bold tracking-[-0.02em] text-ink max-w-xl leading-[1.1]">
                লিফট ছাড়া ৪/৫ তলাতেও, হাসিমুখে।
              </p>
              <p className="mt-3 text-base text-ink-soft max-w-md">
                প্রতিটি জার পৌঁছানোর আগে ল্যাবে TDS ও pH পরীক্ষা করা হয়।
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
