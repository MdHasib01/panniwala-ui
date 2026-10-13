import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'cyan';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-cyan-600 text-white shadow hover:bg-cyan-700',
    secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
    destructive: 'border-transparent bg-rose-500 text-white shadow hover:bg-rose-600',
    outline: 'text-slate-800 border-slate-200',
    success: 'border-transparent bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'border-transparent bg-amber-100 text-amber-800 border border-amber-200',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800 border',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
