
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import type { AdRequestStatus } from '@/lib/data'; // Keep AdRequestStatus if it's a shared type
import { Loader2, ArrowLeft, Hourglass, CheckCircle, AlertCircle, Upload, Send, FileCheck, CircleDollarSign, XCircle, Search, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define AdRequest type based on backend/prisma/schema.prisma
interface AdRequest {
  id: number;
  title: string;
  message: string;
  price: number;
  currency: string;
  status: AdRequestStatus;
  userId: number;
  imageUrl?: string;
  rejectionReason?: string;
  paymentProofUrl?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const StatusInfo = ({ status, t }: { status: AdRequestStatus; t: Record<string, string>; }) => {
    const infoMap: Record<AdRequestStatus, { icon: React.ElementType, titleKey: string, descKey: string, style: string }> = {
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
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
 
   const fetchAdRequest = useCallback(async () => {
     if (!adId || !authUser) return;
     setIsLoading(true);
     setError(null);
     try {
         const res = await fetch(`/api/ads/${adId}`, {
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
         });
         if (!res.ok) {
           const errorData = await res.json();
           throw new Error(errorData.message || 'Failed to fetch ad details.');
         }
         const fetchedAd: AdRequest = await res.json();
         if (!fetchedAd) {
             setError(t.adRequestNotFound || 'Ad request not found.');
             return;
         }
         if (fetchedAd.userId !== authUser.id) {
             setError(t.unauthorized || 'Unauthorized to view this ad.'); // Changed to 'unauthorized'
             return;
         }
         setAdRequest(fetchedAd);
     } catch (err: any) {
         setError(t.errorOccurred || 'Failed to fetch ad details.'); // Changed to 'errorOccurred'
     } finally {
         setIsLoading(false);
     }
   }, [adId, authUser, t]);
 
   useEffect(() => {
     if (!isAuthLoading && authUser && adId) {
       fetchAdRequest();
     } else if (!isAuthLoading && !authUser) {
       router.push('/login');
     }
   }, [adId, authUser, fetchAdRequest, isAuthLoading, router]);
   
   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (!file || !adRequest || !authUser) return;
     
     setIsSubmitting(true);
     try {
         const formData = new FormData();
         formData.append('file', file);
         formData.append('adId', adRequest.id.toString());
         formData.append('userId', authUser.id.toString());
         formData.append('type', 'payment_proof'); // Indicate type of upload
 
         const uploadRes = await fetch(`/api/uploads/payment-proof`, {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           },
           body: formData,
         });
 
         if (!uploadRes.ok) {
           const errorData = await uploadRes.json();
           throw new Error(errorData.message || 'Failed to upload payment proof.');
         }
 
         toast({ title: t.fileUploadedSuccessTitle || 'Proof Uploaded', description: t.fileUploadedSuccessDescription || 'Payment proof uploaded successfully.' }); // Changed to fileUploadedSuccessTitle/Description
         fetchAdRequest(); // Re-fetch ad request to update status
     } catch (err: any) {
         toast({ variant: "destructive", title: t.errorOccurred || 'Upload Failed', description: err.message || 'Failed to upload file.' }); // Changed to errorOccurred
     } finally {
         setIsSubmitting(false);
         if (event.target) event.target.value = '';
     }
   };
 
   if (isLoading || isAuthLoading || !authUser) {
     return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
   }
 
   if (error) {
     return <div className="text-center text-destructive p-8">{error}</div>;
   }
   
   if (!adRequest) {
     return <div className="text-center p-8">{t.adRequestNotFound || 'Ad request not found.'}</div>; // Added default
   }
 
   const showPaymentBox = adRequest.status === 'pending_payment';
 
   return (
     <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="outline" onClick={() => router.push('/dashboard/provider/ads')} className="group">
         <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors" />
         {t.myAds || 'My Ads'}
       </Button>
 
       <Card>
         <CardHeader>
           {adRequest.imageUrl && (
             <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
               <Image src={adRequest.imageUrl} alt={adRequest.title} layout="fill" objectFit="cover" />
             </div>
           )}
           <CardTitle>{adRequest.title}</CardTitle>
           <CardDescription>{t.adRequestId || 'Ad Request ID'}: {adRequest.id}</CardDescription> {/* Added default */}
         </CardHeader>
         <CardContent className="space-y-4">
             <StatusInfo status={adRequest.status} t={t} />
 
             {adRequest.rejectionReason && (
                 <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>{t.rejectionReason || 'Rejection Reason'}</AlertTitle>
                     <AlertDescription>{adRequest.rejectionReason}</AlertDescription>
                 </Alert>
             )}
 
             {adRequest.status === 'payment_review' && adRequest.verificationNotes && (
                 <Alert variant={"default"}>
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle>{t.adminNotes || 'Admin Note'}</AlertTitle> {/* Changed to adminNotes */}
                     <AlertDescription>
                         {adRequest.verificationNotes}
                     </AlertDescription>
                 </Alert>
             )}
 
             <div>
                 <strong className="block text-sm font-medium text-muted-foreground">{t.adDescription || 'Ad Description'}</strong> {/* Added default */}
                 <p className="p-3 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">{adRequest.message}</p>
             </div>
             
             {showPaymentBox && (
                 <Card className="bg-background border-primary">
                     <CardHeader>
                         <CardTitle className="flex items-center gap-2">{t.paymentRequired || 'Payment Required'}</CardTitle> {/* Added default */}
                         <CardDescription>{t.paymentRequiredDesc || 'Payment is required to activate your ad.'}</CardDescription> {/* Added default */}
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <div className="text-center p-4 bg-muted rounded-lg">
                             <p className="text-sm text-muted-foreground">{t.amountDue || 'Amount Due'}</p> {/* Added default */}
                             <p className="text-3xl font-bold">{adRequest.price} {adRequest.currency}</p>
                         </div>
                         <div>
                             <h4 className="font-semibold">{t.bankTransferDetails || 'Bank Transfer Details'}</h4> {/* Added default */}
                             <p className="text-sm text-muted-foreground">{t.bankName || 'Bank Name'}: {t.bankNameValue || 'Bank Name Value'}</p> {/* Added default */}
                             <p className="text-sm text-muted-foreground">{t.accountNumber || 'Account Number'}: {t.accountNumberValue || 'Account Number Value'}</p> {/* Added default */}
                         </div>
                         <Separator />
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,application/pdf" />
                         
                         <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                             {t.uploadPaymentProof || 'Upload Payment Proof'}
                         </Button>
                     </CardContent>
                 </Card>
             )}
 
              {adRequest.status === 'payment_review' && (
                  <Card className="bg-background border-blue-500">
                     <CardHeader>
                         <CardTitle className="flex items-center gap-2">{t.paymentUnderReview || 'Payment Under Review'}</CardTitle> {/* Added default */}
                         <CardDescription>{t.paymentUnderReviewDesc || 'Your payment is currently under review.'}</CardDescription> {/* Added default */}
                     </CardHeader>
                     <CardContent>
                         <Link href={adRequest.paymentProofUrl || '#'} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({variant: 'outline'}), 'w-full')}>
                             <FileCheck className="mr-2 h-4 w-4"/> {t.viewUploadedProof || 'View Uploaded Proof'} {/* Added default */}
                         </Link>
                     </CardContent>
                  </Card>
             )}
 
         </CardContent>
       </Card>
     </div>
   );
 }
