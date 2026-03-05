'use client';

import clsx from 'clsx';

interface SkeletonProps {
  variant?: 'text' | 'avatar' | 'image' | 'card' | 'button' | 'custom';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function Skeleton({ variant = 'custom', width, height, className, count = 1 }: SkeletonProps) {
  const base = 'skeleton';

  const variantStyles: Record<string, string> = {
    text: 'h-4 w-full rounded',
    avatar: 'h-12 w-12 rounded-full',
    image: 'w-full aspect-video rounded-xl',
    card: 'w-full h-48 rounded-2xl',
    button: 'h-12 w-32 rounded-xl',
    custom: '',
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={clsx(base, variantStyles[variant], className)}
          style={{ width, height }}
        />
      ))}
    </>
  );
}

/* ─── Compound Skeletons ────────────────────────────────────────────── */

export function SearchCardSkeleton() {
  return (
    <div className="card flex flex-col sm:flex-row animate-pulse">
      <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-200 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shrink-0" />
      <div className="p-4 flex-1 space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="flex gap-2 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-end pt-2">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="text-right space-y-1">
            <div className="h-7 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded ms-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div className="section py-8 animate-pulse">
      {/* Breadcrumbs */}
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      {/* Stars + Title */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
      {/* Image gallery */}
      <div className="h-[400px] bg-gray-200 rounded-xl mb-4" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 w-28 bg-gray-200 rounded-lg" />
        ))}
      </div>
      {/* Content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mt-6 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex gap-3 items-center">
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-56 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 w-24 bg-gray-200 rounded ms-auto" />
          <div className="h-4 w-20 bg-gray-200 rounded ms-auto" />
        </div>
      </div>
    </div>
  );
}
