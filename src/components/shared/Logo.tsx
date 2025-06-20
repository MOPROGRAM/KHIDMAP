"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="inline-block" aria-label="Homepage Logo">
      <div 
        className="
          inline-block p-[2px] rounded-lg
          bg-gradient-to-b from-green-500 to-orange-600
          transition-transform duration-200 ease-in-out hover:scale-105
        "
      >
        <div className="bg-background rounded-md">
          <span className="font-headline font-bold text-xl text-foreground">
            {t.appName}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
