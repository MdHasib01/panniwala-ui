import { createContext, useContext } from 'react';
import type { WaterPackage } from '@/src/types';

interface SiteContextValue {
  /** Opens the quick-order modal, optionally with a package preselected. */
  openOrder: (pkg?: WaterPackage) => void;
  /** Opens the mobile "More" drawer. */
  openMore: () => void;
}

export const SiteContext = createContext<SiteContextValue>({
  openOrder: () => {},
  openMore: () => {},
});

export const useSite = () => useContext(SiteContext);

export const ROLE_LABEL_BN = {
  user: 'গ্রাহক',
  supplier: 'সাপ্লায়ার',
  admin: 'অ্যাডমিন',
} as const;

export const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
