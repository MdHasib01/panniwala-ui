import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { toBengaliNumber } from '@/src/data/packages';
import { useReduced } from '@/src/lib/motion';

interface CountUpProps {
  to: number;
  /** Text appended after the number, e.g. "+" or " মিনিট". */
  suffix?: string;
  durationMs?: number;
  className?: string;
}

const format = (n: number, grouped: boolean) => {
  const rounded = Math.round(n);
  const text = grouped ? rounded.toLocaleString('en-US') : String(rounded);
  return toBengaliNumber(text);
};

/**
 * Bengali-numeral counter that ticks up once, at half visibility, on a cubic
 * ease-out so the last digits settle slowly. Reduced motion writes the final value.
 */
export const CountUp: React.FC<CountUpProps> = ({ to, suffix = '', durationMs = 1400, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReduced();
  const grouped = to >= 10000;
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, durationMs]);

  return (
    <span ref={ref} className={`tabular ${className ?? ''}`}>
      <span aria-hidden="true">
        {format(value, grouped)}
        {suffix}
      </span>
      <span className="sr-only">
        {format(to, grouped)}
        {suffix}
      </span>
    </span>
  );
};
