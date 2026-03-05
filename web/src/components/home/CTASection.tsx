'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950" />
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative section py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display-md md:text-display-lg text-white mb-4">
            {t('home.cta')}
          </h2>
          <p className="text-lg text-primary-200 mb-8 max-w-xl mx-auto">
            {t('home.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search" className="btn-accent btn-lg w-full sm:w-auto">
              {t('home.ctaButton')}
              <svg className="w-5 h-5 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/register" className="btn bg-white/10 text-white border border-white/20 px-8 py-4
              rounded-2xl text-lg hover:bg-white/20 w-full sm:w-auto">
              {t('common.register')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
