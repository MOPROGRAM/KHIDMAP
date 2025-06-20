
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ServiceAd, getAllServiceAds, UserProfile, getUserProfileById } from '@/lib/data';
import Link from 'next/link';
import NextImage from 'next/image'; // Renamed
import { Search as SearchIcon, MapPin, Briefcase, Wrench, Zap, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

interface SearchHistoryItem {
  query: string;
  date: string; // ISO string
}

export default function ServiceSearchPage() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [allAds, setAllAds] = useState<ServiceAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<ServiceAd[]>([]);
  const [providerDetails, setProviderDetails] = useState<Record<string, UserProfile>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('fullSearchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  const updateSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const newItem: SearchHistoryItem = { query, date: new Date().toISOString() };
    const newHistory = [newItem, ...searchHistory.filter(item => item.query.toLowerCase() !== query.toLowerCase())].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('fullSearchHistory', JSON.stringify(newHistory));
  };

  const fetchInitialAdsAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ads = await getAllServiceAds();
      setAllAds(ads);
      
      const providerIds = [...new Set(ads.map(ad => ad.providerId))];
      const providerPromises = providerIds.map(id => getUserProfileById(id));
      const providersArray = await Promise.all(providerPromises);
      
      const providerMap: Record<string, UserProfile> = {};
      providersArray.forEach(provider => {
        if (provider) {
          providerMap[provider.uid] = provider;
        }
      });
      setProviderDetails(providerMap);

      const initialQuery = searchParams.get('q');
      if (initialQuery) {
        setSearchTerm(initialQuery);
        filterAds(initialQuery, ads, providerMap);
        setCurrentSearchQuery(initialQuery);
      } else {
        setFilteredAds(ads);
      }

    } catch (err) {
      console.error("Error fetching ads or providers:", err);
      setError((err as Error).message || "Failed to load services.");
      setAllAds([]);
      setFilteredAds([]);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInitialAdsAndProviders();
  }, [fetchInitialAdsAndProviders]);

  const filterAds = (query: string, adsToFilter: ServiceAd[], currentProviderDetails: Record<string, UserProfile>) => {
    if (!query.trim()) {
      setFilteredAds(adsToFilter);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const results = adsToFilter.filter(ad => {
      const providerName = ad.providerName?.toLowerCase() || currentProviderDetails[ad.providerId]?.name.toLowerCase() || '';
      return (
        ad.title.toLowerCase().includes(lowerCaseQuery) ||
        ad.description.toLowerCase().includes(lowerCaseQuery) ||
        ad.address.toLowerCase().includes(lowerCaseQuery) || 
        t[ad.category.toLowerCase() as keyof typeof t].toLowerCase().includes(lowerCaseQuery) ||
        providerName.includes(lowerCaseQuery)
      );
    });
    setFilteredAds(results);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentSearchQuery(query);
    if (!initialLoad) setIsLoading(true);

    setTimeout(() => {
      filterAds(query, allAds, providerDetails);
      if (query.trim()) {
        updateSearchHistory(query);
        router.push(`/services/search?q=${encodeURIComponent(query)}`, { scroll: false });
      } else {
         router.push(`/services/search`, { scroll: false });
      }
      if (!initialLoad) setIsLoading(false);
    }, 300); 
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
    <div className="space-y-8 py-8">
      <Card className="shadow-lg sticky top-20 z-40 backdrop-blur-md bg-background/90">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <SearchIcon className="h-8 w-8 text-primary" />
            {t.search} {t.services}
          </CardTitle>
          <CardDescription>{t.searchByAddressOrKeyword}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow text-lg p-3 rounded-md shadow-sm focus:ring-2 focus:ring-primary"
              aria-label={t.searchPlaceholder}
            />
            <Button type="submit" size="lg" className="text-lg py-3 rounded-md shadow-md hover:bg-primary/90 transition-all duration-300 transform hover:scale-105" disabled={isLoading && !initialLoad}>
              {(isLoading && !initialLoad) ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <SearchIcon className="ltr:mr-2 rtl:ml-2 h-5 w-5" />}
              {t.search}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchHistory.length > 0 && !initialLoad && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">{t.recentSearches}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <Button key={index} variant="outline" size="sm" onClick={() => handleHistorySearch(item.query)} className="rounded-full hover:bg-accent/10 transition-colors">
                {item.query}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {initialLoad && isLoading && (
        <div className="flex flex-col justify-center items-center py-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{t.loading} {t.services}...</p>
        </div>
      )}
      
      {error && !initialLoad && (
         <Card className="text-center py-12 bg-destructive/10 border-destructive shadow-lg">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-destructive">{t.errorOccurred}</CardTitle>
            <CardDescription className="text-destructive/80">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!initialLoad && !isLoading && !error && currentSearchQuery && filteredAds.length === 0 && (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
             <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>{t.noResultsFound}</CardTitle>
            <CardDescription>
              Try searching with different keywords or check your spelling.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {!initialLoad && !isLoading && !error && filteredAds.length === 0 && !currentSearchQuery && allAds.length === 0 && (
         <Card className="text-center py-12 shadow-lg">
          <CardHeader>
             <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>No Services Available Yet</CardTitle>
            <CardDescription>
              There are currently no service ads posted. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      )}


      {!isLoading && !error && filteredAds.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAds.map((ad) => {
            const provider = providerDetails[ad.providerId];
            const providerName = ad.providerName || provider?.name || t.provider;
            return (
              <Card key={ad.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col group transform hover:-translate-y-1">
                <div className="relative w-full h-56 overflow-hidden">
                   <NextImage
                    src={ad.imageUrl || "https://placehold.co/600x400.png"}
                    alt={ad.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    data-ai-hint={ad.category === 'Plumbing' ? "plumbing work" : "electrical work"}
                  />
                  <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold rounded-full shadow-md">
                    {ad.category === 'Plumbing' ? <Wrench className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" /> : <Zap className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" />}
                    {t[ad.category.toLowerCase() as keyof typeof t]}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold font-headline truncate hover:text-primary transition-colors" title={ad.title}>
                     <Link href={`/services/ad/${ad.id}`}>{ad.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5"> <Briefcase className="h-4 w-4" /> {providerName} </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-1">
                  <p className="text-sm text-foreground/90 line-clamp-3 mb-2 whitespace-pre-wrap">{ad.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                    <MapPin className="h-4 w-4" /> {ad.address}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-4">
                  <Button asChild className="w-full group/button hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                    <Link href={`/services/ad/${ad.id}`}> 
                      {t.viewDetails} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
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

    