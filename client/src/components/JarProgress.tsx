import React, { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useSpring, useTransform } from 'motion/react';
import { HOME_NAV_ID, NAV_ITEMS } from '@/src/data/navigation';
import { toBengaliNumber } from '@/src/data/packages';
import { useScrollProgress, useReduced } from '@/src/lib/motion';

// Jar geometry (SVG units)
const W = 60;
const H = 150;
const BODY_TOP = 16;
const BODY_BOTTOM = 148;
const BODY_H = BODY_BOTTOM - BODY_TOP;

const JAR_OUTLINE =
  'M22 2 h16 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-1 v8 c0 4 14 8 16 14 c2 4 3 8 3 14 v88 c0 6 -4 10 -10 10 h-32 c-6 0 -10 -4 -10 -10 v-88 c0 -6 1 -10 3 -14 c2 -6 16 -10 16 -14 v-8 h-1 a2 2 0 0 1 -2 -2 v-8 a2 2 0 0 1 2 -2 z';

const SECTIONS = NAV_ITEMS.filter((item) => item.id !== HOME_NAV_ID);
const CLOSE_ID = 'order-now';
const MIN_TICK_GAP = 16;

interface Tick {
  id: string;
  label: string;
  at: number;
}

/**
 * Signature move: a jar fixed beside the page whose water level is the visitor's
 * reading progress. Each section passed stamps a tick that doubles as a jump link,
 * and when the closing section arrives the jar is full and hands over to its CTA.
 */
export const JarProgress: React.FC = () => {
  const reduced = useReduced();
  const scrollYProgress = useScrollProgress();
  const level = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const source = reduced ? scrollYProgress : level;
  const waterY = useTransform(source, [0, 1], [BODY_H, 0]);

  const [ticks, setTicks] = useState<Tick[]>([]);
  const [progress, setProgress] = useState(0);
  const [closeAt, setCloseAt] = useState(1);

  // Map each section's top onto the page's scroll range, re-measured whenever layout changes.
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const fraction = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max));
      };
      setTicks(
        SECTIONS.flatMap((s) => {
          const at = fraction(s.id);
          return at === null ? [] : [{ id: s.id, label: s.label, at }];
        })
      );
      setCloseAt(fraction(CLOSE_ID) ?? 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setProgress(v));

  // Ticks sit at their true level, nudged apart where sections are close together.
  const tickTops = ticks.reduce<number[]>((tops, t, i) => {
    const natural = BODY_BOTTOM - t.at * BODY_H - 6;
    tops.push(i === 0 ? natural : Math.min(natural, tops[i - 1] - MIN_TICK_GAP));
    return tops;
  }, []);

  const handedOver = progress >= closeAt - 0.01;
  const percent = toBengaliNumber(Math.round(progress * 100));

  return (
    <motion.aside
      aria-label="পাতার অগ্রগতি"
      className="hidden min-[1360px]:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 px-2.5 pt-3 pb-2 rounded-full bg-surface/90 backdrop-blur-md ring-1 ring-hairline shadow-e2"
      animate={{ opacity: handedOver ? 0 : 1, scale: handedOver ? 0.9 : 1 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: handedOver ? 'none' : 'auto' }}
    >
      <div className="relative" style={{ width: W, height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" className="overflow-visible">
          <defs>
            <clipPath id="jar-body">
              <path d={JAR_OUTLINE} />
            </clipPath>
            <linearGradient id="jar-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5fb6e0" />
              <stop offset="1" stopColor="#0873b1" />
            </linearGradient>
          </defs>
          <path d={JAR_OUTLINE} fill="rgba(255,255,255,0.75)" />
          <g clipPath="url(#jar-body)">
            <motion.g style={{ y: waterY }}>
              <g transform={`translate(0 ${BODY_TOP})`}>
                <g className={reduced ? '' : 'jar-wave'}>
                  <path
                    d="M0 4 C 15 0, 15 0, 30 4 S 45 8, 60 4 S 75 0, 90 4 S 105 8, 120 4 V 200 H 0 Z"
                    fill="url(#jar-water)"
                  />
                </g>
              </g>
            </motion.g>
          </g>
          <path d={JAR_OUTLINE} fill="none" stroke="#0b2233" strokeOpacity={0.35} strokeWidth={1.5} />
          {/* Ridges on the jar body */}
          {[78, 110].map((y) => (
            <line key={y} x1={4} x2={56} y1={y} y2={y} stroke="#0b2233" strokeOpacity={0.12} strokeWidth={1} />
          ))}
        </svg>

        {/* Section ticks, stamped once passed; each is a jump link */}
        {ticks.map((t, i) => {
          const passed = progress >= t.at - 0.002;
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="group absolute right-full mr-2 flex items-center"
              style={{ top: tickTops[i] }}
              aria-label={t.label}
            >
              <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-white opacity-0 translate-x-1 transition-[opacity,transform] duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100">
                {t.label}
              </span>
              <span
                className={`block h-3 w-3 rounded-full ring-2 transition-[background-color,transform] duration-200 ease-out-soft group-hover:scale-125 ${
                  passed ? 'bg-accent ring-white' : 'bg-white ring-hairline'
                }`}
              />
            </a>
          );
        })}
      </div>
      <span className="text-[11px] font-bold text-ink-soft tabular" aria-hidden="true">
        {percent}%
      </span>
    </motion.aside>
  );
};
