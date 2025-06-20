
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { ADMIN_EMAIL } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(user => {
      if (!user) {
        router.replace('/auth/login');
        toast({ variant: "destructive", title: "Unauthorized", description: "Please log in as admin." });
      } else if (user.email !== ADMIN_EMAIL) {
        router.replace('/dashboard');
        toast({ variant: "destructive", title: "Access Denied", description: "You are not authorized to view this page." });
      }
    });
    return () => unsubscribe?.();
  }, [router, toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-3xl font-headline">{t.welcomeAdmin}</CardTitle>
                <CardDescription>{t.adminDashboard}</CardDescription>
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
