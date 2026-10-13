import React from 'react';
import { BrandLogo } from '@/src/components/BrandLogo';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-white/75 pt-16 pb-32 md:pb-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="bg-white/95 p-2 rounded-2xl inline-block">
              <BrandLogo size="md" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">পানি ওয়ালা</strong> বাংলাদেশে শতভাগ নিরাপদ, সুপেয় ও ল্যাব-পরীক্ষিত মিনারেল খাবার পানি সরবরাহের একটি শীর্ষস্থানীয় প্ল্যাটফর্ম। আমরা পরিবার ও প্রতিষ্ঠানের স্বাস্থ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ।
            </p>
            <div className="flex items-center gap-2 text-xs text-water font-semibold bg-white/5 p-2.5 rounded-xl ring-1 ring-white/10">
              <ShieldCheck className="w-4 h-4 text-water shrink-0" />
              <span>BSTI সার্টিফাইড <strong className="font-bold text-white">BDS-1414</strong> কমপ্লায়েন্ট</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#packages" className="hover:text-water transition-colors">
                  পানির প্যাকেজ ও রেট চার্ট
                </a>
              </li>
              <li>
                <a href="#areas" className="hover:text-water transition-colors">
                  ডেলিভারি এরিয়া ও হাবসমূহ
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-water transition-colors">
                  গ্রাহক রিভিউ ও অভিজ্ঞতা
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-water transition-colors">
                  সাধারণ প্রশ্ন ও উত্তর
                </a>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              প্রধান ডেলিভারি হাব (খুলনা)
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
              {['সোনাডাঙ্গা', 'বয়রা', 'খালিশপুর', 'দৌলতপুর', 'শিববাড়ি মোড়', 'নিরালা', 'ময়লাপোতা', 'রয়্যাল মোড়', 'মুজগুন্নি', 'রূপসা'].map(
                (place, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white/5 rounded-lg ring-1 ring-white/10"
                  >
                    {place}
                  </span>
                )
              )}
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              প্রতিদিন সকাল <strong className="font-bold text-slate-200">৭টা</strong> থেকে রাত <strong className="font-bold text-slate-200">১০টা</strong> পর্যন্ত নিরবচ্ছিন্ন ডেলিভারি।
            </p>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              যোগাযোগ ও হটলাইন
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <a
                href={`tel:${HOTLINE_TEL}`}
                className="flex items-center gap-2 hover:text-water transition-colors"
              >
                <Phone className="w-4 h-4 text-water shrink-0" />
                <span className="font-bold text-sm text-white">{HOTLINE_NUMBER}</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-water shrink-0" />
                <span>support@paniwala.com.bd</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400 pt-1">
                <MapPin className="w-4 h-4 text-water shrink-0 mt-0.5" />
                <span>কেডিএ এভিনিউ, শিববাড়ি মোড়, সোনাডাঙ্গা, খুলনা-<strong className="font-bold text-slate-200">৯১০০</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
          <p>
            © <strong className="font-bold text-slate-400">{new Date().getFullYear()}</strong> পানি ওয়ালা (Pani Wala). সর্বস্বত্ব সংরক্ষিত। ট্রেড লাইসেন্স নং: TRAD/KCC/<strong className="font-bold text-slate-400">049182</strong>
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>বিশুদ্ধ পানির সাথে সুস্বাস্থ্য বজায় রাখুন</span>
            <Heart className="w-3.5 h-3.5 text-water fill-water inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
