
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Layers } from 'lucide-react';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
      <Layers className="h-7 w-7" />
      <span className="font-headline font-semibold">{t.appName}</span>
    </Link>
  );
};

export default Logo;
