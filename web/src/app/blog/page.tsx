'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: 'Exploring the Sahara: A Guide to Desert Adventures in Algeria',
    excerpt: 'Discover the magic of the world\'s largest hot desert — from camel treks across golden dunes to stargazing under pristine skies in Timimoun and Djanet.',
    image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=400&fit=crop',
    date: '2026-02-20',
    category: 'Destinations',
  },
  {
    id: 2,
    title: 'The Casbah of Algiers: Walking Through Centuries of History',
    excerpt: 'Step into the UNESCO-listed Casbah of Algiers, a labyrinth of Ottoman-era palaces, mosques, and whitewashed houses perched above the Mediterranean.',
    image: 'https://images.unsplash.com/photo-1583425423320-b42f4487c3ed?w=600&h=400&fit=crop',
    date: '2026-02-10',
    category: 'Culture',
  },
  {
    id: 3,
    title: 'A Taste of Algeria: 10 Dishes You Must Try',
    excerpt: 'From couscous royale and chakhchoukha to makroud and zlabia — an essential culinary guide to the rich and diverse flavors of Algerian cuisine.',
    image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=600&h=400&fit=crop',
    date: '2026-01-28',
    category: 'Food & Cuisine',
  },
  {
    id: 4,
    title: 'Mediterranean Coast: Algeria\'s Hidden Beach Paradise',
    excerpt: 'Explore the turquoise coves of Jijel, the sandy beaches of Tipaza, and the dramatic cliffs along Algeria\'s stunning 1,600 km Mediterranean coastline.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    date: '2026-01-15',
    category: 'Destinations',
  },
  {
    id: 5,
    title: 'Roman Ruins of Djémila and Timgad: Ancient Wonders',
    excerpt: 'Algeria is home to some of the best-preserved Roman ruins in the world. Explore the UNESCO sites of Djémila and Timgad, frozen in time for nearly 2,000 years.',
    image: 'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=600&h=400&fit=crop',
    date: '2026-01-05',
    category: 'Culture',
  },
  {
    id: 6,
    title: 'Tassili n\'Ajjer: Prehistoric Rock Art in the Desert',
    excerpt: 'Journey to the Tassili n\'Ajjer plateau to witness 15,000 ancient rock engravings and paintings — a window into the Sahara\'s green past and early human civilization.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=400&fit=crop',
    date: '2025-12-22',
    category: 'Travel Tips',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Travel Tips': 'bg-blue-100 text-blue-700',
  'Destinations': 'bg-emerald-100 text-emerald-700',
  'Culture': 'bg-purple-100 text-purple-700',
  'Food & Cuisine': 'bg-orange-100 text-orange-700',
};

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-algerian text-white py-16 md:py-20">
        <div className="section text-center">
          <h1 className="text-display-md md:text-display-lg mb-3">Travel Blog</h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            Stories, tips, and inspiration for exploring the beauty of Algeria
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.map((article) => (
              <div
                key={article.id}
                className="card overflow-hidden group hover:shadow-soft-lg transition-all"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                        CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'
                      )}
                    >
                      <Tag className="w-3 h-3" />
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <h3 className="text-heading-md mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  <button
                    onClick={() => toast('Coming soon!')}
                    className="btn-ghost text-sm inline-flex items-center gap-1.5"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="card p-8 text-center bg-primary-50 border-primary-100">
            <h3 className="text-heading-lg mb-2">Stay Updated</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for the latest travel stories and exclusive deals.
            </p>
            <Link href="/contact" className="btn-primary">
              {t('common.contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
