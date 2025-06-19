
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { ServiceAd, mockServiceAds, ServiceProvider, getProviderById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, MapPin, Briefcase, Wrench, Zap, Phone, Mail, UserCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function ServiceAdDetailsPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const [ad, setAd] = useState<ServiceAd | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (adId) {
      // Simulate fetching ad details
      const foundAd = mockServiceAds.find(a => a.id === adId);
      if (foundAd) {
        setAd(foundAd);
        const foundProvider = getProviderById(foundAd.providerId);
        if (foundProvider) {
          setProvider(foundProvider);
        }
      }
    }
    setIsLoading(false);
  }, [adId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>{t.loading}</p></div>;
  }

  if (!ad) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">{t.noResultsFound}</h1>
        <p className="text-muted-foreground mb-6">The service ad you are looking for does not exist or may have been removed.</p>
        <Button asChild variant="outline">
          <Link href="/services/search">
            <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> Back to Search
          </Link>
        </Button>
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
            <p className="text-foreground leading-relaxed">{ad.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
                Posted on: {new Date(ad.postedDate).toLocaleDateString()}
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
                  <Image src={provider.profilePictureUrl || "https://placehold.co/80x80.png"} alt={provider.name} width={60} height={60} className="rounded-full" data-ai-hint="person portrait" />
                  <div>
                    <h3 className="text-lg font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">{provider.email}</p>
                  </div>
                </div>
                
                <p className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {provider.phoneNumber}</p>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">{t.qualifications}:</h4>
                  <p className="text-sm bg-background p-3 rounded-md border">{provider.qualifications}</p>
                </div>

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
                 <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Serves Zip Codes:</h4>
                  <p className="text-sm">{provider.zipCodesServed.join(', ')}</p>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full sm:w-auto">Contact {provider.name.split(' ')[0]}</Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
