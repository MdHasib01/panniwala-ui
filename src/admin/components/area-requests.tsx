import { Check, X } from 'lucide-react';
import { Badge } from '@/src/admin/components/ui/badge';
import { Button } from '@/src/admin/components/ui/button';
import { cn } from '@/src/lib/utils';
import type { AreaRequest } from '@/src/lib/models';
import { formatDate } from '../lib/format';
import { useLocations } from '@/src/lib/areas-api';

/** "English name · Zone" under a requested location's display name. */
export function RequestDetails({ request }: { request: AreaRequest }) {
  const { zones } = useLocations();
  const zone = request.zone ? zones.find((z) => z._id === request.zone) : undefined;
  const parts = [
    request.nameEn && request.nameEn !== request.name ? request.nameEn : null,
    request.aliases?.length ? `aka ${request.aliases.join(', ')}` : null,
    zone ? zone.name : null,
  ].filter(Boolean);
  if (!parts.length) return null;
  return <span className="text-muted-foreground block truncate text-xs font-normal no-underline">{parts.join(' · ')}</span>;
}

export type AreaDecision = 'approved' | 'rejected';
export type AreaDecisions = Record<string, AreaDecision>;

export const pendingRequests = (requests: AreaRequest[] = []) => requests.filter((r) => r.status === 'pending');

/** Body for PATCH /users/:id. */
export const toAreaDecisions = (d: AreaDecisions) => Object.entries(d).map(([id, status]) => ({ id, status }));

export const allDecided = (requests: AreaRequest[] = [], d: AreaDecisions) => pendingRequests(requests).every((r) => d[r._id]);

/** Approve / reject toggles for a supplier's pending area requests. */
export function AreaRequestDecider({
  requests,
  value,
  onChange,
  compact,
}: {
  requests: AreaRequest[];
  value: AreaDecisions;
  onChange: (next: AreaDecisions) => void;
  compact?: boolean;
}) {
  const pending = pendingRequests(requests);
  if (!pending.length) return null;
  const set = (id: string, status: AreaDecision) => onChange({ ...value, [id]: status });
  return (
    <ul className="grid gap-1.5">
      {pending.map((r) => {
        const d = value[r._id];
        return (
          <li
            key={r._id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm',
              d === 'approved' && 'border-emerald-500/40 bg-emerald-500/5',
              d === 'rejected' && 'border-destructive/40 bg-destructive/5'
            )}
          >
            <span className="min-w-0 flex-1">
              <span className={cn('block truncate font-medium', d === 'rejected' && 'text-muted-foreground line-through')}>{r.name}</span>
              <RequestDetails request={r} />
            </span>
            {!compact && <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">{formatDate(r.requestedAt, false)}</span>}
            <Button
              type="button"
              size="icon-sm"
              variant={d === 'approved' ? 'default' : 'outline'}
              className={cn(d === 'approved' && 'bg-emerald-600 text-white hover:bg-emerald-600/90')}
              aria-label={`Approve ${r.name}`}
              aria-pressed={d === 'approved'}
              onClick={() => set(r._id, 'approved')}
            >
              <Check />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={d === 'rejected' ? 'destructive' : 'outline'}
              aria-label={`Reject ${r.name}`}
              aria-pressed={d === 'rejected'}
              onClick={() => set(r._id, 'rejected')}
            >
              <X />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS_CLASS: Record<AreaRequest['status'], string> = {
  pending: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  approved: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  rejected: 'border-destructive/40 text-destructive',
};

/** Read-only history of a supplier's decided requests. */
export function AreaRequestHistory({ requests }: { requests: AreaRequest[] }) {
  const decided = requests.filter((r) => r.status !== 'pending');
  if (!decided.length) return null;
  return (
    <ul className="grid gap-1 text-sm">
      {decided.map((r) => (
        <li key={r._id} className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate">{r.name}</span>
          <span className="text-muted-foreground shrink-0 text-xs">{formatDate(r.decidedAt ?? r.requestedAt, false)}</span>
          <Badge variant="outline" className={cn('capitalize', STATUS_CLASS[r.status])}>{r.status}</Badge>
        </li>
      ))}
    </ul>
  );
}
