import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  PackageSearch,
  MessageCircle,
  Truck,
  UserRound,
  LayoutDashboard,
  LayoutGrid,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/lib/auth';
import { useSocket } from '@/src/lib/socket';
import { useSite } from '@/src/site/context';

type Tab =
  | { kind: 'link'; to: string; label: string; icon: LucideIcon; badge?: number }
  | { kind: 'order' }
  | { kind: 'more' };

/** Tabs for the current role. Guests and customers get a raised "Order" button in the middle. */
function useTabs(): Tab[] {
  const { user } = useAuth();
  const { unreadChats } = useSocket();
  const home: Tab = { kind: 'link', to: '/', label: 'হোম', icon: Home };

  if (!user) {
    return [
      home,
      { kind: 'link', to: '/#packages', label: 'প্যাকেজ', icon: Package },
      { kind: 'order' },
      { kind: 'link', to: '/orders', label: 'ট্র্যাক', icon: PackageSearch },
      { kind: 'more' },
    ];
  }
  if (user.role === 'supplier') {
    return [
      home,
      { kind: 'link', to: '/deliveries', label: 'ডেলিভারি', icon: Truck },
      { kind: 'link', to: '/chat', label: 'মেসেজ', icon: MessageCircle, badge: unreadChats },
      { kind: 'link', to: '/profile', label: 'প্রোফাইল', icon: UserRound },
      { kind: 'more' },
    ];
  }
  if (user.role === 'admin') {
    return [
      home,
      { kind: 'link', to: '/#packages', label: 'প্যাকেজ', icon: Package },
      { kind: 'order' },
      { kind: 'link', to: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
      { kind: 'more' },
    ];
  }
  return [
    home,
    { kind: 'link', to: '/orders', label: 'আমার অর্ডার', icon: Package },
    { kind: 'order' },
    { kind: 'link', to: '/chat', label: 'মেসেজ', icon: MessageCircle, badge: unreadChats },
    { kind: 'more' },
  ];
}

/* Geometry of the curved bar (px). */
const CORNER = 24; // rounded top corners of the bar
const FAB = 60; // diameter of the round Order button
const DOME = FAB / 2 + 6; // radius of the raised curve that wraps over the button
const FILLET = 12; // smooths the edge where the bar rises into the dome

/** Bar outline: rounded top corners and (optionally) a smooth dome rising over the middle button. */
function barPath(w: number, h: number, dome: boolean) {
  const r = Math.min(CORNER, w / 2);
  let top = `L ${w - r} 0`;
  if (dome) {
    const cx = w / 2;
    // Fillet circle sits just above the top edge, tangent to it and to the dome circle.
    const xf = cx - Math.sqrt((DOME + FILLET) ** 2 - FILLET ** 2);
    const k = DOME / (DOME + FILLET);
    const px = cx + k * (xf - cx);
    const py = -k * FILLET;
    top =
      `L ${xf} 0 ` +
      `A ${FILLET} ${FILLET} 0 0 0 ${px} ${py} ` +
      `A ${DOME} ${DOME} 0 0 1 ${2 * cx - px} ${py} ` +
      `A ${FILLET} ${FILLET} 0 0 0 ${2 * cx - xf} 0 ` +
      top;
  }
  return `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 ${top} A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
}

/**
 * App-style bottom navigation for phones (replaces the top hamburger menu).
 * Hidden from md up, where the regular navbar takes over.
 */
export const BottomNav: React.FC = () => {
  const { pathname, hash } = useLocation();
  const { openOrder, openMore } = useSite();
  const tabs = useTabs();
  const hasOrder = tabs.some((t) => t.kind === 'order');

  // Measure the bar so the SVG outline (corners + notch) matches its real size.
  const navRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isActive = (to: string) => {
    const [path, h] = to.split('#');
    if (h) return pathname === path && hash === `#${h}`;
    if (path === '/') return pathname === '/' && hash !== '#packages';
    return pathname.startsWith(path);
  };

  const item = 'relative flex flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 text-[11px] font-semibold transition-colors';

  return (
    <nav
      ref={navRef}
      aria-label="প্রধান নেভিগেশন"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      {size.w > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_-3px_12px_rgba(15,23,42,0.10)]"
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="none"
        >
          <path d={barPath(size.w, size.h, hasOrder)} className="fill-white" />
        </svg>
      )}
      <div className="relative mx-auto flex h-16 max-w-md items-stretch px-1">
        {tabs.map((tab, i) => {
          if (tab.kind === 'order') {
            return (
              <div key="order" className="flex flex-1 items-start justify-center">
                <button
                  id="bottom-nav-order-btn"
                  onClick={() => openOrder()}
                  style={{ marginTop: -FAB / 2 }}
                  className="flex flex-col items-center gap-1 text-[11px] font-bold text-cyan-700"
                >
                  <span
                    style={{ width: FAB, height: FAB }}
                    className="btn-shine flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-600/40 active:scale-95 transition-transform"
                  >
                    <ShoppingBag className="h-6 w-6" />
                  </span>
                  অর্ডার
                </button>
              </div>
            );
          }
          if (tab.kind === 'more') {
            return (
              <button key="more" onClick={openMore} className={cn(item, 'text-slate-500 active:text-cyan-700')}>
                <LayoutGrid className="h-[22px] w-[22px]" />
                আরও
              </button>
            );
          }
          const active = isActive(tab.to);
          return (
            <Link
              key={`${tab.to}-${i}`}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={cn(item, active ? 'text-cyan-700' : 'text-slate-500 active:text-cyan-700')}
            >
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-cyan-600" />}
              <span className="relative">
                <tab.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
                {!!tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] leading-4 font-bold text-white ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
