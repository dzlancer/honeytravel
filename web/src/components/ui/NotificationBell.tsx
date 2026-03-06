'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen, CreditCard, Award, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification as TsaNotification } from '@shared/types';
import clsx from 'clsx';

const EVENT_ICONS: Record<string, React.ElementType> = {
  'booking.created': BookOpen,
  'booking.confirmed': CreditCard,
  'loyalty.earned': Award,
};

export function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('notifications.justNow');
    if (mins < 60) return t('notifications.minutesAgo', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('notifications.daysAgo', { count: days });
  };

  const recent = notifications.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-80 bg-white rounded-xl shadow-soft-lg border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length > 0 ? (
              recent.map((n: TsaNotification) => {
                const Icon = (n.event ? EVENT_ICONS[n.event] : undefined) || Bell;
                const isUnread = !n.readAt;
                return (
                  <button
                    key={n.id}
                    onClick={() => { if (isUnread) markAsRead(n.id); }}
                    className={clsx(
                      'flex items-start gap-3 w-full px-4 py-3 text-left transition-colors',
                      isUnread ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isUnread ? 'bg-primary-100' : 'bg-gray-100'
                    )}>
                      <Icon className={clsx('w-4 h-4', isUnread ? 'text-primary-600' : 'text-gray-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-sm truncate', isUnread ? 'font-medium text-gray-900' : 'text-gray-700')}>
                        {n.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('notifications.noNotifications')}</p>
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}
