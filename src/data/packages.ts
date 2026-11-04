import { WaterPackage } from '@/src/types';
import package1Img from '@/src/assets/package1.png';
import package2Img from '@/src/assets/package2.png';
import package4Img from '@/src/assets/package4.png';

export const WATER_PACKAGES: WaterPackage[] = [
  {
    id: 'ro-20l-jar',
    title: '২০ লিটার বিশুদ্ধতার জার',
    subtitle: 'বাসা-বাড়ি ও পরিবারের জন্য সবচেয়ে জনপ্রিয়',
    volume: '২০ লিটার',
    price: 40,
    regularPrice: 60,
    unit: 'প্রতি জার',
    popular: true,
    image: package1Img,
    features: [
      '৭ ধাপে RO বিশুদ্ধকরণ',
      'ল্যাবটেস্টেড, ব্যাক্টেরিয়া মুক্ত পানি',
      'ফ্রি হোম ডেলিভারি'
    ],
    depositRequired: true,
    depositAmount: 100,
    iconName: 'droplets'
  },
  {
    id: 'ro-20l-pump-combo',
    title: '২০ লিটার জার + ওয়াটার মেশিন',
    subtitle: 'নতুন সংযোগের জন্য নির্ভরযোগ্য সমাধান',
    volume: '২০ লিটার + মেশিন',
    price: 199,
    regularPrice: 1200,
    unit: 'প্রথম সেট',
    bestValue: true,
    image: package2Img,
    features: [
      'হট, নরমাল ও কোল্ড ডিসপেনসার',
      'প্রথম ২০ লিটার জার সহ',
      '১ বছরের সার্ভিস ওয়ারেন্টি'
    ],
    depositRequired: false,
    depositAmount: 0,
    iconName: 'zap'
  },
  {
    id: 'corporate-monthly',
    title: 'অফিস সাবস্ক্রিপশন',
    subtitle: 'অফিস, রেস্টুরেন্ট ও বাণিজ্যিক প্রতিষ্ঠানের জন্য বিশেষ প্যাকেজ',
    volume: 'অফিস/প্রতিষ্ঠান',
    price: 35,
    regularPrice: 50,
    unit: 'প্রতি জার',
    image: package4Img,
    features: [
      'বিশেষ সাবস্ক্রিপশন রেট',
      'নিয়মিত ও দ্রুত ডেলিভারি',
      'কাস্টম মাসিক বিলিং'
    ],
    depositRequired: true,
    depositAmount: 100,
    iconName: 'building'
  }
];

export const KHULNA_AREAS = [
  'সোনাডাঙ্গা আবাসিক (১ম ও ২য় ফেজ)',
  'বয়রা ও মুজগুন্নি',
  'খালিশপুর হাউজিং এস্টেট',
  'দৌলতপুর ও ফুলবাড়ীগেট',
  'শিববাড়ি মোড় ও কেডিএ এভিনিউ',
  'রয়্যাল মোড় ও শান্তিধাম মোড়',
  'নিরালা আবাসিক এলাকা',
  'ময়লাপোতা ও আহসান আহমেদ রোড',
  'গল্লামারী ও জিরো পয়েন্ট',
  'ডাকবাংলা ও পিকচার প্যালেস',
  'রূপসা ও রূপসা ঘাট',
  'নতুন বাজার ও বড় বাজার',
  'খান জাহান আলী রোড',
  'কুয়েট ও তেলিগাতী এলাকা'
];


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
