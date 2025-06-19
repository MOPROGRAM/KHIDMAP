
"use client";

import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { language, setLanguage } = useSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          disabled={language === 'en'}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ar')}
          disabled={language === 'ar'}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
