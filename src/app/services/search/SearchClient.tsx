"use client";

import { useSearchParams } from 'next/navigation';
import { ServiceCategory } from '@/lib/data';
import SearchComponent from './Search';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = (searchParams.get('category') as ServiceCategory | null) || 'all';

  return <SearchComponent initialQuery={query} initialCategory={category} />;
}
