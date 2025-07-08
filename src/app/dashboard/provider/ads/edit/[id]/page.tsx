
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { auth, storage } from '@/lib/firebase';
import type { AdRequest, AdRequestStatus } from '@/lib/data';
import { getAdRequestById, uploadAdPaymentProof } from '@/lib/data';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Loader2, ArrowLeft, Hourglass, CheckCircle, AlertCircle, Upload, Send, FileCheck, CircleDollarSign, XCircle, Search, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const StatusInfo = ({ status, t }: { status: AdRequestStatus; t: Translations; }) => {
    const infoMap: Record<AdRequestStatus, { icon: React.ElementType, titleKey: keyof Translations, descKey: keyof Translations, style: string }> = {
        pending_review: {
            icon: Hourglass,
            titleKey: 'statusPendingReview',
            descKey: 'statusPendingReviewDescription',
            style: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
        },
        pending_payment: {
            icon: CircleDollarSign,
            titleKey: 'statusPendingPayment',
            descKey: 'statusPendingPaymentDescription',
            style: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        },
        payment_review: {
            icon: Search,
            titleKey: 'statusPaymentReview',
            descKey: 'statusPaymentReviewDescription',
            style: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
        },
        active: {
            icon: CheckCircle,
            titleKey: 'statusActive',
            descKey: 'statusActiveDescription',
            style: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:text-green-300'
        },
        rejected: {
            icon: XCircle,
            titleKey: 'statusRejected',
            descKey: 'statusRejectedDescription',
            style: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        },
    };

    const info = infoMap[status];
    if (!info) return null;

    const Icon = info.icon;

    return (
        <Card className={cn("p-4 flex items-start gap-4", info.style)}>
            <Icon className="h-6 w-6 mt-1 flex-shrink-0"/>
            <div>
                <h3 className="font-semibold text-base">{t[info.titleKey]}</h3>
                <p className="text-sm">{t[info.descKey]}</p>
            </div>
        </Card>
    );
};

export default function AdDetailPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [adRequest, setAdRequest] = useState<AdRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const fetchAdRequest = async () => {
    if (!adId || !user) return;
    setIsLoading(true);
    setError(null);
    try {
        const fetchedAd = await getAdRequestById(adId);
        if (!fetchedAd) {
            setError(t.adRequestNotFound);
            return;
        }
        if (fetchedAd.userId !== user.uid) {
            setError(t.unauthorizedViewAd);
            return;
        }
        setAdRequest(fetchedAd);
    } catch (err: any) {
        setError(t.failedToFetchAdDetails);
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) router.push('/login');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if(user && adId){
      fetchAdRequest();
    }
  }, [adId, user]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !adRequest) return;
    
    setIsSubmitting(true);
    try {
        await uploadAdPaymentProof(adRequest.id, file);
        await fetchAdRequest();
        toast({ title: t.proofUploadedSuccessTitle, description: t.proofUploadedSuccessDescription });
    } catch (err: any) {
        toast({ variant: "destructive", title: t.uploadFailed, description: err.message });
    } finally {
        setIsSubmitting(false);
        if (event.target) event.target.value = '';
    }
  };

  if (isLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-destructive p-8">{error}</div>;
  }
  
  if (!adRequest) {
    return <div className="text-center p-8">{t.adRequestNotFound}</div>;
  }

  const showPaymentBox = adRequest.status === 'pending_payment';

  return (
    <div className="max-w-3xl mx-auto space-y-4">
       <Button variant="outline" onClick={() => router.push('/dashboard/provider/ads')} className="group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors" />
        {t.myAds}
      </Button>

      <Card>
        <CardHeader>
          {adRequest.imageUrl && (
            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
              <Image src={adRequest.imageUrl} alt={adRequest.title} layout="fill" objectFit="cover" />
            </div>
          )}
          <CardTitle>{adRequest.title}</CardTitle>
          <CardDescription>{t.adRequestId}: {adRequest.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <StatusInfo status={adRequest.status} t={t} />

            {adRequest.rejectionReason && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t.rejectionReason}</AlertTitle>
                    <AlertDescription>{adRequest.rejectionReason}</AlertDescription>
                </Alert>
            )}

            {adRequest.status === 'payment_review' && adRequest.verificationNotes && (
                <Alert variant={"default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t.adminNote}</AlertTitle>
                    <AlertDescription>
                        {adRequest.verificationNotes}
                    </AlertDescription>
                </Alert>
            )}

            <div>
                <strong className="block text-sm font-medium text-muted-foreground">{t.adDescription}</strong>
                <p className="p-3 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">{adRequest.message}</p>
            </div>
            
            {showPaymentBox && (
                <Card className="bg-background border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">{t.paymentRequired}</CardTitle>
                        <CardDescription>{t.paymentRequiredDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{t.amountDue}</p>
                            <p className="text-3xl font-bold">{adRequest.price} {adRequest.currency}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">{t.bankTransferDetails}</h4>
                            <p className="text-sm text-muted-foreground">{t.bankName}: {t.bankNameValue}</p>
                            <p className="text-sm text-muted-foreground">{t.accountNumber}: {t.accountNumberValue}</p>
                        </div>
                        <Separator />
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,application/pdf" />
                        
                        <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                            {t.uploadPaymentProof}
                        </Button>
                    </CardContent>
                </Card>
            )}

             {adRequest.status === 'payment_review' && (
                 <Card className="bg-background border-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">{t.paymentUnderReview}</CardTitle>
                        <CardDescription>{t.paymentUnderReviewDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={adRequest.paymentProofUrl || '#'} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({variant: 'outline'}), 'w-full')}>
                            <FileCheck className="mr-2 h-4 w-4"/> {t.viewUploadedProof}
                        </Link>
                    </CardContent>
                 </Card>
            )}

        </CardContent>
      </Card>
    </div>
  );
}
