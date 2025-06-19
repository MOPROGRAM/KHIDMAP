
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Briefcase, Search, History, LogOut, Settings, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase'; // auth can be undefined
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

type UserRole = 'provider' | 'seeker';

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


  useEffect(() => {
    if (!auth || !db) {
      console.warn("Firebase Auth or DB is not initialized. Dashboard layout may not function correctly.");
      setIsLoading(false);
      // If auth is critical for dashboard, redirect to login or show error
      // toast({ variant: "destructive", title: "Configuration Error", description: "Core services are unavailable." });
      // router.replace('/auth/login'); // Potentially too aggressive, depends on app logic
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        const roleFromStorage = localStorage.getItem('userRole') as UserRole | null;
        if (roleFromStorage) {
            setUserRole(roleFromStorage);
        }

        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const roleFromFirestore = userData.role as UserRole;
            setUserRole(roleFromFirestore);
            localStorage.setItem('userRole', roleFromFirestore);
            localStorage.setItem('userName', userData.name || user.displayName || '');
            localStorage.setItem('userEmail', userData.email || user.email || '');
          } else {
            console.warn("User profile not found in Firestore for UID:", user.uid, ". Redirecting to login.");
            if(auth) await signOut(auth); 
            router.replace('/auth/login');
            return; 
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          setUserRole(null); 
          // Potentially redirect if role is critical and fetch failed
          // toast({ variant: "destructive", title: "Error", description: "Failed to fetch user details." });
        }
      } else {
        setAuthUser(null);
        setUserRole(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        router.replace('/auth/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);


  const navItems: NavItem[] = [
    { href: '/dashboard', labelKey: 'dashboard', icon: <Home className="h-5 w-5" />, roles: ['provider', 'seeker'] },
    { href: '/dashboard/provider/profile', labelKey: 'profile', icon: <User className="h-5 w-5" />, roles: ['provider'] },
    { href: '/dashboard/provider/ads', labelKey: 'myAds', icon: <Briefcase className="h-5 w-5" />, roles: ['provider'] },
    { href: '/dashboard/provider/ads/new', labelKey: 'newAd', icon: <PlusCircle className="h-5 w-5" />, roles: ['provider'] },
    { href: '/services/search', labelKey: 'search', icon: <Search className="h-5 w-5" />, roles: ['seeker'] },
    { href: '/dashboard/seeker/history', labelKey: 'searchHistory', icon: <History className="h-5 w-5" />, roles: ['seeker'] },
  ];
  
  const handleLogout = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Error", description: "Authentication service is unavailable." });
      return;
    }
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out from dashboard: ", error);
      toast({ variant: "destructive", title: "Logout Failed", description: (error as Error).message });
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
  
  if (!auth && !isLoading) { // If auth is definitely not available after initial check
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Service Unavailable</h1>
        <p className="text-muted-foreground mb-6">Core authentication services are not configured. Please contact support.</p>
        <Button onClick={() => router.push('/')}>Go to Homepage</Button>
      </div>
    );
  }

  if (!authUser && !isLoading) { // Should be redirected by onAuthStateChanged, but as a fallback
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  const filteredNavItems = userRole ? navItems.filter(item => item.roles.includes(userRole)) : navItems.filter(item => item.href === '/dashboard');

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <aside className="w-64 border-r bg-background p-4 space-y-4 hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="px-2 py-1">
          <Logo />
        </div>
        <Separator />
        <nav className="flex-grow space-y-1">
          {filteredNavItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                {React.cloneElement(item.icon, { className: cn("ltr:mr-2 rtl:ml-2 h-5 w-5", pathname === item.href ? "text-primary" : "") })}
                {t[item.labelKey]}
              </Link>
            </Button>
          ))}
           {!userRole && authUser && ( 
            <p className="text-xs text-muted-foreground p-2">Verifying user role... Some links may be hidden temporarily.</p>
          )}
        </nav>
        <Separator />
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
          {t.logout}
        </Button>
      </aside>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
