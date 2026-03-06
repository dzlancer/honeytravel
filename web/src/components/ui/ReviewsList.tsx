'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquarePlus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ReviewsResponse, Review } from '@shared/types';
import { ReviewCard } from '@/components/ui/ReviewCard';
import { RatingDistribution } from '@/components/ui/RatingDistribution';
import { WriteReviewModal } from '@/components/ui/WriteReviewModal';
import { Pagination } from '@/components/ui/Pagination';

interface ReviewsListProps {
  productType: string;
  productId: string;
}

export function ReviewsList({ productType, productId }: ReviewsListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showWrite, setShowWrite] = useState(false);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const result = await api.getProductReviews(productType, productId, p);
      setData(result);
    } catch {}
    setLoading(false);
  }, [productType, productId]);

  useEffect(() => { fetch(page); }, [fetch, page]);

  const handleReviewSubmitted = () => {
    setShowWrite(false);
    fetch(1);
    setPage(1);
  };

  if (loading && !data) {
    return (
      <section>
        <h2 className="text-heading-md font-semibold mb-4">{t('reviews.title')}</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </section>
    );
  }

  const reviews = data?.reviews || [];
  const total = data?.total || 0;
  const avgRating = data?.averageRating || 0;
  const dist = data?.ratingDistribution || {};
  const totalPages = Math.ceil(total / (data?.limit || 10));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-heading-md font-semibold">{t('reviews.title')}</h2>
        {user && (
          <button
            onClick={() => setShowWrite(true)}
            className="btn-primary btn-sm text-sm gap-1.5"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {t('reviews.writeReview')}
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="card p-5 mb-6">
          <RatingDistribution
            averageRating={avgRating}
            totalReviews={total}
            distribution={dist}
          />
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review: Review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <MessageSquarePlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t('reviews.noReviews')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('reviews.noReviewsDesc')}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {showWrite && (
        <WriteReviewModal
          productType={productType}
          productId={productId}
          onClose={() => setShowWrite(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </section>
  );
}
