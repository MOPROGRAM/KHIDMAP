
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { UserProfile, getAllProviders, ServiceCategory } from '@/lib/data';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, User, Wrench, Zap, ArrowRight, Loader2, AlertTriangle, Hammer, Brush, SprayCan, GripVertical, HardHat, Layers, UserCircle, Star, Briefcase, LocateFixed, BadgeCheck } from 'lucide-react';
import { db } from '@/lib/firebase'; 
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { GeoPoint } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type UserProfileWithDistance = UserProfile & { distance?: number };

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

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export default function ServiceSearchPage() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [allProviders, setAllProviders] = useState<UserProfile[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<UserProfileWithDistance[]>([]);
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [seekerLocation, setSeekerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSortedByLocation, setIsSortedByLocation] = useState(false);

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const isDbAvailable = !!db;
    if (!isDbAvailable) {
        setError(t.serviceUnavailableMessage);
        setIsLoading(false);
        return;
    }
    
    const storedHistory = localStorage.getItem('fullSearchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
    
    setIsLoading(true);
    getAllProviders()
      .then(providers => {
        setAllProviders(providers);
        // Initial filter based on URL param
        const initialQuery = searchParams.get('q') || '';
        setSearchTerm(initialQuery);
        updateDisplayedProviders(initialQuery, providers, null);
      })
      .catch(err => {
        console.error("Error fetching providers:", err);
        setError(err.message || t.failedLoadServices);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Only on mount

  const updateSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const newItem: SearchHistoryItem = { query, date: new Date().toISOString() };
    const newHistory = [newItem, ...searchHistory.filter(item => item.query.toLowerCase() !== query.toLowerCase())].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('fullSearchHistory', JSON.stringify(newHistory));
  };
  
  const updateDisplayedProviders = useCallback((query: string, providers: UserProfile[], location: {latitude: number, longitude: number} | null) => {
      let results: UserProfileWithDistance[] = providers;

      // 1. Filter by search term
      if (query.trim()) {
        const lowerCaseQuery = query.toLowerCase();
        results = providers.filter(provider => {
            const categories = (provider.serviceCategories || []).map(cat => (t[cat.toLowerCase() as keyof Translations] || cat).toLowerCase());
            const areas = (provider.serviceAreas || []).map(area => area.toLowerCase());
            
            return (
                provider.name.toLowerCase().includes(lowerCaseQuery) ||
                (provider.qualifications || '').toLowerCase().includes(lowerCaseQuery) ||
                categories.some(cat => cat.includes(lowerCaseQuery)) ||
                areas.some(area => area.includes(lowerCaseQuery))
            );
        });
      }

      // 2. Sort by distance if location is available
      if (location) {
          results = results
              .map(p => {
                  if (p.location) {
                      const distance = getDistanceInKm(location.latitude, location.longitude, p.location.latitude, p.location.longitude);
                      return { ...p, distance };
                  }
                  return { ...p, distance: Infinity }; // Put providers without location at the end
              })
              .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
          setIsSortedByLocation(true);
      } else {
          setIsSortedByLocation(false);
          // Default sort if no location (e.g., by name or recently updated)
          results.sort((a, b) => a.name.localeCompare(b.name));
      }

      setFilteredProviders(results);
  }, [t]);
  
  useEffect(() => {
    if (!isLoading) { // Avoid running on initial data load
        updateDisplayedProviders(searchTerm, allProviders, seekerLocation);
    }
    
    // Update URL without full page reload
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
          updateSearchHistory(searchTerm);
          router.push(`/services/search?q=${encodeURIComponent(searchTerm)}`, { scroll: false });
      } else if (searchParams.get('q')) { // Clear URL if search term is cleared
          router.push(`/services/search`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, seekerLocation, allProviders, isLoading, router, updateDisplayedProviders, searchParams]);


  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: t.locationError, description: t.locationUnavailable });
      return;
    }
    setIsFindingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setSeekerLocation(newLocation);
        toast({ title: t.sortedByDistance });
        setIsFindingLocation(false);
      },
      (error) => {
        let description = t.locationError;
        if (error.code === error.PERMISSION_DENIED) {
          description = t.locationPermissionDenied;
        }
        toast({ variant: "destructive", title: t.locationError, description });
        setIsFindingLocation(false);
      }
    );
  };
  
  const handleHistorySearch = (term: string) => {
    setSearchTerm(term);
  };
  
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
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow text-base p-3 rounded-lg shadow-inner focus:ring-2 focus:ring-primary border-input"
              aria-label={t.searchPlaceholder}
              disabled={isLoading || !db}
            />
             <Button 
              type="button"
              onClick={handleFindNearMe}
              size="lg"
              variant="outline"
              className="text-base py-3 rounded-lg group"
              disabled={isFindingLocation || isLoading || !db}
            >
              {isFindingLocation ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <LocateFixed className="ltr:mr-2 rtl:ml-2 h-5 w-5 group-hover:animate-pulse-glow"/>}
              {t.findNearMe}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isSortedByLocation && (
        <div className="p-3 bg-accent/10 text-accent-foreground/80 rounded-lg text-sm text-center font-medium animate-fadeIn">
            {t.sortedByDistance}
        </div>
      )}

      {db && searchHistory.length > 0 && !isLoading && (
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

      {isLoading && ( 
        <div className="flex flex-col justify-center items-center py-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{t.loading} {t.serviceProviders}...</p>
        </div>
      )}
      
      {!isLoading && error && (
         <Card className="text-center py-12 bg-destructive/10 border-destructive shadow-lg animate-fadeIn">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-destructive text-xl">{t.errorOccurred}</CardTitle>
            <CardDescription className="text-destructive/80">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline" className="group">
                {t.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredProviders.length === 0 && (
        <Card className="text-center py-12 shadow-md animate-fadeIn border">
          <CardHeader>
             <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl text-foreground">{searchTerm ? t.noResultsFound : t.noServicesAvailableYet}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {searchTerm ? t.tryDifferentKeywords : t.checkBackLater}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {!isLoading && !error && filteredProviders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadeIn animation-delay-400">
          {filteredProviders.map((provider, index) => (
              <Card 
                key={provider.uid} 
                className="overflow-hidden shadow-md hover:shadow-lg border transition-all duration-300 ease-in-out flex flex-col group transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                   <div className="flex items-center gap-4">
                     <Avatar className="h-14 w-14">
                       <AvatarImage src={provider.images?.[0]} alt={provider.name} />
                       <AvatarFallback className="text-2xl bg-muted">
                         <UserCircle/>
                       </AvatarFallback>
                     </Avatar>
                     <div className='flex-1 overflow-hidden'>
                        <div className="flex items-center gap-1.5">
                           <Link href={`/services/ad/${provider.uid}`} className="font-semibold truncate hover:text-primary transition-colors" title={provider.name}>
                             {provider.name}
                           </Link>
                           {provider.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />}
                        </div>
                       <div className="flex flex-wrap items-center gap-2 mt-1">
                        {(provider.serviceCategories || []).slice(0, 1).map(cat => {
                            if (!cat) return null;
                            const CatIcon = categoryIcons[cat] || Briefcase;
                            return (
                                <Badge key={cat} variant="secondary" className="font-normal">
                                    <CatIcon className="h-3 w-3 mr-1"/>
                                    {t[cat.toLowerCase() as keyof Translations] || cat}
                                </Badge>
                            )
                        })}
                        {provider.distance !== undefined && provider.distance !== Infinity && (
                            <Badge variant="outline" className="font-normal">
                               <MapPin className="h-3 w-3 mr-1"/>
                               {provider.distance.toFixed(1)} {t.kmAway?.replace('{distance}', '')}
                            </Badge>
                         )}
                       </div>
                     </div>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{provider.qualifications || t.provider + " " + (t[provider.serviceCategories?.[0]?.toLowerCase() as keyof Translations] || '')}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <Button asChild className="w-full group/button" size="sm">
                    <Link href={`/services/ad/${provider.uid}`}>
                      {t.viewProfile} <ArrowRight className="ltr:ml-2 rtl:ml-2 h-4 w-4 group-hover/button:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
          ))}
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
