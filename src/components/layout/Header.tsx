
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import Logo from '@/components/shared/Logo';
import { useTranslation } from '@/hooks/useTranslation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogIn, UserPlus } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Mock authentication state
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // Replace with actual auth check if available
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);
  return { isAuthenticated };
};


export default function Header() {
  const t = useTranslation();
  const { isAuthenticated } = useAuth(); // Mock auth
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/services/search', label: t.services },
  ];

  const authLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: t.dashboard, icon: <UserCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> },
        { href: '/logout', label: t.logout, icon: <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> }, // Mock logout, should be an action
      ]
    : [
        { href: '/auth/login', label: t.login, icon: <LogIn className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> },
        { href: '/auth/register', label: t.register, icon: <UserPlus className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> },
      ];

  const allLinks = [...navLinks, ...authLinks];


  const NavLinkItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Button key={link.href} variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
          <Link href={link.href} onClick={() => mobile && setIsMobileMenuOpen(false)}>{link.label}</Link>
        </Button>
      ))}
      {isAuthenticated ? (
        <>
          <Button variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
            <Link href="/dashboard" onClick={() => mobile && setIsMobileMenuOpen(false)}>{t.dashboard}</Link>
          </Button>
          <Button variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
            {/* This should be an action, not a link for real logout */}
            <Link href="/auth/login" onClick={() => { 
              localStorage.removeItem('isLoggedIn');
              if (mobile) setIsMobileMenuOpen(false);
              // For a real app, you'd redirect or call an API endpoint
              window.location.href = '/auth/login';
            }}>{t.logout}</Link>
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild className={mobile ? "w-full justify-start" : ""}>
            <Link href="/auth/login" onClick={() => mobile && setIsMobileMenuOpen(false)}>{t.login}</Link>
          </Button>
          <Button variant="default" asChild className={mobile ? "w-full" : ""}>
            <Link href="/auth/register" onClick={() => mobile && setIsMobileMenuOpen(false)}>{t.register}</Link>
          </Button>
        </>
      )}
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-2 md:flex">
          <NavLinkItems />
          <LanguageSwitcher />
          <ThemeSwitcher />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
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
              <nav className="flex flex-col gap-4">
                <NavLinkItems mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
