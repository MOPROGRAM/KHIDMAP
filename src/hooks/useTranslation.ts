
"use client";

import { useSettings } from '@/contexts/SettingsContext';
import { translations, Translations } from '@/lib/translations';

export const useTranslation = (): Translations => {
  const { language } = useSettings();
  return translations[language];
};
