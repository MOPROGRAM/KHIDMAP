
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { ADMIN_EMAIL } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

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
          router.replace('/auth/login');
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
          <p>{t.adminPlaceholder}</p>
          {/* Future admin functionalities will be added here */}
        </CardContent>
      </Card>
    </div>
  );
}
