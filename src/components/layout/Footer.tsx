
"use client";

import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';
import { ADMIN_EMAIL } from '@/lib/config';

export default function Footer() {
  const t = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo />
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <p>
              &copy; {currentYear} {t.appName}. {t.tagline}.
            </p>
            <a href={`mailto:${ADMIN_EMAIL}?subject=Inquiry from ${t.appName} Website`} className="hover:text-primary transition-colors">
              {t.contactUs}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
