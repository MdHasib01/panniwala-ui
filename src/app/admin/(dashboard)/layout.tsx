import { DashboardLayout } from '@/src/admin/components/layout';

/** Sidebar + header shell; redirects guests to /admin/login and non-admins to their own pages. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
