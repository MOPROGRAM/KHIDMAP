
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { UserProfile, getAllProviders, ServiceCategory } from '@/lib/data';
import Link from 'next/link';
import NextImage from 'next/image'; 
import { Search as SearchIcon, MapPin, User, Wrench, Zap, ArrowRight, Loader2, AlertTriangle, Hammer, Brush, SprayCan, GripVertical, HardHat, Layers, UserCircle, Star, Briefcase } from 'lucide-react';
import { db } from '@/lib/firebase'; 
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SearchHistoryItem {
  query: string;
  date: string; 
}

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Brush,
  HomeCleaning: SprayCan,
  Construction: HardHat,
  Plastering: Layers,
  Other: GripVertical,
};

export default function ServiceSearchPage() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [allProviders, setAllProviders] = useState<UserProfile[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<UserProfile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false); 
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [isDbAvailable, setIsDbAvailable] = useState(false);

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setIsDbAvailable(!!db); 
    if (db) {
        const storedHistory = localStorage.getItem('fullSearchHistory');
        if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
        }
    }
  }, []);

  const updateSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const newItem: SearchHistoryItem = { query, date: new Date().toISOString() };
    const newHistory = [newItem, ...searchHistory.filter(item => item.query.toLowerCase() !== query.toLowerCase())].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('fullSearchHistory', JSON.stringify(newHistory));
  };

  const fetchInitialProviders = useCallback(async () => {
    if (!isDbAvailable) {
        setError(t.serviceUnavailableMessage);
        setInitialLoadComplete(true);
        setIsLoading(false);
        return;
    }
    setIsLoading(true); 
    setError(null);
    try {
      const providers = await getAllProviders();
      setAllProviders(providers);
      
      const initialQuery = searchParams.get('q');
      if (initialQuery) {
        setSearchTerm(initialQuery);
        filterProviders(initialQuery, providers); 
        setCurrentSearchQuery(initialQuery);
      } else {
        setFilteredProviders(providers);
      }

    } catch (err: any) {
      console.error("Error fetching providers:", err);
      setError(err.message || t.failedLoadServices);
      setAllProviders([]);
      setFilteredProviders([]);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  }, [searchParams, t, isDbAvailable]); 

  
  const filterProviders = (query: string, providersToFilter: UserProfile[]) => {
    if (!query.trim()) {
      setFilteredProviders(providersToFilter);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const results = providersToFilter.filter(provider => {
        const categories = (provider.serviceCategories || []).map(cat => (t[cat.toLowerCase() as keyof Translations] || cat).toLowerCase());
        const areas = (provider.serviceAreas || []).map(area => area.toLowerCase());
        
        return (
            provider.name.toLowerCase().includes(lowerCaseQuery) ||
            (provider.qualifications || '').toLowerCase().includes(lowerCaseQuery) ||
            categories.some(cat => cat.includes(lowerCaseQuery)) ||
            areas.some(area => area.includes(lowerCaseQuery))
        );
    });
    setFilteredProviders(results);
  };
  
  useEffect(() => {
    if (isDbAvailable) {
        fetchInitialProviders();
    } else if (!isDbAvailable && !initialLoadComplete) { 
        setError(t.serviceUnavailableMessage);
        setInitialLoadComplete(true);
    }
  }, [isDbAvailable, fetchInitialProviders, initialLoadComplete, t.serviceUnavailableMessage]);


  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentSearchQuery(query);
    if (initialLoadComplete) setIsLoading(true); 

    setTimeout(() => {
      filterProviders(query, allProviders);
      if (query.trim()) {
        updateSearchHistory(query);
        router.push(`/services/search?q=${encodeURIComponent(query)}`, { scroll: false });
      } else {
         router.push(`/services/search`, { scroll: false });
      }
      if (initialLoadComplete) setIsLoading(false);
    }, 300); 
  };
  
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDbAvailable) {
      toast({ variant: "destructive", title: t.serviceUnavailableTitle, description: t.serviceUnavailableMessage });
      return;
    }
    handleSearch(searchTerm);
  };

  const handleHistorySearch = (term: string) => {
    if (!isDbAvailable) {
      toast({ variant: "destructive", title: t.serviceUnavailableTitle, description: t.serviceUnavailableMessage });
      return;
    }
    setSearchTerm(term);
    handleSearch(term);
  }

  return (
    <div className="space-y-4 py-4 animate-fadeIn">
      <Card className="shadow-md sticky top-[calc(var(--header-height,4rem)+1rem)] z-40 backdrop-blur-md bg-background/90 border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <SearchIcon className="h-8 w-8 text-primary" />
            {t.search} {t.serviceProviders}
          </CardTitle>
          <CardDescription>{t.searchServicesPageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow text-base p-3 rounded-lg shadow-inner focus:ring-2 focus:ring-primary border-input"
              aria-label={t.searchPlaceholder}
              disabled={!isDbAvailable || (isLoading && initialLoadComplete)}
            />
            <Button 
              type="submit" 
              size="lg" 
              className="text-base py-3 rounded-lg group" 
              disabled={!isDbAvailable || (isLoading && initialLoadComplete)}
            >
              {(isLoading && initialLoadComplete) ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <SearchIcon className="ltr:mr-2 rtl:ml-2 h-5 w-5 group-hover:animate-pulse-glow" />}
              {t.search}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isDbAvailable && searchHistory.length > 0 && initialLoadComplete && (
        <Card className="shadow-sm animate-fadeIn animation-delay-200 border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">{t.recentSearches}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                onClick={() => handleHistorySearch(item.query)} 
                className="rounded-full hover:bg-accent/20 hover:border-primary transition-colors duration-200 transform hover:scale-105"
              >
                {item.query}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {!initialLoadComplete && isLoading && ( 
        <div className="flex flex-col justify-center items-center py-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{t.loading} {t.serviceProviders}...</p>
        </div>
      )}
      
      {initialLoadComplete && error && (
         <Card className="text-center py-12 bg-destructive/10 border-destructive shadow-lg animate-fadeIn">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-destructive text-xl">{t.errorOccurred}</CardTitle>
            <CardDescription className="text-destructive/80">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
                if(isDbAvailable) fetchInitialProviders();
                else toast({variant: "destructive", title: t.serviceUnavailableTitle, description: t.serviceUnavailableMessage});
            }} variant="outline" className="group">
                {t.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}

      {initialLoadComplete && !error && currentSearchQuery && filteredProviders.length === 0 && (
        <Card className="text-center py-12 shadow-md animate-fadeIn border">
          <CardHeader>
             <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl text-foreground">{t.noResultsFound}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t.tryDifferentKeywords}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {initialLoadComplete && !error && filteredProviders.length === 0 && !currentSearchQuery && allProviders.length === 0 && (
         <Card className="text-center py-12 shadow-md animate-fadeIn border">
          <CardHeader>
             <UserCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl text-foreground">{t.noServicesAvailableYet}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t.checkBackLater}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {initialLoadComplete && !isLoading && !error && filteredProviders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadeIn animation-delay-400">
          {filteredProviders.map((provider, index) => {
            const mainCategory = provider.serviceCategories?.[0];
            const Icon = mainCategory ? (categoryIcons[mainCategory] || Briefcase) : Briefcase;
            return (
              <Card 
                key={provider.uid} 
                className="overflow-hidden shadow-md hover:shadow-lg border transition-all duration-300 ease-in-out flex flex-col group transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <NextImage 
                      src={provider.profilePictureUrl || `https://placehold.co/400x250.png`}
                      alt={provider.name}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-500"
                      data-ai-hint="person portrait"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {(provider.serviceCategories || []).slice(0, 2).map(cat => (
                        <Badge key={cat} variant="secondary">{t[cat.toLowerCase() as keyof Translations] || cat}</Badge>
                    ))}
                  </div>
                  <CardTitle className="text-base font-semibold truncate hover:text-primary transition-colors" title={provider.name}>
                     <Link href={`/services/ad/${provider.uid}`}>{provider.name}</Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">{provider.qualifications || t.provider + " " + (t[provider.serviceCategories?.[0]?.toLowerCase() as keyof Translations] || '')}</p>
                </CardContent>
                <CardFooter className="p-4 mt-auto">
                  <Button asChild className="w-full group/button" size="sm">
                    <Link href={`/services/ad/${provider.uid}`}>
                      {t.viewProfile} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4 group-hover/button:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <style jsx global>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        [style*="animation-delay"] {
          animation-fill-mode: backwards; 
        }
      `}</style>
    </div>
  );
}
