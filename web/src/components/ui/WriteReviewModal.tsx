'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface WriteReviewModalProps {
  productType: string;
  productId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function WriteReviewModal({ productType, productId, onClose, onSubmitted }: WriteReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('reviews.ratingRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await api.createReview({ productType, productId, rating, title, comment });
      toast.success(t('reviews.reviewSubmitted'));
      onSubmitted();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-soft-xl w-full max-w-lg p-6 z-10"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">{t('reviews.writeReview')}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Selector */}
            <div>
              <label className="input-label">{t('reviews.averageRating')}</label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={clsx(
                        'w-8 h-8 transition-colors',
                        star <= (hoverRating || rating)
                          ? 'text-accent-500 fill-accent-500'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="input-label">{t('reviews.reviewTitle')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Comment */}
            <div>
              <label className="input-label">{t('reviews.reviewComment')}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field min-h-[120px] resize-y"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('reviews.submitReview')
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
