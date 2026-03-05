'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const DESTINATIONS = [
  {
    name: 'Algiers',
    nameAr: '\u0627\u0644\u062c\u0632\u0627\u0626\u0631',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    hotels: 42,
    tag: 'Capital',
  },
  {
    name: 'Oran',
    nameAr: '\u0648\u0647\u0631\u0627\u0646',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    hotels: 28,
    tag: 'Coastal',
  },
  {
    name: 'Constantine',
    nameAr: '\u0642\u0633\u0646\u0637\u064a\u0646\u0629',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
    hotels: 19,
    tag: 'Historic',
  },
  {
    name: 'Ghardaia',
    nameAr: '\u063a\u0631\u062f\u0627\u064a\u0629',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
    hotels: 12,
    tag: 'Desert',
  },
  {
    name: 'Tlemcen',
    nameAr: '\u062a\u0644\u0645\u0633\u0627\u0646',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
    hotels: 15,
    tag: 'Cultural',
  },
];

export function Destinations() {
  const { t } = useTranslation();

  return (
    <section className="bg-sand-50 section-padding">
      <div className="section">
        <div className="text-center mb-12">
          <h2 className="text-display-sm text-gray-900">{t('home.destinations')}</h2>
          <p className="text-gray-500 mt-2">{t('home.destinationsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {DESTINATIONS.map((dest, i) => (
            <Link
              key={dest.name}
              href={`/search?destination=${dest.name}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Tag */}
              <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3
                badge bg-white/20 backdrop-blur-sm text-white border border-white/20 text-[10px]">
                {dest.tag}
              </span>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                <p className="text-white/70 text-sm">{dest.hotels} {t('common.hotels').toLowerCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
