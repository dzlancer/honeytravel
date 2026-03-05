'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';
const MAX_THUMBS = 5;

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const safeImages = images && images.length > 0 ? images : [PLACEHOLDER];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const getImgSrc = (index: number) => {
    if (imgError[index]) return PLACEHOLDER;
    return safeImages[index] || PLACEHOLDER;
  };

  const extraCount = safeImages.length - MAX_THUMBS;

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={getImgSrc(selectedIndex)}
              alt={`${alt} - ${selectedIndex + 1}`}
              fill
              className="object-cover"
              priority={selectedIndex === 0}
              onError={() => setImgError((prev) => ({ ...prev, [selectedIndex]: true }))}
            />
          </motion.div>
        </AnimatePresence>

        {/* Image counter */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 end-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
          {safeImages.slice(0, MAX_THUMBS).map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={clsx(
                'relative w-24 h-16 rounded-lg overflow-hidden shrink-0 transition-all duration-200',
                selectedIndex === index
                  ? 'ring-2 ring-primary-500 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={getImgSrc(index)}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                onError={() => setImgError((prev) => ({ ...prev, [index]: true }))}
              />

              {/* "+N more" overlay on last visible thumb */}
              {index === MAX_THUMBS - 1 && extraCount > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">+{extraCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
