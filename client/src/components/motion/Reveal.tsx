import React from 'react';
import { motion } from 'motion/react';
import { fadeOnly, fadeUp, useReduced } from '@/src/lib/motion';

type RevealTag = 'div' | 'ul' | 'ol' | 'section' | 'article' | 'header';

interface RevealProps {
  as?: RevealTag;
  className?: string;
  /** Delay between children, in seconds (30 to 80ms reads as premium). */
  stagger?: number;
  delay?: number;
  children: React.ReactNode;
}

/**
 * Stagger container that fires once when it is a little inside the viewport.
 * Direct children wrapped in <RevealItem> rise in reading order.
 */
export const Reveal: React.FC<RevealProps> = ({
  as = 'div',
  className,
  stagger = 0.06,
  delay = 0,
  children,
}) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
};

interface RevealItemProps {
  as?: 'div' | 'li' | 'p' | 'h2' | 'h3' | 'span' | 'article';
  className?: string;
  children: React.ReactNode;
}

export const RevealItem: React.FC<RevealItemProps> = ({ as = 'div', className, children }) => {
  const reduced = useReduced();
  const Comp = motion[as];
  return (
    <Comp className={className} variants={reduced ? fadeOnly : fadeUp}>
      {children}
    </Comp>
  );
};
