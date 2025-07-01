
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { auth, storage } from '@/lib/firebase';
import { Order, getOrderById, OrderStatus, uploadPaymentProofAndUpdateOrder, markOrderAsCompleted, disputeOrder, acceptOrder, declineOrder } from '@/lib/data';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Loader2, ArrowLeft, Clock, CheckCircle, AlertCircle, Upload, Send, ShieldQuestion, FileCheck, DollarSign, Banknote, Landmark, Hourglass, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const StatusInfo = ({ status, t, isProvider }: { status: OrderStatus; t: Translations; isProvider: boolean }) => {
    const infoMap: Record<OrderStatus, { icon: React.ElementType, titleKey: keyof Translations, descKey: keyof Translations, style: string }> = {
        pending_approval: {
            icon: Hourglass,
            titleKey: 'statusPendingApprovalTitle',
            descKey: isProvider ? 'statusPendingApprovalDescriptionProvider' : 'statusPendingApprovalDescriptionSeeker',
            style: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
        },
        pending_payment: {
            icon: Clock,
            titleKey: 'paymentPendingTitle',
            descKey: 'paymentPendingDescription',
            style: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        },
        paid: {
            icon: CheckCircle,
            titleKey: 'paymentApprovedTitle',
            descKey: 'paymentApprovedDescription',
            style: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        },
        completed: {
            icon: CheckCircle,
            titleKey: 'orderCompletedTitle',
            descKey: 'orderCompletedDescription',
            style: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        },
        disputed: {
            icon: AlertCircle,
            titleKey: 'orderDisputedTitle',
            descKey: 'orderDisputedDescription',
            style: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        },
        declined: {
            icon: XCircle,
            titleKey: 'statusDeclinedTitle',
            descKey: 'statusDeclinedDescription',
            style: 'bg-gray-200 border-gray-400 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
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

export default function OrderDetailPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    SAR: 'ر.س',
    EGP: 'ج.م',
    AED: 'د.إ',
    QAR: 'ر.ق',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) router.push('/login');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!orderId || !user) return;
    
    const fetchOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedOrder = await getOrderById(orderId);
            if (!fetchedOrder) {
                setError("Order not found.");
                return;
            }
            if (fetchedOrder.seekerId !== user.uid && fetchedOrder.providerId !== user.uid) {
                setError("You are not authorized to view this order.");
                return;
            }
            setOrder(fetchedOrder);
        } catch (err: any) {
            setError("Failed to fetch order details.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchOrder();
  }, [orderId, user]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        toast({ variant: "destructive", title: t.fileTooLargeTitle, description: t.fileTooLargeDescription?.replace('{size}', '10MB') });
        return;
    }
    
    setIsSubmitting(true);
    try {
        await uploadPaymentProofAndUpdateOrder(order.id, file);
        const updatedOrder = await getOrderById(order.id);
        setOrder(updatedOrder);
        toast({ title: "Proof Uploaded Successfully", description: "The admin will review your payment shortly."});
    } catch (err: any) {
        toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
        setIsSubmitting(false);
        if (event.target) event.target.value = '';
    }
  };

  const handleMarkAsCompleted = async () => {
    if(!order) return;
    setIsSubmitting(true);
    try {
      await markOrderAsCompleted(order.id);
      const updatedOrder = await getOrderById(order.id);
      setOrder(updatedOrder);
      toast({ title: "Service Marked as Completed!", description: "Thank you for using our platform."});
    } catch(err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleDispute = async () => {
    if(!order) return;
    setIsSubmitting(true);
    try {
      await disputeOrder(order.id);
      const updatedOrder = await getOrderById(order.id);
      setOrder(updatedOrder);
      toast({ title: "Order Disputed", description: "The order has been marked as disputed. Admin will review it."});
    } catch(err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAcceptOrder = async () => {
    if(!order) return;
    setIsSubmitting(true);
    try {
      await acceptOrder(order.id);
      const updatedOrder = await getOrderById(order.id);
      setOrder(updatedOrder);
      toast({ title: t.orderAccepted, description: t.orderAcceptedDescription });
    } catch(err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeclineOrder = async () => {
    if(!order) return;
    setIsSubmitting(true);
    try {
      await declineOrder(order.id);
      const updatedOrder = await getOrderById(order.id);
      setOrder(updatedOrder);
      toast({ title: t.orderDeclined, description: t.orderDeclinedDescription });
    } catch(err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-destructive p-8">{error}</div>;
  }
  
  if (!order) {
    return <div className="text-center p-8">Order not found.</div>;
  }

  const isSeeker = user.uid === order.seekerId;
  const isProvider = user.uid === order.providerId;
  const showPaymentBox = isSeeker && order.status === 'pending_payment';
  const showSeekerActionBox = isSeeker && order.status === 'paid';
  const showProviderActionBox = isProvider && order.status === 'pending_approval';
  const currencySymbol = currencySymbols[order.currency] || order.currency;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
       <Button variant="outline" onClick={() => router.push('/dashboard/orders')} className="group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order ID: {order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <StatusInfo status={order.status} t={t} isProvider={isProvider}/>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong className="block text-muted-foreground">Provider</strong> {order.providerName}</div>
                <div><strong className="block text-muted-foreground">Seeker</strong> {order.seekerName}</div>
                <div><strong className="block text-muted-foreground">Order Date</strong> {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</div>
                {order.approvedByProviderAt && <div><strong className="block text-muted-foreground">Request Approved</strong> {new Date(order.approvedByProviderAt.seconds * 1000).toLocaleDateString()}</div>}
                {order.paymentApprovedAt && <div><strong className="block text-muted-foreground">Payment Approved</strong> {new Date(order.paymentApprovedAt.seconds * 1000).toLocaleDateString()}</div>}
            </div>

            <div>
                <strong className="block text-sm font-medium text-muted-foreground">Service Description</strong>
                <p className="p-3 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">{order.serviceDescription}</p>
            </div>

            <Card className="bg-background">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="h-5 w-5"/>Financial Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.serviceAmount}</span> <span className="font-mono font-medium">{currencySymbol}{order.amount.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.platformCommission} (5%)</span> <span className="font-mono font-medium">{currencySymbol}{order.commission.toFixed(2)}</span></div>
                  <Separator/>
                  <div className="flex justify-between items-center font-semibold"><span className="text-muted-foreground">{t.providerPayout}</span> <span className="font-mono">{currencySymbol}{order.payoutAmount.toFixed(2)}</span></div>
              </CardContent>
            </Card>
            
            {showProviderActionBox && (
                <Card className="bg-background border-primary">
                    <CardHeader>
                        <CardTitle>New Service Request</CardTitle>
                        <CardDescription>Review the details below and respond to the seeker.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAcceptOrder} disabled={isSubmitting}>
                             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className="mr-2 h-4 w-4"/>}
                            {t.acceptOrder}
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleDeclineOrder} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsDown className="mr-2 h-4 w-4"/>}
                            {t.declineOrder}
                        </Button>
                    </CardContent>
                </Card>
            )}
            
            {showPaymentBox && (
                <Card className="bg-background border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5"/>Payment Required</CardTitle>
                        <CardDescription>Please complete the payment and upload proof to proceed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2"><Landmark className="h-4 w-4"/>Bank Transfer Details</h4>
                            <p className="text-sm text-muted-foreground">Bank Name: Khidmap National Bank</p>
                            <p className="text-sm text-muted-foreground">Account Number: 123-456-7890</p>
                            <p className="text-sm text-muted-foreground">Amount: <strong className="font-mono">{currencySymbol}{order.amount.toFixed(2)}</strong></p>
                        </div>
                        <Separator />
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,application/pdf" />
                        
                        {!order.proofOfPaymentUrl ? (
                            <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                                Upload Payment Proof
                            </Button>
                        ) : (
                             <div className="flex items-center gap-2 p-3 border rounded-md bg-green-50 text-green-800">
                                <FileCheck className="h-5 w-5"/>
                                <span className="font-medium">Proof of payment has been uploaded.</span>
                             </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {showSeekerActionBox && (
                 <Card className="bg-background">
                    <CardHeader>
                        <CardTitle>Confirm Service Completion</CardTitle>
                        <CardDescription>Once the service is completed to your satisfaction, please mark it as complete.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-2">
                        <Button className="w-full" onClick={handleMarkAsCompleted} disabled={isSubmitting}>
                             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                            Mark as Completed
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleDispute} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ShieldQuestion className="mr-2 h-4 w-4"/>}
                            Report a Problem
                        </Button>
                    </CardContent>
                </Card>
            )}

        </CardContent>
      </Card>
    </div>
  );
}
