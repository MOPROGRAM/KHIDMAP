
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ServiceAd, UserProfile, getAdById, getUserProfileById, ServiceCategory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image'; 
import { ArrowLeft, MapPin, Wrench, Zap, Phone, Mail, UserCircle, Info, Loader2, AlertTriangle, Hammer, Brush, Sparkles, GripVertical, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Brush,
  HomeCleaning: Sparkles,
  Other: GripVertical,
};

export default function ServiceAdDetailsPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const [ad, setAd] = useState<ServiceAd | null>(null);
  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdDetails = useCallback(async () => {
    if (!adId) {
      setError("Ad ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const foundAd = await getAdById(adId);
      if (foundAd) {
        setAd(foundAd);
        if (foundAd.providerId) {
          const foundProvider = await getUserProfileById(foundAd.providerId);
          setProvider(foundProvider);
        } else {
          console.warn("Ad has no providerId:", foundAd);
        }
      } else {
        setError(t.noResultsFound);
      }
    } catch (err) {
      console.error("Error fetching ad details:", err);
      setError((err as Error).message || "Failed to load ad details.");
    } finally {
      setIsLoading(false);
    }
  }, [adId, t]);

  useEffect(() => {
    fetchAdDetails();
  }, [fetchAdDetails]);
  
  const formatDate = (dateValue: Timestamp | string | undefined): string => {
    if (!dateValue) return 'N/A';
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Timestamp) {
      date = dateValue.toDate();
    } else {
       return 'Invalid Date';
    }
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 max-w-md mx-auto">
        <Card className="shadow-lg border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-destructive">
              <AlertTriangle className="h-8 w-8" />
              {t.errorOccurred}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild variant="outline" onClick={() => router.back()}>
              <Link href="#"> 
                <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!ad) {
     return (
      <div className="text-center py-10 max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Info className="h-8 w-8 text-primary" />
               {t.noResultsFound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">The service ad you are looking for does not exist or may have been removed.</p>
             <Button asChild variant="outline" onClick={() => router.back()}>
              <Link href="#">
                <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = categoryIcons[ad.category] || GripVertical;
  const categoryKey = ad.category.toLowerCase() as keyof Translations;
  const categoryName = t[categoryKey] || ad.category;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 group transition-all hover:shadow-md">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors" /> Back to Search
      </Button>

      <Card className="overflow-hidden shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
        <div className="relative w-full h-72 md:h-96 group overflow-hidden">
          <NextImage
            src={ad.imageUrl || "https://placehold.co/800x600.png"}
            alt={ad.title}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-110 transition-transform duration-700 ease-in-out"
            data-ai-hint={`${ad.category} service project`}
            priority
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
           <div className="absolute bottom-0 left-0 p-6 w-full">
             <h1 className="text-3xl md:text-4xl font-bold font-headline text-white mb-2 drop-shadow-lg">{ad.title}</h1>
             <div className="flex items-center gap-3 text-sm text-gray-200">
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm shadow">
                    <Icon className="h-4 w-4" />
                    <span>{categoryName}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm shadow">
                    <MapPin className="h-4 w-4" />
                    <span>{ad.address}</span>
                </span>
             </div>
           </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3 text-primary">
                <Info className="h-6 w-6"/> {t.adDescription}
            </h2>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-md">{ad.description}</p>
            <p className="text-sm text-muted-foreground mt-4">
                Posted on: {formatDate(ad.postedDate)}
            </p>
          </div>

          <Separator />

          {provider && (
            <Card className="bg-card p-0 border-none shadow-none">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-primary">
                    <UserCircle className="h-7 w-7" /> {t.serviceProvider}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                <div className="flex items-center gap-4">
                  <NextImage 
                    src={provider.profilePictureUrl || "https://placehold.co/80x80.png"} 
                    alt={provider.name} 
                    width={80} 
                    height={80} 
                    className="rounded-full border-2 border-primary shadow-md object-cover"
                    data-ai-hint="person portrait"
                  />
                  <div>
                    <h3 className="text-xl font-medium text-foreground">{provider.name}</h3>
                    {provider.email && (
                      <a href={`mailto:${provider.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-1">
                        <Mail className="h-4 w-4" /> {provider.email}
                      </a>
                    )}
                    {provider.phoneNumber && (
                        <a href={`tel:${provider.phoneNumber}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-1">
                            <Phone className="h-4 w-4" /> {provider.phoneNumber}
                        </a>
                    )}
                  </div>
                </div>
                
                {provider.qualifications && (
                  <div>
                    <h4 className="text-md font-semibold text-muted-foreground mb-1">{t.qualifications}:</h4>
                    <p className="text-md bg-muted/50 p-4 rounded-md border whitespace-pre-wrap text-foreground/90">{provider.qualifications}</p>
                  </div>
                )}

                {provider.serviceCategories && provider.serviceCategories.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-muted-foreground mb-1.5">{t.serviceCategory}s:</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.serviceCategories.map(cat => {
                        const ProviderCatIcon = categoryIcons[cat] || GripVertical;
                        const providerCatKey = cat.toLowerCase() as keyof Translations;
                        const providerCatName = t[providerCatKey] || cat;
                        return (
                        <span key={cat} className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full shadow-sm flex items-center gap-1">
                          <ProviderCatIcon className="h-3 w-3" />
                          {providerCatName}
                        </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                 {provider.serviceAreas && provider.serviceAreas.length > 0 && (
                   <div>
                    <h4 className="text-md font-semibold text-muted-foreground mb-1.5">Serves Areas:</h4>
                    <p className="text-md text-foreground/90">{provider.serviceAreas.join(', ')}</p>
                  </div>
                 )}
              </CardContent>
              <CardFooter className="px-0 pt-6">
                 <Button size="lg" className="w-full sm:w-auto text-base py-3 group hover:shadow-lg transition-all transform hover:scale-105" asChild>
                    <a href={`mailto:${provider.email}?subject=Inquiry about your ad: ${ad.title}`}>
                        Contact {provider.name.split(' ')[0]}
                        <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform"/>
                    </a>
                 </Button>
              </CardFooter>
            </Card>
          )}
           {!provider && !isLoading && (
             <div className="text-center py-6">
                <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2"/>
                <p className="text-muted-foreground">Provider details are not available.</p>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
