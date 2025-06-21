"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="relative inline-block transition-transform duration-200 ease-in-out group-hover:scale-105">
        <h1 className="text-xl font-extrabold tracking-tighter text-foreground">
          {t.appName}
        </h1>
        <div className="absolute bottom-1 left-0 h-[3px] w-full bg-primary"></div>
      </div>
    </Link>
  );
};

export default Logo;
