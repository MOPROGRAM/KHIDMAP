"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="inline-block" aria-label="Homepage Logo">
      <div 
        className="
          flex items-center justify-center 
          px-4 py-2 rounded-md
          bg-[linear-gradient(to_bottom,hsl(var(--accent))_50%,hsl(25_95%_45%)_50%)]
          dark:bg-[linear-gradient(to_bottom,hsl(var(--accent))_50%,hsl(25_95%_50%)_50%)]
          text-white 
          font-headline font-bold text-2xl
          transition-transform duration-200 ease-in-out hover:scale-105 shadow-sm
        "
      >
        <span>{t.appName}</span>
      </div>
    </Link>
  );
};

export default Logo;
