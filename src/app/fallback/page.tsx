import Link from 'next/link';

export default function FallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-700">The URL you requested was not found.</p>
        <p className="mt-2 text-gray-500">It may have been moved, or the link is incorrect.</p>
        <div className="mt-6">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}


