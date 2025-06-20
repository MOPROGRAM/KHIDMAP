"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();
  return (
    <Link href="/" className="inline-block" aria-label="Homepage Logo">
      <div 
        className="
          inline-block p-0.5 rounded-lg
          bg-[linear-gradient(to_bottom,hsl(var(--accent)),hsl(var(--primary)))]
          transition-transform duration-200 ease-in-out hover:scale-105
        "
      >
        <div className="bg-background rounded-md px-3 py-1.5">
          <span className="font-headline font-bold text-2xl text-foreground">
            {t.appName}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
