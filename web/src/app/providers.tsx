'use client';

import { ReactNode, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { FavoritesContext, useFavoritesProvider } from '@/hooks/useFavorites';
import { CurrencyContext, useCurrencyProvider } from '@/hooks/useCurrency';
import '@/lib/i18n'; // Initialize i18n

export function Providers({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  const favorites = useFavoritesProvider();
  const currency = useCurrencyProvider();

  // Apply saved language direction on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('tsa-language');
    if (savedLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else if (savedLang === 'fr') {
      document.documentElement.lang = 'fr';
    }
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <CurrencyContext.Provider value={currency}>
        <FavoritesContext.Provider value={favorites}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)',
              },
              success: {
                iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
              },
              error: {
                iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
              },
            }}
          />
        </FavoritesContext.Provider>
      </CurrencyContext.Provider>
    </AuthContext.Provider>
  );
}
