import { Link, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/src/admin/components/ui/sonner';
import { TooltipProvider } from '@/src/admin/components/ui/tooltip';
import { Button } from '@/src/admin/components/ui/button';
import { ThemeProvider } from './context/theme';
import { AuthProvider } from '@/src/lib/auth';
import { ConfirmProvider, EmptyState } from './components/shared';
import { DashboardLayout, GuestOnly, RequireRole } from './components/layout';
import { LoginPage, RegisterPage } from './pages/auth';
import { OverviewPage } from './pages/overview';
import { OrdersPage } from './pages/orders';
import { ChatPage } from './pages/chat';
import { PackagesPage } from './pages/packages';
import { UsersPage } from './pages/users';
import { SuppliersPage } from './pages/suppliers';
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

/** Mounted at /admin/* — loaded lazily so the landing page stays lightweight. */
export default function AdminApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          <ConfirmProvider>
            <Routes>
              <Route path="login" element={<GuestOnly><LoginPage /></GuestOnly>} />
              <Route path="register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
              <Route element={<DashboardLayout />}>
                <Route index element={<OverviewPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="packages" element={<RequireRole roles={['admin']}><PackagesPage /></RequireRole>} />
                <Route path="users" element={<RequireRole roles={['admin']}><UsersPage /></RequireRole>} />
                <Route path="suppliers" element={<RequireRole roles={['admin']}><SuppliersPage /></RequireRole>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster position="top-right" richColors closeButton />
          </ConfirmProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
