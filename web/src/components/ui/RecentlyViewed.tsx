'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Clock, X } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCurrency } from '@/hooks/useCurrency';

const TYPE_ROUTES: Record<string, string> = {
  hotel: '/hotels',
  flight: '/flights',
  activity: '/activities',
  car_rental: '/cars',
};

export function RecentlyViewed({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { items, clearAll } = useRecentlyViewed();
  const { format } = useCurrency();

  if (items.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-heading-md font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-500" />
          {t('dashboard.recentlyViewed')}
        </h2>
        <button
          onClick={clearAll}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {items.map((item) => {
          const route = TYPE_ROUTES[item.productType] || '/hotels';
          return (
            <Link
              key={`${item.productType}:${item.productId}`}
              href={`${route}/${item.productId}`}
              className="card overflow-hidden shrink-0 w-48 hover:shadow-soft-md transition-shadow group"
            >
              <div className="h-28 bg-gray-100 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Clock className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm font-semibold text-primary-600 mt-1">
                  {format(item.price, item.currency)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
