
"use client";

import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';
import { ADMIN_EMAIL } from '@/lib/config';
import { Separator } from '../ui/separator';

export default function Footer() {
  const t = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <Logo />
          </div>
          
          <nav className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">{t.home}</Link>
            <Link href="/services/search" className="hover:text-primary transition-colors">{t.services}</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">{t.contactUs}</Link>
          </nav>

          <div className="text-center md:text-right text-sm text-muted-foreground">
            <p>
              &copy; {currentYear} {t.appName}. {t.tagline}.
            </p>
            <a href={`mailto:${ADMIN_EMAIL}?subject=Inquiry from ${t.appName} Website`} className="hover:text-primary transition-colors block mt-1">
              {ADMIN_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

    