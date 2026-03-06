'use client';

import { Star } from 'lucide-react';
import clsx from 'clsx';

interface RatingDistributionProps {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export function RatingDistribution({ averageRating, totalReviews, distribution }: RatingDistributionProps) {
  return (
    <div className="flex gap-6 items-start">
      {/* Average Rating */}
      <div className="text-center shrink-0">
        <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx(
                'w-4 h-4',
                i < Math.round(averageRating)
                  ? 'text-accent-500 fill-accent-500'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">{totalReviews} reviews</p>
      </div>

      {/* Distribution Bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
              <Star className="w-3 h-3 text-accent-500 fill-accent-500" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
