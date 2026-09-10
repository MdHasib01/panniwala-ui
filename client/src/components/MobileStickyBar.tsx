import React from 'react';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { Phone, ShoppingBag } from 'lucide-react';

interface MobileStickyBarProps {
  onOpenOrder: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ onOpenOrder }) => {
  return (
    <div
      id="mobile-sticky-cta-bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-3 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-2">
        {/* Direct Phone Call Button */}
        <a
          id="mobile-call-btn"
          href={`tel:${HOTLINE_TEL}`}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs active:scale-[0.98] transition-all border border-slate-200"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] text-slate-500 font-normal">সরাসরি কল</span>
            <span className="text-xs font-bold text-slate-900">{HOTLINE_NUMBER}</span>
          </div>
        </a>

        {/* Order Now CTA Button */}
        <button
          id="mobile-order-btn"
          onClick={onOpenOrder}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-bold text-sm shadow-md shadow-cyan-600/30 active:scale-[0.98] transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>এখনই অর্ডার</span>
        </button>
      </div>
    </div>
  );
};
