'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Headset, SendHorizontal, Loader2, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import { useAuth } from '@/src/lib/auth';
import { useSocket } from '@/src/lib/socket';
import { isGrouped, isNewDay, useChatThread } from '@/src/lib/use-chat-thread';
import { bnTime } from '@/src/lib/order-status';
import type { Conversation } from '@/src/lib/models';
import { Spinner } from './ui';

/**
 * Height left between the sticky site header and the mobile bottom nav —
 * including any part of the nav (e.g. a raised Order button) that rises above it,
 * so nothing covers the message box.
 */
function useScreenHeight() {
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      const nav = document.querySelector<HTMLElement>('nav[aria-label="প্রধান নেভিগেশন"]');
      const top = header?.getBoundingClientRect().height ?? 0;
      let bottom = 0;
      if (nav && getComputedStyle(nav).display !== 'none') {
        const navTop = nav.getBoundingClientRect().top;
        const highest = Math.min(navTop, ...[...nav.querySelectorAll('*')].map((el) => el.getBoundingClientRect().top));
        bottom = window.innerHeight - highest;
      }
      setHeight(window.innerHeight - top - bottom);
    };
    measure();
    // The nav measures itself after mount; re-check once it has settled.
    const t = setTimeout(measure, 150);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);
  return height;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return 'আজ';
  if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) return 'গতকাল';
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

const QUICK_REPLIES = {
  user: ['আমার অর্ডার কখন পৌঁছাবে?', 'জার জামানত সম্পর্কে জানতে চাই', 'নতুন সংযোগ নিতে চাই'],
  supplier: ['আমার অ্যাকাউন্ট কবে অনুমোদন হবে?', 'একটি ডেলিভারিতে সমস্যা হয়েছে', 'নতুন এলাকা যোগ করতে চাই'],
};

export default function SupportChatPage() {
  const { user } = useAuth();
  const { connected, supportOnline } = useSocket();
  const height = useScreenHeight();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [booting, setBooting] = useState(true);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api
      .get<{ items: Conversation[] }>('/chat/conversations')
      .then(({ items }) => setConversation(items[0] ?? null))
      .catch((err) => toast.error(err.message))
      .finally(() => setBooting(false));
  }, []);

  const t = useChatThread({ conversation, onConversation: setConversation });

  // Auto-grow the composer up to a few lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  const send = (body = text) => {
    if (!body.trim()) return;
    setText('');
    t.send(body).catch((err: Error) => toast.error(`মেসেজ পাঠানো যায়নি: ${err.message}`));
  };

  if (!user) return null;
  const quick = user.role === 'supplier' ? QUICK_REPLIES.supplier : QUICK_REPLIES.user;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col md:py-6" style={height ? { height } : { minHeight: '70vh' }}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:rounded-3xl md:border md:border-slate-200 md:shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
            <Headset className="h-5 w-5" />
            <span className={cn('absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white', supportOnline ? 'bg-emerald-500' : 'bg-slate-300')} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900">পানি ওয়ালা সাপোর্ট</p>
            <p className={cn('truncate text-xs', t.otherTyping ? 'font-semibold text-cyan-600' : 'text-slate-500')}>
              {t.otherTyping ? 'লিখছে…' : supportOnline ? 'অনলাইন — সাধারণত কয়েক মিনিটে উত্তর দেওয়া হয়' : 'অফলাইন — অনলাইনে এলেই উত্তর পাবেন'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={t.scrollRef} onScroll={t.onScroll} className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4 sm:px-5">
          {booting || t.loading ? (
            <Spinner className="h-full items-center py-0" />
          ) : !t.messages.length ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700">
                <Headset className="h-8 w-8" />
              </span>
              <p className="mt-3 text-lg font-bold text-slate-900">কীভাবে সাহায্য করতে পারি?</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">অর্ডার, ডেলিভারি বা যেকোনো প্রশ্ন লিখে পাঠান — আমাদের টিম এখানেই উত্তর দেবে।</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {quick.map((q) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-cyan-200 bg-white px-3.5 py-2 text-sm font-semibold text-cyan-800 active:scale-[0.98]">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-1">
              {t.hasMore && (
                <button onClick={t.loadOlder} disabled={t.loadingMore} className="mb-2 flex items-center gap-1.5 justify-self-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {t.loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />} আগের মেসেজ দেখুন
                </button>
              )}
              {t.messages.map((m, i) => {
                const mine = m.sender._id === user._id;
                const prev = t.messages[i - 1];
                const grouped = isGrouped(prev, m);
                return (
                  <React.Fragment key={m._id}>
                    {isNewDay(prev, m) && (
                      <div className="my-3 flex justify-center">
                        <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">{dayLabel(m.createdAt)}</span>
                      </div>
                    )}
                    <div className={cn('flex', mine ? 'justify-end' : 'justify-start', !grouped && 'mt-2')}>
                      <div className={cn('flex max-w-[82%] flex-col sm:max-w-[70%]', mine ? 'items-end' : 'items-start')}>
                        {!mine && !grouped && <span className="mb-0.5 px-1 text-[11px] font-semibold text-slate-500">{m.sender.name} · সাপোর্ট</span>}
                        <div
                          className={cn(
                            'rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed break-words whitespace-pre-wrap',
                            mine ? 'rounded-br-md bg-cyan-600 text-white' : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200',
                            m.pending && 'opacity-70',
                            m.failed && 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          )}
                        >
                          {m.text}
                        </div>
                        <span className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-slate-400">
                          {m.failed ? (
                            <button className="font-semibold text-rose-600 underline" onClick={() => setText(t.discardFailed(m))}>পাঠানো যায়নি — আবার চেষ্টা করুন</button>
                          ) : (
                            <>
                              {bnTime(m.createdAt)}
                              {mine && (m.pending ? <Loader2 className="h-3 w-3 animate-spin" /> : m._id === t.lastMineId && t.otherRead ? <CheckCheck className="h-3 w-3 text-cyan-600" /> : <Check className="h-3 w-3" />)}
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
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 ring-1 ring-slate-200">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
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
          className="flex items-end gap-2 border-t border-slate-100 bg-white p-2.5 sm:p-3"
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              t.emitTyping(e.target.value.length > 0);
            }}
            onBlur={() => t.emitTyping(false)}
            onKeyDown={(e) => {
              // Enter sends on desktop; on phones the return key inserts a new line.
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia('(min-width: 768px)').matches) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={connected ? 'মেসেজ লিখুন…' : 'মেসেজ লিখুন (সংযোগ হচ্ছে…)'}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          <button type="submit" disabled={!text.trim()} aria-label="পাঠান" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-600/25 disabled:opacity-40">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
