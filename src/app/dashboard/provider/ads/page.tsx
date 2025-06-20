
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ServiceAd, ServiceCategory } from '@/lib/data'; 
import { getAdsByProviderId, deleteServiceAd } from '@/lib/data';
import { Briefcase, PlusCircle, Edit3, Trash2, Wrench, Zap, Loader2, MapPin, Brush, Hammer, SprayCan, GripVertical, ImageOff } from 'lucide-react'; // Changed Sparkles to SprayCan
import NextImage from 'next/image'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Brush,
  HomeCleaning: SprayCan, // Changed Sparkles to SprayCan
  Other: GripVertical,
};

export default function MyAdsPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAds = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const providerAds = await getAdsByProviderId(id);
      setAds(providerAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load your ads." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(user => {
      if (user) {
        fetchAds(user.uid);
      } else {
        toast({ variant: "destructive", title: "Error", description: "User not identified. Please log in again." });
        router.push('/auth/login');
      }
    });
    return () => unsubscribe?.();
  }, [router, toast, fetchAds]);

  const handleDeleteAd = async (adId: string) => {
    const adToDelete = ads.find(ad => ad.id === adId);
    if (!adToDelete) return;

    try {
      await deleteServiceAd(adId, adToDelete.imageUrl); // Pass imageUrl to deleteServiceAd
      setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      toast({ title: "Ad Deleted", description: "The advertisement has been successfully deleted." });
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete ad." });
    }
  };

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
    return date.toLocaleDateString();
  };


  if (isLoading && !ads.length) { 
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Briefcase className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">{t.myAds}</h1>
            <p className="text-muted-foreground">View, edit, or delete your service advertisements.</p>
          </div>
        </div>
        <Button asChild className="shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300">
          <Link href="/dashboard/provider/ads/new">
            <PlusCircle className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
            {t.newAd}
          </Link>
        </Button>
      </div>

      {ads.length === 0 && !isLoading ? ( 
        <Card className="text-center py-12 shadow-xl hover:shadow-2xl transition-shadow duration-300 border">
          <CardHeader>
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl text-foreground">{t.noAdsYet}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Click the button above to create your first service advertisement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300">
              <Link href="/dashboard/provider/ads/new">{t.newAd}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {ads.map((ad, index) => {
            const Icon = categoryIcons[ad.category] || GripVertical;
            const categoryKey = ad.category.toLowerCase() as keyof Translations;
            const categoryName = t[categoryKey] || ad.category;
            return (
            <Card 
              key={ad.id} 
              className="overflow-hidden shadow-xl hover:shadow-2xl border transition-all duration-300 flex flex-col group transform hover:-translate-y-1.5"
              style={{ animationDelay: `${index * 100}ms`, animationName: 'fadeIn', animationFillMode: 'backwards' }}
            >
              <div className="relative w-full h-60 bg-muted/30 overflow-hidden">
                {ad.imageUrl ? (
                  <NextImage
                    src={ad.imageUrl}
                    alt={ad.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    data-ai-hint={`${ad.category} service work`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold rounded-full shadow-md flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {categoryName}
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold font-headline text-foreground">{ad.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5"> <MapPin className="h-4 w-4"/> {ad.address} </div>
                  <div className="mt-1">Posted: {formatDate(ad.postedDate)}</div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <p className="text-sm text-foreground/90 line-clamp-3">{ad.description}</p>
              </CardContent>
              <div className="p-4 border-t flex gap-3 justify-end bg-muted/20 mt-auto">
                <Button variant="outline" size="sm" asChild className="hover:bg-accent/20 hover:border-primary transition-colors duration-200 transform hover:scale-105">
                  <Link href={`/dashboard/provider/ads/edit/${ad.id}`}>
                    <Edit3 className="ltr:mr-1.5 rtl:ml-1.5 h-4 w-4" /> {t.editAd}
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="transition-colors duration-200 transform hover:scale-105">
                      <Trash2 className="ltr:mr-1.5 rtl:ml-1.5 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this ad?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the ad titled "{ad.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAd(ad.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
            );
          })}
        </div>
      )}
      <style jsx global>{`
        [style*="animation-delay"] {
          animation-duration: 0.5s; /* Ensure animations have a duration */
        }
      `}</style>
    </div>
  );
}
