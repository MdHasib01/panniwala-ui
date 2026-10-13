import { WaterPackage } from '@/src/types';
import package1Img from '@/src/assets/package1.png';
import package2Img from '@/src/assets/package2.png';
import package3Img from '@/src/assets/package3.png';
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
    id: 'mineral-5l-pack',
    title: '৫ লিটার বোতল (৪টি বোতল)',
    subtitle: 'ছোট পরিবার বা অফিসের জন্য উপযুক্ত প্যাক',
    volume: '৫ লিটার × ৪টি বোতল',
    price: 400,
    regularPrice: 500,
    unit: '৪ বোতলের প্যাক',
    image: package3Img,
    features: [
      'RO ফিল্টারকৃত বিশুদ্ধ পানি',
      'পরিবার/অফিসের দৈনিক চাহিদার জন্য পারফেক্ট',
      'হালকা ও সহজে বহনযোগ্য',
      'নিরাপদ, স্বাস্থ্যসম্মত ও মান নিয়ন্ত্রিত'
    ],
    depositRequired: false,
    depositAmount: 0,
    iconName: 'sparkles'
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
      'প্রতি মাসে মাত্র ৩৫ টাকার বিশেষ সাবস্ক্রিপশন রেট',
      'নিয়মিত ডেলিভারি ও তাৎক্ষণিক সরবরাহ',
      'প্রতিষ্ঠানের জন্য কাস্টম বিলিং সুবিধা',
      'রেগুলার সার্ভিস ও কাস্টমার সাপোর্ট'
    ],
    depositRequired: true,
    depositAmount: 100,
    iconName: 'building'
  }
];

export const DHAKA_AREAS = [
  'মিরপুর (সব সেকশন)',
  'ধানমন্ডি ও কলাবাগান',
  'গুলশান ১ ও ২',
  'বনানী ও মহাখালী',
  'উত্তরা (সব সেক্টর)',
  'মোহাম্মদপুর ও আদাবর',
  'বসুন্ধরা আবাসিক এলাকা',
  'বাড্ডা ও রামপুরা',
  'মতিঝিল ও পল্টন',
  'খিলগাঁও ও মালিবাগ',
  'লালমাটিয়া ও শুক্রাবাদ',
  'তেজগাঁও ও ফার্মগেট',
  'যাত্রাবাড়ী ও সায়দাবাদ',
  'পুরান ঢাকা ও কোতোয়ালি',
  'চট্টগ্রাম সিটি (জিইসি, আগ্রাবাদ, নাসিরাবাদ)'
];

export const HOTLINE_NUMBER = '০১৭০০-১২৩৪৫৬';
export const HOTLINE_TEL = '+8801700123456';
export const WHATSAPP_NUMBER = '8801700123456';

/**
 * Converts English digits to Bengali numerals for clean Bangla typography.
 */
export const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
};
