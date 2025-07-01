
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';
export type Currency = 'USD' | 'SAR' | 'EGP' | 'AED' | 'QAR';

interface SettingsContextProps {
  language: Language;
  theme: Theme;
  currency: Currency;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: Currency) => void;
  isMounted: boolean;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('light');
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem('language') as Language | null;
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedCurrency = localStorage.getItem('currency') as Currency | null;

    if (storedLang) {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
    } else {
      document.documentElement.lang = 'en';
    }

    if (storedTheme) {
      setThemeState(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }
    
    if (storedCurrency) {
      setCurrencyState(storedCurrency);
    }

  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };
  
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);


  if (!isMounted) {
    return null; // Or a loading spinner, etc.
  }

  return (
    <SettingsContext.Provider value={{ language, theme, currency, setCurrency, toggleLanguage, setLanguage, toggleTheme, setTheme, isMounted }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
