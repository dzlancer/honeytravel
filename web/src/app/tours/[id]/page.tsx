'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Clock, Users, Check, X, Minus, Plus, ArrowRight,
  Lock, Loader2, ShieldCheck, Compass, ChevronDown,
  Utensils, Hotel, Globe, Baby, Mountain,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ErrorState } from '@/components/ui/ErrorState';
import { ReviewsList } from '@/components/ui/ReviewsList';
import { StarRating } from '@/components/ui/StarRating';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { setPageMeta } from '@/lib/metadata';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { Tour, TourCalculationResponse } from '@shared/types';

function TourDetailSkeleton() {
  return (
    <div className="section py-8 animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
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
        <div className="h-[500px] bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function TourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState<TourCalculationResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    api.getTour(id as string)
      .then((data) => {
        setTour(data);
        setPageMeta({
          title: data.name,
          description: `Book ${data.name} — ${data.duration} tour in ${data.destination?.city || 'Algeria'}. From ${formatCurrency(data.price, data.currency || 'USD')}/person.`,
          image: data.images?.[0],
        });
        if (data.availableDates?.length) setSelectedDate(data.availableDates[0]);
        addRecentlyViewed({
          productType: 'tour', productId: data.id, name: data.name,
          image: data.images?.[0] || '', price: data.price || 0, currency: data.currency || 'USD',
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleCalculatePrice = async () => {
    if (!tour || !selectedDate) { toast.error(t('tour.selectDate', 'Please select a date')); return; }
    setCalculating(true);
    try {
      const result = await api.calculateTourPrice(tour.id, {
        date: selectedDate, adults, children: children > 0 ? children : undefined,
      });
      setCalculatedPrice(result);
      if (!result.available) toast.error(t('tour.notAvailable', 'This date is not available'));
    } catch (err: any) {
      toast.error(err.message || t('tour.calcError', 'Failed to calculate price'));
    } finally { setCalculating(false); }
  };

  const handleBook = async () => {
    if (!user) { router.push('/login'); return; }
    if (!tour) return;
    if (!selectedDate) { toast.error(t('tour.selectDate', 'Please select a date')); return; }
    const totalAmount = calculatedPrice?.totalPrice ?? tour.price * adults + (tour.priceChild || 0) * children;
    setBookingLoading(true);
    try {
      const booking = await api.createBooking({
        productType: 'tour', productId: tour.id, supplierId: tour.supplierId,
        checkIn: selectedDate, checkOut: selectedDate, guestCount: adults + children,
        totalAmount, currency: tour.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      router.push(`/checkout/${booking.id}`);
    } catch (err: any) {
      toast.error(err.message || t('tour.bookError', 'Failed to create booking'));
    } finally { setBookingLoading(false); }
  };

  if (loading) return <TourDetailSkeleton />;
  if (error || !tour) {
    return (
      <div className="section py-8">
        <ErrorState title={t('tour.details', 'Tour Details')}
          message="The tour you're looking for doesn't exist or has been removed."
          onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const images = Array.isArray(tour.images) ? tour.images : [];
  const highlights = Array.isArray(tour.highlights) ? tour.highlights : [];
  const includes = Array.isArray(tour.includes) ? tour.includes : [];
  const excludes = Array.isArray(tour.excludes) ? tour.excludes : [];
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const accommodations = Array.isArray(tour.accommodations) ? tour.accommodations : [];
  const availableDates = Array.isArray(tour.availableDates) ? tour.availableDates : [];
  const guideLanguages = Array.isArray(tour.guideLanguages) ? tour.guideLanguages : [];

  const difficultyColor = tour.difficulty === 'easy' ? 'bg-green-100 text-green-700'
    : tour.difficulty === 'moderate' ? 'bg-amber-100 text-amber-700'
    : tour.difficulty === 'challenging' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home', 'Home'), href: '/' },
          { label: t('nav.tours', 'Tours'), href: '/search?type=tours' },
          { label: tour.name },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-display-sm font-bold text-gray-900">{tour.name}</h1>
            <div className="flex items-center gap-1.5 text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{tour.destination?.city}, {tour.destination?.country}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge bg-blue-100 text-blue-700 gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
              {tour.difficulty && (
                <span className={clsx('badge', difficultyColor)}><Mountain className="w-3 h-3" />{t(`tour.difficulty.${tour.difficulty}`, tour.difficulty)}</span>
              )}
              {tour.tourStyle && (
                <span className="badge bg-purple-100 text-purple-700 gap-1"><Compass className="w-3 h-3" />{tour.tourStyle}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton productType="tour" productId={tour.id} />
            {tour.avgRating > 0 && (
              <div className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{tour.avgRating}</span>
                {tour.reviewCount > 0 && <span className="text-white/70 text-sm">({tour.reviewCount})</span>}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8"><ImageGallery images={images} alt={tour.name} /></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-heading-md font-semibold mb-3">{t('tour.about', 'About This Tour')}</h2>
              <p className="text-gray-600 leading-relaxed">{tour.description}</p>
            </section>

            {highlights.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.highlights', 'Highlights')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-primary-600" /></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {itinerary.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.itinerary', 'Itinerary')}</h2>
                <div className="space-y-3">
                  {itinerary.map((day) => (
                    <div key={day.day} className="bg-white rounded-2xl shadow-soft-md overflow-hidden">
                      <button onClick={() => toggleDay(day.day)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 text-sm font-bold text-primary-600">{day.day}</div>
                          <div>
                            <p className="font-medium text-gray-900">{t('tour.dayLabel', 'Day {{day}}', { day: day.day })}: {day.title}</p>
                            {day.locations && day.locations.length > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{day.locations.join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={clsx('w-5 h-5 text-gray-400 transition-transform', expandedDays.includes(day.day) && 'rotate-180')} />
                      </button>
                      <AnimatePresence>
                        {expandedDays.includes(day.day) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3">
                              <p className="text-sm text-gray-600 leading-relaxed">{day.description}</p>
                              <div className="flex flex-wrap gap-3">
                                {day.meals && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Utensils className="w-3.5 h-3.5" />
                                    {[day.meals.breakfast && t('tour.breakfast', 'Breakfast'), day.meals.lunch && t('tour.lunch', 'Lunch'),
                                      day.meals.dinner && t('tour.dinner', 'Dinner')].filter(Boolean).join(', ') || t('tour.noMeals', 'No meals')}
                                  </div>
                                )}
                                {day.accommodation && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500"><Hotel className="w-3.5 h-3.5" />{day.accommodation}</div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {includes.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.includes', "What's Included")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green-600" /></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {excludes.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.excludes', "What's Not Included")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {excludes.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><X className="w-4 h-4 text-red-600" /></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {accommodations.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.accommodations', 'Accommodations')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {accommodations.map((acc, i) => (
                    <div key={i} className="card p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Hotel className="w-5 h-5 text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{acc.type} &middot; {acc.city}</p>
                        {acc.starRating && <StarRating rating={acc.starRating} size="sm" className="mt-1" />}
                        <p className="text-xs text-gray-400 mt-1">{acc.nights} {acc.nights === 1 ? t('tour.night', 'night') : t('tour.nights', 'nights')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {guideLanguages.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.guideLanguages', 'Guide Languages')}</h2>
                <div className="flex flex-wrap gap-2">
                  {guideLanguages.map((lang, i) => (
                    <span key={i} className="badge bg-gray-100 text-gray-700 gap-1"><Globe className="w-3 h-3" />{lang}</span>
                  ))}
                </div>
              </section>
            )}

            {tour.cancellationPolicy && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.cancellation', 'Cancellation Policy')}</h2>
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-success-600" /></div>
                  <p className="text-sm text-gray-600">{tour.cancellationPolicy}</p>
                </div>
              </section>
            )}

            {tour.childPolicy && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('tour.childPolicy', 'Child Policy')}</h2>
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0"><Baby className="w-5 h-5 text-purple-600" /></div>
                  <p className="text-sm text-gray-600">{tour.childPolicy}</p>
                </div>
              </section>
            )}

            <ReviewsList productType="tour" productId={tour.id} />
          </div>

          {/* Right Column — Booking Sidebar */}
          <div>
            <div className="card p-6 sticky top-24 shadow-soft-lg">
              <h3 className="text-lg font-semibold mb-1">{t('tour.bookTour', 'Book This Tour')}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-bold text-primary-700">{formatCurrency(tour.price, tour.currency || 'USD')}</span>
                <span className="text-sm text-gray-500">/ {t('tour.perPerson', 'person')}</span>
              </div>
              {tour.priceChild != null && tour.priceChild > 0 && (
                <p className="text-sm text-gray-500 -mt-4 mb-5">
                  {t('tour.childPrice', 'Children')}: {formatCurrency(tour.priceChild, tour.currency || 'USD')} / {t('tour.perChild', 'child')}
                </p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="input-label">{t('tour.selectDateLabel', 'Travel Date')}</label>
                  {availableDates.length > 0 ? (
                    <select value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCalculatedPrice(null); }} className="input-field">
                      {availableDates.map((d) => (
                        <option key={d} value={d}>{new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCalculatedPrice(null); }} className="input-field" />
                  )}
                </div>

                <div>
                  <label className="input-label">{t('tour.adults', 'Adults')}</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setAdults(Math.max(1, adults - 1)); setCalculatedPrice(null); }} className="btn-icon btn-ghost border border-gray-200 !p-2"><Minus className="w-4 h-4" /></button>
                    <span className="text-lg font-semibold w-8 text-center">{adults}</span>
                    <button onClick={() => { setAdults(Math.min(10, adults + 1)); setCalculatedPrice(null); }} className="btn-icon btn-ghost border border-gray-200 !p-2"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <div>
                  <label className="input-label">{t('tour.children', 'Children')}</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setChildren(Math.max(0, children - 1)); setCalculatedPrice(null); }} className="btn-icon btn-ghost border border-gray-200 !p-2"><Minus className="w-4 h-4" /></button>
                    <span className="text-lg font-semibold w-8 text-center">{children}</span>
                    <button onClick={() => { setChildren(Math.min(5, children + 1)); setCalculatedPrice(null); }} className="btn-icon btn-ghost border border-gray-200 !p-2"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <button onClick={handleCalculatePrice} disabled={calculating || !selectedDate}
                  className="btn-ghost w-full border border-primary-200 text-primary-700 hover:bg-primary-50">
                  {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : t('tour.calculatePrice', 'Calculate Price')}
                </button>

                <AnimatePresence>
                  {calculatedPrice && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{adults} {adults === 1 ? t('tour.adult', 'adult') : t('tour.adults', 'adults')} &times; {formatCurrency(calculatedPrice.pricePerAdult, calculatedPrice.currency)}</span>
                          <span>{formatCurrency(calculatedPrice.pricePerAdult * adults, calculatedPrice.currency)}</span>
                        </div>
                        {children > 0 && calculatedPrice.pricePerChild != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{children} {children === 1 ? t('tour.child', 'child') : t('tour.children', 'children')} &times; {formatCurrency(calculatedPrice.pricePerChild, calculatedPrice.currency)}</span>
                            <span>{formatCurrency(calculatedPrice.pricePerChild * children, calculatedPrice.currency)}</span>
                          </div>
                        )}
                        {calculatedPrice.supplements?.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-500">
                            <span>{s.name}</span><span>{formatCurrency(s.price, calculatedPrice.currency)}</span>
                          </div>
                        ))}
                        <div className="border-t border-primary-100 pt-2 flex justify-between">
                          <span className="font-semibold">{t('checkout.total', 'Total')}</span>
                          <span className="text-xl font-bold text-primary-700">{formatCurrency(calculatedPrice.totalPrice, calculatedPrice.currency)}</span>
                        </div>
                        {!calculatedPrice.available && (
                          <p className="text-xs text-red-600 text-center">{t('tour.dateUnavailable', 'This date is currently unavailable')}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleBook} disabled={bookingLoading || (calculatedPrice != null && !calculatedPrice.available)} className="btn-primary w-full">
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" />
                    : user ? <><Lock className="w-4 h-4" />{t('tour.bookNow', 'Book Now')}<ArrowRight className="w-4 h-4" /></>
                    : t('tour.loginToBook', 'Login to Book')}
                </button>

                <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {t('tour.groupSizeInfo', 'Group size: {{min}}-{{max}} people', { min: tour.groupSize?.min || 1, max: tour.groupSize?.max || 20 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
