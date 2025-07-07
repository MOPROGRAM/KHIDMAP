
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, Megaphone, Clock, ThumbsUp, ThumbsDown, Search, CircleDollarSign, Image as ImageIcon } from 'lucide-react';
import type { AdRequest, AdRequestStatus } from '@/lib/data';
import { getAdRequests, approveAdRequestAndSetPrice, rejectAdRequest, confirmAdPayment, rejectAdPayment } from '@/lib/data';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const StatusBadge = ({ status, t }: { status: AdRequestStatus, t: Translations }) => {
    const styles: Record<AdRequestStatus, string> = {
        pending_review: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300',
        pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300',
        payment_review: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
        active: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300',
    };
    const text: Record<AdRequestStatus, keyof Translations> = {
        pending_review: 'statusPendingReview',
        pending_payment: 'statusPendingPayment',
        payment_review: 'statusPaymentReview',
        active: 'statusActive',
        rejected: 'statusRejected',
    };
    const Icon = {
        pending_review: Clock,
        pending_payment: CircleDollarSign,
        payment_review: Search,
        active: ThumbsUp,
        rejected: ThumbsDown,
    }[status] || AlertTriangle;
    return (
        <Badge variant="outline" className={`gap-1.5 ${styles[status]}`}>
            <Icon className="h-3.5 w-3.5" />
            {t[text[status]]}
        </Badge>
    );
};

