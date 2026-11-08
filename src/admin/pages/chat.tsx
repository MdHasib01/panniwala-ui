import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Search, SendHorizontal, MessagesSquare, Loader2, Check, CheckCheck } from 'lucide-react';
import { Card } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Input } from '@/src/admin/components/ui/input';
import { Textarea } from '@/src/admin/components/ui/textarea';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/lib/auth';
import { useSocket, useSocketEvent } from '@/src/lib/socket';
import { useDebounced, useFetch } from '@/src/lib/use-fetch';
import { isGrouped, isNewDay, useChatThread } from '@/src/lib/use-chat-thread';
import { EmptyState, RoleBadge, UserAvatar } from '../components/shared';
import { formatClock, timeAgo } from '../lib/format';
import type { Conversation } from '@/src/lib/models';

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const displayName = (c: Conversation) => c.user.supplier?.businessName || c.user.name;

/* ------------------------------ Conversation list ------------------------------ */

function ConversationList({
  items,
  loading,
  selectedId,
  onSelect,
  search,
  onSearch,
  typing,
}: {
  items: Conversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (s: string) => void;
  typing: Record<string, boolean>;
}) {
  const { onlineIds } = useSocket();
  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input placeholder="Search conversations" value={search} onChange={(e) => onSearch(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && !items.length ? (
          <div className="grid gap-2 p-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : !items.length ? (
          <EmptyState icon={MessagesSquare} title="No conversations" description="When customers or suppliers message support, they'll appear here. Start one from Users." />
        ) : (
          <ul className="grid gap-0.5 p-2">
            {items.map((c) => (
              <li key={c._id}>
                <button
                  onClick={() => onSelect(c._id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors',
                    selectedId === c._id ? 'bg-accent' : 'hover:bg-muted/60'
                  )}
                >
                  <UserAvatar name={displayName(c)} online={onlineIds.has(c.user._id)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-sm', c.unreadForAdmin ? 'font-semibold' : 'font-medium')}>{displayName(c)}</span>
                      <span className="text-muted-foreground shrink-0 text-[11px]">{c.lastMessage ? timeAgo(c.lastMessageAt) : ''}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-xs', c.unreadForAdmin ? 'text-foreground' : 'text-muted-foreground')}>
                        {typing[c._id] ? <span className="text-primary">typing…</span> : c.lastMessage || 'No messages yet'}
                      </span>
                      {c.unreadForAdmin > 0 && (
                        <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold">
                          {c.unreadForAdmin}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Thread ---------------------------------- */

function Thread({
  conversation,
  onBack,
  onRead,
}: {
  conversation: Conversation;
  onBack: () => void;
  onRead: () => void;
}) {
  const { user } = useAuth();
  const { connected, onlineIds } = useSocket();
  const [text, setText] = React.useState('');
  const t = useChatThread({ conversation, onRead });

  const send = () => {
    const body = text;
    if (!body.trim()) return;
    setText('');
    t.send(body).catch((err: Error) => toast.error(`Message not sent: ${err.message}`));
  };

  const other = conversation.user;
  const otherOnline = onlineIds.has(other._id);
  const title = displayName(conversation);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b px-3 py-2.5 sm:px-4">
        <Button variant="ghost" size="icon-sm" onClick={onBack} className="md:hidden" aria-label="Back to conversations">
          <ArrowLeft />
        </Button>
        <UserAvatar name={title} online={otherOnline} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{title}</p>
            <RoleBadge role={other.role} />
          </div>
          <p className={cn('truncate text-xs', t.otherTyping ? 'text-primary' : 'text-muted-foreground')}>
            {t.otherTyping ? 'typing…' : otherOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        {other.phone && (
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <a href={`tel:${other.phone}`}>{other.phone}</a>
          </Button>
        )}
      </div>

      <div ref={t.scrollRef} onScroll={t.onScroll} className="bg-muted/30 min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        {t.loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="text-muted-foreground size-5 animate-spin" /></div>
        ) : !t.messages.length ? (
          <EmptyState icon={MessagesSquare} title={`Say hello to ${other.name.split(' ')[0]}`} description="Messages are delivered instantly while they are online." />
        ) : (
          <div className="mx-auto grid max-w-3xl gap-1">
            {t.hasMore && (
              <Button variant="ghost" size="sm" className="mb-2 justify-self-center" onClick={t.loadOlder} disabled={t.loadingMore}>
                {t.loadingMore && <Loader2 className="animate-spin" />} Load earlier messages
              </Button>
            )}
            {t.messages.map((m, i) => {
              const mine = m.sender._id === user?._id;
              const prev = t.messages[i - 1];
              const newDay = isNewDay(prev, m);
              const grouped = isGrouped(prev, m);
              // Show which teammate replied when another admin answered.
              const showName = !mine && !grouped && m.sender.role === 'admin';
              return (
                <React.Fragment key={m._id}>
                  {newDay && (
                    <div className="my-3 flex justify-center">
                      <span className="bg-background text-muted-foreground rounded-full border px-3 py-0.5 text-[11px] font-medium">{dayLabel(m.createdAt)}</span>
                    </div>
                  )}
                  <div className={cn('flex', mine ? 'justify-end' : 'justify-start', !grouped && 'mt-2')}>
                    <div className={cn('flex max-w-[85%] flex-col sm:max-w-[70%]', mine ? 'items-end' : 'items-start')}>
                      {showName && <span className="text-muted-foreground mb-0.5 px-1 text-[11px]">{m.sender.name}</span>}
                      <div
                        className={cn(
                          'rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-xs',
                          mine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-background rounded-bl-md border',
                          m.pending && 'opacity-70',
                          m.failed && 'bg-destructive/10 text-destructive border-destructive/30 border'
                        )}
                      >
                        {m.text}
                      </div>
                      <span className="text-muted-foreground mt-0.5 flex items-center gap-1 px-1 text-[10px]">
                        {m.failed ? (
                          <button className="text-destructive underline" onClick={() => setText(t.discardFailed(m))}>Failed — tap to edit & retry</button>
                        ) : (
                          <>
                            {formatClock(m.createdAt)}
                            {mine && (m.pending ? <Loader2 className="size-3 animate-spin" /> : m._id === t.lastMineId && t.otherRead ? <CheckCheck className="text-primary size-3" /> : <Check className="size-3" />)}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {t.otherTyping && (
              <div className="mt-2 flex justify-start">
                <div className="bg-background flex items-center gap-1 rounded-2xl rounded-bl-md border px-3.5 py-3">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t p-3"
      >
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            t.emitTyping(e.target.value.length > 0);
          }}
          onBlur={() => t.emitTyping(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={connected ? 'Type a message…' : 'Type a message (reconnecting…)'}
          rows={1}
          maxLength={2000}
          className="max-h-36 min-h-10 resize-none"
        />
        <Button type="submit" size="icon" disabled={!text.trim()} aria-label="Send">
          <SendHorizontal />
        </Button>
      </form>
    </div>
  );
}

/* ----------------------------------- Page ----------------------------------- */

export function ChatPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search);
  const [typing, setTyping] = React.useState<Record<string, boolean>>({});

  const { data, setData, loading, error, refetch } = useFetch<{ items: Conversation[] }>('/chat/conversations', { search: debounced });
  const items = data?.items ?? [];
  const selectedId = params.get('c');
  const selected = items.find((c) => c._id === selectedId) ?? null;

  // A ?c= link to a conversation outside the current list (e.g. a brand-new thread):
  // refetch once per id, then give up so an invalid id can't loop.
  const refetchedFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!selectedId || !data || selected || debounced) return;
    if (refetchedFor.current === selectedId) return;
    refetchedFor.current = selectedId;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, data]);

  const updateConversation = React.useCallback(
    (c: Conversation) =>
      setData((d) => {
        if (!d) return d;
        const existing = d.items.find((x) => x._id === c._id);
        // Only re-sort when there's a newer message.
        if (existing && existing.lastMessageAt === c.lastMessageAt) {
          return { items: d.items.map((x) => (x._id === c._id ? c : x)) };
        }
        return { items: [c, ...d.items.filter((x) => x._id !== c._id)] };
      }),
    [setData]
  );

  const clearUnread = React.useCallback(
    (id: string) => setData((d) => (d ? { items: d.items.map((x) => (x._id === id ? { ...x, unreadForAdmin: 0 } : x)) } : d)),
    [setData]
  );

  useSocketEvent<{ conversation: Conversation }>('chat:message', ({ conversation }) => {
    updateConversation(conversation);
    setTyping((t) => ({ ...t, [conversation._id]: false }));
  });
  useSocketEvent<{ conversationId: string; userId: string; typing: boolean }>('chat:typing', (p) => {
    if (p.userId === user?._id) return;
    setTyping((t) => ({ ...t, [p.conversationId]: p.typing }));
  });

  if (error) {
    return (
      <Card>
        <EmptyState title="Couldn't load messages" description={error} action={<Button onClick={refetch}>Retry</Button>} />
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100svh-7.5rem)] min-h-[30rem] gap-0 overflow-hidden py-0 md:h-[calc(100svh-9rem)]">
      <div className="flex h-full min-h-0 md:grid md:grid-cols-[18rem_1fr] lg:grid-cols-[20rem_1fr]">
        <div className={cn('min-h-0 w-full flex-col border-r md:flex', selected ? 'hidden' : 'flex')}>
          <ConversationList
            items={items}
            loading={loading}
            selectedId={selectedId}
            onSelect={(id) => setParams({ c: id })}
            search={search}
            onSearch={setSearch}
            typing={typing}
          />
        </div>
        <div className={cn('min-h-0 min-w-0 flex-1 flex-col', !selected ? 'hidden md:flex' : 'flex')}>
          {selected ? (
            <Thread key={selected._id} conversation={selected} onBack={() => setParams({})} onRead={() => clearUnread(selected._id)} />
          ) : loading ? (
            <div className="flex flex-1 items-center justify-center"><Loader2 className="text-muted-foreground size-5 animate-spin" /></div>
          ) : (
            <EmptyState className="flex-1" icon={MessagesSquare} title="Select a conversation" description="Pick a conversation from the list to start chatting." />
          )}
        </div>
      </div>
    </Card>
  );
}
