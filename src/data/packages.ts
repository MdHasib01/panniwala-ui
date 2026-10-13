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
      '৭ ধাপে বিশুদ্ধকরণ (RO) ফিল্টারিং',
      'ক্ষতিকর মিনারেল ও ব্যাক্টেরিয়া মুক্ত, pH ৭.২',
      'নিয়মিত মান নিয়ন্ত্রণ ও ল্যাবটেস্টেড পানি',
      'ফ্রি কলসার এবং ডেলিভারি'
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
      'হট, নরমাল ও কোল্ড অপশন আধুনিক ওয়াটার ডিসপেনসার মেশিন',
      'প্রথম জার ২০ লিটার বিশুদ্ধ পানি সহ',
      'সহজ ইনস্টলেশন ও ব্যবহার',
      '১ বছরের সার্ভিস ওয়ারেন্টি'
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
    price: 0,
    unit: 'আলোচনা সাপেক্ষে',
    isCustomPricing: true,
    callOnly: true,
    image: package4Img,
    features: [
      'নিয়মিত ডেলিভারি ও তাৎক্ষণিক সরবরাহ',
      'প্রতিষ্ঠানের জন্য কাস্টম বিলিং সুবিধা',
      'রেগুলার সার্ভিস ও কাস্টমার সাপোর্ট'
    ],
    depositRequired: false,
    depositAmount: 0,
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
export const WHATSAPP_CHAT_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'আসসালামু আলাইকুম, আমি পানি ওয়ালা থেকে খাবার পানির জার অর্ডার করতে চাই।'
)}`;

/**
 * Converts English digits to Bengali numerals for clean Bangla typography.
 */
export const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
};
