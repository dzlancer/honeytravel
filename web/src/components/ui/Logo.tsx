'use client';

import Link from 'next/link';
import clsx from 'clsx';

interface LogoProps {
  variant?: 'default' | 'white' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'default', size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 'w-9 h-9', text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl', sub: 'text-sm' },
  };

  const s = sizes[size];
  const isWhite = variant === 'white';

  return (
    <Link href="/" className={clsx('flex items-center gap-2.5 group', className)}>
      {/* Icon mark — stylized compass/star inspired by Algerian patterns */}
      <div
        className={clsx(
          s.icon,
          'rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105',
          isWhite
            ? 'bg-white/15 backdrop-blur-sm border border-white/20'
            : 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-glow-primary'
        )}
      >
        <svg viewBox="0 0 32 32" className={clsx('w-5 h-5', isWhite ? 'text-white' : 'text-white')}>
          {/* Stylized compass rose / star */}
          <path
            d="M16 2L19.5 12.5L30 16L19.5 19.5L16 30L12.5 19.5L2 16L12.5 12.5L16 2Z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      {variant !== 'compact' && (
        <div className="flex flex-col">
          <span
            className={clsx(
              s.text,
              'font-bold leading-tight tracking-tight',
              isWhite ? 'text-white' : 'text-primary-900'
            )}
          >
            TravelShop
          </span>
          <span
            className={clsx(
              s.sub,
              'font-semibold uppercase tracking-widest leading-tight',
              isWhite ? 'text-accent-300' : 'text-accent-500'
            )}
          >
            Algeria
          </span>
        </div>
      )}
    </Link>
  );
}
