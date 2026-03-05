'use client';

import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StarRating({ rating, size = 'md', showCount = false, count, className }: StarRatingProps) {
  const stars = Math.round(Math.min(Math.max(rating, 0), 5));

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={clsx(
              sizeMap[size],
              i < stars
                ? 'text-accent-500 fill-accent-500'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-gray-500 text-sm ms-1">
          ({count})
        </span>
      )}
    </div>
  );
}
