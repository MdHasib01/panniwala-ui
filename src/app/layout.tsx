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

const TITLE = 'পানি ওয়ালা | নিরাপদ ও বিশুদ্ধ পানির বিশ্বস্ত সরবরাহ';
const DESCRIPTION =
  'বাংলাদেশে নিরাপদ ও বিশুদ্ধ খাবার পানি সরবরাহের বিশ্বস্ত সেবা। বাসা-বাড়ি, অফিস ও প্রতিষ্ঠানে দ্রুত ২০ লিটার জার ও মিনারেল পানি ডেলিভারি।';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
  twitter: { card: 'summary_large_image' },
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
