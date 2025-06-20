
"use client";

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/hooks/useTranslation';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useSettings();
  const t = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? t.switchToDarkMode : t.switchToLightMode}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
