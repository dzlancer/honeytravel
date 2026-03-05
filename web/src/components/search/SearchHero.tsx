'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchHero() {
  const router = useRouter();
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
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Algeria&apos;s Hidden Gems
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto">
            Book hotels, flights, and travel packages at the best prices
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you going?"
                className="input-field text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input-field text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input-field text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Guests
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="input-field text-gray-900 flex-1"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Search
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
