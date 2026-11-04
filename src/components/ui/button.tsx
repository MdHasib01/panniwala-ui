import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';
    
    const variants = {
      default: 'bg-cyan-600 text-white shadow-md hover:bg-cyan-700 shadow-cyan-600/20',
      accent: 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 shadow-emerald-600/20',
      destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
      ghost: 'hover:bg-slate-100 text-slate-700',
      link: 'text-cyan-600 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3.5 text-xs',
      lg: 'h-13 rounded-xl px-7 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
