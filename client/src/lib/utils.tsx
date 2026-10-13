import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses text and wraps any numbers (Bengali and English digits, decimals, fractions, ranges, percentages) in a bold tag.
 */
export function boldNumbers(text: string, boldClassName: string = 'font-bold'): React.ReactNode {
  if (!text) return text;
  // Regex captures Bengali or Latin numbers with decimals, slashes, commas, and percentage/plus signs
  const parts = text.split(/([০-৯0-9]+(?:[,\.\/][০-৯0-9]+)*[%+]?)/g);
  return parts.map((part, index) => {
    if (/[০-৯0-9]/.test(part)) {
      return (
        <strong key={index} className={boldClassName}>
          {part}
        </strong>
      );
    }
    return part;
  });
}
