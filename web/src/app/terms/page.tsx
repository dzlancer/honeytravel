'use client';

import { useTranslation } from 'react-i18next';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <section className="bg-gradient-algerian text-white py-16">
        <div className="section text-center">
          <h1 className="text-display-md">{t('footer.terms')}</h1>
        </div>
      </section>

      <section className="section section-padding">
        <div className="max-w-3xl mx-auto prose prose-gray">
          <div className="card p-8 md:p-12 space-y-8">
            <div>
              <h2 className="text-heading-xl mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Travel Shop Algeria, you accept and agree to be bound by the terms and
                provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">2. Booking & Reservations</h2>
              <p className="text-gray-600 leading-relaxed">
                All bookings are subject to availability. Prices displayed are in the selected currency and may vary
                based on exchange rates. A booking is confirmed only after successful payment processing.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">3. Cancellation Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Cancellation policies vary by property and booking type. Free cancellation is available on select
                properties up to 24-48 hours before check-in. Non-refundable bookings are clearly marked at the time
                of booking.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">4. Payment</h2>
              <p className="text-gray-600 leading-relaxed">
                We accept major credit cards, local payment methods (CIB, Dahabia), and cash payments at select
                properties. All transactions are processed securely using industry-standard encryption.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">5. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to
                notify us immediately of any unauthorized use of your account.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                Travel Shop Algeria acts as an intermediary between travelers and service providers. We are not liable
                for the services provided by hotels, airlines, or other third-party suppliers.
              </p>
            </div>
            <p className="text-sm text-gray-400 pt-4 border-t border-gray-100">
              Last updated: March 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
