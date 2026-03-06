'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import type { Booking } from '@shared/types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, CalendarX2, History, XCircle, ChevronDown, X, SearchX, Award } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookingCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type TabKey = 'active' | 'past' | 'cancelled';

const TABS: { key: TabKey; statuses: string[] }[] = [
  { key: 'active', statuses: ['pending', 'confirmed'] },
  { key: 'past', statuses: ['completed'] },
  { key: 'cancelled', statuses: ['cancelled', 'failed', 'refunded'] },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [data, setData] = useState<{ bookings: Booking[]; total: number }>({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setLoading(true);
    api.getMyBookings(page)
      .then(setData)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [user, router, page]);

  const handleCancel = async (id: string) => {
    try {
      await api.cancelBooking(id);
      toast.success(t('booking.cancelBooking'));
      setData((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b: Booking) =>
          b.id === id ? { ...b, status: 'cancelled' as Booking['status'] } : b,
        ),
      }));
      setCancelModal(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const currentTabStatuses = TABS.find((tab) => tab.key === activeTab)?.statuses || [];
  const filteredBookings = (data.bookings || []).filter((b: Booking) => currentTabStatuses.includes(b.status));
  const totalPages = Math.ceil((data.total || 0) / 10);

  return (
    <PageTransition>
      <div className="section py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[
            { label: t('common.home'), href: '/' },
            { label: t('common.myBookings') },
          ]} />

          <h1 className="text-display-sm font-bold text-gray-900 mb-6">{t('common.myBookings')}</h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {TABS.map((tab) => {
              const count = (data.bookings || []).filter((b: any) => tab.statuses.includes(b.status)).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    'relative px-5 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {t(`booking.${tab.key}Bookings`)}
                  {count > 0 && (
                    <span className={clsx(
                      'ms-2 text-xs px-1.5 py-0.5 rounded-full',
                      activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 start-0 end-0 h-0.5 bg-primary-600"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              icon={activeTab === 'active' ? CalendarX2 : activeTab === 'past' ? History : XCircle}
              title={t(`booking.no${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Bookings`)}
              description={t(`booking.no${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}BookingsDesc`)}
              action={activeTab === 'active' ? { label: t('booking.startExploring'), href: '/search' } : undefined}
            />
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredBookings.map((booking: any) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="card-hover">
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusBadge status={booking.status} />
                              <span className="text-gray-400 text-xs font-mono">
                                {booking.supplierBookingRef || booking.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 capitalize">
                              {booking.productType} {t('booking.bookNow').split(' ')[0]}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {booking.checkIn} — {booking.checkOut}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {booking.guestCount} {booking.guestCount === 1 ? t('common.guest') : t('common.guests')}
                              </span>
                            </div>
                            {booking.loyaltyPointsEarned > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 text-primary-600 text-xs">
                                <Award className="w-3.5 h-3.5" />
                                +{booking.loyaltyPointsEarned} {t('loyalty.points')}
                              </div>
                            )}
                          </div>
                          <div className="text-end flex sm:flex-col items-center sm:items-end gap-3">
                            <span className="text-xl font-bold text-primary-700">
                              {formatCurrency(booking.totalAmount, booking.currency)}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                                className="btn-ghost btn-sm text-xs"
                              >
                                <ChevronDown className={clsx(
                                  'w-4 h-4 transition-transform',
                                  expandedId === booking.id && 'rotate-180'
                                )} />
                              </button>
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <button
                                  onClick={() => setCancelModal(booking.id)}
                                  className="btn-ghost btn-sm text-xs text-error-600 hover:bg-error-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  {t('common.cancel')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === booking.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-sm">
                                <div>
                                  <span className="text-gray-400 text-xs">{t('booking.bookingRef')}</span>
                                  <p className="font-mono font-medium">{booking.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400 text-xs">{t('checkout.product')}</span>
                                  <p className="font-medium capitalize">{booking.productType}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400 text-xs">{t('booking.status')}</span>
                                  <p className="font-medium capitalize">{booking.status}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {cancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/40" onClick={() => setCancelModal(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              >
                <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-error-600" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">{t('booking.cancelConfirm')}</h3>
                <p className="text-sm text-gray-500 text-center mb-6">{t('booking.cancelConfirmDesc')}</p>
                <div className="flex gap-3">
                  <button onClick={() => setCancelModal(null)} className="btn-ghost flex-1">
                    {t('common.back')}
                  </button>
                  <button onClick={() => handleCancel(cancelModal)} className="btn flex-1 bg-error-600 text-white hover:bg-error-700">
                    {t('booking.cancelBooking')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
