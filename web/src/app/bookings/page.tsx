'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  failed: 'bg-gray-100 text-gray-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.getMyBookings()
      .then(setData)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(id);
      toast.success('Booking cancelled');
      setData((prev: any) => ({
        ...prev,
        bookings: prev.bookings.map((b: any) =>
          b.id === id ? { ...b, status: 'cancelled' } : b,
        ),
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {data.bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">You have no bookings yet</p>
          <Link href="/search" className="btn-primary">Search Hotels</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.bookings.map((booking: any) => (
            <div key={booking.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                      {booking.status}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Ref: {booking.supplierBookingRef || booking.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{booking.productType} Booking</h3>
                  <p className="text-gray-600 text-sm">
                    {booking.checkIn} to {booking.checkOut} &middot; {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}
                  </p>
                  {booking.loyaltyPointsEarned > 0 && (
                    <p className="text-primary-600 text-sm mt-1">
                      +{booking.loyaltyPointsEarned} loyalty points
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary-700">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </span>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="block mt-2 text-red-500 text-sm hover:underline"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
