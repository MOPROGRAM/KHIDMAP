
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Layers } from 'lucide-react';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors">
      <Layers className="h-6 w-6 text-primary" />
      <span className="font-headline font-bold">{t.appName}</span>
    </Link>
  );
};

export default Logo;
