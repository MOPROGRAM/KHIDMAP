"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="inline-flex flex-col items-start transition-transform duration-200 ease-in-out group-hover:scale-105">
        <h1 className="text-lg font-extrabold font-headline tracking-tighter text-foreground leading-none">
            {t.appName}
        </h1>
        <span className="w-full h-[1px] bg-primary"></span>
      </div>
    </Link>
  );
};

export default Logo;
