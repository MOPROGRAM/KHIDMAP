
"use client";

import { Button } from '@/components/ui/button';
import { useSettings, Currency } from '@/contexts/SettingsContext';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { CircleDollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useSettings();
  const t = useTranslation();

  const currencies: { code: Currency; labelKey: keyof Translations }[] = [
    { code: 'USD', labelKey: 'USD' },
    { code: 'SAR', labelKey: 'SAR' },
    { code: 'EGP', labelKey: 'EGP' },
    { code: 'AED', labelKey: 'AED' },
    { code: 'QAR', labelKey: 'QAR' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.currency}>
          <CircleDollarSign className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            disabled={currency === c.code}
          >
            {t[c.labelKey]} ({c.code})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
