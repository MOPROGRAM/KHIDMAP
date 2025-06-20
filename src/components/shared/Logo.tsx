"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="relative inline-block transition-transform duration-200 ease-in-out group-hover:scale-105">
        <h1 className="text-xl md:text-xl font-extrabold font-headline tracking-tighter text-foreground relative z-10 bg-background leading-[0.8] pb-0 pr-1">
          {t.appName}
        </h1>
        <span className="absolute bottom-[3px] left-0 w-full h-[2px] bg-primary"></span>
      </div>
    </Link>
  );
};

export default Logo;
