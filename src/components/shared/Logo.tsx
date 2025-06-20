"use client";
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/contexts/SettingsContext';

const Logo = () => {
  const t = useTranslation();
  const { language } = useSettings();

  const animationClass = language === 'ar' ? 'animate-typingAr' : 'animate-typingEn';

  return (
    <Link href="/" className="inline-block" aria-label="Homepage Logo">
      <div 
        className="
          inline-block p-px rounded-lg
          bg-gradient-to-b from-green-500 to-orange-600
          transition-transform duration-200 ease-in-out hover:scale-105
        "
      >
        <div className="bg-background rounded-md px-2 py-1 flex items-center justify-center">
            <span className={`font-headline font-extrabold text-xl text-foreground inline-block overflow-hidden whitespace-nowrap border-r-2 border-r-transparent pr-1 ${animationClass}`}>
              {t.appName}
            </span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
