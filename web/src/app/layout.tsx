import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Travel Shop Algeria — Hotels, Flights & Travel Packages',
    template: '%s | Travel Shop Algeria',
  },
  description:
    'Discover Algeria and the world. Book hotels, flights, car rentals and travel packages at the best prices. Your trusted Algerian online travel agency.',
  keywords: [
    'travel', 'algeria', 'hotels', 'flights', 'booking', 'vacation', 'tourism',
    'voyage', 'alg\u00e9rie', 'h\u00f4tels', 'r\u00e9servation', '\u0633\u0641\u0631', '\u0627\u0644\u062c\u0632\u0627\u0626\u0631', '\u0641\u0646\u0627\u062f\u0642',
  ],
  metadataBase: new URL('https://travelshopalgeria.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_DZ',
    alternateLocale: ['en_US', 'ar_DZ'],
    siteName: 'Travel Shop Algeria',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={`${inter.variable} ${cairo.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
