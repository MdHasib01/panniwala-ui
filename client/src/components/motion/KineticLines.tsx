import React from 'react';
import { motion } from 'motion/react';
import { EASE_OUT, useReduced } from '@/src/lib/motion';

interface KineticLinesProps {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}

/**
 * Headline whose lines slide up from behind a mask on mount. The mask is padded
 * so Bengali vowel signs above the matra and below the baseline are never sheared.
 */
export const KineticLines: React.FC<KineticLinesProps> = ({ lines, className, lineClassName, delay = 0.1 }) => {
  const reduced = useReduced();
  return (
    <h1 className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden py-[0.14em] -my-[0.14em]">
          <motion.span
            className={`block ${lineClassName ?? ''}`}
            initial={reduced ? { opacity: 0 } : { y: '108%' }}
            animate={reduced ? { opacity: 1 } : { y: '0%' }}
            transition={{ duration: reduced ? 0.4 : 0.9, ease: EASE_OUT, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};
