import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Droplets, HelpCircle, Home, Package, Phone } from 'lucide-react';
import { BrandLogo } from '@/src/components/BrandLogo';
import { HOTLINE_NUMBER, HOTLINE_TEL } from '@/src/data/packages';

const quickLinks = [
  { to: '/#packages', label: 'প্যাকেজ ও মূল্য', icon: Package },
  { to: '/#faq', label: 'সাধারণ জিজ্ঞাসা', icon: HelpCircle },
];

export const NotFound: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = 'পেজটি পাওয়া যায়নি | পানি ওয়ালা';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <Link to="/" className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl">
            <BrandLogo size="sm" />
          </Link>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="relative w-full max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-sm">
            <Droplets className="h-8 w-8" />
          </div>

          <p className="text-7xl sm:text-8xl font-bold tracking-tight leading-none bg-gradient-to-b from-cyan-500 to-cyan-800 bg-clip-text text-transparent">
            ৪০৪
          </p>

          <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-slate-900">
            দুঃখিত, পেজটি পাওয়া যায়নি
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            আপনি যে পেজটি খুঁজছেন সেটি হয়তো সরিয়ে ফেলা হয়েছে, নাম পরিবর্তন হয়েছে
            অথবা কখনো ছিলই না।
          </p>
          <p className="mt-2 inline-block max-w-full truncate rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500">
            {pathname}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition-all hover:bg-cyan-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Home className="h-4 w-4" />
              হোম পেজে ফিরে যান
            </Link>
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Phone className="h-4 w-4 text-emerald-600" />
              কল করুন: {HOTLINE_NUMBER}
            </a>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">অথবা দেখে নিন:</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                // Plain anchor (full load) so the browser scrolls to the section hash.
                <a
                  key={to}
                  href={to}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-3.5 py-1.5 text-sm font-medium text-cyan-800 transition-colors hover:bg-cyan-100"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                আগের পেজে যান
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} পানি ওয়ালা — নিরাপদ ও বিশুদ্ধ পানির বিশ্বস্ত সরবরাহ
      </footer>
    </div>
  );
};

export default NotFound;
