"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Search, History, LogOut, Settings, MessageSquare, Loader2, ShieldCheck, AlertTriangle, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged, signOut, User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from '@/lib/config';
import CallNotification from '@/components/chat/CallNotification';

type UserRole = 'provider' | 'seeker' | 'admin';

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useTranslation>;
  icon: React.ReactElement;
  roles: UserRole[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);

  const isMessagesPage = pathname.startsWith('/dashboard/messages');

  useEffect(() => {
    if (auth && db) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setAuthUser(user);
          setIsEmailVerified(user.emailVerified); 

          const roleFromStorage = localStorage.getItem('userRole') as UserRole | null;
          if (roleFromStorage) {
              setUserRole(roleFromStorage);
          }

          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              const roleFromFirestore = user.email === ADMIN_EMAIL ? 'admin' : (userData.role as UserRole);
              
              if (!['provider', 'seeker', 'admin'].includes(roleFromFirestore)) {
                console.error("User has no valid role. Logging out.", user.uid);
                toast({ variant: "destructive", title: t.roleMissingTitle, description: t.roleMissingDescription });
                if(auth) await signOut(auth);
                // No need to return, state change will trigger re-render and redirect
              } else {
                setUserRole(roleFromFirestore); 
                localStorage.setItem('userRole', roleFromFirestore);
                localStorage.setItem('userName', userData.name || user.displayName || '');
                localStorage.setItem('userEmail', userData.email || user.email || '');
              }
            } else {
              console.warn("User profile not found in Firestore for UID:", user.uid, ". Logging out user.");
              toast({ variant: "destructive", title: t.profileNotFoundTitle, description: t.profileNotFoundDescription });
              if(auth) await signOut(auth); 
            }
          } catch (error) {
            console.error("Error fetching user role from Firestore:", error);
            setUserRole(null);
            toast({ variant: "destructive", title: t.errorOccurred, description: t.couldNotFetchProfile });
          } finally {
            setIsLoading(false);
          }
        } else {
          setAuthUser(null);
          setUserRole(null);
          setIsEmailVerified(false);
          localStorage.clear();
          router.replace('/login');
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      console.warn("Firebase Auth or DB is not initialized. Dashboard layout cannot function.");
      setIsCoreServicesAvailable(false);
      setIsLoading(false);
    }
  }, [router, toast, t]);


  const navItems: NavItem[] = [
    { href: '/dashboard', labelKey: 'dashboard', icon: <Home className="h-5 w-5" />, roles: ['provider', 'seeker', 'admin'] },
    { href: '/dashboard/messages', labelKey: 'messages', icon: <MessageSquare className="h-5 w-5" />, roles: ['provider', 'seeker'] },
    { href: '/dashboard/provider/profile', labelKey: 'profile', icon: <User className="h-5 w-5" />, roles: ['provider'] },
    { href: '/services/search', labelKey: 'search', icon: <Search className="h-5 w-5" />, roles: ['seeker', 'provider'] },
    { href: '/dashboard/seeker/history', labelKey: 'searchHistory', icon: <History className="h-5 w-5" />, roles: ['seeker'] },
    { href: '/dashboard/settings', labelKey: 'settings', icon: <Settings className="h-5 w-5" />, roles: ['provider', 'seeker', 'admin'] },
    { href: '/admin/dashboard', labelKey: 'adminDashboard', icon: <ShieldCheck className="h-5 w-5" />, roles: ['admin'] },
  ];
  
  const handleLogout = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: t.errorOccurred, description: t.authServiceUnavailable });
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out from dashboard: ", error);
      toast({ variant: "destructive", title: t.logoutFailed, description: (error as Error).message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading}</p>
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

  if (!authUser && !isLoading) { 
    return (
      <div className="flex h-screen items-center justify-center">
        <p>{t.redirectingToLogin}</p>
      </div>
    );
  }
  
  const filteredNavItems = userRole ? navItems.filter(item => item.roles.includes(userRole)) : navItems.filter(item => item.href === '/dashboard');

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-64 border-r bg-background p-4 space-y-2 hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="px-2 py-1">
          <Logo />
        </div>
        <Separator />
        <nav className="flex-grow space-y-1">
          {filteredNavItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                {React.cloneElement(item.icon, { className: cn("ltr:mr-2 rtl:ml-2 h-5 w-5", pathname.startsWith(item.href) ? "text-primary" : "") })}
                {t[item.labelKey]}
              </Link>
            </Button>
          ))}
           {!userRole && authUser && ( 
            <div className="p-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{t.verifyingUserRole}</span>
            </div>
          )}
        </nav>
        <Separator />
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
          {t.logout}
        </Button>
      </aside>
      <main className={cn(
        "flex-1 p-2 md:p-4",
        isMessagesPage ? "flex flex-col overflow-hidden" : "overflow-y-auto"
      )}>
        {authUser && !isEmailVerified && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600 rounded-md shadow">
            <p className="font-medium">{t.verifyEmailPromptTitle}</p>
            <p className="text-sm">{t.verifyEmailPromptMessage?.replace('{email}', authUser.email || '')}</p>
            <Button variant="link" size="sm" className="p-0 h-auto text-yellow-700 dark:text-yellow-300 hover:underline font-semibold" onClick={async () => {
              if (auth?.currentUser) {
                try {
                  await sendEmailVerification(auth.currentUser);
                  toast({ title: t.verificationEmailResent, description: t.checkYourEmail});
                } catch (error) {
                  toast({ variant: "destructive", title: t.errorOccurred, description: t.errorResendingVerificationEmail});
                }
              }
            }}>
              {t.resendVerificationEmail}
            </Button>
          </div>
        )}
        {children}
      </main>
      {authUser && <CallNotification />}
    </div>
  );
}
