export type Lang = "fr" | "ar" | "en";

const translations: Record<string, Record<Lang, string>> = {
  "nav.home": { fr: "Accueil", ar: "الرئيسية", en: "Home" },
  "nav.hotels": { fr: "Hotels", ar: "الفنادق", en: "Hotels" },
  "nav.bookings": { fr: "Reservations", ar: "الحجوزات", en: "Bookings" },
  "nav.admin": { fr: "Admin", ar: "الإدارة", en: "Admin" },
  "nav.contact": { fr: "Contact", ar: "اتصل بنا", en: "Contact" },
  "hero.title": { fr: "Votre Sejour a Istanbul Commence Ici", ar: "إقامتك في إسطنبول تبدأ هنا", en: "Your Istanbul Stay Starts Here" },
  "hero.subtitle": { fr: "62 hotels selectionnes pour les voyageurs algeriens", ar: "62 فندقاً مختاراً للمسافرين الجزائريين", en: "62 handpicked hotels for Algerian travelers" },
  "hero.cta": { fr: "Voir les Hotels", ar: "عرض الفنادق", en: "Browse Hotels" },
  "filter.district": { fr: "Quartier", ar: "الحي", en: "District" },
  "filter.all": { fr: "Tous", ar: "الكل", en: "All" },
  "filter.price": { fr: "Prix", ar: "السعر", en: "Price" },
  "filter.stars": { fr: "Etoiles", ar: "النجوم", en: "Stars" },
  "filter.search": { fr: "Rechercher un hotel...", ar: "البحث عن فندق...", en: "Search hotels..." },
  "hotel.from": { fr: "A partir de", ar: "يبدأ من", en: "From" },
  "hotel.night": { fr: "/ nuit", ar: "/ ليلة", en: "/ night" },
  "hotel.perNight": { fr: "par nuit", ar: "لليلة", en: "per night" },
  "hotel.viewDetails": { fr: "Voir les Details", ar: "عرض التفاصيل", en: "View Details" },
  "hotel.bookNow": { fr: "Reserver Maintenant", ar: "احجز الآن", en: "Book Now" },
  "hotel.nights": { fr: "nuits", ar: "ليالي", en: "nights" },
  "hotel.breakfast": { fr: "Petit-dejeuner inclus", ar: "إفطار مشمول", en: "Breakfast included" },
  "hotel.transfer": { fr: "Transfert inclus", ar: "نقل مشمول", en: "Transfer included" },
  "hotel.amenities": { fr: "Equipements", ar: "المرافق", en: "Amenities" },
  "booking.step1": { fr: "Choisir le Forfait", ar: "اختر الباقة", en: "Choose Package" },
  "booking.step2": { fr: "Dates du Sejour", ar: "تواريخ الإقامة", en: "Stay Dates" },
  "booking.step3": { fr: "Informations Voyageur", ar: "معلومات المسافر", en: "Traveler Info" },
  "booking.step4": { fr: "Paiement", ar: "الدفع", en: "Payment" },
  "booking.step5": { fr: "Confirmation", ar: "التأكيد", en: "Confirmation" },
  "booking.fullName": { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "booking.whatsapp": { fr: "WhatsApp (+213)", ar: "واتساب (+213)", en: "WhatsApp (+213)" },
  "booking.email": { fr: "Email", ar: "البريد الإلكتروني", en: "Email" },
  "booking.passport": { fr: "N° Passeport", ar: "رقم جواز السفر", en: "Passport No." },
  "booking.city": { fr: "Ville", ar: "المدينة", en: "City" },
  "booking.specialRequests": { fr: "Demandes speciales", ar: "طلبات خاصة", en: "Special requests" },
  "booking.confirm": { fr: "Confirmer la Reservation", ar: "تأكيد الحجز", en: "Confirm Booking" },
  "booking.success": { fr: "Reservation Confirmee!", ar: "تم تأكيد الحجز!", en: "Booking Confirmed!" },
  "payment.cib": { fr: "CIB / Edahabia (D17)", ar: "CIB / الدهبية (D17)", en: "CIB / Edahabia (D17)" },
  "payment.baridimob": { fr: "BaridiMob", ar: "بريدي موب", en: "BaridiMob" },
  "payment.cash": { fr: "Especes au Bureau (Cheraga)", ar: "نقداً في المكتب (شراقة)", en: "Cash at Office (Cheraga)" },
  "payment.reserve": { fr: "Reserver & Payer a l'Hotel", ar: "احجز وادفع في الفندق", en: "Reserve & Pay at Hotel" },
  "social.bookingsToday": { fr: "Algeriens ont reserve aujourd'hui", ar: "جزائري حجزوا اليوم", en: "Algerians booked today" },
  "social.viewing": { fr: "personnes consultent maintenant", ar: "أشخاص يتصفحون الآن", en: "people viewing now" },
  "social.roomsLeft": { fr: "chambres restantes a ce prix", ar: "غرف متبقية بهذا السعر", en: "rooms left at this price" },
  "currency.dzd": { fr: "DZD", ar: "د.ج", en: "DZD" },
  "whatsapp.cta": { fr: "Discuter sur WhatsApp", ar: "تحدث عبر واتساب", en: "Chat on WhatsApp" },
  "map.title": { fr: "Carte des Hotels", ar: "خريطة الفنادق", en: "Hotel Map" },
  "admin.dashboard": { fr: "Tableau de Bord", ar: "لوحة التحكم", en: "Dashboard" },
  "admin.bookings": { fr: "Reservations", ar: "الحجوزات", en: "Bookings" },
  "admin.customers": { fr: "Clients", ar: "العملاء", en: "Customers" },
  "admin.pricing": { fr: "Tarification", ar: "التسعير", en: "Pricing" },
};

export function t(key: string, lang: Lang = "fr"): string {
  return translations[key]?.[lang] || translations[key]?.["fr"] || key;
}

export function formatPrice(amount: number, currency: "DZD" | "EUR" = "DZD"): string {
  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
  }
  return new Intl.NumberFormat("fr-DZ").format(amount) + " DZD";
}

export function isRTL(lang: Lang): boolean {
  return lang === "ar";
}
