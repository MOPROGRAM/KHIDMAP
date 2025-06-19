
"use client";

import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/shared/Logo';

export default function Footer() {
  const t = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {t.appName}. {t.tagline}.
          </p>
        </div>
      </div>
    </footer>
  );
}
