'use client';

import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div>
      <section className="bg-gradient-algerian text-white py-16">
        <div className="section text-center">
          <h1 className="text-display-md">{t('footer.privacy')}</h1>
        </div>
      </section>

      <section className="section section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="card p-8 md:p-12 space-y-8">
            <div>
              <h2 className="text-heading-xl mb-4">Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect information you provide directly to us, such as your name, email address, phone number,
                and payment information when you create an account or make a booking. We also automatically collect
                certain information about your device and usage of our services.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect to process your bookings, communicate with you, provide customer
                support, improve our services, and send you relevant marketing communications (with your consent).
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry-standard security measures to protect your personal information. All payment
                data is encrypted using SSL technology and processed through secure payment gateways.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and
                deliver personalized content. You can manage your cookie preferences through your browser settings.
              </p>
            </div>
            <div>
              <h2 className="text-heading-xl mb-4">Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to access, correct, or delete your personal data. You may also request data
                portability or restrict processing. To exercise these rights, contact us at privacy@travelshopalgeria.com.
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
