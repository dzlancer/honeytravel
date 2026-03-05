'use client';

import { useTranslation } from 'react-i18next';

const FEATURES = [
  {
    key: 'bestPrice',
    descKey: 'bestPriceDesc',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    key: 'support',
    descKey: 'supportDesc',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    bgColor: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
  {
    key: 'secure',
    descKey: 'secureDesc',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    bgColor: 'bg-success-50',
    iconColor: 'text-success-600',
  },
  {
    key: 'loyalty',
    descKey: 'loyaltyDesc',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    bgColor: 'bg-terracotta-50',
    iconColor: 'text-terracotta-600',
  },
];

export function WhyUs() {
  const { t } = useTranslation();

  return (
    <section className="bg-white section-padding">
      <div className="section">
        <div className="text-center mb-14">
          <h2 className="text-display-sm text-gray-900">{t('home.whyUs')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.key}
              className="text-center group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center
                mx-auto mb-5 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-heading-md text-gray-900 mb-2">{t(`home.${feature.key}`)}</h3>
              <p className="text-gray-500 text-body-sm leading-relaxed">{t(`home.${feature.descKey}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
