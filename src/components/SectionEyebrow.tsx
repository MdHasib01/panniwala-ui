import React from 'react';

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** Small label shown above section headings (e.g. "পানির প্যাকেজ ও মূল্যতালিকা"). */
export const SectionEyebrow: React.FC<SectionEyebrowProps> = ({ children, className = '' }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <span className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_8px_rgba(6,182,212,0.6)] shrink-0" />
    <span className="text-sm sm:text-[15px] font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-sky-700 to-blue-700">
      {children}
    </span>
  </div>
);
