import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/src/admin/components/ui/sonner';
import { TooltipProvider } from '@/src/admin/components/ui/tooltip';
import { Button } from '@/src/admin/components/ui/button';
import { ThemeProvider } from './context/theme';
import { ConfirmProvider, EmptyState } from './components/shared';
import { DashboardLayout, GuestOnly } from './components/layout';
import { LoginPage } from './pages/auth';
import { OverviewPage } from './pages/overview';
import { OrdersPage } from './pages/orders';
import { ChatPage } from './pages/chat';
import { PackagesPage } from './pages/packages';
import { UsersPage } from './pages/users';
import { SuppliersPage } from './pages/suppliers';
import { AreasPage } from './pages/areas';
import { ProfilePage } from './pages/profile';

function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="This dashboard page doesn't exist."
      action={<Button asChild><Link to="/admin">Back to overview</Link></Button>}
    />
  );
}

/**
 * Mounted at /admin/* — admins only (DashboardLayout redirects everyone else to
 * their pages on the website). Auth and the socket come from the app root.
 * Loaded lazily so the landing page stays lightweight.
 */
export default function AdminApp() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ConfirmProvider>
          <Routes>
            <Route path="login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            {/* Sign-up is for customers and suppliers, which happens on the website. */}
            <Route path="register" element={<Navigate to="/register" replace />} />
            <Route element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="areas" element={<AreasPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </ConfirmProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
