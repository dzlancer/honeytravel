'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Search,
  HelpCircle,
  CreditCard,
  CalendarCheck,
  Star,
  ChevronDown,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  icon: React.ElementType;
  questions: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    title: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: 'What is Travel Shop Algeria?',
        a: "Travel Shop Algeria (TSA) is Algeria's leading online travel platform. We help you search, compare, and book flights, hotels, car rentals, and activities across Algeria and beyond \u2014 all in one place.",
      },
      {
        q: 'What languages are supported?',
        a: 'Our platform is available in English, French, and Arabic. You can switch languages at any time from the settings menu or the language selector in the navigation bar.',
      },
      {
        q: 'How do I contact customer support?',
        a: 'You can reach our support team 24/7 via the Contact page, by emailing support@travelshopalgeria.com, or by calling our hotline at +213 21 00 00 00. We typically respond within 2 hours.',
      },
    ],
  },
  {
    title: 'Booking',
    icon: CalendarCheck,
    questions: [
      {
        q: 'How do I book a trip?',
        a: "Simply search for your destination, select your preferred dates and options (flights, hotels, cars, or activities), review the details, and proceed to checkout. You'll need a free account to complete the booking.",
      },
      {
        q: 'Can I modify my booking after confirmation?',
        a: "Yes, most bookings can be modified from the My Bookings section in your dashboard. Changes are subject to availability and the provider's modification policy. Some changes may incur additional fees.",
      },
      {
        q: 'What is the cancellation policy?',
        a: 'Cancellation policies vary by provider and rate type. Free cancellation is available on many listings up to 24-48 hours before check-in. Non-refundable rates are clearly marked at the time of booking.',
      },
      {
        q: 'Do you offer group bookings?',
        a: 'Yes! For groups of 10 or more, we offer special rates and dedicated support. Contact our team via the Contact page or email groups@travelshopalgeria.com for a custom quote.',
      },
    ],
  },
  {
    title: 'Payment',
    icon: CreditCard,
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept Visa, Mastercard, CIB (Carte Interbancaire), Dahabia (Alg\u00e9rie Poste), and bank transfers. Cash on arrival is available at select properties.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'Absolutely not. The price displayed at checkout is the final price you pay, including all taxes and service fees. We believe in full transparency \u2014 no surprises.',
      },
      {
        q: 'How does the refund process work?',
        a: 'Once a cancellation is approved, refunds are processed to your original payment method within 5-10 business days. CIB and Dahabia refunds may take up to 15 business days depending on your bank.',
      },
    ],
  },
  {
    title: 'Loyalty',
    icon: Star,
    questions: [
      {
        q: 'How do loyalty points work?',
        a: 'You earn 10 points for every dollar spent on bookings. Points accumulate automatically in your account and can be redeemed at checkout \u2014 every 100 points equals $1 off your next booking.',
      },
      {
        q: 'What are the tier benefits?',
        a: 'We have three tiers: Silver (0-999 points) with basic perks, Gold (1,000-4,999 points) with priority support and 10% bonus points, and Platinum (5,000+ points) with exclusive deals, free upgrades, and 25% bonus points.',
      },
      {
        q: 'Do points expire?',
        a: 'Points are valid for 24 months from the date they were earned. As long as you make at least one booking per year, all your points remain active indefinitely.',
      },
    ],
  },
];

export default function FaqPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredData = FAQ_DATA.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (item) =>
        !normalizedSearch ||
        item.q.toLowerCase().includes(normalizedSearch) ||
        item.a.toLowerCase().includes(normalizedSearch)
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-algerian text-white py-16 md:py-20">
        <div className="section text-center">
          <h1 className="text-display-md md:text-display-lg mb-3">Frequently Asked Questions</h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            Quick answers to the most common questions about Travel Shop Algeria
          </p>
        </div>
      </section>

      <section className="section section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Search */}
          <div className="relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="input-field pl-12 w-full"
            />
          </div>

          {/* FAQ Categories */}
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-heading-md mb-2">No results found</h3>
              <p className="text-gray-600 text-sm">
                Try a different search term or{' '}
                <Link href="/contact" className="text-primary-600 hover:underline">
                  contact support
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredData.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.title}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <h2 className="text-heading-lg">{category.title}</h2>
                    </div>
                    <div className="space-y-2">
                      {category.questions.map((item) => {
                        const key = `${category.title}-${item.q}`;
                        const isOpen = openItems.has(key);
                        return (
                          <div key={key} className="card">
                            <button
                              onClick={() => toggle(key)}
                              className="w-full flex items-center justify-between px-6 py-4 text-left"
                            >
                              <span className="font-medium text-gray-900">{item.q}</span>
                              <ChevronDown
                                className={clsx(
                                  'w-5 h-5 text-gray-400 transition-transform flex-shrink-0',
                                  isOpen && 'rotate-180'
                                )}
                              />
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
                );
              })}
            </div>
          )}

          {/* Contact CTA */}
          <div className="card p-8 text-center bg-primary-50 border-primary-100 mt-10">
            <h3 className="text-heading-lg mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is available 24/7 to help you with anything.
            </p>
            <Link href="/contact" className="btn-primary">
              {t('common.contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