const AdRequestCard = ({ request, t, onUpdate }: { request: AdRequest, t: Translations, onUpdate: () => void }) => {
    const { language, currency: defaultCurrency } = useSettings();
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState(defaultCurrency);
    const [reason, setReason] = useState('');

    const formatRelativeTime = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: language === 'ar' ? ar : enUS });
    }

    const handleApprove = async () => {
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Price', description: 'Please enter a valid positive number for the price.' });
            return;
        }
        setProcessingId(request.id);
        try {
            await approveAdRequestAndSetPrice(request.id, numericPrice, currency);
            toast({ title: 'Ad Approved', description: 'The user has been notified to make the payment.' });
            onUpdate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: "Approval Failed", description: err.message });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'Reason Required', description: 'Please provide a reason for rejection.' });
            return;
        }
        setProcessingId(request.id);
        try {
            await rejectAdRequest(request.id, reason);
            toast({ title: 'Ad Rejected', description: 'The user has been notified.' });
            onUpdate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: "Rejection Failed", description: err.message });
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmPayment = async () => {
        setProcessingId(request.id);
        try {
            await confirmAdPayment(request.id);
            toast({ title: 'Payment Confirmed', description: 'The ad is now active.' });
            onUpdate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: "Confirmation Failed", description: err.message });
        } finally {
            setProcessingId(null);
        }
    }

    const handleRejectPayment = async () => {
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'Reason Required', description: 'Please provide a reason for payment rejection.' });
            return;
        }
        setProcessingId(request.id);
        try {
            await rejectAdPayment(request.id, reason);
            toast({ title: 'Payment Rejected', description: 'The user has been notified to upload new proof.' });
            onUpdate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: "Rejection Failed", description: err.message });
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <Card key={request.id} className="p-4">
            <div className="grid md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <StatusBadge status={request.status} t={t} />
                        <span className="text-muted-foreground">{formatRelativeTime(request.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {request.imageUrl && (
                            <Image src={request.imageUrl} alt={request.title} width={100} height={100} className="rounded-md object-cover border aspect-square" />
                        )}
                        {!request.imageUrl && (
                           <div className="w-[100px] h-[100px] bg-muted rounded-md flex items-center justify-center border">
                                <ImageIcon className="w-8 h-8 text-muted-foreground"/>
                           </div>
                        )}
                        <div className="space-y-1">
                            <h4 className="font-bold">{request.title}</h4>
                            <p><strong>From:</strong> {request.name} ({request.email})</p>
                            <p className="text-sm text-muted-foreground pt-1 whitespace-pre-wrap">{request.message}</p>
                        </div>
                    </div>
                     {request.status === 'payment_review' && request.paymentProofUrl && (
                        <div>
                             <h5 className="font-semibold text-sm mb-1">Payment Proof:</h5>
                             <Link href={request.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                                <Image src={request.paymentProofUrl} alt="Payment Proof" width={150} height={150} className="rounded-md border object-cover" />
                             </Link>
                        </div>
                    )}
                    {request.verificationNotes && (
                        <Alert variant={request.verificationNotes.includes("Rejected") ? "destructive" : "default"} className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{request.verificationNotes.includes("Rejected") ? "AI Verification Failed" : "AI Note"}</AlertTitle>
                            <AlertDescription>
                                {request.verificationNotes}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="space-y-2 flex flex-col items-center justify-center">
                    {request.status === 'pending_review' && (
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={!!processingId} className="w-full bg-green-600 hover:bg-green-700">
                                        <ThumbsUp className="mr-2 h-4 w-4" /> Approve & Set Price
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Approve Ad Request</AlertDialogTitle><AlertDialogDescription>Set the price for this ad. The user will be notified to pay.</AlertDialogDescription></AlertDialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price</Label>
                                        <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 50.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select value={currency} onValueChange={(v) => setCurrency(v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem><SelectItem value="SAR">SAR</SelectItem><SelectItem value="EGP">EGP</SelectItem><SelectItem value="AED">AED</SelectItem><SelectItem value="QAR">QAR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleApprove} disabled={!price}>Confirm Approval</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={!!processingId} variant="destructive" className="w-full">
                                        <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Reject Ad Request</AlertDialogTitle><AlertDialogDescription>Provide a reason for rejecting this ad request.</AlertDialogDescription></AlertDialogHeader>
                                    <div className="space-y-2"><Label htmlFor="reason">Rejection Reason</Label><Input id="reason" value={reason} onChange={e => setReason(e.target.value)} /></div>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleReject} disabled={!reason.trim()} className={buttonVariants({ variant: "destructive" })}>Confirm Rejection</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                     {request.status === 'payment_review' && (
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                             <Button onClick={handleConfirmPayment} disabled={!!processingId} className="w-full bg-green-600 hover:bg-green-700">
                                {processingId === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                Confirm Payment
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={!!processingId} variant="destructive" className="w-full">
                                        <ThumbsDown className="mr-2 h-4 w-4" /> Reject Payment
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Reject Payment Proof</AlertDialogTitle><AlertDialogDescription>Provide a reason for rejecting this payment proof.</AlertDialogDescription></AlertDialogHeader>
                                    <div className="space-y-2"><Label htmlFor="reason-payment">Rejection Reason</Label><Input id="reason-payment" value={reason} onChange={e => setReason(e.target.value)} /></div>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRejectPayment} disabled={!reason.trim()} className={buttonVariants({ variant: "destructive" })}>Confirm Rejection</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default function AdminAdRequestsPage() {
  const t = useTranslation();
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    // No need to set loading to true here, happens in the initial load
    try {
      const adRequests = await getAdRequests();
      setRequests(adRequests);
    } catch (err: any) {
      setError(t.errorOccurred + ": " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const filteredRequests = useMemo(() => {
    const pendingReview = requests.filter(r => r.status === 'pending_review');
    const paymentReview = requests.filter(r => r.status === 'payment_review');
    const active = requests.filter(r => r.status === 'active');
    const rejected = requests.filter(r => r.status === 'rejected');
    return { pendingReview, paymentReview, active, rejected };
  }, [requests]);

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
          <div className="flex items-center gap-3">
             <Megaphone className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">Advertisement Requests</CardTitle>
                <CardDescription>Review, approve, or reject advertisement inquiries from users.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md flex items-center gap-2 justify-center">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          <Tabs defaultValue="pending_review" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending_review">Pending Review ({filteredRequests.pendingReview.length})</TabsTrigger>
              <TabsTrigger value="payment_review">Payment Review ({filteredRequests.paymentReview.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({filteredRequests.active.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({filteredRequests.rejected.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending_review" className="mt-4">
                {filteredRequests.pendingReview.length === 0 ? (
                     <div className="text-center py-12"><CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" /><h3 className="text-xl font-semibold">No New Ad Requests</h3><p className="text-muted-foreground">There are no new requests awaiting review.</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.pendingReview.map(req => <AdRequestCard key={req.id} request={req} t={t} onUpdate={fetchRequests} />)}
                    </div>
                )}
            </TabsContent>

             <TabsContent value="payment_review" className="mt-4">
                {filteredRequests.paymentReview.length === 0 ? (
                     <div className="text-center py-12"><CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" /><h3 className="text-xl font-semibold">No Payments to Review</h3><p className="text-muted-foreground">There are no payments awaiting confirmation.</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.paymentReview.map(req => <AdRequestCard key={req.id} request={req} t={t} onUpdate={fetchRequests} />)}
                    </div>
                )}
            </TabsContent>

             <TabsContent value="active" className="mt-4">
                {filteredRequests.active.length === 0 ? (
                     <div className="text-center py-12"><CheckCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-xl font-semibold">No Active Ads</h3><p className="text-muted-foreground">There are currently no active ads.</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.active.map(req => <AdRequestCard key={req.id} request={req} t={t} onUpdate={fetchRequests} />)}
                    </div>
                )}
            </TabsContent>

             <TabsContent value="rejected" className="mt-4">
                {filteredRequests.rejected.length === 0 ? (
                     <div className="text-center py-12"><CheckCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-xl font-semibold">No Rejected Ads</h3><p className="text-muted-foreground">There are no rejected ad requests.</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.rejected.map(req => <AdRequestCard key={req.id} request={req} t={t} onUpdate={fetchRequests} />)}
                    </div>
                )}
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
