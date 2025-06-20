
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Logo />
            <p>&copy; {currentYear} {t.appName}.</p>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/services/search" className="hover:text-primary transition-colors">{t.services}</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">{t.contactUs}</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">{t.dashboard}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
