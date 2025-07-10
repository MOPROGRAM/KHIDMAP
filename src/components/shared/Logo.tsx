
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
        {t.appName}
      </div>
    </Link>
  );
};

export default Logo;
