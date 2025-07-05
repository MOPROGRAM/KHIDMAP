
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, ExternalLink, Image as ImageIcon, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Order, getPendingPaymentOrders, approvePayment, rejectPayment } from '@/lib/data';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AdminPaymentsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const currencySymbols: Record<string, string> = {
    USD: '$',
    SAR: 'ر.س',
    EGP: 'ج.م',
    AED: 'د.إ',
    QAR: 'ر.ق',
  };

  const fetchOrdersForReview = async () => {
    setIsLoading(true);
    try {
      const pendingOrders = await getPendingPaymentOrders();
      setOrders(pendingOrders);
    } catch (err: any) {
      setError(t.errorOccurred + ": " + err.message);
      toast({
        variant: 'destructive',
        title: t.errorOccurred,
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const ordersForReview = useMemo(() => {
    return orders.filter(order => order.proofOfPaymentUrl);
  }, [orders]);


  useEffect(() => {
    fetchOrdersForReview();
  }, []);

  const handleApprove = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      await approvePayment(orderId);
      toast({
        title: "Payment Approved",
        description: `Order ${orderId} has been marked as paid.`
      });
      fetchOrdersForReview();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: "Approval Failed",
        description: err.message
      });
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!orderId) return;
    setRejectingOrderId(orderId);
    try {
      await rejectPayment(orderId, rejectionReason || "The uploaded proof was invalid.");
      toast({
        title: t.rejectionSuccessTitle,
        description: t.rejectionSuccessDescription,
      });
      setRejectionReason('');
      fetchOrdersForReview();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.rejectionFailedTitle,
        description: err.message
      });
    } finally {
      setRejectingOrderId(null);
    }
  };

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
             <Search className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">Manual Payment Review</CardTitle>
                <CardDescription>Review payments that failed automatic AI verification or require manual checks.</CardDescription>
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
          {ordersForReview.length === 0 && !error ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">No Manual Reviews Needed</h3>
              <p className="text-muted-foreground">All uploaded payments have been verified automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersForReview.map((order) => {
                const currencySymbol = currencySymbols[order.currency] || order.currency;
                const isProcessing = approvingOrderId === order.id || rejectingOrderId === order.id;
                return (
                  <Card key={order.id} className="grid md:grid-cols-3 gap-4 p-4 items-start">
                    <div className="md:col-span-2 space-y-2">
                      <div className="text-sm text-muted-foreground">Order ID: <Badge variant="secondary">{order.id}</Badge></div>
                      <p><strong>Seeker:</strong> {order.seekerName}</p>
                      <p><strong>Provider:</strong> {order.providerName}</p>
                      <p><strong>Amount:</strong> <span className="font-mono">{currencySymbol}{order.amount.toFixed(2)}</span></p>
                      <p className="text-sm text-muted-foreground pt-2"><strong>Description:</strong> {order.serviceDescription}</p>
                       {order.verificationNotes && (
                          <Alert variant={order.verificationNotes.includes("Rejected") ? "destructive" : "default"} className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>{order.verificationNotes.includes("Rejected") ? "AI Verification Failed" : "AI Note"}</AlertTitle>
                              <AlertDescription>
                                  {order.verificationNotes}
                              </AlertDescription>
                          </Alert>
                      )}
                    </div>
                    <div className="space-y-3 flex flex-col items-center">
                      {order.proofOfPaymentUrl ? (
                        <>
                          <Link href={order.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer" className="block relative w-40 h-40 group">
                            <Image src={order.proofOfPaymentUrl} alt="Payment Proof" layout="fill" className="rounded-md object-cover border" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                  <ExternalLink className="h-8 w-8 text-white" />
                             </div>
                          </Link>
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button 
                              onClick={() => handleApprove(order.id)} 
                              disabled={isProcessing}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              {approvingOrderId === order.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <ThumbsUp className="mr-2 h-4 w-4" />
                              )}
                              {t.approveManually}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  disabled={isProcessing}
                                >
                                  <ThumbsDown className="mr-2 h-4 w-4" />
                                  {t.rejectManually}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t.confirmRejectPaymentTitle}</AlertDialogTitle>
                                  <AlertDialogDescription>{t.confirmRejectPaymentDescription}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2">
                                  <Label htmlFor={`rejection-reason-${order.id}`}>{t.rejectionReason}</Label>
                                  <Input
                                    id={`rejection-reason-${order.id}`}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={t.rejectionReasonPlaceholder}
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setRejectionReason('')}>{t.cancel}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(order.id)}
                                    disabled={rejectingOrderId === order.id}
                                    className={buttonVariants({ variant: "destructive" })}
                                  >
                                    {rejectingOrderId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.reject}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-md h-full w-full">
                              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2"/>
                              <p className="text-sm text-muted-foreground">No proof uploaded yet.</p>
                          </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
