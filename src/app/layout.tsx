import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import { Providers } from './providers';
import '@/src/index.css';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// Public site origin — og:image / canonical URLs must be absolute and point at the live site.
// Override with NEXT_PUBLIC_SITE_URL (e.g. when a custom domain is added); otherwise use
// Vercel's production domain (set automatically at build time, hostname only).
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://panniwala.vercel.app'
).replace(/\/$/, '');
const SITE_NAME = 'পানি ওয়ালা';
const TITLE = 'পানি ওয়ালা | ১০০% বিশুদ্ধ ও নিরাপদ খাবার পানি — খুলনায় হোম ডেলিভারি';
const DESCRIPTION =
  'RO ও UV ফিল্টারকৃত ল্যাব-পরীক্ষিত বিশুদ্ধ খাবার পানি। বাসা-বাড়ি ও অফিসে ২০ লিটার জার মাত্র ৳৪০ — খুলনা শহরে ফ্রি হোম ডেলিভারি।';

// og:image / twitter:image come from app/opengraph-image.jpg + twitter-image.jpg
// (generated from the hero image by scripts/generate-og-image.mjs).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['পানি ওয়ালা', 'Pani Wala', 'বিশুদ্ধ পানি', 'খাবার পানি', '২০ লিটার জার', 'মিনারেল পানি', 'পানি ডেলিভারি', 'খুলনা', 'water delivery Khulna'],
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    locale: 'bn_BD',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The admin dashboard toggles `admin` / `dark` classes on <html> from the client.
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="bg-[#f8fafc] text-slate-900 antialiased selection:bg-cyan-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
