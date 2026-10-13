import { useEffect, useState } from 'react';
import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, type Variants } from 'motion/react';

/**
 * Scroll progress as a plain JS-driven motion value. motion hands raw useScroll
 * values to the browser's native scroll timeline, which mis-maps tall sticky
 * sections and snaps styles back to their first keyframe once the range ends.
 * Re-publishing the value through an event keeps every transform on the JS path.
 */
export const useScrollProgress = (options?: Parameters<typeof useScroll>[0]) => {
  const { scrollYProgress } = useScroll(options);
  const progress = useMotionValue(scrollYProgress.get());
  useMotionValueEvent(scrollYProgress, 'change', (v) => progress.set(v));
  return progress;
};

/** Strong ease-out used for every entrance on the page. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Premium fade-in: opacity from 0 and a 14px rise over 620ms. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE_OUT } },
};

/** Reduced-motion variant: keeps the fade that carries comprehension, drops the rise. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

/** True only for a real mouse or trackpad, so touch never fires a false hover. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

/** Normalised reduced-motion flag (motion returns null before it knows). */
export const useReduced = () => Boolean(useReducedMotion());

/**
 * Keyframes for a crossfade window inside a pinned stage: fade in just after
 * `from`, hold, fade out just before `to`. Neighbouring windows overlap only by a
 * sliver, so the stage is never empty but two lines are never legible at once.
 */
export const cueWindow = (from: number, to: number, ramp = 0.025) => ({
  input: [from - 0.005, from + ramp, to - ramp, to + 0.005],
  output: [0, 1, 1, 0],
});
