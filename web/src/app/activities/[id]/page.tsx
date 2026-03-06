'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Clock, Users, Check, Minus, Plus, ArrowRight,
  Lock, Loader2, ShieldCheck, Compass, Calendar,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function ActivityDetailSkeleton() {
  return (
    <div className="section py-8 animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="h-[400px] bg-gray-200 rounded-xl mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ActivityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [date, setDate] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.getActivity(id as string)
      .then((data) => {
        setActivity(data);
        if (data.groupSize?.min) setGroupSize(data.groupSize.min);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const pricePerPerson = activity?.pricePerPerson || activity?.price || 0;
  const totalAmount = pricePerPerson * groupSize;
  const pointsEarned = Math.floor(totalAmount * 10);
  const minGroup = activity?.groupSize?.min || 1;
  const maxGroup = activity?.groupSize?.max || 20;

  const handleBook = async () => {
    if (!user) { router.push('/login'); return; }
    if (!activity) return;
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    setBooking(true);
    try {
      const bookingResult = await api.createBooking({
        productType: 'activity',
        productId: activity.id,
        supplierId: activity.supplierId,
        checkIn: date,
        checkOut: date,
        guestCount: groupSize,
        totalAmount,
        currency: activity.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      router.push(`/checkout/${bookingResult.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <ActivityDetailSkeleton />;
  if (error || !activity) {
    return (
      <div className="section py-8">
        <ErrorState
          title={t('activity.details')}
          message="The activity you're looking for doesn't exist or has been removed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const images = Array.isArray(activity.images) ? activity.images : [];
  const included = Array.isArray(activity.included) ? activity.included : [];
  const schedule = Array.isArray(activity.schedule) ? activity.schedule : [];

  const difficultyColor = activity.difficulty === 'easy' ? 'bg-green-100 text-green-700'
    : activity.difficulty === 'moderate' ? 'bg-amber-100 text-amber-700'
    : activity.difficulty === 'challenging' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-600';

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('search.results'), href: '/search?type=activities' },
          { label: activity.name },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-display-sm font-bold text-gray-900">{activity.name}</h1>
            <div className="flex items-center gap-1.5 text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{activity.destination || activity.city}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {activity.difficulty && (
                <span className={clsx('badge', difficultyColor)}>
                  {t(`activity.${activity.difficulty}`)}
                </span>
              )}
              {activity.category && (
                <span className="badge bg-purple-100 text-purple-700 gap-1">
                  <Compass className="w-3 h-3" />
                  {activity.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activity.avgRating > 0 && (
              <div className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{activity.avgRating}</span>
                {activity.reviewCount > 0 && (
                  <span className="text-white/70 text-sm">({activity.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={images} alt={activity.name} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-heading-md font-semibold mb-3">{t('activity.about')}</h2>
              <p className="text-gray-600 leading-relaxed">{activity.description}</p>
            </section>

            {/* What's Included */}
            {included.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('activity.included')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {included.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Details Grid */}
            <section>
              <h2 className="text-heading-md font-semibold mb-4">{t('activity.details')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {activity.duration && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('activity.duration')}</p>
                      <p className="text-sm text-gray-500">{activity.duration}</p>
                    </div>
                  </div>
                )}
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('activity.groupSize')}</p>
                    <p className="text-sm text-gray-500">
                      {t('activity.minGroup', { count: minGroup })} &middot; {t('activity.maxGroup', { count: maxGroup })}
                    </p>
                  </div>
                </div>
                {activity.difficulty && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      activity.difficulty === 'easy' ? 'bg-green-100' :
                      activity.difficulty === 'moderate' ? 'bg-amber-100' : 'bg-red-100'
                    )}>
                      <Compass className={clsx('w-5 h-5',
                        activity.difficulty === 'easy' ? 'text-green-600' :
                        activity.difficulty === 'moderate' ? 'text-amber-600' : 'text-red-600'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('activity.difficulty')}</p>
                      <p className="text-sm text-gray-500 capitalize">{t(`activity.${activity.difficulty}`)}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Schedule */}
            {schedule.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('activity.schedule')}</h2>
                <div className="space-y-3">
                  {schedule.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 text-sm font-bold text-primary-600">
                        {i + 1}
                      </div>
                      <div>
                        {item.time && <p className="text-sm font-medium text-gray-900">{item.time}</p>}
                        <p className="text-sm text-gray-600">{typeof item === 'string' ? item : item.description || item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cancellation Policy */}
            {activity.cancellationPolicy && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('activity.cancellation')}</h2>
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{activity.cancellationPolicy}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Booking Sidebar */}
          <div>
            <div className="card p-6 sticky top-24 shadow-soft-lg">
              <h3 className="text-lg font-semibold mb-5">{t('activity.bookActivity')}</h3>
              <div className="space-y-4">
                {/* Date picker */}
                <div>
                  <label className="input-label">{t('activity.schedule')}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Group Size */}
                <div>
                  <label className="input-label">{t('activity.groupSize')}</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGroupSize(Math.max(minGroup, groupSize - 1))}
                      className="btn-icon btn-ghost border border-gray-200 !p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{groupSize}</span>
                    <button
                      onClick={() => setGroupSize(Math.min(maxGroup, groupSize + 1))}
                      className="btn-icon btn-ghost border border-gray-200 !p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 ms-1">
                      {groupSize === 1 ? t('common.guest') : t('common.guests')}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <AnimatePresence>
                  {groupSize > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('activity.perPerson')}</span>
                          <span>{formatCurrency(pricePerPerson, activity.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>&times; {groupSize} {groupSize === 1 ? t('common.guest') : t('common.guests')}</span>
                        </div>
                        <div className="border-t border-primary-100 pt-2 flex justify-between">
                          <span className="font-semibold">{t('checkout.total')}</span>
                          <span className="text-xl font-bold text-primary-700">
                            {formatCurrency(totalAmount, activity.currency || 'USD')}
                          </span>
                        </div>
                        {pointsEarned > 0 && (
                          <p className="text-xs text-primary-600 text-center mt-1">
                            {t('checkout.earnPoints', { count: pointsEarned })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleBook} disabled={booking} className="btn-primary w-full">
                  {booking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user ? (
                    <>
                      <Lock className="w-4 h-4" />
                      {t('activity.bookNow')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : t('activity.loginToBook')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
