'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'tsa-recently-viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  productType: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  timestamp: number;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        setItems(stored);
      } catch {
        setItems([]);
      }
    }
  }, []);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, 'timestamp'>) => {
    setItems((prev) => {
      const key = `${item.productType}:${item.productId}`;
      const filtered = prev.filter((i) => `${i.productType}:${i.productId}` !== key);
      const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { items, addItem, clearAll };
}
