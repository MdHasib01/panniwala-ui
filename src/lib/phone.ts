/**
 * Mirrors server/src/utils/phone.js: turns "+880 1712-345678", "8801712345678" or
 * "01712345678" into the local 11-digit form 01XXXXXXXXX.
 */
export function normalizeBdPhone(input: string): string {
  let digits = String(input ?? '').replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('88')) digits = digits.slice(2);
  return digits;
}

export const isBdPhone = (input: string) => /^01[3-9]\d{8}$/.test(normalizeBdPhone(input));

/** Maps the API's English auth errors to Bangla for the website. */
export function authErrorBn(message: string): string {
  if (/invalid .*password/i.test(message)) return 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়';
  if (/suspended/i.test(message)) return 'আপনার অ্যাকাউন্টটি সাময়িকভাবে বন্ধ আছে। সাপোর্টে যোগাযোগ করুন।';
  if (/mobile number already exists/i.test(message)) return 'এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে';
  if (/email already exists/i.test(message)) return 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে';
  if (/valid email/i.test(message)) return 'সঠিক ইমেইল ঠিকানা দিন';
  if (/valid bangladeshi mobile/i.test(message)) return 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
  return message;
}
