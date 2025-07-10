
"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Caveat } from 'next/font/google'
import { cn } from '@/lib/utils';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-logo',
})

const Logo = () => {
  const t = useTranslation();

  return (
    <Link href="/" className="group inline-block" aria-label="Homepage Logo">
      <div className={cn(
        "text-3xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary",
        caveat.variable
      )} style={{ fontFamily: 'var(--font-logo), var(--font-sans)' }}>
        {t.appName}
      </div>
    </Link>
  );
};

export default Logo;
