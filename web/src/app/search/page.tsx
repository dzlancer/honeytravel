'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal, X, SearchX, MapPin, Wifi, Car as CarIcon, UtensilsCrossed,
  Waves, Dumbbell, Sparkles, Check, Plane, Clock, Users, Compass, Star,
  Fuel, Cog,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { StarRating } from '@/components/ui/StarRating';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchCardSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/components/ui/PageTransition';
import clsx from 'clsx';

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, pool: Waves, parking: CarIcon, restaurant: UtensilsCrossed,
  gym: Dumbbell, spa: Sparkles,
};

const ITEMS_PER_PAGE = 10;

type SearchType = 'hotels' | 'flights' | 'activities' | 'cars';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [results, setResults] = useState<any>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const type = (searchParams.get('type') || 'hotels') as SearchType;

  // Type-aware filter state
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    // Hotel filters
    starRating: [] as number[],
    sortBy: 'price',
    // Flight filters
    stops: '' as '' | 'direct' | '1' | '2+',
    // Activity filters
    activityCategories: [] as string[],
    difficulty: '',
    // Car filters
    carCategory: '',
    transmission: '',
  });

  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const params: Record<string, string> = {};

    if (type === 'flights') {
      const origin = searchParams.get('origin');
      if (origin) params.origin = origin;
      const dest = searchParams.get('destination');
      if (dest) params.destination = dest;
      const dep = searchParams.get('departureDate');
      if (dep) params.departureDate = dep;
      const pax = searchParams.get('passengers');
      if (pax) params.passengers = pax;
      if (filters.stops) params.stops = filters.stops;
    } else if (type === 'activities') {
      const dest = searchParams.get('destination');
      if (dest) params.destination = dest;
      const date = searchParams.get('date');
      if (date) params.date = date;
      const cat = searchParams.get('category');
      if (cat) params.category = cat;
      const gs = searchParams.get('groupSize');
      if (gs) params.groupSize = gs;
      if (filters.activityCategories.length) params.category = filters.activityCategories.join(',');
      if (filters.difficulty) params.difficulty = filters.difficulty;
    } else if (type === 'cars') {
      const loc = searchParams.get('pickupLocation');
      if (loc) params.pickupLocation = loc;
      const pd = searchParams.get('pickupDate');
      if (pd) params.pickupDate = pd;
      const dd = searchParams.get('dropoffDate');
      if (dd) params.dropoffDate = dd;
      const cat = searchParams.get('category');
      if (cat) params.category = cat;
      const trans = searchParams.get('transmission');
      if (trans) params.transmission = trans;
      if (filters.carCategory) params.category = filters.carCategory;
      if (filters.transmission) params.transmission = filters.transmission;
    } else {
      // Hotels
      const dest = searchParams.get('destination');
      if (dest) params.destination = dest;
      const ci = searchParams.get('checkIn');
      if (ci) params.checkIn = ci;
      const co = searchParams.get('checkOut');
      if (co) params.checkOut = co;
      const g = searchParams.get('guests');
      if (g) params.guests = g;
      if (filters.starRating.length) params.starRating = filters.starRating.join(',');
    }

    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    params.sortBy = filters.sortBy;
    params.page = String(page);
    params.limit = String(ITEMS_PER_PAGE);

    setLoading(true);

    let searchPromise: Promise<any>;
    if (type === 'flights') {
      searchPromise = api.searchFlights(params);
    } else if (type === 'activities') {
      searchPromise = api.searchActivities(params);
    } else if (type === 'cars') {
      searchPromise = api.searchCars(params);
    } else {
      searchPromise = api.searchHotels(params);
    }

    searchPromise
      .then(setResults)
      .catch(() => setResults({ items: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [searchParams, filters, page, type]);

  const toggleStar = (star: number) => {
    setFilters((prev) => ({
      ...prev,
      starRating: prev.starRating.includes(star)
        ? prev.starRating.filter((s) => s !== star)
        : [...prev.starRating, star],
    }));
  };

  const toggleActivityCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      activityCategories: prev.activityCategories.includes(cat)
        ? prev.activityCategories.filter((c) => c !== cat)
        : [...prev.activityCategories, cat],
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '', maxPrice: '', starRating: [], sortBy: 'price',
      stops: '', activityCategories: [], difficulty: '', carCategory: '', transmission: '',
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice ||
    filters.starRating.length > 0 || filters.stops || filters.activityCategories.length > 0 ||
    filters.difficulty || filters.carCategory || filters.transmission;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = Math.ceil((results.total || 0) / ITEMS_PER_PAGE);

  // Title label based on type
  const typeLabel = type === 'flights' ? t('common.flights')
    : type === 'activities' ? t('common.activities')
    : type === 'cars' ? t('common.carRentals')
    : t('common.hotels');

  const destination = searchParams.get('destination') || searchParams.get('pickupLocation') || searchParams.get('origin');

  /* ---- Filter Sidebar Content ---- */
  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{t('search.filters')}</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <X className="w-3 h-3" />
            {t('search.clearFilters')}
          </button>
        )}
      </div>

      {/* Price range - all types */}
      <div>
        <label className="input-label">{t('search.priceRange')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="input-field text-sm !py-2"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="input-field text-sm !py-2"
          />
        </div>
      </div>

      {/* Hotel: Star Rating */}
      {type === 'hotels' && (
        <>
          <div>
            <label className="input-label">{t('search.starRating')}</label>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.starRating.includes(star)}
                    onChange={() => toggleStar(star)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <StarRating rating={star} size="sm" />
                  <span className="text-xs text-gray-400 group-hover:text-gray-600">({star})</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">{t('search.sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="price">{t('search.priceLow')}</option>
              <option value="rating">{t('search.ratingHigh')}</option>
            </select>
          </div>
        </>
      )}

      {/* Flights: Stops + Sort */}
      {type === 'flights' && (
        <>
          <div>
            <label className="input-label">{t('flight.stops')}</label>
            <div className="space-y-2">
              {[
                { value: '', label: 'All' },
                { value: 'direct', label: t('flight.direct') },
                { value: '1', label: t('flight.oneStop') },
                { value: '2+', label: '2+ Stops' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="stops"
                    checked={filters.stops === opt.value}
                    onChange={() => setFilters({ ...filters, stops: opt.value as any })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">{t('search.sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="price">{t('search.priceLow')}</option>
              <option value="duration">{t('flight.duration')}</option>
            </select>
          </div>
        </>
      )}

      {/* Activities: Category + Difficulty + Sort */}
      {type === 'activities' && (
        <>
          <div>
            <label className="input-label">{t('activity.category')}</label>
            <div className="space-y-2">
              {['adventure', 'cultural', 'nature', 'cityTour'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.activityCategories.includes(cat)}
                    onChange={() => toggleActivityCategory(cat)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                    {t(`activity.${cat}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">{t('activity.difficulty')}</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="">All</option>
              <option value="easy">{t('activity.easy')}</option>
              <option value="moderate">{t('activity.moderate')}</option>
              <option value="challenging">{t('activity.challenging')}</option>
            </select>
          </div>
          <div>
            <label className="input-label">{t('search.sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="price">{t('search.priceLow')}</option>
              <option value="rating">{t('search.ratingHigh')}</option>
            </select>
          </div>
        </>
      )}

      {/* Cars: Category + Transmission + Sort */}
      {type === 'cars' && (
        <>
          <div>
            <label className="input-label">{t('car.category')}</label>
            <select
              value={filters.carCategory}
              onChange={(e) => setFilters({ ...filters, carCategory: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="">All</option>
              <option value="economy">{t('car.economy')}</option>
              <option value="compact">{t('car.compact')}</option>
              <option value="suv">{t('car.suv')}</option>
              <option value="luxury">{t('car.luxury')}</option>
            </select>
          </div>
          <div>
            <label className="input-label">{t('car.transmission')}</label>
            <select
              value={filters.transmission}
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="">All</option>
              <option value="automatic">{t('car.automatic')}</option>
              <option value="manual">{t('car.manual')}</option>
            </select>
          </div>
          <div>
            <label className="input-label">{t('search.sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field text-sm !py-2"
            >
              <option value="price">{t('search.priceLow')}</option>
              <option value="rating">{t('search.ratingHigh')}</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  /* ---- Result card renderers ---- */

  const renderHotelCard = (hotel: any) => (
    <motion.div key={hotel.id || hotel.supplierHotelId} variants={staggerItem}>
      <Link href={`/hotels/${hotel.id}`} className="card-hover flex flex-col sm:flex-row group">
        <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
          <Image
            src={(Array.isArray(hotel.images) && hotel.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hotel.avgRating > 0 && (
            <div className="absolute top-3 end-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {hotel.avgRating}
            </div>
          )}
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <StarRating rating={hotel.starRating || 3} size="sm" className="mb-1.5" />
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {hotel.city || hotel.address?.city}, {hotel.country || hotel.address?.country}
            </div>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{hotel.description}</p>
            {hotel.amenities && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(Array.isArray(hotel.amenities) ? hotel.amenities : []).slice(0, 4).map((a: string) => {
                  const Icon = AMENITY_ICONS[a.toLowerCase()] || Check;
                  return (
                    <span key={a} className="badge bg-gray-100 text-gray-600 gap-1">
                      <Icon className="w-3 h-3" />
                      <span className="capitalize">{a}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              {hotel.reviewCount > 0 && (
                <span className="text-gray-400 text-xs">{hotel.reviewCount} {t('common.reviews')}</span>
              )}
            </div>
            <div className="text-end">
              <span className="text-xs text-gray-400">{t('common.from')}</span>
              <span className="text-xl font-bold text-primary-700 ms-1">
                {formatCurrency(hotel.minPrice || hotel.rooms?.[0]?.pricePerNight || 0, hotel.currency || 'USD')}
              </span>
              <span className="text-gray-400 text-xs block">{t('common.perNight')}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const renderFlightCard = (flight: any) => (
    <motion.div key={flight.id} variants={staggerItem}>
      <Link href={`/flights/${flight.id}`} className="card-hover flex flex-col sm:flex-row group">
        <div className="p-4 sm:p-5 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">{flight.airline}</span>
              {flight.flightNumber && (
                <span className="text-gray-400 text-xs ms-2">{flight.flightNumber}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{flight.departureTime || '--:--'}</p>
              <p className="text-xs text-gray-500">{flight.departureCity || flight.origin}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">{flight.duration}</span>
              <div className="w-full h-px bg-gray-300 relative">
                <Plane className="w-3 h-3 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              {flight.stops !== undefined && (
                <span className={clsx(
                  'text-xs mt-1 badge',
                  flight.stops === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}>
                  {flight.stops === 0 ? t('flight.direct') : `${flight.stops} ${t('flight.stops').toLowerCase()}`}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{flight.arrivalTime || '--:--'}</p>
              <p className="text-xs text-gray-500">{flight.arrivalCity || flight.destination}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {flight.cabinClass && (
              <span className="badge bg-gray-100 text-gray-600">{flight.cabinClass}</span>
            )}
            {flight.refundable && (
              <span className="badge bg-green-100 text-green-700">{t('flight.refundable')}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-center p-4 sm:p-5 border-t sm:border-t-0 sm:border-s border-gray-100 min-w-[140px]">
          <span className="text-xs text-gray-400">{t('common.from')}</span>
          <span className="text-xl font-bold text-primary-700">
            {formatCurrency(flight.price || flight.pricePerPassenger || 0, flight.currency || 'USD')}
          </span>
          <span className="text-gray-400 text-xs">{t('flight.perPassenger')}</span>
        </div>
      </Link>
    </motion.div>
  );

  const renderActivityCard = (activity: any) => (
    <motion.div key={activity.id} variants={staggerItem}>
      <Link href={`/activities/${activity.id}`} className="card-hover flex flex-col sm:flex-row group">
        <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
          <Image
            src={(Array.isArray(activity.images) && activity.images[0]) || 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400'}
            alt={activity.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
              {activity.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {activity.destination || activity.city}
            </div>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{activity.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {activity.duration && (
                <span className="badge bg-blue-100 text-blue-700 gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.duration}
                </span>
              )}
              {activity.difficulty && (
                <span className={clsx('badge gap-1',
                  activity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  activity.difficulty === 'moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}>
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
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              {activity.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
                  <span className="text-sm font-medium text-gray-700">{activity.avgRating}</span>
                  {activity.reviewCount > 0 && (
                    <span className="text-gray-400 text-xs">({activity.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-end">
              <span className="text-xs text-gray-400">{t('common.from')}</span>
              <span className="text-xl font-bold text-primary-700 ms-1">
                {formatCurrency(activity.pricePerPerson || activity.price || 0, activity.currency || 'USD')}
              </span>
              <span className="text-gray-400 text-xs block">{t('common.perPerson')}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const renderCarCard = (car: any) => (
    <motion.div key={car.id} variants={staggerItem}>
      <Link href={`/cars/${car.id}`} className="card-hover flex flex-col sm:flex-row group">
        <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
          <Image
            src={(Array.isArray(car.images) && car.images[0]) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0637?w=400'}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
              {car.make} {car.model} {car.year && `(${car.year})`}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {car.category && (
                <span className="badge bg-blue-100 text-blue-700">{car.category}</span>
              )}
              {car.transmission && (
                <span className="badge bg-gray-100 text-gray-600 gap-1">
                  <Cog className="w-3 h-3" />
                  {car.transmission}
                </span>
              )}
              {car.fuelType && (
                <span className="badge bg-green-100 text-green-700 gap-1">
                  <Fuel className="w-3 h-3" />
                  {car.fuelType}
                </span>
              )}
            </div>
            {car.features && Array.isArray(car.features) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {car.features.slice(0, 4).map((f: string) => (
                  <span key={f} className="text-xs text-gray-500 flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {car.seats && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {car.seats}
                </span>
              )}
            </div>
            <div className="text-end">
              <span className="text-xs text-gray-400">{t('common.from')}</span>
              <span className="text-xl font-bold text-primary-700 ms-1">
                {formatCurrency(car.pricePerDay || car.price || 0, car.currency || 'USD')}
              </span>
              <span className="text-gray-400 text-xs block">{t('car.perDay')}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const renderCard = (item: any) => {
    switch (type) {
      case 'flights': return renderFlightCard(item);
      case 'activities': return renderActivityCard(item);
      case 'cars': return renderCarCard(item);
      default: return renderHotelCard(item);
    }
  };

  return (
    <PageTransition>
      <div className="section py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-display-sm font-bold text-gray-900">
              {destination ? `${typeLabel} — ${destination}` : t('search.results')}
            </h1>
            {!loading && results.total > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                {t('search.resultsCount', { count: results.total })}
              </p>
            )}
          </div>
          <button
            onClick={() => setMobileFilters(true)}
            className="lg:hidden btn-ghost btn-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('search.filters')}
          </button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.minPrice && (
              <span className="badge badge-primary">Min: ${filters.minPrice}</span>
            )}
            {filters.maxPrice && (
              <span className="badge badge-primary">Max: ${filters.maxPrice}</span>
            )}
            {filters.starRating.map((s) => (
              <span key={s} className="badge badge-accent">{s} Stars</span>
            ))}
            {filters.stops && (
              <span className="badge badge-primary">{filters.stops === 'direct' ? t('flight.direct') : `${filters.stops} stops`}</span>
            )}
            {filters.activityCategories.map((c) => (
              <span key={c} className="badge badge-accent capitalize">{c}</span>
            ))}
            {filters.difficulty && (
              <span className="badge badge-primary capitalize">{filters.difficulty}</span>
            )}
            {filters.carCategory && (
              <span className="badge badge-primary capitalize">{filters.carCategory}</span>
            )}
            {filters.transmission && (
              <span className="badge badge-primary capitalize">{filters.transmission}</span>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="card p-5 sticky top-24">{filterContent}</div>
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
              <div className="absolute inset-y-0 end-0 w-80 bg-white p-6 overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg">{t('search.filters')}</h2>
                  <button onClick={() => setMobileFilters(false)} className="btn-icon btn-ghost">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {filterContent}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <SearchCardSkeleton key={i} />)}
              </div>
            ) : results.items.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={t('search.noResults').split('.')[0]}
                description={t('search.noResults')}
                action={hasActiveFilters ? { label: t('search.clearFilters'), onClick: clearFilters } : undefined}
              />
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {results.items.map((item: any) => renderCard(item))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="section py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <SearchCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
