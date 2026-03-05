'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Mail, Download, HelpCircle, Calendar, Users, CreditCard } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';

export default function BookingConfirmedPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    api.getBooking(id as string).then(setBooking).catch(() => {});
  }, [id]);

  const refCode = (id as string).slice(0, 8).toUpperCase();

  return (
    <PageTransition>
      <div className="section py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              <Check className="w-12 h-12 text-success-600" strokeWidth={3} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-display-sm font-bold text-gray-900 mb-2">
              {t('confirmation.title')}
            </h1>
            <p className="text-gray-500 mb-6">{t('confirmation.subtitle')}</p>

            {/* Booking Reference */}
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-6 py-3 mb-8">
              <span className="text-sm text-primary-600">{t('confirmation.reference')}:</span>
              <span className="text-lg font-bold text-primary-800 font-mono tracking-wider">{refCode}</span>
            </div>
          </motion.div>

          {/* Booking Details */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-6 text-start mb-8"
            >
              <h3 className="font-semibold text-gray-900 mb-4">{t('checkout.bookingSummary')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {t('checkout.dates')}
                  </span>
                  <span className="font-medium">{booking.checkIn} — {booking.checkOut}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    {t('common.guests')}
                  </span>
                  <span className="font-medium">{booking.guestCount}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-2 text-gray-500">
                    <CreditCard className="w-4 h-4" />
                    {t('checkout.total')}
                  </span>
                  <span className="font-bold text-primary-700">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Mail, title: t('confirmation.emailSent'), desc: t('confirmation.emailSentDesc'), color: 'text-primary-600 bg-primary-100' },
              { icon: Download, title: t('confirmation.downloadReceipt'), desc: t('confirmation.downloadReceiptDesc'), color: 'text-accent-600 bg-accent-100' },
              { icon: HelpCircle, title: t('confirmation.needHelp'), desc: t('confirmation.needHelpDesc'), color: 'text-success-600 bg-success-100' },
            ].map((item, i) => (
              <div key={i} className="card p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/bookings" className="btn-primary">{t('confirmation.viewBookings')}</Link>
            <Link href="/" className="btn-secondary">{t('confirmation.backHome')}</Link>
            <Link href="/search" className="btn-ghost">{t('confirmation.browseMore')}</Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
