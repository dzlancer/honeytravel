'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Plane, Compass, Car, Hotel, Search } from 'lucide-react';
import clsx from 'clsx';

const TABS = ['hotels', 'flights', 'activities', 'carRentals'] as const;

const TAB_ICONS: Record<string, React.ElementType> = {
  hotels: Hotel,
  flights: Plane,
  activities: Compass,
  carRentals: Car,
};

export function SearchHero() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('hotels');

  // Hotel fields
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  // Flight fields
  const [origin, setOrigin] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');

  // Activity fields
  const [groupSize, setGroupSize] = useState(2);

  // Car fields
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (activeTab === 'hotels') {
      if (destination) params.set('destination', destination);
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);
      params.set('guests', String(guests));
    } else if (activeTab === 'flights') {
      if (origin) params.set('origin', origin);
      if (destination) params.set('destination', destination);
      if (departureDate) params.set('departureDate', departureDate);
      if (returnDate) params.set('returnDate', returnDate);
      params.set('passengers', String(passengers));
      params.set('cabinClass', cabinClass);
      params.set('type', 'flights');
    } else if (activeTab === 'activities') {
      if (destination) params.set('destination', destination);
      if (checkIn) params.set('date', checkIn);
      params.set('groupSize', String(groupSize));
      params.set('type', 'activities');
    } else if (activeTab === 'carRentals') {
      if (destination) params.set('pickupLocation', destination);
      if (pickupDate) params.set('pickupDate', pickupDate);
      if (dropoffDate) params.set('dropoffDate', dropoffDate);
      params.set('type', 'cars');
    }

    router.push(`/search?${params.toString()}`);
  };

  const renderHotelFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
      <div className="md:col-span-1">
        <label className="input-label">{t('common.destination')}</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
          className="input-field text-gray-900"
        />
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
            <Search className="w-5 h-5" />
            <span className="hidden md:inline">{t('common.search')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFlightFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
      <div>
        <label className="input-label">{t('flight.origin')}</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder={t('flight.from')}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('common.destination')}</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t('flight.to')}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('flight.departureDate')}</label>
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('flight.passengers')}</label>
        <div className="flex gap-2">
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="input-field text-gray-900 flex-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>{n} {t(n > 1 ? 'flight.passengers' : 'flight.passenger')}</option>
            ))}
          </select>
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
            className="input-field text-gray-900 flex-1"
          >
            <option value="economy">{t('flight.economy')}</option>
            <option value="business">{t('flight.business')}</option>
            <option value="first">{t('flight.first')}</option>
          </select>
          <button type="submit" className="btn-primary whitespace-nowrap px-6">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivityFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      <div>
        <label className="input-label">{t('common.destination')}</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('flight.departure')}</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('activity.groupSize')}</label>
        <div className="flex gap-2">
          <select
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value))}
            className="input-field text-gray-900 flex-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {t(n > 1 ? 'common.guests' : 'common.guest')}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary whitespace-nowrap px-6">
            <Search className="w-5 h-5" />
            <span className="hidden md:inline">{t('common.search')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCarFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
      <div>
        <label className="input-label">{t('car.pickupLocation')}</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t('car.pickupLocation')}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('car.pickupDate')}</label>
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className="input-field text-gray-900"
        />
      </div>
      <div>
        <label className="input-label">{t('car.dropoffDate')}</label>
        <input
          type="date"
          value={dropoffDate}
          onChange={(e) => setDropoffDate(e.target.value)}
          className="input-field text-gray-900"
        />
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full whitespace-nowrap px-6">
          <Search className="w-5 h-5" />
          <span>{t('common.search')}</span>
        </button>
      </div>
    </div>
  );

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
              {TABS.map((tab) => {
                const Icon = TAB_ICONS[tab];
                return (
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
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(`common.${tab}`)}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="p-4 md:p-6">
              {activeTab === 'hotels' && renderHotelFields()}
              {activeTab === 'flights' && renderFlightFields()}
              {activeTab === 'activities' && renderActivityFields()}
              {activeTab === 'carRentals' && renderCarFields()}
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
