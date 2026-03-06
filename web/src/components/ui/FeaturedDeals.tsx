'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Hotel, Compass, Car, MapPin, Star } from 'lucide-react';

const DEALS = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
    type: 'hotel' as const,
    name: 'Grand Hotel Algiers',
    subtitle: 'Algiers, Algeria',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    price: 250,
    priceLabel: 'night',
    rating: 4.7,
    badge: 'Popular',
    href: '/hotels/a1b2c3d4-e5f6-7890-abcd-ef1234567001',
    icon: Hotel,
  },
  {
    id: 'a1c2t3v4-d5e6-7890-abcd-activity00001',
    type: 'activity' as const,
    name: 'Sahara Camel Trek',
    subtitle: 'Ghardaia — 4 hours',
    image: 'https://images.unsplash.com/photo-1549221987-25a490f65d34?w=600',
    price: 45,
    priceLabel: 'person',
    rating: 4.8,
    badge: 'New',
    href: '/activities/a1c2t3v4-d5e6-7890-abcd-activity00001',
    icon: Compass,
  },
  {
    id: 'c1a2r3s4-d5e6-7890-abcd-carrental0002',
    type: 'car' as const,
    name: 'Peugeot 3008 SUV',
    subtitle: 'Algiers — Automatic',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600',
    price: 65,
    priceLabel: 'day',
    rating: 4.5,
    badge: 'Best Value',
    href: '/cars/c1a2r3s4-d5e6-7890-abcd-carrental0002',
    icon: Car,
  },
];

const TYPE_COLORS = {
  hotel: 'bg-primary-100 text-primary-700',
  activity: 'bg-accent-100 text-accent-700',
  car: 'bg-terracotta-100 text-terracotta-700',
};

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
            href={deal.href}
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
              {/* Type indicator */}
              <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${TYPE_COLORS[deal.type]}`}>
                  <deal.icon className="w-3 h-3" />
                  {t(`common.${deal.type === 'hotel' ? 'hotels' : deal.type === 'activity' ? 'activities' : 'carRentals'}`)}
                </span>
              </div>
              {/* Rating */}
              <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
                <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm
                  text-primary-800 px-2.5 py-1 rounded-lg text-sm font-semibold">
                  <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
                  {deal.rating}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-heading-md text-gray-900 group-hover:text-primary-600 transition-colors">
                {deal.name}
              </h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {deal.subtitle}
              </p>

              <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{t('common.from')}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary-700">${deal.price}</span>
                    <span className="text-sm text-gray-400">/ {deal.priceLabel}</span>
                  </div>
                </div>
                <span className="btn-primary btn-sm text-xs group-hover:shadow-glow-primary">
                  {t('common.viewAll').split(' ')[0]}
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
