
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { CurrencySwitcher } from '@/components/shared/CurrencySwitcher';
import Logo from '@/components/shared/Logo';
import { useTranslation } from '@/hooks/useTranslation';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, UserCircle, LogIn, UserPlus, LogOutIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase'; // auth can be undefined
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not initialized. User authentication will not work.");
      setIsLoading(false);
      // Optionally, show a global error to the user if auth is critical for the app
      // toast({ variant: "destructive", title: "Configuration Error", description: "Authentication service is unavailable." });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        localStorage.setItem('isLoggedIn', 'true'); 
      } else {
        setAuthUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    if (!auth) {
      toast({ variant: "destructive", title: t.errorOccurred, description: t.authServiceUnavailable });
      return;
    }
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: "destructive", title: t.logoutFailed, description: (error as Error).message });
    }
  };

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/services/search', label: t.services },
  ];

  const NavLinkItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Button key={link.href} variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
          <Link href={link.href} onClick={() => mobile && setIsMobileMenuOpen(false)}>{link.label}</Link>
        </Button>
      ))}
      {authUser ? (
        <>
          <Button variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
            <Link href="/dashboard" onClick={() => mobile && setIsMobileMenuOpen(false)}>
             <UserCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t.dashboard}
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className={mobile ? "w-full justify-start" : ""}>
            <LogOutIcon className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t.logout}
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
            <Link href="/login" onClick={() => mobile && setIsMobileMenuOpen(false)}>
              <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.login}
            </Link>
          </Button>
          <Button variant="default" asChild className={mobile ? "w-full" : ""}>
            <Link href="/register" onClick={() => mobile && setIsMobileMenuOpen(false)}>
              <UserPlus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.register}
            </Link>
          </Button>
        </>
      )}
    </>
  );

  if (isLoading && !auth) { // Show basic header if auth is not even defined
     return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <CurrencySwitcher />
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <NavLinkItems />
          <CurrencySwitcher />
          <LanguageSwitcher />
          <ThemeSwitcher />
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{t.toggleNavigationMenu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-6">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="sr-only">{t.dashboardMenu}</SheetTitle>
                <SheetDescription className="sr-only">{t.dashboardMenuDesc}</SheetDescription>
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                <NavLinkItems mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}