'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { PageTransition } from '@/components/ui/PageTransition';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RecentlyViewed } from '@/components/ui/RecentlyViewed';
import {
  Calendar, Star, Heart, MessageSquare, ArrowRight,
  User, BookOpen, Award, MapPin, Loader2,
} from 'lucide-react';
import clsx from 'clsx';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700',
  Silver: 'bg-gray-100 text-gray-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-purple-100 text-purple-700',
};

function getTier(points: number) {
  if (points >= 50000) return 'Platinum';
  if (points >= 20000) return 'Gold';
  if (points >= 5000) return 'Silver';
  return 'Bronze';
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { favoritesCount } = useFavorites();
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    loyaltyPoints: 0,
    reviewsCount: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, loyaltyRes, reviewsRes] = await Promise.allSettled([
          api.getMyBookings(1),
          api.getLoyaltyBalance(),
          api.getMyReviews(1),
        ]);

        const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value : { bookings: [], total: 0 };
        const loyalty = loyaltyRes.status === 'fulfilled' ? loyaltyRes.value : { points: 0 };
        const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value : { total: 0 };

        const today = new Date().toISOString().split('T')[0];
        const upcoming = (bookings.bookings || []).filter(
          (b: any) => (b.status === 'confirmed' || b.status === 'pending') && b.checkIn >= today
        );

        setUpcomingBookings(upcoming.slice(0, 3));
        setStats({
          upcomingBookings: upcoming.length,
          loyaltyPoints: loyalty.points || user.loyaltyPoints || 0,
          reviewsCount: reviews.total || 0,
        });
      } catch {}
      setLoading(false);
    };

    loadData();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="section py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const tier = getTier(stats.loyaltyPoints);

  const quickStats = [
    { label: t('dashboard.upcomingBookings'), value: stats.upcomingBookings, icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: t('dashboard.pointsBalance'), value: stats.loyaltyPoints.toLocaleString(), icon: Award, color: 'bg-amber-100 text-amber-600' },
    { label: t('dashboard.wishlistCount'), value: favoritesCount, icon: Heart, color: 'bg-red-100 text-red-600' },
    { label: t('dashboard.reviewsCount'), value: stats.reviewsCount, icon: MessageSquare, color: 'bg-green-100 text-green-600' },
  ];

  const quickLinks = [
    { href: '/profile', label: t('common.profile'), icon: User },
    { href: '/bookings', label: t('common.myBookings'), icon: BookOpen },
    { href: '/loyalty', label: 'Loyalty', icon: Award },
    { href: '/wishlist', label: t('wishlist.title'), icon: Heart },
  ];

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('dashboard.title') },
        ]} />

        {/* Welcome Banner */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">{user.firstName[0]}{user.lastName[0]}</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {t('dashboard.welcome', { name: user.firstName })}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx('badge text-xs', TIER_COLORS[tier])}>{tier}</span>
                <span className="text-primary-200 text-sm">{stats.loyaltyPoints.toLocaleString()} points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className="card p-4">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-md font-semibold">{t('dashboard.upcomingBookings')}</h2>
            <Link href="/bookings" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingBookings.map((booking) => (
                <Link key={booking.id} href={`/bookings`} className="card p-4 hover:shadow-soft-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge bg-primary-100 text-primary-700 text-xs capitalize">{booking.productType}</span>
                    <span className="badge bg-green-100 text-green-700 text-xs capitalize">{booking.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.checkIn}</span>
                  </div>
                  <p className="text-lg font-bold text-primary-700 mt-2">
                    {formatCurrency(booking.totalAmount, booking.currency || 'USD')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('dashboard.noUpcoming')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('dashboard.noUpcomingDesc')}</p>
              <Link href="/search" className="btn-primary btn-sm mt-4 inline-flex">
                {t('common.search')}
              </Link>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed className="mb-8" />

        {/* Quick Links */}
        <section>
          <h2 className="text-heading-md font-semibold mb-4">{t('dashboard.quickLinks')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="card p-4 flex items-center gap-3 hover:shadow-soft-md hover:border-primary-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
