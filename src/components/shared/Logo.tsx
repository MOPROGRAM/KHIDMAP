
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Layers } from 'lucide-react';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
      <Layers className="h-7 w-7" />
      <span className="font-headline font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shine">{t.appName}</span>
    </Link>
  );
};

export default Logo;
