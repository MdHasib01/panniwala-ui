import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Search, SendHorizontal, MessagesSquare, Headset, Loader2, Check, CheckCheck } from 'lucide-react';
import { Card } from '@/src/admin/components/ui/card';
import { Button } from '@/src/admin/components/ui/button';
import { Input } from '@/src/admin/components/ui/input';
import { Textarea } from '@/src/admin/components/ui/textarea';
import { Skeleton } from '@/src/admin/components/ui/skeleton';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '../context/auth';
import { emitWithAck, useSocket, useSocketEvent } from '../context/socket';
import { useDebounced, useFetch } from '../hooks/use-fetch';
import { EmptyState, RoleBadge, UserAvatar } from '../components/shared';
import { formatClock, timeAgo } from '../lib/format';
import type { ChatMessage, Conversation } from '../lib/types';

type UiMessage = ChatMessage & { pending?: boolean; failed?: boolean };

const PAGE = 50;

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
  onConversationUpdate,
}: {
  conversation: Conversation;
  onBack?: () => void;
  onConversationUpdate: (c: Conversation) => void;
}) {
  const { user } = useAuth();
  const { socket, connected, onlineIds, supportOnline } = useSocket();
  const isAdmin = user?.role === 'admin';
  const convId = conversation._id;

  const [messages, setMessages] = React.useState<UiMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [text, setText] = React.useState('');
  const [otherTyping, setOtherTyping] = React.useState<string | null>(null);
  const [otherRead, setOtherRead] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickToBottom = React.useRef(true);
  const typingTimeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTypingEmit = React.useRef(0);

  const scrollToBottom = (smooth = false) =>
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });

  const markRead = React.useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    if (socket?.connected) emitWithAck(socket, 'chat:read', { conversationId: convId }).catch(() => {});
    else api.post(`/chat/conversations/${convId}/read`).catch(() => {});
  }, [socket, convId]);

  // Load history whenever the conversation changes.
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    setOtherTyping(null);
    setOtherRead((isAdmin ? conversation.unreadForUser : conversation.unreadForAdmin) === 0);
    api
      .get<{ items: ChatMessage[] }>(`/chat/conversations/${convId}/messages`, { limit: PAGE })
      .then(({ items }) => {
        if (cancelled) return;
        setMessages(items);
        setHasMore(items.length === PAGE);
        stickToBottom.current = true;
        scrollToBottom();
        markRead();
      })
      .catch((err) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId]);

  React.useEffect(() => {
    const onVisible = () => markRead();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [markRead]);

  const loadOlder = async () => {
    if (!messages.length) return;
    setLoadingMore(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const { items } = await api.get<{ items: ChatMessage[] }>(`/chat/conversations/${convId}/messages`, {
        limit: PAGE,
        before: messages[0].createdAt,
      });
      setMessages((m) => [...items, ...m]);
      setHasMore(items.length === PAGE);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  /** Adds a server message, replacing a matching optimistic one if present. */
  const reconcile = React.useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      const tempIdx = prev.findIndex((m) => m.pending && m.sender._id === msg.sender._id && m.text === msg.text);
      if (tempIdx >= 0) {
        const next = [...prev];
        next[tempIdx] = msg;
        return next;
      }
      return [...prev, msg];
    });
  }, []);

  useSocketEvent<{ conversation: Conversation; message: ChatMessage }>('chat:message', ({ conversation: c, message }) => {
    if (c._id !== convId) return;
    reconcile(message);
    if (message.sender._id !== user?._id) {
      setOtherTyping(null);
      markRead();
    } else {
      setOtherRead(false);
    }
    if (stickToBottom.current) scrollToBottom(true);
  });

  useSocketEvent<{ conversationId: string; userId: string; name: string; typing: boolean }>('chat:typing', (p) => {
    if (p.conversationId !== convId || p.userId === user?._id) return;
    setOtherTyping(p.typing ? p.name : null);
    clearTimeout(typingTimeout.current);
    if (p.typing) typingTimeout.current = setTimeout(() => setOtherTyping(null), 4000);
  });

  useSocketEvent<{ conversationId: string; side: string }>('chat:read', (p) => {
    if (p.conversationId !== convId) return;
    const otherSide = isAdmin ? 'user' : 'admin';
    if (p.side === otherSide) setOtherRead(true);
    // Reflect our own read in the conversation list.
    if (p.side === (isAdmin ? 'admin' : 'user')) {
      onConversationUpdate({ ...conversation, ...(isAdmin ? { unreadForAdmin: 0 } : { unreadForUser: 0 }) });
    }
  });

  React.useEffect(() => () => clearTimeout(typingTimeout.current), []);

  const emitTyping = (typing: boolean) => {
    if (!socket?.connected) return;
    const now = Date.now();
    if (typing && now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = typing ? now : 0;
    socket.emit('chat:typing', { conversationId: convId, typing });
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !user) return;
    setText('');
    emitTyping(false);
    const temp: UiMessage = {
      _id: `tmp-${Date.now()}`,
      conversation: convId,
      sender: { _id: user._id, name: user.name, role: user.role },
      text: body,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...m, temp]);
    setOtherRead(false);
    stickToBottom.current = true;
    scrollToBottom(true);

    try {
      const res = socket?.connected
        ? await emitWithAck<{ message: ChatMessage }>(socket, 'chat:send', { conversationId: convId, text: body })
        : await api.post<{ message: ChatMessage }>(`/chat/conversations/${convId}/messages`, { text: body });
      reconcile(res.message);
    } catch (err) {
      setMessages((m) => m.map((x) => (x._id === temp._id ? { ...x, pending: false, failed: true } : x)));
      toast.error(`Message not sent: ${(err as Error).message}`);
    }
  };

  const retry = (m: UiMessage) => {
    setMessages((prev) => prev.filter((x) => x._id !== m._id));
    setText(m.text);
  };

  const other = conversation.user;
  const otherOnline = isAdmin ? onlineIds.has(other._id) : supportOnline;
  const title = isAdmin ? displayName(conversation) : 'Pani Wala Support';
  const subtitle = otherTyping
    ? 'typing…'
    : isAdmin
      ? otherOnline ? 'Online' : 'Offline'
      : supportOnline ? 'Online — we usually reply in minutes' : 'Offline — we\'ll reply as soon as we\'re back';

  const lastMine = [...messages].reverse().find((m) => m.sender._id === user?._id && !m.pending && !m.failed);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-3 py-2.5 sm:px-4">
        {onBack && (
          <Button variant="ghost" size="icon-sm" onClick={onBack} className="md:hidden" aria-label="Back to conversations">
            <ArrowLeft />
          </Button>
        )}
        {isAdmin ? (
          <UserAvatar name={title} online={otherOnline} />
        ) : (
          <span className="relative inline-flex">
            <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full"><Headset className="size-4" /></span>
            <span className={cn('ring-background absolute right-0 bottom-0 size-2.5 rounded-full ring-2', otherOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{title}</p>
            {isAdmin && <RoleBadge role={other.role} />}
          </div>
          <p className={cn('truncate text-xs', otherTyping ? 'text-primary' : 'text-muted-foreground')}>{subtitle}</p>
        </div>
        {isAdmin && other.phone && (
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <a href={`tel:${other.phone}`}>{other.phone}</a>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="bg-muted/30 min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="text-muted-foreground size-5 animate-spin" /></div>
        ) : !messages.length ? (
          <EmptyState
            icon={MessagesSquare}
            title={isAdmin ? `Say hello to ${other.name.split(' ')[0]}` : 'How can we help?'}
            description={isAdmin ? 'Messages are delivered instantly while they are online.' : 'Ask about an order, a delivery or anything else — our team will reply here.'}
          />
        ) : (
          <div className="mx-auto grid max-w-3xl gap-1">
            {hasMore && (
              <Button variant="ghost" size="sm" className="mb-2 justify-self-center" onClick={loadOlder} disabled={loadingMore}>
                {loadingMore && <Loader2 className="animate-spin" />} Load earlier messages
              </Button>
            )}
            {messages.map((m, i) => {
              const mine = m.sender._id === user?._id;
              const prev = messages[i - 1];
              const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
              const grouped = !newDay && prev && prev.sender._id === m.sender._id && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60000;
              // Admins see which teammate replied; customers see "Support".
              const showName = !mine && !grouped && (isAdmin ? m.sender.role === 'admin' : true);
              return (
                <React.Fragment key={m._id}>
                  {newDay && (
                    <div className="my-3 flex justify-center">
                      <span className="bg-background text-muted-foreground rounded-full border px-3 py-0.5 text-[11px] font-medium">{dayLabel(m.createdAt)}</span>
                    </div>
                  )}
                  <div className={cn('flex', mine ? 'justify-end' : 'justify-start', !grouped && 'mt-2')}>
                    <div className={cn('flex max-w-[85%] flex-col sm:max-w-[70%]', mine ? 'items-end' : 'items-start')}>
                      {showName && (
                        <span className="text-muted-foreground mb-0.5 px-1 text-[11px]">
                          {m.sender.role === 'admin' && !isAdmin ? `${m.sender.name} · Support` : m.sender.name}
                        </span>
                      )}
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
                          <button className="text-destructive underline" onClick={() => retry(m)}>Failed — tap to edit & retry</button>
                        ) : (
                          <>
                            {formatClock(m.createdAt)}
                            {mine && (m.pending ? <Loader2 className="size-3 animate-spin" /> : m._id === lastMine?._id && otherRead ? <CheckCheck className="text-primary size-3" /> : <Check className="size-3" />)}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {otherTyping && (
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

      {/* Composer */}
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
            emitTyping(e.target.value.length > 0);
          }}
          onBlur={() => emitTyping(false)}
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
  const isAdmin = user?.role === 'admin';
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search);
  const [typing, setTyping] = React.useState<Record<string, boolean>>({});

  const { data, setData, loading, error, refetch } = useFetch<{ items: Conversation[] }>('/chat/conversations', {
    search: isAdmin ? debounced : undefined,
  });
  const items = data?.items ?? [];

  const selectedId = isAdmin ? params.get('c') : items[0]?._id ?? null;
  const selected = items.find((c) => c._id === selectedId) ?? null;

  // A ?c= link to a conversation outside the current list (e.g. a brand-new thread):
  // refetch once per id, then give up so an invalid id can't loop.
  const refetchedFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!isAdmin || !selectedId || !data || selected || debounced) return;
    if (refetchedFor.current === selectedId) return;
    refetchedFor.current = selectedId;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, data]);

  const updateConversation = React.useCallback(
    (c: Conversation) =>
      setData((d) => {
        if (!d) return d;
        const rest = d.items.filter((x) => x._id !== c._id);
        const existing = d.items.find((x) => x._id === c._id);
        // Only re-sort when there's a newer message.
        if (existing && existing.lastMessageAt === c.lastMessageAt) {
          return { items: d.items.map((x) => (x._id === c._id ? c : x)) };
        }
        return { items: [c, ...rest] };
      }),
    [setData]
  );

  useSocketEvent<{ conversation: Conversation }>('chat:message', ({ conversation }) => {
    // While the thread is open its unread count will be cleared by markRead.
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
      <div className={cn('flex h-full min-h-0', isAdmin && 'md:grid md:grid-cols-[18rem_1fr] lg:grid-cols-[20rem_1fr]')}>
        {isAdmin && (
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
        )}
        <div className={cn('min-h-0 min-w-0 flex-1 flex-col', isAdmin && !selected ? 'hidden md:flex' : 'flex')}>
          {selected ? (
            <Thread
              key={selected._id}
              conversation={selected}
              onBack={isAdmin ? () => setParams({}) : undefined}
              onConversationUpdate={updateConversation}
            />
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
