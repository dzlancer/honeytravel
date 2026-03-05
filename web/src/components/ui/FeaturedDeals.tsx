'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const DEALS = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
    name: 'Grand Hotel Algiers',
    city: 'Algiers',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    price: 250,
    rating: 4.7,
    stars: 5,
    badge: 'Popular',
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
    name: 'Sahara Oasis Resort',
    city: 'Ghardaia',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
    price: 120,
    rating: 4.3,
    stars: 4,
    badge: 'Best Value',
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
    name: 'Constantine Cliff Hotel',
    city: 'Constantine',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
    price: 150,
    rating: 4.5,
    stars: 4,
    badge: null,
  },
];

export function FeaturedDeals() {
  const { t } = useTranslation();

  return (
    <section className="section section-padding">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-display-sm text-gray-900">{t('home.deals')}</h2>
          <p className="text-gray-500 mt-2">{t('home.dealsSubtitle')}</p>
        </div>
        <Link href="/search" className="btn-ghost btn-sm hidden sm:flex">
          {t('common.viewAll')}
          <svg className="w-4 h-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEALS.map((deal, i) => (
          <Link
            key={deal.id}
            href={`/hotels/${deal.id}`}
            className="card-interactive group animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="relative h-56 overflow-hidden">
              <Image
                src={deal.image}
                alt={deal.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              {/* Badge */}
              {deal.badge && (
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                  <span className="badge bg-accent-500 text-white text-xs font-semibold px-3 py-1">
                    {deal.badge}
                  </span>
                </div>
              )}
              {/* Rating */}
              <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
                <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm
                  text-primary-800 px-2.5 py-1 rounded-lg text-sm font-semibold">
                  <svg className="w-3.5 h-3.5 text-accent-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  {deal.rating}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: deal.stars }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-accent-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <h3 className="text-heading-md text-gray-900 group-hover:text-primary-600 transition-colors">
                {deal.name}
              </h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {deal.city}, Algeria
              </p>

              <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{t('common.from')}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary-700">${deal.price}</span>
                    <span className="text-sm text-gray-400">/ {t('common.night')}</span>
                  </div>
                </div>
                <span className="btn-primary btn-sm text-xs group-hover:shadow-glow-primary">
                  {t('hotel.bookNow')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8 sm:hidden">
        <Link href="/search" className="btn-secondary">
          {t('common.viewAll')}
        </Link>
      </div>
    </section>
  );
}
