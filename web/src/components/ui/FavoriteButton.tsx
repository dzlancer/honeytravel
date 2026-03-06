'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  productType: string;
  productId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function FavoriteButton({ productType, productId, size = 'md', className }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const active = isFavorited(productType, productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productType, productId);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={clsx(
        'rounded-full flex items-center justify-center transition-colors',
        size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
        active
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white shadow-sm',
        className,
      )}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={clsx(
          size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
          active && 'fill-current',
        )}
      />
    </motion.button>
  );
}
