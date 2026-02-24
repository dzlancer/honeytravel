import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, Coffee, Car, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Hotel } from "../types";
import { Lang, t, formatPrice } from "../lib/i18n";

interface HotelCardProps {
  hotel: Hotel;
  lang: Lang;
  index?: number;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={14} />,
  breakfast: <Coffee size={14} />,
  airport_shuttle: <Car size={14} />,
};

export default function HotelCard({ hotel, lang, index = 0 }: HotelCardProps) {
  const savings = hotel.base_price_dzd - hotel.sale_price_dzd;
  const savingsPct = Math.round((savings / hotel.base_price_dzd) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.images?.[0] || "https://images.unsplash.com/photo-1542314831-e87e9d01db6b?w=800&q=80"}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {savingsPct > 10 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{savingsPct}%
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1">
            <MapPin size={12} />
            {hotel.district}
          </span>
        </div>
        {/* Stars */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-0.5">
          {Array.from({ length: hotel.star_rating }).map((_, i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        {/* Viewing count */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <Eye size={12} />
          {Math.floor(Math.random() * 12) + 3} {t("social.viewing", lang)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
          {hotel.name}
        </h3>
        <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
          <MapPin size={12} />
          {hotel.address}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hotel.amenities?.slice(0, 4).map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full"
            >
              {amenityIcons[a] || null}
              {a.replace("_", " ")}
            </span>
          ))}
          {hotel.amenities && hotel.amenities.length > 4 && (
            <span className="text-xs text-amber-600 font-medium">
              +{hotel.amenities.length - 4}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(hotel.base_price_dzd)}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-600">
                {formatPrice(hotel.sale_price_dzd)}
              </span>
              <span className="text-xs text-gray-500">{t("hotel.night", lang)}</span>
            </div>
          </div>
          <Link
            to={`/hotels/${hotel.slug}`}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {t("hotel.viewDetails", lang)}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
