'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { PageTransition } from '@/components/ui/PageTransition';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { Heart, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const TABS = ['all', 'hotel', 'flight', 'activity', 'car_rental'] as const;

const TYPE_ROUTES: Record<string, string> = {
  hotel: '/hotels',
  flight: '/flights',
  activity: '/activities',
  car_rental: '/cars',
};

const TYPE_LABELS: Record<string, string> = {
  all: 'wishlist.all',
  hotel: 'common.hotels',
  flight: 'common.flights',
  activity: 'common.activities',
  car_rental: 'common.carRentals',
};

export default function WishlistPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading } = useFavorites();
  const [activeTab, setActiveTab] = useState<string>('all');

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

  const filtered = activeTab === 'all'
    ? favorites
    : favorites.filter((f: any) => f.productType === activeTab);

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('wishlist.title') },
        ]} />

        <h1 className="text-display-sm font-bold text-gray-900 mb-6">{t('wishlist.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {t(TYPE_LABELS[tab])}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((fav: any) => {
              const route = TYPE_ROUTES[fav.productType] || '/hotels';
              return (
                <div key={fav.id || `${fav.productType}:${fav.productId}`} className="card p-4 relative">
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10">
                    <FavoriteButton productType={fav.productType} productId={fav.productId} size="sm" />
                  </div>
                  <Link href={`${route}/${fav.productId}`} className="block">
                    <span className="badge bg-primary-100 text-primary-700 text-xs capitalize mb-2 inline-block">
                      {fav.productType?.replace('_', ' ')}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {fav.productId.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(fav.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500">{t('wishlist.empty')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('wishlist.emptyDesc')}</p>
            <Link href="/search" className="btn-primary btn-sm mt-4 inline-flex">
              {t('common.search')}
            </Link>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
