
"use client";

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

// This component ensures that language and theme are applied client-side
// after initial hydration to prevent mismatches.
export default function AppInitializer() {
  const { language, theme, isMounted } = useSettings();

  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [language, theme, isMounted]);

  return null; // This component doesn't render anything
}
