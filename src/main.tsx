import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import HomePage from './pages/Home.tsx';
import { NotFound } from './components/NotFound.tsx';
import { AuthProvider } from './lib/auth.tsx';
import { SocketProvider } from './lib/socket.tsx';
import { RequireAuth } from './account/ui.tsx';
import './index.css';

// The admin dashboard (charts, shadcn) is split into its own chunk — admins only.
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));

// Customer & supplier pages on the website, loaded on demand.
const LoginPage = lazy(() => import('./account/AuthPages.tsx').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./account/AuthPages.tsx').then((m) => ({ default: m.RegisterPage })));
const MyOrdersPage = lazy(() => import('./account/MyOrders.tsx'));
const DeliveriesPage = lazy(() => import('./account/Deliveries.tsx'));
const SupportChatPage = lazy(() => import('./account/SupportChat.tsx'));
const ProfilePage = lazy(() => import('./account/Profile.tsx'));

function AdminFallback() {
  return (
    <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center' }}>
      <div className="size-7 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* One session + one realtime socket shared by the website and the dashboard. */}
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminApp />
                </Suspense>
              }
            />

            {/* Website: landing page + customer/supplier pages share one shell. */}
            <Route element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              {/* Guests can track an order here; customers see all their orders. */}
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="deliveries" element={<RequireAuth roles={['supplier']}><DeliveriesPage /></RequireAuth>} />
              <Route path="chat" element={<RequireAuth roles={['user', 'supplier']}><SupportChatPage /></RequireAuth>} />
              <Route path="profile" element={<RequireAuth roles={['user', 'supplier']}><ProfilePage /></RequireAuth>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
