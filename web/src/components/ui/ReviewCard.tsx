'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, ShieldCheck } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { api } from '@/lib/api';
import clsx from 'clsx';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    helpfulCount: number;
    isVerified: boolean;
    createdAt: string;
    user?: { firstName: string; lastName: string } | null;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation();
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);

  const initials = review.user
    ? `${review.user.firstName[0]}${review.user.lastName[0]}`
    : '??';
  const name = review.user
    ? `${review.user.firstName} ${review.user.lastName[0]}.`
    : t('reviews.anonymous');

  const timeAgo = (() => {
    const diff = Date.now() - new Date(review.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('notifications.justNow');
    if (mins < 60) return t('notifications.minutesAgo', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('notifications.daysAgo', { count: days });
  })();

  const handleHelpful = async () => {
    if (voted) return;
    setVoted(true);
    setHelpful((h) => h + 1);
    try {
      await api.markReviewHelpful(review.id);
    } catch {
      setVoted(false);
      setHelpful((h) => h - 1);
    }
  };

  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{name}</span>
            {review.isVerified && (
              <span className="badge bg-green-100 text-green-700 text-xs gap-1">
                <ShieldCheck className="w-3 h-3" />
                {t('reviews.verifiedPurchase')}
              </span>
            )}
            <span className="text-xs text-gray-400 ms-auto">{timeAgo}</span>
          </div>
          <StarRating rating={review.rating} size="sm" className="mt-1" />
          <h4 className="text-sm font-semibold text-gray-900 mt-2">{review.title}</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
          <button
            onClick={handleHelpful}
            disabled={voted}
            className={clsx(
              'flex items-center gap-1.5 mt-3 text-xs px-3 py-1.5 rounded-lg transition-colors',
              voted
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {t('reviews.helpful')} {helpful > 0 && `(${helpful})`}
          </button>
        </div>
      </div>
    </div>
  );
}
