import SiteShell from '@/src/site/SiteShell';

/** Website shell: landing page + customer/supplier pages (navbar, footer, bottom nav, order modal). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
