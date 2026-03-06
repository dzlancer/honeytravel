import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center section-padding bg-gradient-algerian">
      <div className="animate-fade-in-down text-center max-w-lg mx-auto">
        <p className="text-[10rem] font-extrabold leading-none text-primary-600/20 select-none">
          404
        </p>

        <h1 className="text-display-md font-bold text-gray-900 -mt-8">
          Page Not Found
        </h1>

        <p className="text-heading-lg text-gray-500 mt-4">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-5 w-5" />
            Go Home
          </Link>

          <Link href="/search" className="btn-secondary inline-flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </Link>
        </div>
      </div>
    </main>
  );
}
