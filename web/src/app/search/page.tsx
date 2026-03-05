'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, SearchX, MapPin, Wifi, Car, UtensilsCrossed, Waves, Dumbbell, Sparkles, Check } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { StarRating } from '@/components/ui/StarRating';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchCardSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, staggerItem } from '@/components/ui/PageTransition';
import clsx from 'clsx';

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, pool: Waves, parking: Car, restaurant: UtensilsCrossed,
  gym: Dumbbell, spa: Sparkles,
};

const ITEMS_PER_PAGE = 10;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [results, setResults] = useState<any>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    starRating: [] as number[],
    sortBy: 'price',
  });

  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const params: Record<string, string> = {};
    const dest = searchParams.get('destination');
    if (dest) params.destination = dest;
    const ci = searchParams.get('checkIn');
    if (ci) params.checkIn = ci;
    const co = searchParams.get('checkOut');
    if (co) params.checkOut = co;
    const g = searchParams.get('guests');
    if (g) params.guests = g;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.starRating.length) params.starRating = filters.starRating.join(',');
    params.sortBy = filters.sortBy;
    params.page = String(page);
    params.limit = String(ITEMS_PER_PAGE);

    setLoading(true);
    api.searchHotels(params)
      .then(setResults)
      .catch(() => setResults({ items: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [searchParams, filters, page]);

  const toggleStar = (star: number) => {
    setFilters((prev) => ({
      ...prev,
      starRating: prev.starRating.includes(star)
        ? prev.starRating.filter((s) => s !== star)
        : [...prev.starRating, star],
    }));
  };

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', starRating: [], sortBy: 'price' });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.starRating.length > 0;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = Math.ceil((results.total || 0) / ITEMS_PER_PAGE);
  const destination = searchParams.get('destination');

  /* ─── Filter Sidebar Content ─────────────────────────────────── */
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
    </div>
  );

  return (
    <PageTransition>
      <div className="section py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-display-sm font-bold text-gray-900">
              {destination ? `${t('common.hotels')} — ${destination}` : t('search.results')}
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
                  {results.items.map((hotel: any) => (
                    <motion.div key={hotel.id || hotel.supplierHotelId} variants={staggerItem}>
                      <Link
                        href={`/hotels/${hotel.id}`}
                        className="card-hover flex flex-col sm:flex-row group"
                      >
                        <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
                          <Image
                            src={
                              (Array.isArray(hotel.images) && hotel.images[0]) ||
                              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                            }
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
                  ))}
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
