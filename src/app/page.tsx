
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ArrowRight, Search, Wrench, Zap, Hammer, Brush, SprayCan, HardHat, Layers, GripVertical } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const t = useTranslation();

  const serviceCards = [
    { icon: <Wrench className="h-8 w-8 text-primary" />, titleKey: 'plumbing', descriptionKey: 'plumbingDescription' },
    { icon: <Zap className="h-8 w-8 text-primary" />, titleKey: 'electrical', descriptionKey: 'electricalDescription' },
    { icon: <Hammer className="h-8 w-8 text-primary" />, titleKey: 'carpentry', descriptionKey: 'carpentryDescription' },
    { icon: <Brush className="h-8 w-8 text-primary" />, titleKey: 'painting', descriptionKey: 'paintingDescription' },
    { icon: <SprayCan className="h-8 w-8 text-primary" />, titleKey: 'homeCleaning', descriptionKey: 'homeCleaningDescription' },
    { icon: <HardHat className="h-8 w-8 text-primary" />, titleKey: 'construction', descriptionKey: 'constructionDescription' },
    { icon: <Layers className="h-8 w-8 text-primary" />, titleKey: 'plastering', descriptionKey: 'plasteringDescription' },
    { icon: <GripVertical className="h-8 w-8 text-primary" />, titleKey: 'other', descriptionKey: 'otherServicesDescription' },
  ];
  
  return (
    <div className="flex flex-col items-center space-y-20 md:space-y-28 py-12 md:py-24">
      
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center animate-fadeIn">
        <h1 className="text-4xl md:text-7xl font-bold font-headline mb-6 text-foreground tracking-tighter">
            {t.welcomeTo} <span className="text-primary">{t.appName}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t.findSkilledArtisans} {t.orPostYourServices}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild className="text-base">
                <Link href="/services/search">
                  {t.browseServices}
                  <Search className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/auth/register">
                  {t.register}
                  <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </section>
      
      {/* Image Section */}
      <section className="w-full max-w-6xl px-4 animate-fadeIn animation-delay-400">
        <div className="relative aspect-[16/9] w-full">
            <Image 
                src="https://placehold.co/1200x675.png"
                alt="Modern app interface"
                layout="fill"
                objectFit="cover"
                className="rounded-2xl"
                data-ai-hint="abstract graphic"
                priority
            />
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-6xl px-4 animate-fadeIn animation-delay-600">
        <h2 className="text-3xl md:text-5xl font-bold font-headline mb-12 text-foreground text-center tracking-tighter">{t.services}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceCards.map((service, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 font-headline text-foreground">{t[service.titleKey as keyof Translations]}</h3>
              <p className="text-muted-foreground text-sm">
                  {t[service.descriptionKey as keyof Translations]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl px-4 text-center animate-fadeIn animation-delay-800">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">{t.joinAsProvider}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t.orPostYourServices}</p>
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/auth/register?role=provider">{t.register}</Link>
          </Button>
      </section>

      <style jsx global>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        [class*="animation-delay"] {
          animation-fill-mode: backwards;
        }
      `}</style>
    </div>
  );
}
