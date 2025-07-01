
"use client";

import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} {t.appName}. All rights reserved.
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t.home}</Link>
            <Link href="/services/search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t.services}</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t.contactUs}</Link>
            <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t.howToUse}</Link>
            <Link href="/advertise" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t.advertiseWithUs}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
