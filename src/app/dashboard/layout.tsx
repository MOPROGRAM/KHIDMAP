
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Briefcase, Search, History, LogOut, Settings, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import { Separator } from '@/components/ui/separator';

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
  const [userRole, setUserRole] = useState<'provider' | 'seeker' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const role = localStorage.getItem('userRole') as 'provider' | 'seeker' | null;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        router.replace('/auth/login');
    } else {
        setUserRole(role);
    }
  }, [router]);


  const navItems: NavItem[] = [
    { href: '/dashboard', labelKey: 'dashboard', icon: <Home className="h-5 w-5" />, roles: ['provider', 'seeker'] },
    { href: '/dashboard/provider/profile', labelKey: 'profile', icon: <User className="h-5 w-5" />, roles: ['provider'] },
    { href: '/dashboard/provider/ads', labelKey: 'myAds', icon: <Briefcase className="h-5 w-5" />, roles: ['provider'] },
    { href: '/dashboard/provider/ads/new', labelKey: 'newAd', icon: <PlusCircle className="h-5 w-5" />, roles: ['provider'] },
    { href: '/services/search', labelKey: 'search', icon: <Search className="h-5 w-5" />, roles: ['seeker'] },
    { href: '/dashboard/seeker/history', labelKey: 'searchHistory', icon: <History className="h-5 w-5" />, roles: ['seeker'] },
    // { href: '/dashboard/settings', labelKey: 'settings', icon: <Settings className="h-5 w-5" />, roles: ['provider', 'seeker'] }, // Example for settings
  ];
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/auth/login');
  };

  if (!isMounted || !userRole) {
    return <div className="flex h-screen items-center justify-center"><p>{t.loading}</p></div>; // Or a proper loading skeleton
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

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
