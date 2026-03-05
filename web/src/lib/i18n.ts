'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/en.json';
import fr from '@/i18n/fr.json';
import ar from '@/i18n/ar.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'EN', dir: 'ltr' as const },
  { code: 'fr', label: 'Fran\u00e7ais', flag: 'FR', dir: 'ltr' as const },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', flag: 'AR', dir: 'rtl' as const },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

function detectLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'fr'; // Default to French for Algeria

  // Check localStorage
  const saved = localStorage.getItem('tsa-language');
  if (saved && LANGUAGES.some((l) => l.code === saved)) return saved as LanguageCode;

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ar') return 'ar';
  if (browserLang === 'fr') return 'fr';

  return 'fr'; // Default to French for Algeria
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: typeof window !== 'undefined' ? detectLanguage() : 'fr',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function changeLanguage(code: LanguageCode) {
  i18n.changeLanguage(code);
  if (typeof window !== 'undefined') {
    localStorage.setItem('tsa-language', code);
  }

  // Update document direction
  const lang = LANGUAGES.find((l) => l.code === code);
  if (lang && typeof document !== 'undefined') {
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = code;
    // Toggle font for Arabic
    if (code === 'ar') {
      document.documentElement.classList.add('font-arabic');
    } else {
      document.documentElement.classList.remove('font-arabic');
    }
  }
}

export function getCurrentLanguage(): (typeof LANGUAGES)[number] {
  const code = i18n.language as LanguageCode;
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

export default i18n;
