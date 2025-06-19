
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { ServiceAd, UserProfile, getAdById, getUserProfileById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, MapPin, Wrench, Zap, Phone, Mail, UserCircle, Info, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';

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
    if (typeof dateValue === 'string') {
      // Check if it's already a simple date string or ISO string
      const d = new Date(dateValue);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
      return dateValue; // If not a valid date string, return as is
    }
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate().toLocaleDateString();
    }
    return 'Invalid Date';
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-destructive">
              <AlertTriangle className="h-6 w-6" />
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
              <Info className="h-6 w-6 text-primary" />
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


  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Back
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={ad.imageUrl || "https://placehold.co/800x600.png"}
            alt={ad.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={ad.category === 'Plumbing' ? "plumbing project" : "electrical setup"}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <div className="absolute bottom-0 left-0 p-6">
             <h1 className="text-3xl md:text-4xl font-bold font-headline text-white mb-2">{ad.title}</h1>
             <div className="flex items-center gap-2 text-sm text-gray-200 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm w-fit">
                {ad.category === 'Plumbing' ? <Wrench className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                <span>{t[ad.category.toLowerCase() as keyof typeof t]}</span>
                <span className="mx-1">&bull;</span>
                <MapPin className="h-4 w-4" />
                <span>{ad.zipCode}</span>
             </div>
           </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-primary"/> {t.adDescription}
            </h2>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{ad.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
                Posted on: {formatDate(ad.postedDate)}
            </p>
          </div>

          {provider && (
            <Card className="bg-secondary/50 p-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <UserCircle className="h-6 w-6 text-primary" /> {t.serviceProvider}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Image 
                    src={provider.profilePictureUrl || "https://placehold.co/80x80.png"} 
                    alt={provider.name} 
                    width={60} 
                    height={60} 
                    className="rounded-full border"
                    data-ai-hint="person portrait"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">{provider.email}</p>
                  </div>
                </div>
                
                {provider.phoneNumber && <p className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {provider.phoneNumber}</p>}
                
                {provider.qualifications && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t.qualifications}:</h4>
                    <p className="text-sm bg-background p-3 rounded-md border whitespace-pre-wrap">{provider.qualifications}</p>
                  </div>
                )}

                {provider.serviceCategories && provider.serviceCategories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t.serviceCategory}s:</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.serviceCategories.map(cat => (
                        <span key={cat} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                          {t[cat.toLowerCase() as keyof typeof t]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                 {provider.zipCodesServed && provider.zipCodesServed.length > 0 && (
                   <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Serves Zip Codes:</h4>
                    <p className="text-sm">{provider.zipCodesServed.join(', ')}</p>
                  </div>
                 )}
              </CardContent>
              <CardFooter>
                 <Button className="w-full sm:w-auto">Contact {provider.name.split(' ')[0]}</Button>
                 {/* Add actual contact functionality later e.g. mailto or chat */}
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
