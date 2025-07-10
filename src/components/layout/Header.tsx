
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { CurrencySwitcher } from '@/components/shared/CurrencySwitcher';
import Logo from '@/components/shared/Logo';
import { useTranslation } from '@/hooks/useTranslation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogIn, UserPlus, LogOutIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

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
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if(user) {
        localStorage.setItem('isLoggedIn', 'true'); 
      } else {
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
    setIsMobileMenuOpen(false);
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
    { href: '/dashboard', label: t.dashboard, auth: true },
  ];

  const AuthButtons = () => (
    <>
      {authUser ? (
        <Button variant="ghost" onClick={handleLogout}>
          <LogOutIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {t.logout}
        </Button>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/login">{t.login}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">{t.register}</Link>
          </Button>
        </>
      )}
    </>
  );

  const NavLinkItems = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => {
        if (link.auth && !authUser) return null;
        return (
          <Button key={link.href} variant="ghost" asChild className={cn(isMobile && "w-full justify-start text-lg py-6")}>
            <Link href={link.href} onClick={() => isMobile && setIsMobileMenuOpen(false)}>{link.label}</Link>
          </Button>
        )
      })}
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-2 md:flex">
              <NavLinkItems />
            </nav>
        </div>
        
        <div className="hidden items-center gap-2 md:flex">
            <AuthButtons/>
            <CurrencySwitcher />
            <LanguageSwitcher />
            <ThemeSwitcher />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeSwitcher />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-4">
               <div className="flex flex-col h-full">
                <div className="mb-6">
                    <Logo />
                </div>
                <nav className="flex flex-col gap-2 flex-grow">
                    <NavLinkItems isMobile={true}/>
                </nav>
                <div className="flex flex-col gap-2 border-t pt-4">
                    {authUser ? (
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg py-6">
                            <LogOutIcon className="ltr:mr-2 rtl:ml-2 h-5 w-5" /> {t.logout}
                        </Button>
                        ) : (
                        <>
                            <Button variant="ghost" asChild className="w-full justify-start text-lg py-6">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}><LogIn className="h-5 w-5 ltr:mr-2 rtl:ml-2"/>{t.login}</Link>
                            </Button>
                            <Button asChild className="w-full text-lg py-6">
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}><UserPlus className="h-5 w-5 ltr:mr-2 rtl:ml-2"/>{t.register}</Link>
                            </Button>
                        </>
                    )}
                     <div className="flex justify-around items-center pt-4">
                        <CurrencySwitcher />
                        <LanguageSwitcher />
                    </div>
                </div>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
