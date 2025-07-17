"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
// Removed invalid import - searchServices function will be implemented via API
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

const serviceCategoriesList: ServiceCategory[] = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HomeCleaning', 'Construction', 'Plastering', 'Other'];
function isValidServiceCategory(category: any): category is ServiceCategory {
  return (serviceCategoriesList as string[]).includes(category);
}

export default function SearchClient() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialQuery = searchParams.get('q') || '';
  const rawCategory = searchParams.get('category') || 'all';
  const initialCategory = rawCategory === 'all' || isValidServiceCategory(rawCategory) ? rawCategory : 'all';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, category: initialCategory });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);


  const saveSearchToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      // Save recent searches (limited list)
      const recentSearches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedRecent = [searchQuery, ...recentSearches.filter((q: string) => q !== searchQuery)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updatedRecent));

      // Save full history with timestamps
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
        title: "Search Error",
        description: "Please enter a search query."
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Mock search results for now - replace with actual API call later
      const mockResults: UserProfile[] = [
        {
          uid: 'mock-user-1',
          name: `${searchQuery} Provider`,
          email: 'provider@example.com',
          role: 'provider',
          phoneNumber: '123-456-7890',
          qualifications: 'Certified in various skills.',
          serviceCategories: searchFilters.category === 'all' ? ['Plumbing', 'Electrical'] : [searchFilters.category],
          serviceAreas: [searchFilters.location || 'Citywide'],
          location: { lat: 0, lng: 0 },
          images: [],
          videos: [],
          emailVerified: true,
          verificationStatus: 'verified',
        }
      ];
      setResults(mockResults);
      saveSearchToHistory(searchQuery);

      // Update URL without page reload
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (searchFilters.category !== 'all') {
        params.set('category', searchFilters.category);
      }
      router.replace(`/services/search?${params.toString()}`, { scroll: false });

      if (mockResults.length === 0) {
        toast({
          title: "No Results",
          description: "No results found. Try a different search."
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message || "An unexpected error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, t, saveSearchToHistory]);

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
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Search Services</h1>
        <p className="text-muted-foreground">Find the best service providers for your needs.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={"Search for services like 'plumbing', 'electrical'..."}
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
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>Refine your search to find the perfect provider.</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value: ServiceCategory | 'all') => 
                      handleFilterChange({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Painting">Painting</SelectItem>
                      <SelectItem value="HomeCleaning">Cleaning</SelectItem>
                      <SelectItem value="Carpentry">Carpentry</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Plastering">Plastering</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder={"Enter a city or neighborhood"}
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
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
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="1">1+ ⭐</SelectItem>
                      <SelectItem value="2">2+ ⭐</SelectItem>
                      <SelectItem value="3">3+ ⭐</SelectItem>
                      <SelectItem value="4">4+ ⭐</SelectItem>
                      <SelectItem value="5">5 ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Verified Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.isVerified}
                    onCheckedChange={(checked) => 
                      handleFilterChange({ ...filters, isVerified: !!checked })
                    }
                  />
                  <Label htmlFor="verified">Verified Providers Only</Label>
                </div>

                {/* Reset Filters */}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset Filters
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
            <span className="ml-2">Search</span>
          </Button>
        </div>
      </form>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active Filters:</span>
          {filters.category !== 'all' && (
            <Badge variant="secondary">{filters.category}</Badge>
          )}
          {filters.location && (
            <Badge variant="secondary">{filters.location}</Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary">{filters.minRating}+ ⭐</Badge>
          )}
          {filters.isVerified && (
            <Badge variant="secondary">Verified</Badge>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Searching...</span>
        </div>
      )}

      {!isLoading && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {results.length > 0 
                ? `${results.length} Results Found`
                : "No Results Found"
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
                        <p className="text-sm text-muted-foreground">{provider.serviceCategories?.join(', ')}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">N/A</span>
                          <span className="text-sm text-muted-foreground">
                             (0 Reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {provider.qualifications}
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.serviceAreas?.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>N/A</span>
                    </div>

                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "h-2 w-2 rounded-full",
                        provider.verificationStatus === 'verified' ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                      <span className="text-sm capitalize">
                        {provider.verificationStatus}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/services/ad/${provider.uid}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Profile
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
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
                <Button onClick={resetFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}