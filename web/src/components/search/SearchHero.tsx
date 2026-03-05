'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const TABS = ['hotels', 'flights', 'packages', 'carRentals'] as const;

const TAB_ICONS: Record<string, string> = {
  hotels: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  flights: 'M12 19l-7-7 1.41-1.41L11 15.17V2h2v13.17l4.59-4.58L19 12l-7 7z',
  packages: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  carRentals: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z',
};

export function SearchHero() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('hotels');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    if (activeTab !== 'hotels') params.set('type', activeTab);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-algerian" />
      <div className="absolute inset-0 bg-[url('/pattern-overlay.svg')] opacity-5" />
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      <div className="relative section py-20 md:py-28 lg:py-32">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-12 animate-fade-in-up">
          <h1 className="text-display-md md:text-display-lg lg:text-display-xl text-white mb-4">
            {t('home.hero')}
          </h1>
          <p className="text-lg md:text-xl text-primary-200 max-w-2xl mx-auto leading-relaxed">
            {t('home.heroSub')}
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="bg-white rounded-2xl shadow-soft-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-2 pt-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-xl transition-colors',
                    activeTab === tab
                      ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TAB_ICONS[tab]} />
                  </svg>
                  <span className="hidden sm:inline">{t(`common.${tab}`)}</span>
                </button>
              ))}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                <div className="md:col-span-1">
                  <label className="input-label">{t('common.destination')}</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder={t('home.searchPlaceholder')}
                      className="input-field pl-10 text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">{t('common.checkIn')}</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="input-field text-gray-900"
                  />
                </div>
                <div>
                  <label className="input-label">{t('common.checkOut')}</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input-field text-gray-900"
                  />
                </div>
                <div>
                  <label className="input-label">{t('common.guests')}</label>
                  <div className="flex gap-2">
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="input-field text-gray-900 flex-1"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} {t(n > 1 ? 'common.guests' : 'common.guest')}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-primary whitespace-nowrap px-6">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="hidden md:inline">{t('common.search')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-10 text-primary-200/70 text-sm">
          {[
            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: t('home.bestPrice') },
            { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', text: t('home.support') },
            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: t('home.secure') },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
