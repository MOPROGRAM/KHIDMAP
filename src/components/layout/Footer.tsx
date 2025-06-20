
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {t.appName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
