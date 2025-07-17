"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import type { Translations } from '@/lib/translations';
import { UserProfile, ServiceCategory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, MapPin, Star, Filter, SlidersHorizontal, Loader2, 
  User, Mail, Phone, ExternalLink, AlertCircle, CheckCircle2, 
  Clock, DollarSign, Languages, Briefcase 
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SearchFilters {
  category: ServiceCategory | 'all';
  location: string;
  minRating: number;
  maxPrice: number;
  isVerified: boolean;
  languages: string[];
  availability: 'all' | 'available' | 'busy';
}

const defaultFilters: SearchFilters = {
  category: 'all',
  location: '',
  minRating: 0,
  maxPrice: 1000,
  isVerified: false,
  languages: [],
  availability: 'all'
};

interface SearchComponentProps {
    initialQuery: string;
    initialCategory: ServiceCategory | 'all';
}

export default function SearchComponent({ initialQuery, initialCategory }: SearchComponentProps) {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, category: initialCategory });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const saveSearchToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const recentSearches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedRecent = [searchQuery, ...recentSearches.filter((q: string) => q !== searchQuery)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updatedRecent));

      const fullHistory = JSON.parse(localStorage.getItem('fullSearchHistory') || '[]');
      const newEntry = { query: searchQuery, date: new Date().toISOString() };
      const updatedFull = [newEntry, ...fullHistory.filter((item: any) => item.query !== searchQuery)];
      localStorage.setItem('fullSearchHistory', JSON.stringify(updatedFull));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, []);

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: t('validationError'),
        description: t('requiredField')
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const mockResults: UserProfile[] = [
        {
          uid: '1',
          name: `${searchQuery} service in ${searchFilters.location}`,
          email: 'test@example.com',
          role: 'provider',
          qualifications: `Professional ${searchQuery} service provider`,
          location: searchFilters.location,
          serviceCategories: [searchFilters.category === 'all' ? 'Other' : searchFilters.category],
          verificationStatus: 'verified',
        }
      ];
      setResults(mockResults);
      saveSearchToHistory(searchQuery);

      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (searchFilters.category !== 'all') {
        params.set('category', searchFilters.category);
      }
      router.replace(`/services/search?${params.toString()}`, { scroll: false });

      if (mockResults.length === 0) {
        toast({
          title: t('noResultsFound'),
          description: t('tryDifferentKeywords')
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: t('errorOccurred'),
        description: error.message || t('errorOccurred')
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, t, saveSearchToHistory]);

  useEffect(() => {
    if (query) {
      performSearch(query, filters);
    } else {
        setIsLoading(false);
    }
  }, [query, filters, performSearch]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, filters);
  }, [query, filters, performSearch]);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (hasSearched && query.trim()) {
      performSearch(query, newFilters);
    }
  }, [hasSearched, query, performSearch]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    if (hasSearched && query.trim()) {
      performSearch(query, defaultFilters);
    }
  }, [hasSearched, query, performSearch]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.location) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxPrice < 1000) count++;
    if (filters.isVerified) count++;
    if (filters.languages.length > 0) count++;
    if (filters.availability !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">{t('services')}</h1>
        <p className="text-foreground">{t('searchServicesPageDescription')}</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('filters')}
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('filters')}</SheetTitle>
                <SheetDescription>{t('refineYourSearch')}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>{t('category')}</Label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value: any) => 
                      handleFilterChange({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('selectCategory')}</SelectItem>
                      <SelectItem value="Plumbing">{t('plumbing')}</SelectItem>
                      <SelectItem value="Electrical">{t('electrical')}</SelectItem>
                      <SelectItem value="Painting">{t('painting')}</SelectItem>
                      <SelectItem value="HomeCleaning">{t('homeCleaning')}</SelectItem>
                      <SelectItem value="Carpentry">{t('carpentry')}</SelectItem>
                      <SelectItem value="Construction">{t('construction')}</SelectItem>
                      <SelectItem value="Other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('location')}</Label>
                  <Input
                    placeholder={t('address')}
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('rating')}</Label>
                  <Select
                    value={filters.minRating.toString()}
                    onValueChange={(value) => 
                      handleFilterChange({ ...filters, minRating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t('rating')}</SelectItem>
                      <SelectItem value="1">1+ ⭐</SelectItem>
                      <SelectItem value="2">2+ ⭐</SelectItem>
                      <SelectItem value="3">3+ ⭐</SelectItem>
                      <SelectItem value="4">4+ ⭐</SelectItem>
                      <SelectItem value="5">5 ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.isVerified}
                    onCheckedChange={(checked) => 
                      handleFilterChange({ ...filters, isVerified: !!checked })
                    }
                  />
                  <Label htmlFor="verified">{t('verifiedProvider')}</Label>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  {t('clearHistory')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">{t('search')}</span>
          </Button>
        </div>
      </form>

      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-foreground">{t('filters')}:</span>
          {filters.category !== 'all' && (
            <Badge variant="secondary">{t(filters.category.toLowerCase() as keyof Translations)}</Badge>
          )}
          {filters.location && (
            <Badge variant="secondary">{filters.location}</Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary">{filters.minRating}+ ⭐</Badge>
          )}
          {filters.isVerified && (
            <Badge variant="secondary">{t('verifiedProvider')}</Badge>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t('loading')}</span>
        </div>
      )}

      {!isLoading && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {results.length > 0 
                ? `${results.length} ${t('noResultsFound')}`
                : t('noResultsFound')
              }
            </h2>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((provider) => (
                <Card key={provider.uid} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={provider.images?.[0]} alt={provider.name} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                          {provider.verificationStatus === 'verified' && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-foreground">{provider.serviceCategories?.join(', ')}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">0</span>
                          <span className="text-sm text-foreground">
                            (0 {t('reviews')})
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground line-clamp-2">
                      {provider.qualifications}
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-foreground" />
                      <span>{provider.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-foreground" />
                      <span>--</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        'bg-gray-500'
                      )} />
                      <span className="text-sm">
                        --
                      </span>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/services/ad/${provider.uid}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('viewProfile')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasSearched && (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-16 w-16 mx-auto text-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noResultsFound')}</h3>
                <p className="text-foreground mb-4">{t('tryDifferentKeywords')}</p>
                <Button onClick={resetFilters} variant="outline">
                  {t('clearHistory')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
