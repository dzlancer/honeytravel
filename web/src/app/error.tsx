'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center section-padding">
      <div className="animate-fade-in-down text-center max-w-lg mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-display-md font-bold text-gray-900">
          Something went wrong
        </h1>

        <p className="text-heading-lg text-gray-500 mt-4">
          {error.message || 'An unexpected error occurred. Please try again later.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Try Again
          </button>

          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <Home className="h-5 w-5" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
