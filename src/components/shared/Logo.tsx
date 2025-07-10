
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary relative">
        {t.appName}
        <span className="absolute -bottom-1 left-0 w-8 h-1 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </div>
    </Link>
  );
};

export default Logo;
