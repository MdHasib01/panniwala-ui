import { House, Droplets, Package, MapPin, Star, CircleQuestionMark, type LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
}

export const HOME_NAV_ID = 'top';

// In page order (active-section tracking relies on it); items at the end move into the "More" sidebar first on narrow screens
export const NAV_ITEMS: NavItem[] = [
  { id: HOME_NAV_ID, label: 'হোম', shortLabel: 'হোম', href: '#top', icon: House },
  { id: 'purity', label: 'বিশুদ্ধতা', shortLabel: 'বিশুদ্ধতা', href: '#purity', icon: Droplets },
  { id: 'packages', label: 'প্যাকেজ সমূহ', shortLabel: 'প্যাকেজ', href: '#packages', icon: Package },
  { id: 'areas', label: 'সার্ভিস এরিয়া', shortLabel: 'এরিয়া', href: '#areas', icon: MapPin },
  { id: 'reviews', label: 'রিভিউ', shortLabel: 'রিভিউ', href: '#reviews', icon: Star },
  { id: 'faq', label: 'প্রশ্নোত্তর', shortLabel: 'প্রশ্নোত্তর', href: '#faq', icon: CircleQuestionMark },
];

export const SECTION_NAV_ITEMS = NAV_ITEMS.filter((item) => item.id !== HOME_NAV_ID);
