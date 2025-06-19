
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Building2 } from 'lucide-react';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
      <Building2 className="h-8 w-8" />
      <span className="font-headline">{t.appName}</span>
    </Link>
  );
};

export default Logo;
