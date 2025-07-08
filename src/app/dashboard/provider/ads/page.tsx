"use client";

import { useEffect, useState } from 'react';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone, Loader2, AlertTriangle, ArrowRight, CheckCircle, Clock, CircleDollarSign, AlertCircle, Hourglass, Search } from 'lucide-react';
import { AdRequest, AdRequestStatus, getAdRequestsForUser } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const StatusBadge = ({ status, t }: { status: AdRequestStatus; t: Translations }) => {
  const statusStyles: Record<AdRequestStatus, string> = {
    pending_review: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300',
    pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300',
    payment_review: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
    active: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300',
  };
  const statusIcons: Record<AdRequestStatus, React.ElementType> = {
    pending_review: Hourglass,
    pending_payment: CircleDollarSign,
    payment_review: Search,
    active: CheckCircle,
    rejected: AlertCircle,
  };
  const statusText: Record<AdRequestStatus, keyof Translations> = {
    pending_review: 'statusPendingReview',
    pending_payment: 'statusPendingPayment',
    payment_review: 'statusPaymentReview',
    active: 'statusActive',
    rejected: 'statusRejected',
  };
  
  const Icon = statusIcons[status] || AlertTriangle;

  return (
    <Badge variant="outline" className={cn("gap-1.5", statusStyles[status])}>
        <Icon className="h-3.5 w-3.5" />
        {t[statusText[status]]}
    </Badge>
  );
};


export default function MyAdsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [adRequests, setAdRequests] = useState<AdRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authUser) return;

    const fetchAds = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userAds = await getAdRequestsForUser(authUser.uid);
        setAdRequests(userAds);
      } catch (err: any) {
        setError(t.errorOccurred + ": " + err.message);
        toast({
          variant: 'destructive',
          title: t.errorOccurred,
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAds();
  }, [authUser, t, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Megaphone className="h-10 w-10 text-primary" />
                <div>
                <CardTitle className="text-2xl font-headline">{t.myAds}</CardTitle>
                <CardDescription>{t.myAdsDescription}</CardDescription>
                </div>
            </div>
            <Button asChild><Link href="/dashboard/provider/ads/generate">{t.newAdRequest}</Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md flex items-center gap-2 justify-center">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          {adRequests.length === 0 && !error ? (
            <div className="text-center py-12">
              <Megaphone className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">{t.noAdRequestsYet}</h3>
              <p className="text-muted-foreground">{t.noAdRequestsYetDescription}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adRequests.map((ad) => (
                <Link key={ad.id} href={`/dashboard/provider/ads/edit/${ad.id}`} className="block group">
                  <Card className="hover:border-primary hover:bg-muted/30 transition-all duration-200">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <div className="flex items-center gap-4">
                            {ad.imageUrl && <Image src={ad.imageUrl} alt={ad.title} width={64} height={64} className="rounded-md object-cover aspect-square border" />}
                            <div>
                                <p className="font-semibold text-foreground line-clamp-1">{ad.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <StatusBadge status={ad.status} t={t} />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            {ad.price && <p className="text-sm font-semibold">{ad.price} {ad.currency}</p>}
                        </div>

                        <div className="flex md:justify-end items-center gap-4">
                           <p className="text-sm text-muted-foreground">{new Date(ad.createdAt.seconds * 1000).toLocaleDateString()}</p>
                           <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
