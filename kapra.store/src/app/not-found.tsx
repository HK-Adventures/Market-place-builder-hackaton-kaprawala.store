import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="mb-8">The page you're looking for doesn't exist.</p>
        <Link 
          href="/"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
} 