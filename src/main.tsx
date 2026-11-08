import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import { NotFound } from './components/NotFound.tsx';
import './index.css';

// The dashboard (charts, sockets, shadcn) is split into its own chunk.
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));

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
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/" element={<App />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
