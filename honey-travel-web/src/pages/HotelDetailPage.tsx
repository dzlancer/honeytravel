import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Check, Coffee, Car, Eye, Clock, ChevronLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Lang, t, formatPrice } from "../lib/i18n";
import { Hotel, HotelVariant } from "../types";

interface Props { lang: Lang; }

const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi", breakfast: "Petit-dejeuner", parking: "Parking", pool: "Piscine",
  gym: "Salle de sport", spa: "Spa", restaurant: "Restaurant", room_service: "Room Service",
  laundry: "Blanchisserie", airport_shuttle: "Navette aeroport", concierge: "Conciergerie",
  bar: "Bar", business_center: "Centre d'affaires", kids_club: "Club enfants",
  rooftop_terrace: "Terrasse", hamam: "Hammam", sea_view: "Vue mer",
  city_view: "Vue ville", minibar: "Minibar", safe_box: "Coffre-fort",
};

export default function HotelDetailPage({ lang }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<HotelVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getHotel(slug).then((data) => {
      setHotel(data);
      if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">Hotel not found</p>
          <button onClick={() => navigate("/hotels")} className="text-amber-600 font-medium">
            {lang === "fr" ? "Retour aux hotels" : "Back to hotels"}
          </button>
        </div>
      </div>
    );
  }

  const socialProof = hotel.social_proof;
  const pricing = selectedVariant?.dynamic_pricing;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <button onClick={() => navigate("/hotels")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600">
            <ChevronLeft size={16} />
            {lang === "fr" ? "Retour aux hotels" : "Back to hotels"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
              <div className="relative aspect-[16/9]">
                <img
                  src={hotel.images?.[activeImg] || hotel.images?.[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                {/* Social proof overlay */}
                {socialProof && (
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Eye size={14} />
                      {socialProof.viewers.count} {t("social.viewing", lang)}
                    </div>
                    {socialProof.scarcity && (
                      <div className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                        {socialProof.scarcity.message_fr}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {hotel.images && hotel.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {hotel.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                        activeImg === i ? "border-amber-500" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.star_rating }).map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {hotel.district}, {hotel.city}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {lang === "fr" ? hotel.description_fr || hotel.description : hotel.description}
              </p>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t("hotel.amenities", lang)}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hotel.amenities?.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                      <Check size={14} className="text-green-500 shrink-0" />
                      {AMENITY_LABELS[a] || a.replace("_", " ")}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta info */}
              {hotel.meta_data && (
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Check-in</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock size={14} /> {(hotel.meta_data as any).check_in_time || "14:00"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Check-out</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock size={14} /> {(hotel.meta_data as any).check_out_time || "12:00"}
                      </span>
                    </div>
                    {(hotel.meta_data as any).halal_food && (
                      <div>
                        <span className="text-gray-500 block text-xs">{lang === "fr" ? "Nourriture" : "Food"}</span>
                        <span className="font-medium text-green-600">Halal</span>
                      </div>
                    )}
                    {(hotel.meta_data as any).prayer_room && (
                      <div>
                        <span className="text-gray-500 block text-xs">{lang === "fr" ? "Salle de priere" : "Prayer Room"}</span>
                        <span className="font-medium text-green-600">{lang === "fr" ? "Disponible" : "Available"}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Pricing & Booking */}
          <div className="space-y-4">
            {/* Booking Today banner */}
            {socialProof && socialProof.bookings_today > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center"
              >
                <p className="text-sm font-medium text-amber-800">
                  {socialProof.bookings_today} {t("social.bookingsToday", lang)}
                </p>
              </motion.div>
            )}

            {/* Variant Selection */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">{t("booking.step1", lang)}</h3>
              <div className="space-y-2">
                {hotel.variants?.map((v) => (
                  <button
                    key={v.variant_id}
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedVariant?.variant_id === v.variant_id
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-100 hover:border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{v.nights} {t("hotel.nights", lang)}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {v.includes_breakfast && (
                            <span className="text-xs text-green-600 flex items-center gap-0.5">
                              <Coffee size={12} /> {lang === "fr" ? "Petit-dej" : "Breakfast"}
                            </span>
                          )}
                          {v.includes_transfer && (
                            <span className="text-xs text-blue-600 flex items-center gap-0.5">
                              <Car size={12} /> {lang === "fr" ? "Transfert" : "Transfer"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 line-through">
                          {formatPrice(v.base_price_dzd)}
                        </div>
                        <div className="text-lg font-bold text-amber-600">
                          {formatPrice(v.dynamic_pricing?.final_price_per_room || v.sale_price_dzd)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Breakdown */}
            {pricing && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {lang === "fr" ? "Detail du Prix" : "Price Breakdown"}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{lang === "fr" ? "Prix de base" : "Base price"}</span>
                    <span className="line-through">{formatPrice(pricing.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Honey Special</span>
                    <span>{formatPrice(pricing.starting_price)}</span>
                  </div>
                  {pricing.total_discount_pct > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{lang === "fr" ? "Remise" : "Discount"} (-{pricing.total_discount_pct}%)</span>
                      <span>-{formatPrice(pricing.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-gray-900">
                    <span>{lang === "fr" ? "Total" : "Total"}</span>
                    <span className="text-amber-600 text-lg">{formatPrice(pricing.total_price)}</span>
                  </div>
                  {pricing.savings > 0 && (
                    <div className="bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-lg text-center">
                      {lang === "fr" ? "Vous economisez" : "You save"} {formatPrice(pricing.savings)} ({pricing.savings_pct}%)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scarcity */}
            {socialProof?.scarcity && (
              <div className={`rounded-xl p-3 text-center text-sm font-medium ${
                socialProof.scarcity.level === "critical"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}>
                {lang === "fr" ? socialProof.scarcity.message_fr : socialProof.scarcity.message_en}
              </div>
            )}

            {/* Sticky CTA */}
            <div className="sticky bottom-4 space-y-2">
              <button
                onClick={() => navigate(`/booking/${hotel.slug}${selectedVariant ? `?variant=${selectedVariant.variant_id}` : ""}`)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-amber-500/25"
              >
                {t("hotel.bookNow", lang)}
              </button>
              <a
                href={`https://wa.me/213555000001?text=Bonjour%20-%20Je%20suis%20interesse%20par%20${encodeURIComponent(hotel.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <MessageCircle size={16} />
                {t("whatsapp.cta", lang)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
