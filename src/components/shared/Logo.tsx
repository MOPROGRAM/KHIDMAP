
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="relative inline-block transition-transform duration-200 ease-in-out group-hover:scale-105">
        <span className="font-headline font-extrabold text-2xl text-foreground block pb-1">
          {t.appName}
        </span>
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>
      </div>
    </Link>
  );
};

export default Logo;
