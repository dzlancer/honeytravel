'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import clsx from 'clsx';

const CURRENCIES = [
  { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
];

interface CurrencySwitcherProps {
  className?: string;
}

export function CurrencySwitcher({ className }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Change currency"
      >
        <span>{current.flag}</span>
        <span>{current.code}</span>
        <svg className={clsx('w-3 h-3 transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-1 w-48 bg-white rounded-xl shadow-soft-lg border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              className={clsx(
                'flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors',
                currency === c.code
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.code}</span>
              </span>
              <span className="text-xs text-gray-400">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
