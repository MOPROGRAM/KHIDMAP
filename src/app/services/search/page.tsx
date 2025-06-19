
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ServiceAd, mockServiceAds, ServiceProvider, getProviderById } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, MapPin, Briefcase, Wrench, Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function ServiceSearchPage() {
  const t = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ServiceAd[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');

  // Mock search history handling
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  const updateSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5); // Keep last 5 unique searches
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };


  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setCurrentSearch(query);
    setIsLoading(true);
    setSearchResults([]); // Clear previous results

    // Simulate API call
    setTimeout(() => {
      const lowerCaseQuery = query.toLowerCase();
      const results = mockServiceAds.filter(ad => 
        ad.title.toLowerCase().includes(lowerCaseQuery) ||
        ad.description.toLowerCase().includes(lowerCaseQuery) ||
        ad.zipCode.includes(lowerCaseQuery) ||
        ad.category.toLowerCase().includes(lowerCaseQuery)
      );
      setSearchResults(results);
      setIsLoading(false);
      if (query) { // Add to history only if it's a new search by user
        updateSearchHistory(query);
      }
    }, 1000);
  };
  
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleHistorySearch = (term: string) => {
    setSearchTerm(term);
    handleSearch(term);
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <SearchIcon className="h-8 w-8 text-primary" />
            {t.search} {t.services}
          </CardTitle>
          <CardDescription>{t.searchByZipOrKeyword}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow text-lg p-3"
              aria-label={t.searchPlaceholder}
            />
            <Button type="submit" size="lg" className="text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <SearchIcon className="ltr:mr-2 rtl:ml-2 h-5 w-5" />}
              {t.search}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline">{t.recentSearches}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <Button key={index} variant="outline" size="sm" onClick={() => handleHistorySearch(term)}>
                {term}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}


      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">{t.loading}</p>
        </div>
      )}

      {!isLoading && currentSearch && searchResults.length === 0 && (
        <Card className="text-center py-12">
          <CardHeader>
             <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>{t.noResultsFound}</CardTitle>
            <CardDescription>
              Try searching with different keywords or zip codes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((ad) => {
            const provider = getProviderById(ad.providerId);
            return (
              <Card key={ad.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="relative w-full h-48">
                   <Image
                    src={ad.imageUrl || "https://placehold.co/600x400.png"}
                    alt={ad.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={ad.category === 'Plumbing' ? "plumbing work" : "electrical work"}
                  />
                  <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded">
                    {ad.category === 'Plumbing' ? <Wrench className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" /> : <Zap className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" />}
                    {t[ad.category.toLowerCase() as keyof typeof t]}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold font-headline truncate" title={ad.title}>{ad.title}</CardTitle>
                  {provider && (
                    <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> {provider.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-foreground line-clamp-3 mb-2">{ad.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <MapPin className="h-4 w-4" /> {ad.zipCode}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    {/* In a real app, this link would go to a dynamic page like /services/[ad.id] */}
                    <Link href={`/services/ad/${ad.id}`}> 
                      {t.viewDetails} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

