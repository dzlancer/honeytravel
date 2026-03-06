'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Users, Luggage, Fuel, Cog, MapPin, Star, Check, Minus, Plus,
  ArrowRight, Lock, Loader2, ShieldCheck, Calendar, Gauge,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function CarDetailSkeleton() {
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
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.getCar(id as string)
      .then(setCar)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const pricePerDay = car?.pricePerDay || car?.price || 0;
  const days = pickupDate && dropoffDate
    ? Math.max(1, Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / 86400000))
    : 0;
  const totalAmount = pricePerDay * days;
  const pointsEarned = Math.floor(totalAmount * 10);

  const handleBook = async () => {
    if (!user) { router.push('/login'); return; }
    if (!car) return;
    if (!pickupDate || !dropoffDate) {
      toast.error('Please select pickup and drop-off dates');
      return;
    }
    setBooking(true);
    try {
      const bookingResult = await api.createBooking({
        productType: 'car_rental',
        productId: car.id,
        supplierId: car.supplierId,
        checkIn: pickupDate,
        checkOut: dropoffDate,
        guestCount: 1,
        totalAmount,
        currency: car.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      router.push(`/checkout/${bookingResult.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <CarDetailSkeleton />;
  if (error || !car) {
    return (
      <div className="section py-8">
        <ErrorState
          title={t('car.about')}
          message="The vehicle you're looking for doesn't exist or has been removed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const images = Array.isArray(car.images) ? car.images : [];
  const features = Array.isArray(car.features) ? car.features : [];
  const carName = `${car.make || ''} ${car.model || ''} ${car.year ? `(${car.year})` : ''}`.trim();

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('search.results'), href: '/search?type=cars' },
          { label: carName || t('car.about') },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-display-sm font-bold text-gray-900">{carName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {car.category && (
                <span className="badge bg-blue-100 text-blue-700">{car.category}</span>
              )}
              {car.transmission && (
                <span className="badge bg-gray-100 text-gray-600 gap-1">
                  <Cog className="w-3 h-3" />
                  {car.transmission}
                </span>
              )}
            </div>
          </div>
          {car.avgRating > 0 && (
            <div className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{car.avgRating}</span>
              {car.reviewCount > 0 && (
                <span className="text-white/70 text-sm">({car.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={images} alt={carName} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Specs Grid */}
            <section>
              <h2 className="text-heading-md font-semibold mb-4">{t('car.specs')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {car.seats && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('car.seats')}</p>
                      <p className="text-sm text-gray-500">{car.seats}</p>
                    </div>
                  </div>
                )}
                {car.bags !== undefined && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                      <Luggage className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('car.bags')}</p>
                      <p className="text-sm text-gray-500">{car.bags}</p>
                    </div>
                  </div>
                )}
                {car.transmission && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                      <Cog className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('car.transmission')}</p>
                      <p className="text-sm text-gray-500 capitalize">{car.transmission}</p>
                    </div>
                  </div>
                )}
                {car.fuelType && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <Fuel className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('car.fuelType')}</p>
                      <p className="text-sm text-gray-500 capitalize">{car.fuelType}</p>
                    </div>
                  </div>
                )}
                {car.mileagePolicy && (
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Gauge className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('car.mileage')}</p>
                      <p className="text-sm text-gray-500">{car.mileagePolicy}</p>
                    </div>
                  </div>
                )}
                <div className="card p-4 flex items-start gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    car.insuranceIncluded ? 'bg-green-100' : 'bg-gray-100'
                  )}>
                    <ShieldCheck className={clsx('w-5 h-5', car.insuranceIncluded ? 'text-green-600' : 'text-gray-400')} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('car.insurance')}</p>
                    <p className="text-sm text-gray-500">
                      {car.insuranceIncluded ? t('car.insuranceIncluded') : 'Not included'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            {features.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('car.features')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pickup/Dropoff Info */}
            {(car.pickupLocation || car.dropoffLocation) && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('car.pickupDropoff')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.pickupLocation && (
                    <div className="card p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('car.pickupLocation')}</p>
                        <p className="text-sm text-gray-500">{typeof car.pickupLocation === 'object' ? `${car.pickupLocation.city} — ${car.pickupLocation.address}` : car.pickupLocation}</p>
                      </div>
                    </div>
                  )}
                  {car.dropoffLocation && (
                    <div className="card p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('car.dropoffLocation')}</p>
                        <p className="text-sm text-gray-500">{typeof car.dropoffLocation === 'object' ? `${car.dropoffLocation.city} — ${car.dropoffLocation.address}` : car.dropoffLocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Booking Sidebar */}
          <div>
            <div className="card p-6 sticky top-24 shadow-soft-lg">
              <h3 className="text-lg font-semibold mb-5">{t('car.bookCar')}</h3>
              <div className="space-y-4">
                {/* Pickup Date */}
                <div>
                  <label className="input-label">{t('car.pickupDate')}</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Dropoff Date */}
                <div>
                  <label className="input-label">{t('car.dropoffDate')}</label>
                  <input
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Price Breakdown */}
                <AnimatePresence>
                  {days > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('car.perDay')}</span>
                          <span>{formatCurrency(pricePerDay, car.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>&times; {days} {days === 1 ? t('car.day') : t('car.days')}</span>
                        </div>
                        <div className="border-t border-primary-100 pt-2 flex justify-between">
                          <span className="font-semibold">{t('checkout.total')}</span>
                          <span className="text-xl font-bold text-primary-700">
                            {formatCurrency(totalAmount, car.currency || 'USD')}
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
                      {t('car.bookNow')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : t('car.loginToBook')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
