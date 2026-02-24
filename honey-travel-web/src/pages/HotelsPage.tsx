import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { Lang, t } from "../lib/i18n";
import { Hotel, District } from "../types";
import HotelCard from "../components/HotelCard";

interface Props {
  lang: Lang;
}

const STAR_OPTIONS = [0, 3, 4, 5];
const PRICE_RANGES = [
  { label: "Tous", min: 0, max: 999999 },
  { label: "< 35,000 DZD", min: 0, max: 35000 },
  { label: "35k - 60k DZD", min: 35000, max: 60000 },
  { label: "60k - 90k DZD", min: 60000, max: 90000 },
  { label: "> 90,000 DZD", min: 90000, max: 999999 },
];

export default function HotelsPage({ lang }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [stars, setStars] = useState(Number(searchParams.get("stars")) || 0);
  const [priceRange, setPriceRange] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("sale_price_dzd");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12, sort_by: sortBy, sort_order: sortOrder };
      if (district) params.district = district;
      if (stars > 0) params.stars = stars;
      if (search) params.search = search;
      const range = PRICE_RANGES[priceRange];
      if (range && priceRange > 0) {
        params.min_price = range.min;
        params.max_price = range.max;
      }
      const data = await api.getHotels(params);
      setHotels(data.hotels);
      setTotal(data.total);
    } catch {
      // handle error
    }
    setLoading(false);
  }, [district, stars, priceRange, search, sortBy, sortOrder, page]);

  useEffect(() => {
    api.getDistricts().then((d) => setDistricts(d.districts)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    const d = searchParams.get("district");
    if (d) setDistrict(d);
  }, [searchParams]);

  const clearFilters = () => {
    setDistrict("");
    setStars(0);
    setPriceRange(0);
    setSearch("");
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = district || stars > 0 || priceRange > 0 || search;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t("filter.search", lang)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                showFilters || hasFilters
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={16} />
              {lang === "fr" ? "Filtres" : "Filters"}
              {hasFilters && (
                <span className="bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {[district, stars > 0, priceRange > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-4 space-y-4 border-t mt-3">
                  {/* Districts */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                      {t("filter.district", lang)}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setDistrict(""); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          !district ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {t("filter.all", lang)}
                      </button>
                      {districts.map((d) => (
                        <button
                          key={d.name}
                          onClick={() => { setDistrict(d.name); setPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            district === d.name
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {d.name} ({d.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stars */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                      {t("filter.stars", lang)}
                    </label>
                    <div className="flex gap-2">
                      {STAR_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setStars(s); setPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            stars === s
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {s === 0 ? t("filter.all", lang) : `${s}★`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                      {t("filter.price", lang)}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => { setPriceRange(i); setPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            priceRange === i
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {i === 0 ? t("filter.all", lang) : r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort + Clear */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <select
                        value={`${sortBy}_${sortOrder}`}
                        onChange={(e) => {
                          const [sb, so] = e.target.value.split("_");
                          setSortBy(sb === "sale" ? "sale_price_dzd" : sb === "star" ? "star_rating" : "name");
                          setSortOrder(so);
                        }}
                        className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="sale_price_dzd_asc">{lang === "fr" ? "Prix croissant" : "Price: Low to High"}</option>
                        <option value="sale_price_dzd_desc">{lang === "fr" ? "Prix decroissant" : "Price: High to Low"}</option>
                        <option value="star_rating_desc">{lang === "fr" ? "Etoiles" : "Stars"}</option>
                        <option value="name_asc">{lang === "fr" ? "Nom A-Z" : "Name A-Z"}</option>
                      </select>
                    </div>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                      >
                        <X size={14} />
                        {lang === "fr" ? "Effacer les filtres" : "Clear filters"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {total} {lang === "fr" ? "hotels trouves" : "hotels found"}
            {district && <span className="font-medium text-gray-700"> {lang === "fr" ? "a" : "in"} {district}</span>}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, i) => (
              <HotelCard key={hotel.hotel_id} hotel={hotel} lang={lang} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {lang === "fr" ? "Aucun hotel trouve" : "No hotels found"}
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              {lang === "fr" ? "Effacer les filtres" : "Clear filters"}
            </button>
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(total / 12) }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }}
                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                  page === i + 1
                    ? "bg-amber-500 text-white"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
