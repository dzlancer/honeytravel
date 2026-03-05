'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BookingConfirmedPage() {
  const { id } = useParams();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your booking reference is: <strong>{(id as string).slice(0, 8).toUpperCase()}</strong>
        </p>
        <p className="text-gray-500 text-sm mb-8">
          A confirmation email has been sent to your registered email address.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/bookings" className="btn-primary">View My Bookings</Link>
          <Link href="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
