'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) setNotifications(data as Notification[]);
    setLoading(false);
  }, [supabase]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          // RLS ensures users only see their own rows, but filter client-side too
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ── Mark all as read when panel opens ───────────────────────────────────
  useEffect(() => {
    if (!open || unreadCount === 0) return;

    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

    supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle notification click ────────────────────────────────────────────
  function handleNotificationClick(n: Notification) {
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  // ── Format timestamp ─────────────────────────────────────────────────────
  function formatTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="relative">
      {/* ── Bell button ── */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-1 rounded-md text-slate-400 hover:text-white transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '420px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-400">{unreadCount} unread</span>
            )}
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  disabled={!n.link}
                  className={[
                    'w-full text-left px-4 py-3 flex gap-3 transition-colors',
                    n.link
                      ? 'hover:bg-slate-800 cursor-pointer'
                      : 'cursor-default',
                    !n.is_read ? 'bg-slate-800/40' : '',
                  ].join(' ')}
                >
                  {/* Unread dot */}
                  <span className="mt-1.5 shrink-0">
                    {!n.is_read ? (
                      <span className="block w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-white truncate">
                      {n.title}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </span>
                    <span className="block text-[11px] text-slate-600 mt-1">
                      {formatTime(n.created_at)}
                    </span>
                  </span>

                  {n.link && (
                    <span className="shrink-0 self-center text-slate-600 text-xs">→</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}