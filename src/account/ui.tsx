import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Check, Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { homePathFor, useAuth } from '@/src/lib/auth';
import { ORDER_STATUS_BN, ORDER_STEPS } from '@/src/lib/order-status';
import type { OrderStatus, Role } from '@/src/lib/models';

/** Page container for the customer/supplier pages (leaves room for the mobile bottom nav). */
export function AccountPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-3xl px-4 pt-5 pb-28 sm:px-6 sm:pt-8 md:pb-12', className)}>{children}</div>;
}

export function AccountHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-16', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
    </div>
  );
}

export function EmptyCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
        <Icon className="h-7 w-7" />
      </span>
      <p className="mt-3 font-bold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_BN[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1', meta.pill)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

/** Horizontal step tracker: pending → confirmed → assigned → on the way → delivered. */
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null;
  const current = ORDER_STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="flex items-start">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.status} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span className={cn('absolute top-3 right-1/2 h-0.5 w-full', i <= current ? 'bg-cyan-500' : 'bg-slate-200')} aria-hidden />
            )}
            <span
              className={cn(
                'relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-white',
                done ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500',
                i === current && status !== 'delivered' && 'animate-pulse'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn('mt-1.5 text-[10px] leading-tight font-semibold sm:text-[11px]', done ? 'text-cyan-800' : 'text-slate-400')}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Guards customer/supplier pages. Guests go to /login (and come back after);
 * signed-in users of another role go to their own home.
 */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner className="min-h-[60vh] items-center" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user)} replace />;
  return <>{children}</>;
}

export const fieldClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-50 disabled:text-slate-500';

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
