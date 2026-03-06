'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Bed, Users, Clock, ShieldCheck, Heart, Share2,
  Wifi, Car, UtensilsCrossed, Waves, Dumbbell, Sparkles, Check, Minus, Plus, ArrowRight,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { StarRating } from '@/components/ui/StarRating';
import { ErrorState } from '@/components/ui/ErrorState';
import { HotelDetailSkeleton } from '@/components/ui/Skeleton';
import { ReviewsList } from '@/components/ui/ReviewsList';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, pool: Waves, parking: Car, restaurant: UtensilsCrossed,
  gym: Dumbbell, spa: Sparkles, free_wifi: Wifi,
};

export default function HotelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const { addItem: addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    api.getHotel(id as string)
      .then((data) => {
        setHotel(data);
        addRecentlyViewed({
          productType: 'hotel',
          productId: data.id,
          name: data.name,
          image: data.images?.[0] || '',
          price: data.rooms?.[0]?.pricePerNight || 0,
          currency: data.rooms?.[0]?.currency || 'USD',
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const totalAmount = selectedRoom ? selectedRoom.pricePerNight * nights : 0;

  const handleBook = async () => {
    if (!user) { router.push('/login'); return; }
    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error(t('hotel.selectRoomFirst'));
      return;
    }
    try {
      const booking = await api.createBooking({
        productType: 'hotel',
        productId: hotel.id,
        supplierId: hotel.supplierId,
        checkIn, checkOut,
        guestCount: guests,
        totalAmount,
        currency: hotel.currency || 'USD',
        guestDetails: [{ firstName: user.firstName, lastName: user.lastName }],
      });
      router.push(`/checkout/${booking.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    }
  };

  if (loading) return <HotelDetailSkeleton />;
  if (error || !hotel) {
    return (
      <div className="section py-8">
        <ErrorState
          title="Hotel not found"
          message="The hotel you're looking for doesn't exist or has been removed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  const images = Array.isArray(hotel.images) ? hotel.images : [];

  return (
    <PageTransition>
      <div className="section py-8">
        <Breadcrumbs items={[
          { label: t('common.home'), href: '/' },
          { label: t('search.results'), href: '/search' },
          { label: hotel.name },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <StarRating rating={hotel.starRating} size="md" className="mb-2" />
            <h1 className="text-display-sm font-bold text-gray-900">{hotel.name}</h1>
            <div className="flex items-center gap-1.5 text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{hotel.address?.street}, {hotel.address?.city}, {hotel.address?.country}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hotel.avgRating > 0 && (
              <div className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{hotel.avgRating}</span>
                {hotel.reviewCount > 0 && (
                  <span className="text-white/70 text-sm">({hotel.reviewCount})</span>
                )}
              </div>
            )}
            <FavoriteButton productType="hotel" productId={hotel.id} />
            <button className="btn-icon btn-ghost border border-gray-200">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={images} alt={hotel.name} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-heading-md font-semibold mb-3">{t('hotel.about')}</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </section>

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('hotel.amenities')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities.map((a: string) => {
                    const Icon = AMENITY_ICONS[a.toLowerCase()] || Check;
                    return (
                      <div key={a} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="text-sm text-gray-700 capitalize">{a.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Rooms */}
            {rooms.length > 0 && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('hotel.rooms')}</h2>
                <div className="space-y-3">
                  {rooms.map((room: any) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={clsx(
                        'card p-4 cursor-pointer border-2 transition-all duration-200',
                        selectedRoom?.id === room.id
                          ? 'border-primary-500 bg-primary-50/50 shadow-glow-primary'
                          : 'border-transparent hover:border-gray-200'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{room.name}</h3>
                          <p className="text-gray-500 text-sm mt-0.5">{room.description}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Users className="w-4 h-4" />
                              {t('hotel.maxGuests', { count: room.maxOccupancy })}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Bed className="w-4 h-4" />
                              {room.bedType}
                            </span>
                          </div>
                        </div>
                        <div className="text-end ms-4">
                          <span className="text-xl font-bold text-primary-700">
                            {formatCurrency(room.pricePerNight, room.currency || 'USD')}
                          </span>
                          <span className="text-gray-400 text-xs block">{t('common.perNight')}</span>
                          {selectedRoom?.id === room.id ? (
                            <span className="badge badge-primary mt-2">
                              <Check className="w-3 h-3" />
                              {t('hotel.selected')}
                            </span>
                          ) : (
                            <button className="text-primary-600 text-xs font-medium mt-2 hover:underline">
                              {t('hotel.selectRoom')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Policies */}
            {hotel.policies && (
              <section>
                <h2 className="text-heading-md font-semibold mb-4">{t('hotel.policies')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('hotel.checkInTime')}</p>
                      <p className="text-sm text-gray-500">{hotel.policies.checkInTime}</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">{t('hotel.checkOutTime')}</p>
                      <p className="text-sm text-gray-500">{hotel.policies.checkOutTime}</p>
                    </div>
                  </div>
                  <div className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('hotel.cancellation')}</p>
                      <p className="text-sm text-gray-500">{hotel.policies.cancellationPolicy}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Reviews */}
            <ReviewsList productType="hotel" productId={hotel.id} />
          </div>

          {/* Booking Sidebar */}
          <div>
            <div className="card p-6 sticky top-24 shadow-soft-lg">
              <h3 className="text-lg font-semibold mb-5">{t('hotel.bookThisHotel')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="input-label">{t('common.checkIn')}</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">{t('common.checkOut')}</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">{t('common.guests')}</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="btn-icon btn-ghost border border-gray-200 !p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(6, guests + 1))}
                      className="btn-icon btn-ghost border border-gray-200 !p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 ms-1">
                      {guests === 1 ? t('common.guest') : t('common.guests')}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedRoom && nights > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{selectedRoom.name}</span>
                          <span>{formatCurrency(selectedRoom.pricePerNight, selectedRoom.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>&times; {nights} {nights === 1 ? t('common.night') : t('common.nights')}</span>
                        </div>
                        <div className="border-t border-primary-100 pt-2 flex justify-between">
                          <span className="font-semibold">{t('checkout.total')}</span>
                          <span className="text-xl font-bold text-primary-700">
                            {formatCurrency(totalAmount, selectedRoom.currency || 'USD')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleBook} className="btn-primary w-full">
                  {user ? (
                    <>
                      {t('hotel.bookNow')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : t('hotel.loginToBook')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
