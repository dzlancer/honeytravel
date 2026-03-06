export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      <p className="mt-3 text-sm text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}
