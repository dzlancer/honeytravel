'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function getPageNumbers(current: number, total: number, siblings: number): (number | 'dots')[] {
  const totalNumbers = siblings * 2 + 5; // siblings + boundaries + current + 2 dots
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblings, 1);
  const rightSiblingIndex = Math.min(current + siblings, total);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + 2 * siblings }, (_, i) => i + 1);
    return [...leftRange, 'dots', total];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from({ length: 3 + 2 * siblings }, (_, i) => total - (3 + 2 * siblings) + i + 1);
    return [1, 'dots', ...rightRange];
  }

  const middleRange = Array.from({ length: siblings * 2 + 1 }, (_, i) => leftSiblingIndex + i);
  return [1, 'dots', ...middleRange, 'dots', total];
}

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn btn-ghost btn-sm p-2 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 flip-rtl" />
      </button>

      {pages.map((page, idx) =>
        page === 'dots' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm select-none">
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              'btn btn-sm min-w-[36px] text-sm',
              page === currentPage
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'btn-ghost'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn btn-ghost btn-sm p-2 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4 flip-rtl" />
      </button>
    </nav>
  );
}
