import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrandLogo } from '@/src/components/BrandLogo';
import { HOME_NAV_ID, NAV_ITEMS, NavItem } from '@/src/data/navigation';
import { HOTLINE_NUMBER, HOTLINE_TEL, WHATSAPP_CHAT_URL } from '@/src/data/packages';
import {
  ChevronRight,
  LayoutGrid,
  MessageCircle,
  Phone,
  ShoppingBag,
  X,
  type LucideIcon,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenOrder: () => void;
}

// Minimum width each bottom bar slot needs to keep icon + label readable
const SLOT_WIDTH = 68;
const MORE_ID = 'more';

const scrollToSection = (id: string) => {
  if (id === HOME_NAV_ID) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Tracks which page section is currently around the upper part of the viewport. */
const useActiveSection = () => {
  const [activeId, setActiveId] = useState(HOME_NAV_ID);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = window.innerHeight * 0.4;
      let current = HOME_NAV_ID;
      for (const item of NAV_ITEMS) {
        if (item.id === HOME_NAV_ID) continue;
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= marker) current = item.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return activeId;
};

/** Number of slots that fit in the bar, recalculated whenever the bar resizes. */
const useSlotCount = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [slots, setSlots] = useState(() =>
    typeof window === 'undefined' ? 5 : Math.floor((window.innerWidth - 24) / SLOT_WIDTH)
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      if (width > 0) setSlots(Math.floor(width / SLOT_WIDTH));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return Math.max(4, slots);
};

interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  expanded?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, active, onClick, expanded }) => (
  <button
    id={`bottom-nav-${id}`}
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    aria-expanded={expanded}
    className="group flex-1 min-w-0 flex flex-col items-center justify-center gap-1 select-none focus:outline-none"
  >
    <span className="relative flex items-center justify-center w-14 h-8 rounded-full transition-transform duration-150 group-active:scale-90">
      {active && (
        <motion.span
          layoutId="bottom-nav-active-pill"
          className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-100 to-sky-100 ring-1 ring-cyan-200/70"
          transition={{ type: 'spring', stiffness: 520, damping: 38 }}
        />
      )}
      <Icon
        className={`relative w-[22px] h-[22px] transition-colors ${
          active ? 'text-cyan-700' : 'text-slate-500 group-hover:text-slate-700'
        }`}
        strokeWidth={active ? 2.4 : 1.9}
      />
    </span>
    <span
      className={`max-w-full truncate px-0.5 text-[11px] leading-none transition-colors ${
        active ? 'font-bold text-cyan-800' : 'font-medium text-slate-500'
      }`}
    >
      {label}
    </span>
  </button>
);

const OrderButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="flex-1 min-w-0 flex flex-col items-center justify-end pb-1.5">
    <button
      id="bottom-nav-order-btn"
      type="button"
      onClick={onClick}
      aria-label="এখনই অর্ডার করুন"
      className="relative -mt-8 mb-1 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 via-cyan-600 to-sky-700 text-white ring-[5px] ring-white shadow-lg shadow-cyan-600/40 transition-transform duration-150 active:scale-90 focus:outline-none focus-visible:ring-cyan-200"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/25 pointer-events-none" />
      <ShoppingBag className="relative w-6 h-6" strokeWidth={2.2} />
    </button>
    <span className="text-[11px] leading-none font-bold text-cyan-700">অর্ডার</span>
  </div>
);

