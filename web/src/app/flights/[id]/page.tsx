'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Clock, Luggage, Users, ArrowRight, Minus, Plus,
  Lock, Loader2, ShieldCheck,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function FlightDetailSkeleton() {
  return (
    <div className="section py-8 animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function FlightDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.getFlight(id as string)
      .then(setFlight)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Extract segment data
  const seg = flight?.segments?.[0];
  const depTime = seg?.departure?.dateTime ? new Date(seg.departure.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const arrTime = seg?.arrival?.dateTime ? new Date(seg.arrival.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const depDate = seg?.departure?.dateTime ? new Date(seg.departure.dateTime).toLocaleDateString() : '';
  const arrDate = seg?.arrival?.dateTime ? new Date(seg.arrival.dateTime).toLocaleDateString() : '';
  const depCity = seg?.departure?.airport?.city || '';
  const arrCity = seg?.arrival?.airport?.city || '';
  const depAirport = seg?.departure?.airport?.name || '';
  const arrAirport = seg?.arrival?.airport?.name || '';
  const airlineName = seg?.airline || '';
  const flightNum = seg?.flightNumber || '';
  const cabinCls = seg?.cabinClass || 'economy';

  const pricePerPassenger = flight?.pricePerPassenger || flight?.price || 0;
  const totalAmount = pricePerPassenger * passengers;
  const pointsEarned = Math.floor(totalAmount * 10);

  const handleBook = async () => {
    if (!user) { router.push('/login'); return; }
    if (!flight) return;
    setBooking(true);
    try {
      const bookingResult = await api.createBooking({
        productType: 'flight',
        productId: flight.id,
        supplierId: flight.supplierId,
        checkIn: seg?.departure?.dateTime || '',
        checkOut: seg?.arrival?.dateTime || '',
        guestCount: passengers,
        totalAmount,
        currency: flight.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      router.push(`/checkout/${bookingResult.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <FlightDetailSkeleton />;
  if (error || !flight) {
    return (
      <div className="section py-8">
        <ErrorState
          title={t('flight.flightDetails')}
          message="The flight you're looking for doesn't exist or has been removed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('search.results'), href: '/search?type=flights' },
          { label: t('flight.flightDetails') },
        ]} />

        {/* Flight Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-display-sm font-bold text-gray-900">{airlineName}</h1>
                {flightNum && (
                  <p className="text-gray-500 text-sm">{t('flight.flightNumber')}: {flightNum}</p>
                )}
              </div>
            </div>
            <p className="text-gray-600">
              {depCity} <ArrowRight className="w-4 h-4 inline mx-1" /> {arrCity}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Flight Timeline */}
            <section className="card p-6">
              <h2 className="text-heading-md font-semibold mb-6">{t('flight.flightDetails')}</h2>
              <div className="flex items-stretch gap-6">
                {/* Departure */}
                <div className="text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-gray-900">{depTime}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{depCity}</p>
                  {depAirport && (
                    <p className="text-xs text-gray-400">{depAirport}</p>
                  )}
                  {depDate && (
                    <p className="text-xs text-gray-400 mt-1">{depDate}</p>
                  )}
                </div>

                {/* Timeline line */}
                <div className="flex-1 flex flex-col items-center justify-center py-2">
                  <span className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {flight.totalDuration || 'N/A'}
                  </span>
                  <div className="w-full h-0.5 bg-primary-200 relative rounded-full">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary-600 border-2 border-white" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary-600 border-2 border-white" />
                    <Plane className="w-4 h-4 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  {flight.stops !== undefined && (
                    <span className={clsx(
                      'text-xs mt-2 badge',
                      flight.stops === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {flight.stops === 0 ? t('flight.direct') : `${flight.stops} ${t('flight.stops').toLowerCase()}`}
                    </span>
                  )}
                </div>

                {/* Arrival */}
                <div className="text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-gray-900">{arrTime}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{arrCity}</p>
                  {arrAirport && (
                    <p className="text-xs text-gray-400">{arrAirport}</p>
                  )}
                  {arrDate && (
                    <p className="text-xs text-gray-400 mt-1">{arrDate}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Cabin & Baggage */}
            <section className="card p-6">
              <h2 className="text-heading-md font-semibold mb-4">{t('flight.cabinClass')} & {t('flight.baggageAllowance')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('flight.cabinClass')}</p>
                    <p className="text-sm text-gray-500 capitalize">{cabinCls || 'Economy'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                    <Luggage className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('flight.baggageAllowance')}</p>
                    <p className="text-sm text-gray-500">
                      {t('flight.cabin')}: {flight.cabinBaggage || '7kg'} &middot; {t('flight.checked')}: {flight.checkedBaggage || '23kg'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="card p-6">
              <h2 className="text-heading-md font-semibold mb-4">{t('hotel.cancellation')}</h2>
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  flight.refundable ? 'bg-green-100' : 'bg-gray-100'
                )}>
                  <ShieldCheck className={clsx('w-5 h-5', flight.refundable ? 'text-green-600' : 'text-gray-400')} />
                </div>
                <div>
                  <span className={clsx(
                    'badge',
                    flight.refundable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {flight.refundable ? t('flight.refundable') : t('flight.nonRefundable')}
                  </span>
                  {flight.cancellationPolicy && (
                    <p className="text-sm text-gray-500 mt-2">{flight.cancellationPolicy}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div>
            <div className="card p-6 sticky top-24 shadow-soft-lg">
              <h3 className="text-lg font-semibold mb-5">{t('flight.bookFlight')}</h3>
              <div className="space-y-4">
                {/* Passengers */}
                <div>
                  <label className="input-label">{t('flight.passengers')}</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="btn-icon btn-ghost border border-gray-200 !p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{passengers}</span>
                    <button
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      className="btn-icon btn-ghost border border-gray-200 !p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 ms-1">
                      {passengers === 1 ? t('flight.passenger') : t('flight.passengers')}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <AnimatePresence>
                  {passengers > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('flight.perPassenger')}</span>
                          <span>{formatCurrency(pricePerPassenger, flight.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>&times; {passengers} {passengers === 1 ? t('flight.passenger') : t('flight.passengers')}</span>
                        </div>
                        <div className="border-t border-primary-100 pt-2 flex justify-between">
                          <span className="font-semibold">{t('checkout.total')}</span>
                          <span className="text-xl font-bold text-primary-700">
                            {formatCurrency(totalAmount, flight.currency || 'USD')}
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
                      {t('flight.bookNow')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : t('flight.loginToBook')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
