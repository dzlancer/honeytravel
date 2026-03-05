'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.getBooking(bookingId as string)
      .then(setBooking)
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId, user, router]);

  const applyPromo = async () => {
    if (!promoCode) return;
    try {
      const result = await api.validatePromo(promoCode, booking.totalAmount);
      if (result.valid) {
        setPromoDiscount(result.discount);
        toast.success(`Promo applied! Discount: ${formatCurrency(result.discount, booking.currency)}`);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to validate promo code');
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const finalAmount = Number(booking.totalAmount) - promoDiscount;
      const result = await api.createPaymentIntent({
        bookingId: booking.id,
        amount: finalAmount,
        currency: booking.currency,
      });

      // In production, use Stripe Elements to collect card details.
      // For now, show success since this is a mock.
      toast.success('Payment initiated! Booking confirmed.');
      router.push(`/bookings/${booking.id}/confirmed`);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!booking) return null;

  const finalAmount = Number(booking.totalAmount) - promoDiscount;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Booking Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Product</span>
            <span>{booking.productId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in</span>
            <span>{booking.checkIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out</span>
            <span>{booking.checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Guests</span>
            <span>{booking.guestCount}</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(booking.totalAmount, booking.currency)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo Discount</span>
              <span>-{formatCurrency(promoDiscount, booking.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-700">{formatCurrency(finalAmount, booking.currency)}</span>
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Promo Code</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="input-field flex-1"
          />
          <button onClick={applyPromo} className="btn-secondary">Apply</button>
        </div>
      </div>

      {/* Loyalty Points */}
      {user && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-lg mb-2">Loyalty Points</h2>
          <p className="text-sm text-gray-600 mb-2">
            You&apos;ll earn <strong>{Math.floor(finalAmount * 10)}</strong> points from this booking.
          </p>
        </div>
      )}

      {/* Payment */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Payment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Payment is processed securely via Stripe. Your card details are never stored on our servers.
        </p>
        <button onClick={handlePay} disabled={paying} className="btn-primary w-full text-lg">
          {paying ? 'Processing...' : `Pay ${formatCurrency(finalAmount, booking.currency)}`}
        </button>
      </div>
    </div>
  );
}
