
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Search, History, LogOut, Settings, MessageSquare, Loader2, ShieldCheck, AlertTriangle, ServerCrash, Briefcase, DollarSign, Menu, Mail, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged, signOut, User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from '@/lib/config';
import CallNotification from '@/components/chat/CallNotification';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import NotificationBell from '@/components/layout/NotificationBell';

type UserRole = 'provider' | 'seeker' | 'admin';

interface NavItem {
  href: string;
  labelKey: keyof Translations;
  icon: React.ReactElement;
  roles: UserRole[];
}

const NavContent = ({
  navItems,
  pathname,
  t,
  isMobile = false,
  closeSheet,
}: {
  navItems: NavItem[],
  pathname: string,
  t: Translations,
  isMobile?: boolean,
  closeSheet?: () => void,
}) => (
  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => isMobile && closeSheet?.()}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') && "bg-muted text-primary"
        )}
      >
        {React.cloneElement(item.icon, { className: 'h-4 w-4' })}
        {t[item.labelKey]}
      </Link>
    ))}
  </nav>
);


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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              // Handle case where user is authenticated but has no firestore doc
              // This can happen for admin user if they don't have a regular user profile
              if (user.email === ADMIN_EMAIL) {
                setUserRole('admin');
                localStorage.setItem('userRole', 'admin');
              } else {
                console.warn("User profile not found in Firestore for UID:", user.uid, ". Logging you out.");
                toast({ variant: "destructive", title: t.profileNotFoundTitle, description: t.profileNotFoundDescription });
                if(auth) await signOut(auth); 
              }
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
    { href: '/dashboard/orders', labelKey: 'myOrders', icon: <Briefcase className="h-5 w-5" />, roles: ['provider', 'seeker'] },
    { href: '/dashboard/messages', labelKey: 'messages', icon: <MessageSquare className="h-5 w-5" />, roles: ['provider', 'seeker'] },
    { href: '/dashboard/provider/profile', labelKey: 'profile', icon: <User className="h-5 w-5" />, roles: ['provider'] },
    { href: '/services/search', labelKey: 'search', icon: <Search className="h-5 w-5" />, roles: ['seeker', 'provider'] },
    { href: '/dashboard/seeker/history', labelKey: 'searchHistory', icon: <History className="h-5 w-5" />, roles: ['seeker'] },
    { href: '/dashboard/settings', labelKey: 'settings', icon: <Settings className="h-5 w-5" />, roles: ['provider', 'seeker', 'admin'] },
    { href: '/contact', labelKey: 'contactSupport', icon: <Mail className="h-5 w-5" />, roles: ['provider', 'seeker', 'admin'] },
    { href: '/admin/dashboard', labelKey: 'adminDashboard', icon: <ShieldCheck className="h-5 w-5" />, roles: ['admin'] },
    { href: '/admin/payments', labelKey: 'paymentApprovals', icon: <DollarSign className="h-5 w-5" />, roles: ['admin'] },
    { href: '/admin/ads', labelKey: 'adRequests', icon: <Megaphone className="h-5 w-5" />, roles: ['admin'] },
  ];
  
  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
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
  
  const filteredNavItems = userRole ? navItems.filter(item => item.roles.includes(userRole)) : [];
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-background md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Logo />
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <NavContent navItems={filteredNavItems} pathname={pathname} t={t} closeSheet={closeMobileMenu}/>
                </div>
                <div className="mt-auto p-4">
                     <Separator className="my-2"/>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                        {t.logout}
                    </Button>
                </div>
            </div>
        </div>
        <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0">
                         <SheetHeader className="p-4">
                           <SheetTitle>Dashboard Menu</SheetTitle>
                           <SheetDescription>Main navigation links for the dashboard.</SheetDescription>
                        </SheetHeader>
                        <div className="flex h-14 shrink-0 items-center border-b px-4 lg:h-[60px] lg:px-6">
                             <Logo />
                        </div>
                        <div className="flex-1 overflow-auto py-2">
                          <NavContent navItems={filteredNavItems} pathname={pathname} t={t} isMobile={true} closeSheet={closeMobileMenu} />
                        </div>
                        <div className="mt-auto p-4 border-t">
                            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                                <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                {t.logout}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                 <div className="w-full flex-1">
                    {/* Optionally, a search bar can go here */}
                 </div>
                 <div className="flex items-center gap-2">
                    {authUser && <NotificationBell user={authUser} />}
                 </div>
            </header>
            <main className="flex flex-1 flex-col overflow-hidden">
                 {authUser && !isEmailVerified && (
                    <div className="shrink-0 p-3 m-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600 rounded-md shadow">
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
                <div className={cn(
                    "flex-1",
                    isMessagesPage ? "flex flex-col overflow-hidden" : "overflow-y-auto p-2 md:p-4"
                )}>
                    {children}
                </div>
            </main>
        </div>
        {authUser && <CallNotification />}
    </div>
  );
}
