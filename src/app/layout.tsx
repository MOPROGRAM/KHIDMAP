
import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import AppInitializer from '@/components/AppInitializer';

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Khidmap | خدماپ',
  description: 'Find skilled artisans or post your services for plumbing and electrical work.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
      </head>
      <body className={`flex flex-col min-h-screen ${tajawal.variable} font-sans`}>
        <SettingsProvider>
          <AppInitializer />
          <Header />
          <main className="flex-grow container mx-auto px-4 py-4">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
