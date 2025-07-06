
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Order, getDisputedOrders } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AdminDisputesPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    SAR: 'ر.س',
    EGP: 'ج.م',
    AED: 'د.إ',
    QAR: 'ر.ق',
  };

  useEffect(() => {
    const fetchDisputes = async () => {
      setIsLoading(true);
      try {
        const disputedOrders = await getDisputedOrders();
        setOrders(disputedOrders);
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
    fetchDisputes();
  }, [t, toast]);

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
            <ShieldAlert className="h-10 w-10 text-destructive" />
            <div>
              <CardTitle className="text-2xl font-headline">{t.disputeResolution}</CardTitle>
              <CardDescription>{t.disputeResolutionDescription}</CardDescription>
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
              <h3 className="text-xl font-semibold">{t.noDisputes}</h3>
              <p className="text-muted-foreground">{t.noDisputesDescription}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/admin/disputes/${order.id}`} className="block group">
                  <Card className="hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-200">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Order ID: {order.id.slice(0, 6)}...</Badge>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                        <p><strong>Seeker:</strong> {order.seekerName}</p>
                        <p><strong>Provider:</strong> {order.providerName}</p>
                        <p className="text-sm text-muted-foreground pt-1"><strong>Reason:</strong> {order.disputeReason || 'No reason provided'}</p>
                      </div>
                      <div className="flex md:justify-end items-center gap-4">
                         <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive group-hover:translate-x-1 transition-transform" />
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
