'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getExchangeRates, convertCurrency, formatCurrency } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  format: (amount: number, fromCurrency?: string) => string;
  rates: Record<string, number>;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'DZD',
  setCurrency: () => {},
  format: (amount) => `$${amount}`,
  rates: {},
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function useCurrencyProvider(): CurrencyContextType {
  const [currency, setCurrencyState] = useState('DZD');
  const [rates, setRates] = useState<Record<string, number>>({});

  // Load saved currency + exchange rates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsa-currency');
      if (saved) setCurrencyState(saved);
    }
    getExchangeRates().then(setRates).catch(() => {});
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tsa-currency', code);
    }
  }, []);

  const format = useCallback((amount: number, fromCurrency = 'USD') => {
    if (!rates || Object.keys(rates).length === 0) {
      return formatCurrency(amount, fromCurrency);
    }
    const converted = convertCurrency(amount, fromCurrency, currency, rates);
    return formatCurrency(converted, currency);
  }, [currency, rates]);

  return { currency, setCurrency, format, rates };
}
