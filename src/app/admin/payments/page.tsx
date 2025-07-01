
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Loader2, AlertTriangle, CheckCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Order, getPendingPaymentOrders, approvePayment } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPaymentsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);

  const fetchPendingPayments = async () => {
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

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleApprove = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      await approvePayment(orderId);
      toast({
        title: "Payment Approved",
        description: `Order ${orderId} has been marked as paid.`
      });
      // Refresh list after approval
      fetchPendingPayments();
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
             <DollarSign className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">{t.paymentApprovals}</CardTitle>
                <CardDescription>Review uploaded payment proofs and approve orders.</CardDescription>
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
          {orders.length === 0 && !error ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">No Pending Payments</h3>
              <p className="text-muted-foreground">All payments are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="grid md:grid-cols-3 gap-4 p-4 items-center">
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Order ID: <Badge variant="secondary">{order.id}</Badge></p>
                    <p><strong>Seeker:</strong> {order.seekerName}</p>
                    <p><strong>Provider:</strong> {order.providerName}</p>
                    <p className="text-sm text-muted-foreground pt-2"><strong>Description:</strong> {order.serviceDescription}</p>
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
                        <Button 
                          onClick={() => handleApprove(order.id)} 
                          disabled={approvingOrderId === order.id}
                          className="w-full"
                        >
                          {approvingOrderId === order.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Approve Payment
                        </Button>
                      </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-md h-full w-full">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2"/>
                            <p className="text-sm text-muted-foreground">No proof uploaded yet.</p>
                        </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
