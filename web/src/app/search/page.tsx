'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';

function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    starRating: [] as number[],
    sortBy: 'price',
  });

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

    setLoading(true);
    api.searchHotels(params)
      .then(setResults)
      .catch(() => setResults({ items: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [searchParams, filters]);

  const toggleStar = (star: number) => {
    setFilters((prev) => ({
      ...prev,
      starRating: prev.starRating.includes(star)
        ? prev.starRating.filter((s) => s !== star)
        : [...prev.starRating, star],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {searchParams.get('destination')
          ? `Hotels in ${searchParams.get('destination')}`
          : 'Search Results'}
        {results.total > 0 && (
          <span className="text-gray-500 font-normal text-lg ml-2">
            ({results.total} found)
          </span>
        )}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="card p-4 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
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
              <h3 className="font-semibold mb-3">Star Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.starRating.includes(star)}
                      onChange={() => toggleStar(star)}
                      className="rounded border-gray-300 text-primary-600"
                    />
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: star }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-accent-500 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="input-field text-sm !py-2"
              >
                <option value="price">Price: Low to High</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : results.items.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No hotels found</p>
              <p className="text-sm mt-2">Try different dates or destination</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.items.map((hotel: any) => (
                <Link
                  key={hotel.id || hotel.supplierHotelId}
                  href={`/hotels/${hotel.id}`}
                  className="card flex flex-col sm:flex-row hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
                    <Image
                      src={
                        (Array.isArray(hotel.images) && hotel.images[0]) ||
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                      }
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: hotel.starRating || 3 }).map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-accent-500 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                      <p className="text-gray-500 text-sm">
                        {hotel.city || hotel.address?.city}, {hotel.country || hotel.address?.country}
                      </p>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{hotel.description}</p>
                      {hotel.amenities && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(Array.isArray(hotel.amenities) ? hotel.amenities : []).slice(0, 5).map((a: string) => (
                            <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center gap-2">
                        {hotel.avgRating > 0 && (
                          <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-sm font-medium">
                            {hotel.avgRating}
                          </span>
                        )}
                        {hotel.reviewCount > 0 && (
                          <span className="text-gray-500 text-sm">{hotel.reviewCount} reviews</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-700">
                          {formatCurrency(hotel.minPrice || hotel.rooms?.[0]?.pricePerNight || 0, hotel.currency || 'USD')}
                        </span>
                        <span className="text-gray-500 text-sm block">per night</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
