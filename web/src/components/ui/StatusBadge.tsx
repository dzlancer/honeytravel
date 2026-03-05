'use client';

import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed' | 'refunded';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-warning-100 text-warning-700',
  confirmed: 'bg-success-100 text-success-700',
  cancelled: 'bg-error-100 text-error-700',
  completed: 'bg-primary-100 text-primary-700',
  failed: 'bg-gray-100 text-gray-600',
  refunded: 'bg-purple-100 text-purple-700',
};

const statusDot: Record<BookingStatus, string> = {
  pending: 'bg-warning-500',
  confirmed: 'bg-success-500',
  cancelled: 'bg-error-500',
  completed: 'bg-primary-500',
  failed: 'bg-gray-400',
  refunded: 'bg-purple-500',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();

  const statusKey = status as string;
  const label = t(`booking.${statusKey}`, statusKey);

  return (
    <span
      className={clsx(
        'badge text-xs font-medium capitalize',
        statusStyles[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', statusDot[status] || 'bg-gray-400')} />
      {label}
    </span>
  );
}
