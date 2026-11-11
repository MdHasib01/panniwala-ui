import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/src/components/BrandLogo';
import {
  HOTLINE_NUMBER,
  HOTLINE_TEL,
  WHATSAPP_NUMBER,
  SOCIAL_LINKS,
} from '@/src/data/packages';
import { ArrowUpRight, MapPin, MessageCircle, Phone } from 'lucide-react';

const navLinks = [
  { label: 'প্যাকেজ', href: '/#packages' },
  { label: 'সার্ভিস এরিয়া', href: '/#areas' },
  { label: 'রিভিউ', href: '/#reviews' },
  { label: 'প্রশ্নোত্তর', href: '/#faq' },
];

const socials = [
  {
    label: 'Facebook',
    href: SOCIAL_LINKS.facebook,
    hover: 'hover:bg-[#1877F2]',
    path: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z',
  },
  {
    label: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    hover: 'hover:bg-[#E4405F]',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'YouTube',
    href: SOCIAL_LINKS.youtube,
    hover: 'hover:bg-[#FF0000]',
    path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'WhatsApp',
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    hover: 'hover:bg-[#25D366]',
    path: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z',
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative hidden overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-400 md:block">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-40 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-8 py-10 lg:gap-16 lg:py-12">
          <div>
            <Link href="/" aria-label="পানি ওয়ালা হোম" className="inline-flex rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              <BrandLogo size="lg" inverse />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
              বাসা ও অফিসের জন্য নিরাপদ ও বিশুদ্ধ খাবার পানি। খুলনা শহরে আপনার দরজায় পৌঁছে দিই।
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 ${s.hover}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="ফুটার নেভিগেশন" className="pt-2">
            <h3 className="mb-4 text-base font-semibold text-white">প্রয়োজনীয় লিংক</h3>
            <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-2 rounded-md py-2 text-sm transition-colors hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-slate-600 transition-colors group-hover:text-cyan-300" />
                </Link>
              </li>
            ))}
            </ul>
          </nav>

          <div className="pt-2">
            <h3 className="mb-5 text-base font-semibold text-white">যোগাযোগ করুন</h3>
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="group inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
                <Phone aria-hidden="true" className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs text-slate-400">অর্ডার ও সহায়তা</span>
                <span className="mt-1 block font-hind text-base font-semibold text-white transition-colors group-hover:text-cyan-300">{HOTLINE_NUMBER}</span>
              </span>
            </a>
            <p className="mt-5 flex items-center gap-2 text-sm">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-300" />
              খুলনা শহরে হোম ডেলিভারি
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md py-2 text-sm text-slate-300 transition-colors hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              WhatsApp-এ কথা বলুন
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 py-5 text-xs">
          <p>© {new Date().getFullYear()} পানি ওয়ালা। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-slate-500">বিশুদ্ধ পানিতে, সুস্থ প্রতিদিন।</p>
        </div>
      </div>
    </footer>
  );
};
