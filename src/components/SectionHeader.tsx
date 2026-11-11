import React from 'react';

interface SectionHeaderProps {
  title: React.ReactNode;
  /** Extra classes for the wrapper, typically the bottom margin (e.g. "mb-12"). */
  className?: string;
}

/** Shared, centered header used at the top of every landing-page section. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, className = '' }) => (
  <div className={`text-center max-w-3xl mx-auto ${className}`}>
    <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
      {title}
    </h2>
  </div>
);
