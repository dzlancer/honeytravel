'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Favorite } from '@shared/types';

interface FavoritesContextType {
  isFavorited: (productType: string, productId: string) => boolean;
  toggleFavorite: (productType: string, productId: string) => Promise<void>;
  favorites: Favorite[];
  favoritesCount: number;
  loading: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType>({
  isFavorited: () => false,
  toggleFavorite: async () => {},
  favorites: [],
  favoritesCount: 0,
  loading: false,
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

function makeKey(type: string, id: string) {
  return `${type}:${id}`;
}

export function useFavoritesProvider(): FavoritesContextType {
  const { user } = useAuth();
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites on auth change
  useEffect(() => {
    if (user) {
      setLoading(true);
      api.getFavorites()
        .then((data: Favorite[]) => {
          const set = new Set<string>();
          (data || []).forEach((f: Favorite) => set.add(makeKey(f.productType, f.productId)));
          setFavSet(set);
          setFavorites(data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // Load from localStorage for unauthenticated users
      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('tsa-favorites') || '[]');
          const set = new Set<string>();
          stored.forEach((f: Favorite) => set.add(makeKey(f.productType, f.productId)));
          setFavSet(set);
          setFavorites(stored);
        } catch {
          setFavSet(new Set());
          setFavorites([]);
        }
      }
    }
  }, [user]);

  const isFavorited = useCallback((productType: string, productId: string) => {
    return favSet.has(makeKey(productType, productId));
  }, [favSet]);

  const toggleFavorite = useCallback(async (productType: string, productId: string) => {
    const key = makeKey(productType, productId);
    const wasFavorited = favSet.has(key);

    // Optimistic update
    setFavSet((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(key);
      else next.add(key);
      return next;
    });

    if (user) {
      try {
        if (wasFavorited) {
          await api.removeFavorite(productType, productId);
          setFavorites((prev) => prev.filter((f) => !(f.productType === productType && f.productId === productId)));
        } else {
          const result = await api.addFavorite(productType, productId);
          setFavorites((prev) => [result, ...prev]);
        }
      } catch {
        // Revert on failure
        setFavSet((prev) => {
          const next = new Set(prev);
          if (wasFavorited) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    } else {
      // localStorage for unauthenticated
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('tsa-favorites') || '[]');
        let updated;
        if (wasFavorited) {
          updated = stored.filter((f: Favorite) => !(f.productType === productType && f.productId === productId));
        } else {
          updated = [{ productType, productId, createdAt: new Date().toISOString() }, ...stored];
        }
        localStorage.setItem('tsa-favorites', JSON.stringify(updated));
        setFavorites(updated);
      }
    }
  }, [favSet, user]);

  return {
    isFavorited,
    toggleFavorite,
    favorites,
    favoritesCount: favSet.size,
    loading,
  };
}
