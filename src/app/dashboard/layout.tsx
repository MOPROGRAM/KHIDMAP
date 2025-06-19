
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
import { auth, db } from '@/lib/firebase'; // Import db
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

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
  
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        // Attempt to get role from localStorage first for quicker UI update
        const roleFromStorage = localStorage.getItem('userRole') as UserRole | null;
        if (roleFromStorage) {
            setUserRole(roleFromStorage);
        }

        // Fetch user role from Firestore to ensure accuracy and update localStorage
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const roleFromFirestore = userData.role as UserRole;
            setUserRole(roleFromFirestore);
            localStorage.setItem('userRole', roleFromFirestore); // Update localStorage with Firestore data
            localStorage.setItem('userName', userData.name || user.displayName || '');
            localStorage.setItem('userEmail', userData.email || user.email || '');
          } else {
            console.warn("User profile not found in Firestore for UID:", user.uid, ". Redirecting to login.");
            // If profile doesn't exist, critical data like role is missing.
            // Clear potentially stale local storage and redirect.
            await signOut(auth); // Sign out user as their data is incomplete
            router.replace('/auth/login');
            return; // Stop further processing for this user
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          // Handle error, maybe sign out user or set a default state
          setUserRole(null); // Or some error state
          // Potentially redirect if role is critical and fetch failed
        }
      } else {
        setAuthUser(null);
        setUserRole(null);
        // Clear localStorage on logout
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
  }, [router]);


  const navItems: NavItem[] = [
    { href: '/dashboard', labelKey: 'dashboard', icon: <Home className="h-5 w-5" />, roles: ['provider', 'seeker'] },
    { href: '/dashboard/provider/profile', labelKey: 'profile', icon: <User className="h-5 w-5" />, roles: ['provider'] },
    { href: '/dashboard/provider/ads', labelKey: 'myAds', icon: <Briefcase className="h-5 w-5" />, roles: ['provider'] },
    { href: '/dashboard/provider/ads/new', labelKey: 'newAd', icon: <PlusCircle className="h-5 w-5" />, roles: ['provider'] },
    { href: '/services/search', labelKey: 'search', icon: <Search className="h-5 w-5" />, roles: ['seeker'] },
    { href: '/dashboard/seeker/history', labelKey: 'searchHistory', icon: <History className="h-5 w-5" />, roles: ['seeker'] },
  ];
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // localStorage items are cleared by the onAuthStateChanged listener above
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out from dashboard: ", error);
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
  
  if (!authUser) {
    // This case should ideally be handled by the redirect in onAuthStateChanged
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
           {!userRole && authUser && ( // Show if user is authenticated but role is still being fetched or missing
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
