'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const STATS = [
  { value: '50K+', label: 'Happy Travelers' },
  { value: '500+', label: 'Hotels & Riads' },
  { value: '48', label: 'Wilayas Covered' },
  { value: '24/7', label: 'Support' },
];

const VALUES = [
  {
    key: 'trust',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    key: 'innovation',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    key: 'community',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'bg-terracotta-50 text-terracotta-600',
  },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-algerian text-white py-20 md:py-28">
        <div className="section text-center">
          <h1 className="text-display-md md:text-display-lg mb-4">{t('about.title')}</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="section -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section-padding">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="text-heading-xl mb-4">{t('about.mission')}</h2>
            <p className="text-gray-600 leading-relaxed">{t('about.missionText')}</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-heading-xl mb-4">{t('about.vision')}</h2>
            <p className="text-gray-600 leading-relaxed">{t('about.visionText')}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-sand-50 section-padding">
        <div className="section">
          <h2 className="text-display-sm text-center mb-12">{t('about.values')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value) => (
              <div key={value.key} className="card p-8 text-center">
                <div className={`w-14 h-14 ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={value.icon} />
                  </svg>
                </div>
                <h3 className="text-heading-lg mb-3">{t(`about.${value.key}`)}</h3>
                <p className="text-gray-500 text-body-sm">{t(`about.${value.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
