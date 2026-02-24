import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Shield, MessageCircle, Plane, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Lang, t } from "../lib/i18n";
import { Hotel, District } from "../types";
import HotelCard from "../components/HotelCard";

interface Props {
  lang: Lang;
}

export default function HomePage({ lang }: Props) {
  const [featured, setFeatured] = useState<Hotel[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [bookingsToday, setBookingsToday] = useState(0);

  useEffect(() => {
    api.getHotels({ limit: 6, sort_by: "star_rating", sort_order: "desc" })
      .then((d) => setFeatured(d.hotels))
      .catch(() => {});
    api.getDistricts().then((d) => setDistricts(d.districts)).catch(() => {});
    api.getSocialProof().then((d) => setBookingsToday(d.bookings_today)).catch(() => {});
  }, []);

  const trustFeatures = [
    { icon: <Shield size={24} />, title: lang === "fr" ? "Paiement Securise" : "Secure Payment", desc: lang === "fr" ? "CIB, BaridiMob, Especes" : "CIB, BaridiMob, Cash" },
    { icon: <MessageCircle size={24} />, title: lang === "fr" ? "Support WhatsApp 24/7" : "24/7 WhatsApp Support", desc: lang === "fr" ? "Reponse en < 5 minutes" : "Response in < 5 min" },
    { icon: <Plane size={24} />, title: lang === "fr" ? "Transfert Aeroport" : "Airport Transfer", desc: lang === "fr" ? "Inclus dans les forfaits 6N+" : "Included in 6N+ packages" },
    { icon: <Star size={24} />, title: lang === "fr" ? "Hotels Verifies" : "Verified Hotels", desc: lang === "fr" ? "62 hotels inspectes" : "62 inspected hotels" },
  ];

  const districtImages: Record<string, string> = {
    "Sultanahmet": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=80",
    "Taksim": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
    "Fatih": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    "Laleli": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
    "Beyoglu": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    "Besiktas": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    "Sisli": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    "Aksaray": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1920&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {bookingsToday > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                {bookingsToday} {t("social.bookingsToday", lang)}
              </motion.div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {t("hero.title", lang)}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t("hero.subtitle", lang)}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/hotels"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors shadow-lg shadow-amber-500/25"
              >
                <Search size={18} />
                {t("hero.cta", lang)}
              </Link>
              <a
                href="https://wa.me/213555000001?text=Bonjour%20Honey%20Travel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors"
              >
                <MessageCircle size={18} />
                {t("whatsapp.cta", lang)}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Districts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {lang === "fr" ? "Quartiers Populaires" : "Popular Districts"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {lang === "fr" ? "Explorez Istanbul par quartier" : "Explore Istanbul by district"}
              </p>
            </div>
            <Link to="/hotels" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
              {lang === "fr" ? "Voir tout" : "View all"} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {districts.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/hotels?district=${d.name}`}
                  className="group relative block aspect-[4/3] rounded-2xl overflow-hidden"
                >
                  <img
                    src={districtImages[d.name] || "https://images.unsplash.com/photo-1542314831-e87e9d01db6b?w=600&q=80"}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg">{d.name}</h3>
                    <p className="text-white/80 text-xs">{d.count} {lang === "fr" ? "hotels" : "hotels"}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {lang === "fr" ? "Hotels Recommandes" : "Recommended Hotels"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {lang === "fr" ? "Nos meilleurs choix pour vous" : "Our top picks for you"}
              </p>
            </div>
            <Link to="/hotels" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
              {lang === "fr" ? "Tous les hotels" : "All hotels"} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((hotel, i) => (
              <HotelCard key={hotel.hotel_id} hotel={hotel} lang={lang} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            {lang === "fr" ? "Pret pour Istanbul?" : "Ready for Istanbul?"}
          </h2>
          <p className="text-amber-100 mb-6 text-lg">
            {lang === "fr"
              ? "Reservez maintenant et economisez jusqu'a 30% sur nos forfaits speciaux"
              : "Book now and save up to 30% on our special packages"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/hotels"
              className="inline-flex items-center justify-center gap-2 bg-white text-amber-600 px-8 py-3.5 rounded-xl text-base font-semibold transition-colors hover:bg-amber-50"
            >
              {t("hero.cta", lang)}
            </Link>
            <a
              href="https://wa.me/213555000001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="font-bold">Honey Travel</span>
              </div>
              <p className="text-gray-400 text-sm">
                {lang === "fr"
                  ? "Votre passerelle vers Istanbul depuis l'Algerie"
                  : "Your gateway to Istanbul from Algeria"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{lang === "fr" ? "Quartiers" : "Districts"}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/hotels?district=Sultanahmet" className="hover:text-amber-400">Sultanahmet</Link></li>
                <li><Link to="/hotels?district=Taksim" className="hover:text-amber-400">Taksim</Link></li>
                <li><Link to="/hotels?district=Fatih" className="hover:text-amber-400">Fatih</Link></li>
                <li><Link to="/hotels?district=Laleli" className="hover:text-amber-400">Laleli</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{lang === "fr" ? "Aide" : "Help"}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-amber-400">{lang === "fr" ? "FAQ" : "FAQ"}</a></li>
                <li><a href="#" className="hover:text-amber-400">{lang === "fr" ? "Politique d'Annulation" : "Cancellation Policy"}</a></li>
                <li><a href="#" className="hover:text-amber-400">{lang === "fr" ? "Conditions Generales" : "Terms & Conditions"}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>+213 555 000 001</li>
                <li>contact@honeytravel.dz</li>
                <li>{lang === "fr" ? "Bureau: Cheraga, Alger" : "Office: Cheraga, Algiers"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
            &copy; 2026 Honey Travel. {lang === "fr" ? "Tous droits reserves." : "All rights reserved."}
          </div>
        </div>
      </footer>
    </div>
  );
}
