import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Coffee, Car, MessageCircle, CreditCard, Banknote, Building, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { Lang, t, formatPrice } from "../lib/i18n";
import { Hotel, HotelVariant, BookingFormData } from "../types";

interface Props { lang: Lang; }

const STEPS = ["step1", "step2", "step3", "step4", "step5"] as const;

const PAYMENT_METHODS = [
  { id: "cib_d17", icon: <CreditCard size={20} />, labelKey: "payment.cib", desc: "Carte CIB / Edahabia via D17" },
  { id: "baridimob", icon: <Banknote size={20} />, labelKey: "payment.baridimob", desc: "Paiement via BaridiMob" },
  { id: "cash", icon: <Building size={20} />, labelKey: "payment.cash", desc: "Bureau Cheraga, Alger" },
  { id: "reserve_pay_hotel", icon: <Shield size={20} />, labelKey: "payment.reserve", desc: "Aucun paiement maintenant" },
];

const ALGERIAN_CITIES = [
  "Alger", "Oran", "Constantine", "Annaba", "Setif", "Batna",
  "Blida", "Tlemcen", "Bejaia", "Tizi Ouzou", "Biskra", "Djelfa",
];

export default function BookingPage({ lang }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<HotelVariant | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const [form, setForm] = useState<BookingFormData>({
    hotel_id: "", variant_id: "", check_in: "", nights: 4,
    guests_adults: 2, guests_children: 0, room_count: 1,
    full_name: "", whatsapp_phone: "+213", email: "", passport_number: "",
    city: "", payment_method: "reserve_pay_hotel", source_channel: "web",
    referral_code: "", special_requests: "", extras: [],
  });

  useEffect(() => {
    if (!slug) return;
    api.getHotel(slug).then((data) => {
      setHotel(data);
      const variantId = searchParams.get("variant");
      const variant = variantId
        ? data.variants?.find((v: HotelVariant) => v.variant_id === variantId)
        : data.variants?.[0];
      if (variant) {
        setSelectedVariant(variant);
        setForm((f) => ({
          ...f,
          hotel_id: data.hotel_id,
          variant_id: variant.variant_id,
          nights: variant.nights,
        }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, searchParams]);

  const updateForm = (field: keyof BookingFormData, value: string | number | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const selectVariant = (v: HotelVariant) => {
    setSelectedVariant(v);
    setForm((f) => ({ ...f, variant_id: v.variant_id, nights: v.nights }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedVariant;
      case 1: return !!form.check_in;
      case 2: return form.full_name.length >= 2 && form.whatsapp_phone.length >= 10;
      case 3: return !!form.payment_method;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await api.createBooking(form);
      setBookingResult(result);
      setStep(4);
    } catch (err: any) {
      alert(err.message || "Booking failed");
    }
    setSubmitting(false);
  };

  const nextStep = () => {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const pricing = selectedVariant?.dynamic_pricing;

  // Generate default check-in date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split("T")[0];

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
        <p className="text-gray-500">Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => step > 0 ? setStep(step - 1) : navigate(`/hotels/${slug}`)} className="text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1">
              <ChevronLeft size={16} />
              {lang === "fr" ? "Retour" : "Back"}
            </button>
            <span className="text-sm text-gray-500">
              {lang === "fr" ? "Etape" : "Step"} {step + 1}/5
            </span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-amber-500" : "bg-gray-200"
              }`} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs ${i <= step ? "text-amber-600 font-medium" : "text-gray-400"}`}>
                {t(`booking.${s}`, lang)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Hotel summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6 flex items-center gap-4">
          <img
            src={hotel.images?.[0]}
            alt={hotel.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{hotel.name}</h3>
            <p className="text-xs text-gray-500">{hotel.district}, Istanbul</p>
            {selectedVariant && (
              <p className="text-xs text-amber-600 font-medium mt-0.5">
                {selectedVariant.nights}N - {formatPrice(pricing?.final_price_per_room || selectedVariant.sale_price_dzd)}
              </p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Package Selection */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t("booking.step1", lang)}</h2>
                <div className="space-y-3">
                  {hotel.variants?.map((v) => (
                    <button
                      key={v.variant_id}
                      onClick={() => selectVariant(v)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedVariant?.variant_id === v.variant_id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-100 hover:border-amber-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 text-lg">{v.nights} {t("hotel.nights", lang)}</span>
                          <div className="flex items-center gap-3 mt-1">
                            {v.includes_breakfast && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <Coffee size={14} /> {t("hotel.breakfast", lang)}
                              </span>
                            )}
                            {v.includes_transfer && (
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                <Car size={14} /> {t("hotel.transfer", lang)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 line-through">{formatPrice(v.base_price_dzd)}</div>
                          <div className="text-xl font-bold text-amber-600">
                            {formatPrice(v.dynamic_pricing?.final_price_per_room || v.sale_price_dzd)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Room count */}
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {lang === "fr" ? "Nombre de chambres" : "Number of rooms"}
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateForm("room_count", Math.max(1, form.room_count - 1))} className="w-10 h-10 rounded-lg border text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg">-</button>
                    <span className="text-lg font-semibold w-8 text-center">{form.room_count}</span>
                    <button onClick={() => updateForm("room_count", Math.min(10, form.room_count + 1))} className="w-10 h-10 rounded-lg border text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg">+</button>
                    {form.room_count >= 5 && (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                        -8% {lang === "fr" ? "remise groupe" : "group discount"}!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Dates */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t("booking.step2", lang)}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Check-in</label>
                    <input
                      type="date"
                      value={form.check_in || defaultCheckIn}
                      onChange={(e) => updateForm("check_in", e.target.value)}
                      min={defaultCheckIn}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Check-out</span>
                      <span className="font-medium">
                        {form.check_in
                          ? new Date(new Date(form.check_in).getTime() + form.nights * 86400000).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")
                          : "-"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">{lang === "fr" ? "Duree" : "Duration"}</span>
                      <span className="font-medium">{form.nights} {t("hotel.nights", lang)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        {lang === "fr" ? "Adultes" : "Adults"}
                      </label>
                      <select
                        value={form.guests_adults}
                        onChange={(e) => updateForm("guests_adults", parseInt(e.target.value))}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        {lang === "fr" ? "Enfants" : "Children"}
                      </label>
                      <select
                        value={form.guests_children}
                        onChange={(e) => updateForm("guests_children", parseInt(e.target.value))}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Guest Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t("booking.step3", lang)}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{t("booking.fullName", lang)} *</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => updateForm("full_name", e.target.value)}
                      placeholder="Mohamed Benali"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{t("booking.whatsapp", lang)} *</label>
                    <input
                      type="tel"
                      value={form.whatsapp_phone}
                      onChange={(e) => updateForm("whatsapp_phone", e.target.value)}
                      placeholder="+213 555 123 456"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{t("booking.email", lang)}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t("booking.passport", lang)}</label>
                      <input
                        type="text"
                        value={form.passport_number}
                        onChange={(e) => updateForm("passport_number", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t("booking.city", lang)}</label>
                      <select
                        value={form.city}
                        onChange={(e) => updateForm("city", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        <option value="">--</option>
                        {ALGERIAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{t("booking.specialRequests", lang)}</label>
                    <textarea
                      value={form.special_requests}
                      onChange={(e) => updateForm("special_requests", e.target.value)}
                      rows={3}
                      placeholder={lang === "fr" ? "Chambre non-fumeur, lit king size..." : "Non-smoking room, king bed..."}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {lang === "fr" ? "Code de parrainage" : "Referral code"}
                    </label>
                    <input
                      type="text"
                      value={form.referral_code}
                      onChange={(e) => updateForm("referral_code", e.target.value)}
                      placeholder="XXXXXXXX"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t("booking.step4", lang)}</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => updateForm("payment_method", pm.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        form.payment_method === pm.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-100 hover:border-amber-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        form.payment_method === pm.id ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {pm.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{t(pm.labelKey, lang)}</div>
                        <div className="text-xs text-gray-500">{pm.desc}</div>
                      </div>
                      {form.payment_method === pm.id && (
                        <div className="ml-auto">
                          <Check size={20} className="text-amber-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {lang === "fr" ? "Recapitulatif" : "Summary"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{hotel.name}</span>
                      <span>{selectedVariant?.nights}N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "fr" ? "Chambres" : "Rooms"}</span>
                      <span>{form.room_count}</span>
                    </div>
                    {pricing && (
                      <>
                        <div className="flex justify-between text-gray-400">
                          <span>{lang === "fr" ? "Prix original" : "Original price"}</span>
                          <span className="line-through">{formatPrice(pricing.base_price * form.room_count)}</span>
                        </div>
                        {pricing.savings > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>{lang === "fr" ? "Economies" : "Savings"}</span>
                            <span>-{formatPrice(pricing.savings)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total</span>
                          <span className="text-amber-600">{formatPrice(pricing.total_price * form.room_count)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 4 && bookingResult && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("booking.success", lang)}</h2>
                <p className="text-gray-500 mb-6">
                  {lang === "fr"
                    ? "Votre reservation a ete creee avec succes"
                    : "Your booking has been created successfully"}
                </p>

                <div className="bg-amber-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-500">{lang === "fr" ? "Reference de reservation" : "Booking reference"}</p>
                  <p className="text-2xl font-bold text-amber-600 font-mono">{bookingResult.booking?.booking_ref}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hotel</span>
                    <span className="font-medium">{hotel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium">{form.check_in}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === "fr" ? "Duree" : "Duration"}</span>
                    <span className="font-medium">{form.nights} {t("hotel.nights", lang)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === "fr" ? "Montant" : "Amount"}</span>
                    <span className="font-bold text-amber-600">{formatPrice(bookingResult.booking?.final_price_dzd)}</span>
                  </div>
                </div>

                {bookingResult.customer_referral_code && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-medium text-blue-800">
                      {lang === "fr" ? "Votre code de parrainage" : "Your referral code"}
                    </p>
                    <p className="text-lg font-bold text-blue-600 font-mono">{bookingResult.customer_referral_code}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {lang === "fr"
                        ? "Partagez et gagnez 5,000 DZD par parrainage!"
                        : "Share and earn 5,000 DZD per referral!"}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <a
                    href={bookingResult.whatsapp_confirmation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    <MessageCircle size={18} />
                    {lang === "fr" ? "Confirmer via WhatsApp" : "Confirm via WhatsApp"}
                  </a>
                  <button
                    onClick={() => navigate("/hotels")}
                    className="text-amber-600 hover:text-amber-700 py-2 text-sm font-medium"
                  >
                    {lang === "fr" ? "Continuer a parcourir" : "Continue browsing"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        {step < 4 && (
          <div className="sticky bottom-4 mt-6">
            <button
              onClick={nextStep}
              disabled={!canProceed() || submitting}
              className={`w-full py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 ${
                canProceed() && !submitting
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : step === 3 ? (
                t("booking.confirm", lang)
              ) : (
                <>
                  {lang === "fr" ? "Continuer" : "Continue"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
