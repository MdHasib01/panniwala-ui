import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL, api } from '@/src/lib/api';
import { useAuth } from './auth';
import { ORDER_STATUS_META } from '../lib/format';
import type { ChatMessage, Conversation, Order, User } from '../lib/types';

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
 * Opens a single authenticated Socket.IO connection as soon as the user logs in
 * and keeps it alive for the whole dashboard session.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = React.useRef(location.pathname);
  pathRef.current = location.pathname;

  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [onlineIds, setOnlineIds] = React.useState<Set<string>>(new Set());
  const [supportOnline, setSupportOnline] = React.useState(false);
  const [unreadByConv, setUnreadByConv] = React.useState<Record<string, number>>({});

  const userId = user?._id;
  const role = user?.role;
  const side = role === 'admin' ? 'admin' : 'user';

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
        toast.success('Your account is active', { description: 'You can now receive delivery orders.' });
      }
    });
    s.on('account:deleted', () => {
      toast.error('Your account was removed');
      logout();
    });

    s.on('chat:message', ({ conversation, message }: { conversation: Conversation; message: ChatMessage }) => {
      setUnreadByConv((prev) => ({
        ...prev,
        [conversation._id]: side === 'admin' ? conversation.unreadForAdmin : conversation.unreadForUser,
      }));
      const fromMe = message.sender._id === userId;
      if (!fromMe && !pathRef.current.startsWith('/admin/chat')) {
        toast(message.sender.name, {
          description: message.text.length > 90 ? `${message.text.slice(0, 90)}…` : message.text,
          action: { label: 'Reply', onClick: () => navigate(`/admin/chat?c=${conversation._id}`) },
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
          toast.info(`Delivery assigned: ${order.orderNumber}`, {
            description: `${order.customer.area} · ${order.item.quantity} × ${order.item.packageTitle}`,
            action: { label: 'Open', onClick: () => navigate(`/admin/orders?open=${order._id}`) },
          });
        }
      } else if (role === 'user') {
        toast.info(`Order ${order.orderNumber}`, { description: `Status: ${ORDER_STATUS_META[order.status].label}` });
      }
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // navigate is stable enough; re-connect only when the identity changes
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
