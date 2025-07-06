
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle, Loader2, DollarSign, ArrowRight, Megaphone, LifeBuoy, BadgeCheck, ShieldAlert } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { ADMIN_EMAIL } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);


  useEffect(() => {
    if (auth && db) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = auth.onAuthStateChanged(user => {
        setIsCheckingAuth(false);
        if (!user) {
          router.replace('/login');
          toast({ variant: "destructive", title: t.unauthorized, description: t.loginAsAdmin });
        } else if (user.email !== ADMIN_EMAIL) {
          router.replace('/dashboard');
          toast({ variant: "destructive", title: t.accessDenied, description: t.notAuthorizedViewPage });
        }
        // If user is admin, they stay on the page
      });
      return () => unsubscribe?.();
    } else {
      setIsCoreServicesAvailable(false);
      setIsCheckingAuth(false);
      console.warn("Firebase Auth or DB not initialized in AdminDashboardPage.");
    }
  }, [router, toast, t]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading}</p>
      </div>
    );
  }

  if (!isCoreServicesAvailable) {
     return (
        <div className="space-y-8">
            <Card className="shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-7 w-7"/> {t.serviceUnavailableTitle}
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p>{t.adminDashboardUnavailable}</p> 
                 </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">{t.welcomeAdmin}</CardTitle>
                <CardDescription>{t.adminDashboardDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/payments" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Payment Approvals</h3>
                                    <p className="text-sm text-muted-foreground">Review and approve pending payments.</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/ads" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Megaphone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Ad Requests</h3>
                                    <p className="text-sm text-muted-foreground">Review and approve advertisement requests.</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/admin/support" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <LifeBuoy className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.supportRequests}</h3>
                                    <p className="text-sm text-muted-foreground">{t.reviewSupportTickets}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/verifications" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <BadgeCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.providerVerifications}</h3>
                                    <p className="text-sm text-muted-foreground">{t.reviewProviderVerifications}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/disputes" className="group">
                    <Card className="shadow-sm hover:shadow-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <ShieldAlert className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">{t.disputeResolution}</h3>
                                    <p className="text-sm text-muted-foreground">{t.disputeResolutionDescription}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
