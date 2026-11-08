import React from 'react';

interface SectionHeaderProps {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Extra classes for the wrapper, typically the bottom margin (e.g. "mb-12"). */
  className?: string;
}

/** Shared, centered header used at the top of every landing-page section. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, className = '' }) => (
  <div className={`text-center max-w-3xl mx-auto ${className}`}>
    <p className="text-sm sm:text-[15px] font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 inline-block">
      {eyebrow}
    </p>

    <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
      {title}
    </h2>

    {subtitle && (
      <p className="mt-3max-w-2xl mx-auto text-sm sm:text-base text-slate-500 leading-relaxed text-pretty">
        {subtitle}
      </p>
    )}
  </div>
);
