'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { PageTransition } from '@/components/ui/PageTransition';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Bell, BookOpen, CreditCard, Award, CheckCheck, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const EVENT_ICONS: Record<string, React.ElementType> = {
  'booking.created': BookOpen,
  'booking.confirmed': CreditCard,
  'loyalty.earned': Award,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="section py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

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

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('notifications.title') },
        ]} />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-display-sm font-bold text-gray-900">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-ghost btn-sm text-sm gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n: any) => {
              const Icon = EVENT_ICONS[n.event] || Bell;
              const isUnread = !n.readAt;
              return (
                <button
                  key={n.id}
                  onClick={() => { if (isUnread) markAsRead(n.id); }}
                  className={clsx(
                    'flex items-start gap-4 w-full p-4 rounded-xl text-left transition-colors',
                    isUnread
                      ? 'bg-primary-50/70 hover:bg-primary-50 border border-primary-100'
                      : 'bg-white hover:bg-gray-50 border border-gray-100'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    isUnread ? 'bg-primary-100' : 'bg-gray-100'
                  )}>
                    <Icon className={clsx('w-5 h-5', isUnread ? 'text-primary-600' : 'text-gray-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx('text-sm', isUnread ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                        {n.subject}
                      </p>
                      {isUnread && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500">{t('notifications.noNotifications')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('notifications.noNotificationsDesc')}</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
