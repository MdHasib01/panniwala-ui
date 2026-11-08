'use client';

import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL, api } from '@/src/lib/api';
import { useAuth } from './auth';
import { toBengaliNumber } from '@/src/data/packages';
import { ORDER_STATUS_BN } from './order-status';
import type { ChatMessage, Conversation, Order, User } from './models';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  /** Admin only: ids of users with an open dashboard. */
  onlineIds: Set<string>;
  /** Non-admins: whether at least one admin is online. */
  supportOnline: boolean;
  unreadChats: number;
}

const SocketContext = React.createContext<SocketContextValue | null>(null);

/**
 * Opens a single authenticated Socket.IO connection as soon as anyone logs in
 * (admin dashboard or the customer/supplier site) and keeps it for the session.
 * Mounted once at the app root, so it survives navigating between the two.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user, setUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = React.useRef(pathname);
  pathRef.current = pathname;
  const navigate = (href: string) => router.push(href);

  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [onlineIds, setOnlineIds] = React.useState<Set<string>>(new Set());
  const [supportOnline, setSupportOnline] = React.useState(false);
  const [unreadByConv, setUnreadByConv] = React.useState<Record<string, number>>({});

  const userId = user?._id;
  const role = user?.role;
  const isAdmin = role === 'admin';
  const side = isAdmin ? 'admin' : 'user';

  React.useEffect(() => {
    if (!token || !userId) return;

    const s = io(API_URL || undefined, { auth: { token }, transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      setConnected(false);
      if (/suspended|no longer exists|expired|invalid/i.test(err.message)) logout();
    });

    s.on('presence:list', ({ online }: { online: string[] }) => setOnlineIds(new Set(online)));
    s.on('presence:update', ({ userId: id, online }: { userId: string; online: boolean }) =>
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(id);
        else next.delete(id);
        return next;
      })
    );
    s.on('support:status', ({ online }: { online: boolean }) => setSupportOnline(online));

    s.on('account:updated', ({ user: updated }: { user: User }) => {
      setUser(updated);
      if (updated.role === 'supplier' && updated.status === 'active') {
        toast.success('আপনার সাপ্লায়ার অ্যাকাউন্ট সক্রিয় হয়েছে', { description: 'এখন থেকে আপনি ডেলিভারি অর্ডার পাবেন।' });
      }
    });
    s.on('account:deleted', () => {
      toast.error(isAdmin ? 'Your account was removed' : 'আপনার অ্যাকাউন্টটি মুছে ফেলা হয়েছে');
      logout();
    });

    s.on('chat:message', ({ conversation, message }: { conversation: Conversation; message: ChatMessage }) => {
      setUnreadByConv((prev) => ({
        ...prev,
        [conversation._id]: side === 'admin' ? conversation.unreadForAdmin : conversation.unreadForUser,
      }));
      const fromMe = message.sender._id === userId;
      const chatPath = isAdmin ? '/admin/chat' : '/chat';
      if (!fromMe && !pathRef.current.startsWith(chatPath)) {
        toast(isAdmin ? message.sender.name : 'পানি ওয়ালা সাপোর্ট', {
          description: message.text.length > 90 ? `${message.text.slice(0, 90)}…` : message.text,
          action: {
            label: isAdmin ? 'Reply' : 'উত্তর দিন',
            onClick: () => navigate(isAdmin ? `${chatPath}?c=${conversation._id}` : chatPath),
          },
        });
      }
    });
    s.on('chat:read', ({ conversationId, side: readSide }: { conversationId: string; side: string }) => {
      if (readSide === side) setUnreadByConv((prev) => ({ ...prev, [conversationId]: 0 }));
    });

    s.on('order:new', (order: Order) => {
      if (role !== 'admin') return;
      toast.success(`New order ${order.orderNumber}`, {
        description: `${order.customer.name} · ${order.item.quantity} × ${order.item.packageTitle}`,
        action: { label: 'View', onClick: () => navigate(`/admin/orders?open=${order._id}`) },
      });
    });
    s.on('order:updated', (order: Order) => {
      if (role === 'supplier' && order.status === 'assigned' && order.supplier?._id === userId) {
        const last = order.history[order.history.length - 1];
        if (last?.by?._id !== userId) {
          toast.info(`নতুন ডেলিভারি: ${order.orderNumber}`, {
            description: `${order.customer.area} · ${toBengaliNumber(order.item.quantity)} × ${order.item.packageTitle}`,
            action: { label: 'দেখুন', onClick: () => navigate('/deliveries') },
          });
        }
      } else if (role === 'user') {
        toast.info(`অর্ডার ${order.orderNumber}`, {
          description: ORDER_STATUS_BN[order.status].label,
          action: { label: 'দেখুন', onClick: () => navigate('/orders') },
        });
      }
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // the router is stable; re-connect only when the identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, role]);

  // Seed unread counters from the API once per session.
  React.useEffect(() => {
    if (!userId) return;
    api
      .get<{ items: Conversation[] }>('/chat/conversations')
      .then(({ items }) =>
        setUnreadByConv(
          Object.fromEntries(items.map((c) => [c._id, side === 'admin' ? c.unreadForAdmin : c.unreadForUser]))
        )
      )
      .catch(() => {});
  }, [userId, side]);

  const unreadChats = React.useMemo(
    () => Object.values(unreadByConv).reduce<number>((sum, n) => sum + (n > 0 ? 1 : 0), 0),
    [unreadByConv]
  );

  const value = React.useMemo(
    () => ({ socket, connected, onlineIds, supportOnline, unreadChats }),
    [socket, connected, onlineIds, supportOnline, unreadChats]
  );
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = React.useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
}

/** Subscribe to a socket event for the lifetime of a component. */
export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  const { socket } = useSocket();
  const ref = React.useRef(handler);
  ref.current = handler;
  React.useEffect(() => {
    if (!socket) return;
    const fn = (payload: T) => ref.current(payload);
    socket.on(event, fn);
    return () => {
      socket.off(event, fn);
    };
  }, [socket, event]);
}

/** Promise wrapper around an acked socket emit. */
export function emitWithAck<T = Record<string, unknown>>(
  socket: Socket | null,
  event: string,
  payload: unknown
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error('Not connected'));
    socket.timeout(10000).emit(event, payload, (err: Error | null, res: { ok: boolean; error?: string } & T) => {
      if (err) return reject(new Error('Server did not respond'));
      if (!res?.ok) return reject(new Error(res?.error || 'Request failed'));
      resolve(res);
    });
  });
}
