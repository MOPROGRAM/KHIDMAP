import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SearchClient from './SearchClient';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ServiceSearchPage({ searchParams }: { searchParams?: { q?: string; category?: string } }) {
  const q = searchParams?.q || '';
  const category = searchParams?.category || 'all';

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchClient initialQuery={q} initialCategory={category} />
    </Suspense>
  );
}
