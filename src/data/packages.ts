import package1Img from '@/src/assets/package1.png';
import package2Img from '@/src/assets/package2.png';
import package4Img from '@/src/assets/package4.png';

/**
 * Bundled artwork for the default packages, keyed by slug. The package data itself
 * lives in packages.snapshot.json (a snapshot of the database used as a fallback).
 */
export const PACKAGE_IMAGES: Record<string, string> = {
  'ro-20l-jar': package1Img.src,
  'ro-20l-pump-combo': package2Img.src,
  'corporate-monthly': package4Img.src,
};

// Default delivery zones and locations: see src/data/locations.default.json and src/lib/areas-api.ts.


export const HOTLINE_NUMBER = '০১৭০০-১২৩৪৫৬';
export const HOTLINE_TEL = '+8801700123456';
export const WHATSAPP_NUMBER = '8801700123456';

// TODO: replace with the real social media page URLs
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/paniwala',
  instagram: 'https://instagram.com/paniwala',
  youtube: 'https://youtube.com/@paniwala',
};

/**
 * Converts English digits to Bengali numerals for clean Bangla typography.
 */
export const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
};
