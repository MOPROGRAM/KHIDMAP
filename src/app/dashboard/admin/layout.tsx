
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from '@/lib/config';
import { Loader2, AlertTriangle, ServerCrash, ShieldCheck, DollarSign, Megaphone, LifeBuoy, BadgeCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  href: string;
  labelKey: keyof Translations;
  icon: React.ReactElement;
}

const navItems: NavItem[] = [
    { href: '/admin/dashboard', labelKey: 'adminDashboard', icon: <ShieldCheck /> },
    { href: '/admin/payments', labelKey: 'paymentApprovals', icon: <DollarSign /> },
    { href: '/admin/ads', labelKey: 'adRequests', icon: <Megaphone /> },
    { href: '/admin/support', labelKey: 'supportRequests', icon: <LifeBuoy /> },
    { href: '/admin/verifications', labelKey: 'providerVerifications', icon: <BadgeCheck /> },
    { href: '/admin/disputes', labelKey: 'disputeResolution', icon: <ShieldAlert /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);

  useEffect(() => {
    if (auth && db) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.email === ADMIN_EMAIL) {
          // User is admin, all good
        } else {
          router.replace('/login');
          if (user) {
            toast({ variant: "destructive", title: t.accessDenied, description: t.notAuthorizedViewPage });
          } else {
            toast({ variant: "destructive", title: t.unauthorized, description: t.loginAsAdmin });
          }
        }
        setIsCheckingAuth(false);
      });
      return () => unsubscribe();
    } else {
      setIsCoreServicesAvailable(false);
      setIsCheckingAuth(false);
    }
  }, [router, toast, t]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoreServicesAvailable) { 
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-4">
        <ServerCrash className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t.serviceUnavailableTitle}</h1>
        <p className="text-muted-foreground">{t.coreServicesUnavailableDashboard}</p>
        <Button onClick={() => router.push('/')}>{t.goToHomepage}</Button>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="">{t.appName} Admin</span>
                    </Link>
                </div>
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                pathname.startsWith(item.href) && (item.href !== '/admin/dashboard' || pathname === '/admin/dashboard') && "bg-muted text-primary"
                            )}
                        >
                            {React.cloneElement(item.icon, { className: 'h-4 w-4' })}
                            {t[item.labelKey]}
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
        <div className="flex flex-col">
            {/* Header could go here if needed */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
            </main>
        </div>
    </div>
  );
}
