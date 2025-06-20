
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="inline-block" aria-label="Homepage Logo">
      <span className="font-headline font-extrabold text-2xl text-foreground transition-transform duration-200 ease-in-out hover:scale-105 block">
        {t.appName}
      </span>
    </Link>
  );
};

export default Logo;
