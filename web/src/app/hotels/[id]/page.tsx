'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function HotelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    api.getHotel(id as string)
      .then(setHotel)
      .catch(() => toast.error('Hotel not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error('Please select a room and dates');
      return;
    }

    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    );
    const totalAmount = selectedRoom.pricePerNight * nights;

    try {
      const booking = await api.createBooking({
        productType: 'hotel',
        productId: hotel.id,
        supplierId: hotel.supplierId,
        checkIn,
        checkOut,
        guestCount: guests,
        totalAmount,
        currency: hotel.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      router.push(`/checkout/${booking.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!hotel) {
    return <div className="text-center py-20 text-gray-500">Hotel not found</div>;
  }

  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <svg key={i} className="w-5 h-5 text-accent-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
        <p className="text-gray-600">{hotel.street}, {hotel.city}, {hotel.country}</p>
      </div>

      {/* Images */}
      <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
        <Image
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'}
          alt={hotel.name}
          fill
          className="object-cover"
        />
        {hotel.avgRating > 0 && (
          <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-lg font-bold">
            {hotel.avgRating} / 5
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">About this hotel</h2>
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
          </section>

          {hotel.amenities?.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a: string) => (
                  <span key={a} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
                    {a.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </section>
          )}

          {rooms.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Available Rooms</h2>
              <div className="space-y-4">
                {rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className={`card p-4 cursor-pointer border-2 transition-colors ${
                      selectedRoom?.id === room.id ? 'border-primary-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-gray-600 text-sm">{room.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>Max {room.maxOccupancy} guests</span>
                          <span>{room.bedType}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-primary-700">
                          {formatCurrency(room.pricePerNight, room.currency || 'USD')}
                        </span>
                        <span className="text-gray-500 text-sm block">per night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {hotel.policies && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Policies</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Check-in:</strong> {hotel.policies.checkInTime}</div>
                <div><strong>Check-out:</strong> {hotel.policies.checkOutTime}</div>
                <div className="col-span-2"><strong>Cancellation:</strong> {hotel.policies.cancellationPolicy}</div>
              </div>
            </section>
          )}
        </div>

        {/* Booking Sidebar */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Book this hotel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="input-field"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {selectedRoom && checkIn && checkOut && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    {selectedRoom.name} &mdash;{' '}
                    {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} nights
                  </div>
                  <div className="text-2xl font-bold text-primary-700 mt-1">
                    {formatCurrency(
                      selectedRoom.pricePerNight *
                        Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
                      selectedRoom.currency || 'USD',
                    )}
                  </div>
                </div>
              )}

              <button onClick={handleBook} className="btn-primary w-full">
                {user ? 'Book Now' : 'Login to Book'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
