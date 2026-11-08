import * as React from 'react';
import { ChevronLeft, ChevronRight, Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/admin/components/ui/badge';
import { Button } from '@/src/admin/components/ui/button';
import { Card, CardContent } from '@/src/admin/components/ui/card';
import { Avatar, AvatarFallback } from '@/src/admin/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/admin/components/ui/alert-dialog';
import { ORDER_STATUS_META, ROLE_META, USER_STATUS_META, initials } from '../lib/format';
import type { OrderStatus, Role, UserStatus } from '../lib/types';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', meta.className, className)}>
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </Badge>
  );
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const meta = USER_STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const meta = ROLE_META[role];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}

const AVATAR_TONES = [
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-blue-500/15 text-blue-700 dark:text-blue-300',
];

export function UserAvatar({
  name,
  online,
  className,
}: {
  name: string;
  online?: boolean;
  className?: string;
}) {
  const tone = AVATAR_TONES[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={cn('size-9', className)}>
        <AvatarFallback className={cn('text-xs font-semibold', tone)}>{initials(name)}</AvatarFallback>
      </Avatar>
      {online !== undefined && (
        <span
          className={cn(
            'ring-background absolute right-0 bottom-0 size-2.5 rounded-full ring-2',
            online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
          )}
        />
      )}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: 'primary' | 'emerald' | 'amber' | 'violet' | 'rose';
}) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-muted-foreground text-sm">
        {total} result{total === 1 ? '' : 's'}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden text-sm sm:inline">
          Page {page} of {pages}
        </span>
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

/** Imperative confirm dialog: `const confirm = useConfirm(); if (await confirm({...})) ...` */
type ConfirmOptions = { title: string; description?: string; confirmText?: string; destructive?: boolean };
const ConfirmContext = React.createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = React.useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...o, resolve })),
    []
  );
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={!!state} onOpenChange={(open) => !open && close(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state?.title}</AlertDialogTitle>
            {state?.description && <AlertDialogDescription>{state.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => close(true)}
              className={cn(state?.destructive && 'bg-destructive hover:bg-destructive/90 text-white')}
            >
              {state?.confirmText || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => React.useContext(ConfirmContext);
