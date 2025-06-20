
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ArrowRight, Wrench, Zap, Hammer, Brush, SprayCan, HardHat, Layers, GripVertical } from 'lucide-react';
import NextImage from 'next/image';

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
  
  const renderServiceCard = (service: any, index: number) => (
    <li 
        key={index} 
        className="flex-shrink-0 w-[300px] h-[220px] flex flex-col items-start text-left p-6 rounded-2xl border bg-card/80 backdrop-blur-sm transition-all"
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-5">
        {service.icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{t[service.titleKey as keyof Translations]}</h3>
      <p className="text-sm text-muted-foreground">{t[service.descriptionKey as keyof Translations]}</p>
    </li>
  );

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      
      {/* Hero Section */}
      <section 
        className="w-full flex flex-col items-center text-center pt-24 pb-20 md:pt-40 md:pb-32 space-y-6"
      >
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
            <h1 className="text-5xl md:text-7xl font-bold font-headline text-foreground tracking-tighter">
                {t.appName}
            </h1>
        </div>
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.findSkilledArtisans} {t.orPostYourServices}
            </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            <Button size="lg" asChild className="text-base px-8">
                <Link href="/services/search">
                  {t.browseServices}
                  <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="/auth/register">
                  {t.register}
                </Link>
            </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-24 md:py-32">
        <div className="animate-fade-in-up text-center" style={{ animationFillMode: 'backwards' }}>
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-16 text-foreground tracking-tighter">
                {t.services}
            </h2>
        </div>
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start animate-scroll [animation-play-state:running] hover:[animation-play-state:paused] gap-8">
                {[...serviceCards, ...serviceCards].map((service, index) => renderServiceCard(service, index))}
            </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-muted/50 py-24">
          <div className="container max-w-4xl px-4 text-center">
            <div className="animate-fade-in-up text-center" style={{ animationFillMode: 'backwards' }}>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">{t.joinAsProvider}</h2>
              <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">{t.orPostYourServices}</p>
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/auth/register?role=provider">
                    {t.register}
                    <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
      </section>
    </div>
  );
}
