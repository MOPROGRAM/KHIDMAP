
import type { Metadata } from 'next';
import { Tajawal, Caveat } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import AppInitializer from '@/components/AppInitializer';

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-sans',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
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
      <body className={`flex flex-col min-h-screen ${tajawal.variable} ${caveat.variable} font-sans`}>
        <SettingsProvider>
          <AppInitializer />
          <Header />
          <main className="flex-grow container mx-auto px-4">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
