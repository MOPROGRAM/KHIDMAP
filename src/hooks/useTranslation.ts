
"use client";

import { useSettings } from '@/contexts/SettingsContext';
import { translations, Translations } from '@/lib/translations';

export { type Translations } from '@/lib/translations';

export const useTranslation = () => {
  const { language } = useSettings();
  const t = (key: keyof Translations) => translations[language][key] || key;
  return t;
};
