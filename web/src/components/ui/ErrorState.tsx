'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || t('common.error')}
      </h3>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        {message || t('common.tryAgain')}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm">
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
