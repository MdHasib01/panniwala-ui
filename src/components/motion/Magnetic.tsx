import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer, useReduced } from '@/src/lib/motion';

interface MagneticProps {
  /** How far the element drifts toward the pointer (0.2 to 0.35). */
  strength?: number;
  className?: string;
  children: React.ReactNode;
}

/** Primary-CTA-only wrapper that drifts toward a fine pointer with momentum. */
export const Magnetic: React.FC<MagneticProps> = ({ strength = 0.28, className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReduced();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.6 });
  const active = fine && !reduced;

  const onMove = (e: React.PointerEvent) => {
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className ?? ''}`}
      style={active ? { x, y } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
};
