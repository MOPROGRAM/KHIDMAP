
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Loader2, AlertTriangle, ArrowRight, CheckCircle, Clock, AlertCircle, DollarSign, XCircle, Hourglass } from 'lucide-react';
import { Order, getOrdersForUser, OrderStatus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const StatusBadge = ({ status, t }: { status: OrderStatus; t: any }) => {
  const statusStyles: Record<OrderStatus, string> = {
    pending_approval: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300',
    pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300',
    paid: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
    disputed: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300',
    declined: 'bg-gray-200 text-gray-800 border-gray-400 dark:bg-gray-700 dark:text-gray-300',
  };
  const statusIcons: Record<OrderStatus, React.ElementType> = {
    pending_approval: Hourglass,
    pending_payment: DollarSign,
    paid: CheckCircle,
    completed: CheckCircle,
    disputed: AlertCircle,
    declined: XCircle,
  };
  const statusText: Record<OrderStatus, string> = {
    pending_approval: t.pendingApproval,
    pending_payment: t.pendingPayment,
    paid: t.paid,
    completed: t.completed,
    disputed: t.disputed,
    declined: t.declined,
  };
  
  const Icon = statusIcons[status];

  return (
    <Badge variant="outline" className={cn("gap-1.5", statusStyles[status])}>
        <Icon className="h-3.5 w-3.5" />
        {statusText[status]}
    </Badge>
  );
};


export default function OrdersPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string|null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setUserRole(localStorage.getItem('userRole'));
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authUser) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userOrders = await getOrdersForUser(authUser.uid);
        setOrders(userOrders);
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
    
    fetchOrders();
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
          <div className="flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">{t.myOrders}</CardTitle>
              <CardDescription>{userRole === 'seeker' ? t.myOrdersDescriptionSeeker : t.myOrdersDescriptionProvider}</CardDescription>
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
              <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">{t.noOrdersYet}</h3>
              <p className="text-muted-foreground">{t.noOrdersYetDescription}</p>
              {userRole === 'seeker' && <Button asChild className="mt-4"><Link href="/services/search">{t.browseServices}</Link></Button>}
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block group">
                  <Card className="hover:border-primary hover:bg-muted/30 transition-all duration-200">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <div className="md:col-span-3">
                            <div className="flex items-center gap-3 mb-2">
                                <StatusBadge status={order.status} t={t} />
                                <p className="text-sm text-muted-foreground">
                                    {userRole === 'seeker' ? `Provider: ${order.providerName}` : `Seeker: ${order.seekerName}`}
                                </p>
                            </div>
                            <p className="font-semibold text-foreground line-clamp-2">{order.serviceDescription}</p>
                        </div>
                        <div className="flex md:justify-end items-center gap-4">
                           <p className="text-sm text-muted-foreground">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
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
