'use client';

import Image from 'next/image';
import Link from 'next/link';

const DEALS = [
  {
    id: 'MH001',
    name: 'Grand Hotel Algiers',
    city: 'Algiers',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    price: 250,
    rating: 4.7,
    stars: 5,
  },
  {
    id: 'MH002',
    name: 'Sahara Oasis Resort',
    city: 'Ghardaia',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
    price: 120,
    rating: 4.3,
    stars: 4,
  },
  {
    id: 'MH003',
    name: 'Constantine Cliff Hotel',
    city: 'Constantine',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
    price: 150,
    rating: 4.5,
    stars: 4,
  },
];

export function FeaturedDeals() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Today&apos;s Best Deals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEALS.map((deal) => (
          <Link key={deal.id} href={`/hotels/${deal.id}`} className="card group hover:shadow-md transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <Image
                src={deal.image}
                alt={deal.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: deal.stars }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-accent-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{deal.name}</h3>
              <p className="text-gray-500 text-sm">{deal.city}, Algeria</p>
              <div className="flex justify-between items-end mt-3">
                <div className="flex items-center gap-1">
                  <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-sm font-medium">
                    {deal.rating}
                  </span>
                  <span className="text-gray-500 text-sm">Excellent</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary-700">${deal.price}</span>
                  <span className="text-gray-500 text-sm block">per night</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