interface MoreSheetProps {
  open: boolean;
  items: NavItem[];
  activeId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

const MoreSheet: React.FC<MoreSheetProps> = ({ open, items, activeId, onClose, onNavigate }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.aside
            id="mobile-more-sidebar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-more-title"
            className="absolute right-0 inset-y-0 w-[min(85vw,320px)] flex flex-col bg-white rounded-l-2xl shadow-2xl shadow-slate-900/30 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            {/* Header */}
            <div className="relative px-5 pt-6 pb-5 bg-gradient-to-br from-cyan-50 via-sky-50 to-white border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <BrandLogo size="sm" className="min-w-0" />
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="মেনু বন্ধ করুন"
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 shadow-xs hover:text-slate-900 active:scale-90 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              {/* Overflow nav links */}
              <div>
                <h2
                  id="mobile-more-title"
                  className="px-1 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                >
                  আরও মেনু
                </h2>
                <ul className="space-y-1.5">
                  {items.map(({ id, label, icon: Icon }) => {
                    const active = id === activeId;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => onNavigate(id)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors active:scale-[0.98] ${
                            active
                              ? 'bg-cyan-50 ring-1 ring-cyan-200/70'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl ${
                              active
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                                : 'bg-cyan-50 text-cyan-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" strokeWidth={2.1} />
                          </span>
                          <span
                            className={`flex-1 text-[15px] ${
                              active ? 'font-bold text-cyan-900' : 'font-semibold text-slate-700'
                            }`}
                          >
                            {label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Quick contact actions */}
              <div>
                <h3 className="px-1 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  যোগাযোগ
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${HOTLINE_TEL}`}
                    className="flex flex-col gap-2 p-3 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-md shadow-cyan-600/25 active:scale-[0.97] transition-transform"
                  >
                    <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20">
                      <Phone className="w-4.5 h-4.5" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[11px] text-cyan-100">সরাসরি কল</span>
                      <span className="block text-[13px] font-bold">{HOTLINE_NUMBER}</span>
                    </span>
                  </a>
                  <a
                    href={WHATSAPP_CHAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70 active:scale-[0.97] transition-transform"
                  >
                    <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#25D366] text-white">
                      <MessageCircle className="w-4.5 h-4.5" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[11px] text-emerald-700">হোয়াটসঅ্যাপ</span>
                      <span className="block text-[13px] font-bold">চ্যাট করুন</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 text-center text-[11px] text-slate-500">
              খুলনা সিটিতে ১ ঘণ্টার মধ্যে ফ্রি হোম ডেলিভারি
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenOrder }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const activeId = useActiveSection();
  const slots = useSlotCount(barRef);

  // One slot is always taken by the center order button
  const allFit = NAV_ITEMS.length + 1 <= slots;
  const visibleItems = allFit ? NAV_ITEMS : NAV_ITEMS.slice(0, slots - 2);
  const overflowItems = allFit ? [] : NAV_ITEMS.slice(slots - 2);
  const overflowActive = overflowItems.some((item) => item.id === activeId);

  const closeMore = React.useCallback(() => setMoreOpen(false), []);

  // Screen got wide enough for every item: the sidebar has nothing left to show
  useEffect(() => {
    if (allFit) setMoreOpen(false);
  }, [allFit]);

  const handleSheetNavigate = (id: string) => {
    setMoreOpen(false);
    // Wait for the body scroll lock to be released before scrolling
    setTimeout(() => scrollToSection(id), 60);
  };

  const sideTabs: React.ReactNode[] = visibleItems.map((item) => (
    <TabButton
      key={item.id}
      id={item.id}
      label={item.shortLabel}
      icon={item.icon}
      active={!moreOpen && item.id === activeId}
      onClick={() => scrollToSection(item.id)}
    />
  ));

  if (!allFit) {
    sideTabs.push(
      <TabButton
        key={MORE_ID}
        id={MORE_ID}
        label="আরও"
        icon={LayoutGrid}
        active={moreOpen || overflowActive}
        expanded={moreOpen}
        onClick={() => setMoreOpen(true)}
      />
    );
  }

  const centerIndex = Math.ceil(sideTabs.length / 2);
  const tabs = [
    ...sideTabs.slice(0, centerIndex),
    <OrderButton key="order" onClick={onOpenOrder} />,
    ...sideTabs.slice(centerIndex),
  ];

  return (
    <>
      <nav
        id="mobile-bottom-nav"
        aria-label="মোবাইল নেভিগেশন"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
      >
        <div
          ref={barRef}
          className="pointer-events-auto relative flex items-stretch h-16 rounded-[26px] bg-white/85 backdrop-blur-xl ring-1 ring-slate-900/[0.06] shadow-[0_10px_40px_-8px_rgba(15,23,42,0.25),0_2px_8px_rgba(15,23,42,0.06)]"
        >
          {tabs}
        </div>
      </nav>

      <MoreSheet
        open={moreOpen}
        items={overflowItems}
        activeId={activeId}
        onClose={closeMore}
        onNavigate={handleSheetNavigate}
      />
    </>
  );
};
