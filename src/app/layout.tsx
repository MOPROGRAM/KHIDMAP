
import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from '@/contexts/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import AppInitializer from '@/components/AppInitializer';
import BackgroundShapes from '@/components/shared/BackgroundShapes';

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Khidmap | Your Business Solution',
  description: 'Better Solutions For Your Business',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="!scroll-smooth">
      <head>
      </head>
      <body className={`flex flex-col min-h-screen ${tajawal.variable} font-sans`}>
        <SessionProvider>
          <SettingsProvider>
            <AppInitializer />
            <BackgroundShapes />
            <Header />
            <main className="flex-grow container mx-auto px-4 relative z-10">
              {children}
            </main>
            <Footer />
            <Toaster />
          </SettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
