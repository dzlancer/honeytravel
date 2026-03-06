export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      <p className="mt-4 text-heading-lg text-gray-500 animate-pulse">Loading...</p>
    </main>
  );
}
