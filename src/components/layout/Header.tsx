
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import Logo from '@/components/shared/Logo';
import { useTranslation } from '@/hooks/useTranslation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogIn, UserPlus, LogOutIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const t = useTranslation();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        localStorage.setItem('isLoggedIn', 'true'); // Keep this for other components that might still use it
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
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error, e.g., show a toast
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
            <Link href="/auth/login" onClick={() => mobile && setIsMobileMenuOpen(false)}>
              <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.login}
            </Link>
          </Button>
          <Button variant="default" asChild className={mobile ? "w-full" : ""}>
            <Link href="/auth/register" onClick={() => mobile && setIsMobileMenuOpen(false)}>
              <UserPlus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />{t.register}
            </Link>
          </Button>
        </>
      )}
    </>
  );

  if (isLoading) {
    // Optional: return a slimmed-down header or a loading indicator
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          {/* Basic controls during load */}
          <div className="flex items-center gap-2">
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
          <LanguageSwitcher />
          <ThemeSwitcher />
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-6">
              <div className="mb-6">
                <Logo />
              </div>
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
