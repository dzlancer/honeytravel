'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Users, CreditCard, Lock, Loader2, CheckCircle, Tag, Calendar, Award } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Stepper } from '@/components/ui/Stepper';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
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
        setPromoApplied(true);
        toast.success(t('checkout.promoApplied'));
      } else {
        toast.error(result.message || t('checkout.promoInvalid'));
      }
    } catch {
      toast.error(t('checkout.promoInvalid'));
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const finalAmount = Number(booking.totalAmount) - promoDiscount;
      await api.createPaymentIntent({
        bookingId: booking.id,
        amount: finalAmount,
        currency: booking.currency,
      });
      router.push(`/bookings/${booking.id}/confirmed`);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="section py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton variant="text" width="300px" height="40px" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton variant="card" height="200px" />
              <Skeleton variant="card" height="120px" />
              <Skeleton variant="card" height="180px" />
            </div>
            <Skeleton variant="card" height="350px" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const finalAmount = Number(booking.totalAmount) - promoDiscount;
  const pointsEarned = Math.floor(finalAmount * 10);

  return (
    <PageTransition>
      <div className="section py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-display-sm font-bold text-gray-900 mb-6">{t('checkout.title')}</h1>

          <Stepper
            steps={[
              { label: t('checkout.step1'), icon: Users },
              { label: t('checkout.step2'), icon: CreditCard },
              { label: t('checkout.step3'), icon: CheckCircle },
            ]}
            currentStep={1}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Details */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h2 className="font-semibold text-lg">{t('checkout.step1')}</h2>
                </div>
                {booking.guestDetails?.map((guest: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {guest.firstName?.[0]}{guest.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{guest.firstName} {guest.lastName}</p>
                        <p className="text-xs text-gray-500">{t('common.guest')} {i + 1}</p>
                      </div>
                    </div>
                    {/* Tour-specific traveler details */}
                    {booking.productType === 'tour' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs">
                        {guest.dateOfBirth && (
                          <div>
                            <span className="text-gray-400">{t('tour.dateOfBirth', 'Date of Birth')}</span>
                            <p className="text-gray-700">{guest.dateOfBirth}</p>
                          </div>
                        )}
                        {guest.nationality && (
                          <div>
                            <span className="text-gray-400">{t('tour.nationality', 'Nationality')}</span>
                            <p className="text-gray-700">{guest.nationality}</p>
                          </div>
                        )}
                        {guest.passportNumber && (
                          <div>
                            <span className="text-gray-400">{t('tour.passport', 'Passport')}</span>
                            <p className="text-gray-700">{guest.passportNumber}</p>
                          </div>
                        )}
                        {guest.passportExpiry && (
                          <div>
                            <span className="text-gray-400">{t('tour.passportExpiry', 'Passport Expiry')}</span>
                            <p className="text-gray-700">{guest.passportExpiry}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-accent-600" />
                  <h2 className="font-semibold text-lg">{t('booking.promoCode')}</h2>
                </div>
                {promoApplied ? (
                  <div className="flex items-center gap-2 p-3 bg-success-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="text-success-700 font-medium">
                      {t('checkout.promoApplied')} -{formatCurrency(promoDiscount, booking.currency)}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="input-field flex-1"
                    />
                    <button onClick={applyPromo} className="btn-accent btn-sm">
                      {t('booking.apply')}
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h2 className="font-semibold text-lg">{t('checkout.paymentMethod')}</h2>
                </div>
                <div className="border-2 border-primary-200 bg-primary-50/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{t('checkout.creditCard')}</span>
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
                      <div className="w-10 h-6 bg-red-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MC</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input className="input-field text-sm" placeholder="**** **** **** ****" disabled />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input-field text-sm" placeholder="MM/YY" disabled />
                      <input className="input-field text-sm" placeholder="CVV" disabled />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                    {t('checkout.securityNote')}
                  </div>
                </div>

                {/* Algerian payment options */}
                <div className="mt-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-gray-600">CIB / Edahabia</span>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-green-700 rounded text-white text-[7px] flex items-center justify-center font-bold">CIB</div>
                    <div className="w-10 h-6 bg-yellow-500 rounded text-[7px] flex items-center justify-center font-bold">EDAH</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div>
              <div className="card p-6 sticky top-24 shadow-soft-lg">
                <h3 className="font-semibold text-lg mb-4">{t('checkout.bookingSummary')}</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {t('checkout.dates')}
                    </span>
                    <span className="font-medium">{booking.checkIn} — {booking.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {t('common.guests')}
                    </span>
                    <span className="font-medium">{booking.guestCount}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('checkout.subtotal')}</span>
                      <span>{formatCurrency(booking.totalAmount, booking.currency)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-success-600">
                        <span>{t('checkout.discount')}</span>
                        <span>-{formatCurrency(promoDiscount, booking.currency)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">{t('checkout.total')}</span>
                      <span className="text-2xl font-bold text-primary-700">
                        {formatCurrency(finalAmount, booking.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-primary-600 text-xs pt-1">
                    <Award className="w-3.5 h-3.5" />
                    {t('checkout.earnPoints', { count: pointsEarned })}
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="btn-primary w-full mt-6 text-lg"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('checkout.processing')}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {t('checkout.payNow')} {formatCurrency(finalAmount, booking.currency)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
