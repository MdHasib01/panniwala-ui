import * as React from 'react';
import { toast } from 'sonner';
import { api } from './api';
import { useAuth } from './auth';
import { emitWithAck, useSocket, useSocketEvent } from './socket';
import type { ChatMessage, Conversation } from './models';

export type UiMessage = ChatMessage & { pending?: boolean; failed?: boolean };

const PAGE = 50;

/**
 * All the realtime logic of one support thread, shared by the admin inbox and the
 * customer/supplier chat page.
 *
 * `conversation` may be null for a customer who has never written to support —
 * the thread is created by the server on their first message and adopted via
 * `onConversation`.
 */
export function useChatThread({
  conversation,
  onConversation,
  onRead,
}: {
  conversation: Conversation | null;
  onConversation?: (c: Conversation) => void;
  /** Our own side read the thread (used to clear unread counts in lists). */
  onRead?: () => void;
}) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const isAdmin = user?.role === 'admin';
  const convId = conversation?._id ?? null;

  const [messages, setMessages] = React.useState<UiMessage[]>([]);
  const [loading, setLoading] = React.useState(!!convId);
  const [hasMore, setHasMore] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [otherTyping, setOtherTyping] = React.useState<string | null>(null);
  const [otherRead, setOtherRead] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickToBottom = React.useRef(true);
  const typingTimeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTypingEmit = React.useRef(0);
  const onReadRef = React.useRef(onRead);
  onReadRef.current = onRead;

  const scrollToBottom = React.useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  const markRead = React.useCallback(() => {
    if (!convId || document.visibilityState !== 'visible') return;
    if (socket?.connected) emitWithAck(socket, 'chat:read', { conversationId: convId }).catch(() => {});
    else api.post(`/chat/conversations/${convId}/read`).catch(() => {});
  }, [socket, convId]);

  // Load history when the thread changes.
  React.useEffect(() => {
    setOtherTyping(null);
    if (!convId) {
      setMessages((m) => m.filter((x) => x.pending || x.failed));
      setLoading(false);
      setHasMore(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setOtherRead((isAdmin ? conversation?.unreadForUser : conversation?.unreadForAdmin) === 0);
    api
      .get<{ items: ChatMessage[] }>(`/chat/conversations/${convId}/messages`, { limit: PAGE })
      .then(({ items }) => {
        if (cancelled) return;
        // Keep optimistic messages sent before the thread existed.
        setMessages((prev) => [...items, ...prev.filter((m) => (m.pending || m.failed) && !items.some((i) => i.text === m.text))]);
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

  React.useEffect(() => () => clearTimeout(typingTimeout.current), []);

  const loadOlder = async () => {
    if (!convId || !messages.length) return;
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

  const belongsHere = (c: Conversation) =>
    convId ? c._id === convId : !isAdmin && c.user._id === user?._id;

  useSocketEvent<{ conversation: Conversation; message: ChatMessage }>('chat:message', ({ conversation: c, message }) => {
    if (!belongsHere(c)) return;
    if (!convId) onConversation?.(c);
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
    const mySide = isAdmin ? 'admin' : 'user';
    if (p.side === mySide) onReadRef.current?.();
    else setOtherRead(true);
  });

  const emitTyping = (typing: boolean) => {
    if (!convId || !socket?.connected) return;
    const now = Date.now();
    if (typing && now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = typing ? now : 0;
    socket.emit('chat:typing', { conversationId: convId, typing });
  };

  /** Sends a message optimistically; falls back to REST when the socket is down. */
  const send = async (text: string) => {
    const body = text.trim();
    if (!body || !user) return;
    emitTyping(false);
    const temp: UiMessage = {
      _id: `tmp-${Date.now()}`,
      conversation: convId ?? '',
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
      // Non-admins always post into their own thread; the server ignores the id for them.
      const res = socket?.connected
        ? await emitWithAck<{ message: ChatMessage; conversation: Conversation }>(socket, 'chat:send', { conversationId: convId ?? undefined, text: body })
        : await api.post<{ message: ChatMessage; conversation: Conversation }>(`/chat/conversations/${convId ?? 'self'}/messages`, { text: body });
      reconcile(res.message);
      if (!convId) onConversation?.(res.conversation);
    } catch (err) {
      setMessages((m) => m.map((x) => (x._id === temp._id ? { ...x, pending: false, failed: true } : x)));
      throw err;
    }
  };

  /** Removes a failed message and returns its text so it can be edited and resent. */
  const discardFailed = (m: UiMessage) => {
    setMessages((prev) => prev.filter((x) => x._id !== m._id));
    return m.text;
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const lastMineId = [...messages].reverse().find((m) => m.sender._id === user?._id && !m.pending && !m.failed)?._id;

  return {
    messages,
    loading,
    hasMore,
    loadingMore,
    loadOlder,
    send,
    discardFailed,
    otherTyping,
    otherRead,
    lastMineId,
    emitTyping,
    scrollRef,
    onScroll,
  };
}

export function isNewDay(prev: ChatMessage | undefined, m: ChatMessage) {
  return !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
}

export function isGrouped(prev: ChatMessage | undefined, m: ChatMessage) {
  return (
    !!prev &&
    !isNewDay(prev, m) &&
    prev.sender._id === m.sender._id &&
    new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60000
  );
}
