
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ServiceAd, getAdsByProviderId } from '@/lib/data';
import { Briefcase, PlusCircle, Edit3, Trash2, Wrench, Zap } from 'lucide-react';
import Image from 'next/image';
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

export default function MyAdsPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setProviderId(id);
      const providerAds = getAdsByProviderId(id);
      setAds(providerAds);
    } else {
      // Handle case where providerId is not found, e.g., redirect to login
      router.push('/auth/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleDeleteAd = (adId: string) => {
    // In a real app, this would be an API call
    // For mock, filter out the ad
    setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
    toast({ title: "Ad Deleted", description: "The advertisement has been successfully deleted." });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>{t.loading}</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Briefcase className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">{t.myAds}</h1>
            <p className="text-muted-foreground">View, edit, or delete your service advertisements.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/provider/ads/new">
            <PlusCircle className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
            {t.newAd}
          </Link>
        </Button>
      </div>

      {ads.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>{t.noAdsYet}</CardTitle>
            <CardDescription>
              Click the button above to create your first service advertisement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/dashboard/provider/ads/new">{t.newAd}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative w-full h-48">
                <Image
                  src={ad.imageUrl || "https://placehold.co/600x400.png"}
                  alt={ad.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={ad.category === 'Plumbing' ? "plumbing tools" : "electrical equipment"}
                />
                <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded">
                  {ad.category === 'Plumbing' ? <Wrench className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" /> : <Zap className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" />}
                  {t[ad.category.toLowerCase() as keyof typeof t]}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold font-headline">{ad.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t.zipCode}: {ad.zipCode} &bull; Posted: {new Date(ad.postedDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-foreground line-clamp-3">{ad.description}</p>
              </CardContent>
              <div className="p-4 border-t flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => alert(`Edit functionality for ad ${ad.id} (not implemented)`)}> {/* Replace with actual edit page navigation */}
                  <Edit3 className="ltr:mr-1 rtl:ml-1 h-4 w-4" /> {t.editAd}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="ltr:mr-1 rtl:ml-1 h-4 w-4" /> Delete
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
          ))}
        </div>
      )}
    </div>
  );
}
