import React from 'react';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-4 pb-20 md:pb-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <p>© {new Date().getFullYear()} পানি ওয়ালা। সর্বস্বত্ব সংরক্ষিত।</p>
        <a
          href={`tel:${HOTLINE_TEL}`}
          className="flex items-center gap-1.5 text-white font-semibold hover:text-cyan-400 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-cyan-400" />
          {HOTLINE_NUMBER}
        </a>
      </div>
    </footer>
  );
};
