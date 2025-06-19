
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
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useTranslation>;
  icon: React.ReactElement;
  roles: ('provider' | 'seeker')[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'provider' | 'seeker' | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        const roleFromStorage = localStorage.getItem('userRole') as 'provider' | 'seeker' | null;
        setUserRole(roleFromStorage); // Still relying on localStorage for role initially
        // TODO: Fetch role from Firestore in the future
        if (!roleFromStorage) {
            // If role isn't in localStorage (e.g. direct navigation after login),
            // this is a temporary issue. A proper solution involves fetching role from DB.
            console.warn("User role not found in localStorage. Dashboard may not display correctly.");
            // For now, we might redirect or show a limited view.
        }
      } else {
        setAuthUser(null);
        setUserRole(null);
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
      // localStorage items are cleared by the onAuthStateChanged listener in Header/elsewhere
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
     // This case should ideally be handled by the redirect in onAuthStateChanged,
     // but as a fallback:
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  // If authUser exists but role is still null, it means localStorage didn't have it.
  // This is a temporary state until Firestore role fetching is implemented.
  // For now, we allow access but some role-specific UI might not render correctly.
  const filteredNavItems = userRole ? navItems.filter(item => item.roles.includes(userRole)) : navItems.filter(item => item.href === '/dashboard'); // Show only dashboard link if role is unknown

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
           {!userRole && (
            <p className="text-xs text-muted-foreground p-2">Role information pending. Some links may be hidden.</p>
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
