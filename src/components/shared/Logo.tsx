"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="relative inline-block transition-transform duration-200 ease-in-out group-hover:scale-105">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-foreground leading-none">
          {t.appName}
        </h1>
        <span className="absolute bottom-0 left-0 w-full h-1 bg-primary"></span>
      </div>
    </Link>
  );
};

export default Logo;
