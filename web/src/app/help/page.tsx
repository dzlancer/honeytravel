'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import clsx from 'clsx';

const CATEGORIES = [
  {
    title: 'Booking & Reservations',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    questions: [
      { q: 'How do I make a booking?', a: 'Search for your destination, select your preferred hotel and room, choose your dates, and proceed to checkout. You\'ll need an account to complete the booking.' },
      { q: 'Can I modify my booking?', a: 'Yes, you can modify your booking from the "My Bookings" section in your profile, subject to the property\'s modification policy.' },
      { q: 'How do I cancel a booking?', a: 'Go to "My Bookings", select the booking you want to cancel, and click "Cancel Booking". Refund eligibility depends on the cancellation policy.' },
    ],
  },
  {
    title: 'Payment & Pricing',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, and local Algerian payment methods including CIB and Dahabia cards. Cash payment is available at select properties.' },
      { q: 'Are there any hidden fees?', a: 'No. The price you see includes all taxes and fees. We believe in transparent pricing with no surprises at checkout.' },
      { q: 'How do refunds work?', a: 'Refunds are processed to your original payment method within 5-10 business days after cancellation approval.' },
    ],
  },
  {
    title: 'Account & Loyalty',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    questions: [
      { q: 'How do loyalty points work?', a: 'You earn 10 points for every dollar spent. Points can be redeemed at checkout — every 100 points equals $1 off your booking.' },
      { q: 'How do I use a promo code?', a: 'Enter your promo code in the "Promo Code" field during checkout. The discount will be applied to your total before payment.' },
    ],
  },
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-algerian text-white py-16 md:py-20">
        <div className="section text-center">
          <h1 className="text-display-md md:text-display-lg mb-3">{t('common.helpCenter')}</h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            Find answers to common questions or reach out to our support team
          </p>
        </div>
      </section>

      <section className="section section-padding">
        <div className="max-w-3xl mx-auto space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
                  </svg>
                </div>
                <h2 className="text-heading-lg">{cat.title}</h2>
              </div>
              <div className="space-y-2">
                {cat.questions.map((item) => {
                  const key = `${cat.title}-${item.q}`;
                  const isOpen = openItems.has(key);
                  return (
                    <div key={key} className="card">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left"
                      >
                        <span className="font-medium text-gray-900">{item.q}</span>
                        <svg className={clsx('w-5 h-5 text-gray-400 transition-transform flex-shrink-0', isOpen && 'rotate-180')}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed animate-fade-in-down">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contact CTA */}
          <div className="card p-8 text-center bg-primary-50 border-primary-100">
            <h3 className="text-heading-lg mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">Our support team is available 24/7 to assist you.</p>
            <Link href="/contact" className="btn-primary">
              {t('common.contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
