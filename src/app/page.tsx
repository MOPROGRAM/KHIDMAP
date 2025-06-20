"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ArrowRight, Wrench, Zap, Hammer, Brush, SprayCan, HardHat, Layers, GripVertical } from 'lucide-react';
import NextImage from 'next/image';
import React from 'react';

export default function HomePage() {
  const t = useTranslation();

  const serviceCards = [
    { icon: <Wrench />, titleKey: 'plumbing', descriptionKey: 'plumbingDescription', color: 'text-chart-1' },
    { icon: <Zap />, titleKey: 'electrical', descriptionKey: 'electricalDescription', color: 'text-chart-2' },
    { icon: <Hammer />, titleKey: 'carpentry', descriptionKey: 'carpentryDescription', color: 'text-chart-3' },
    { icon: <Brush />, titleKey: 'painting', descriptionKey: 'paintingDescription', color: 'text-chart-4' },
    { icon: <SprayCan />, titleKey: 'homeCleaning', descriptionKey: 'homeCleaningDescription', color: 'text-chart-5' },
    { icon: <HardHat />, titleKey: 'construction', descriptionKey: 'constructionDescription', color: 'text-chart-1' },
    { icon: <Layers />, titleKey: 'plastering', descriptionKey: 'plasteringDescription', color: 'text-chart-2' },
    { icon: <GripVertical />, titleKey: 'other', descriptionKey: 'otherServicesDescription', color: 'text-chart-3' },
  ];
  
  const renderServiceCard = (service: any, index: number) => (
    <li 
        key={index} 
        className="flex-shrink-0 w-[280px] h-auto flex flex-col items-start text-left p-4 rounded-xl border bg-card/80 backdrop-blur-sm transition-all"
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 mb-3">
        {React.cloneElement(service.icon, { className: `h-6 w-6 ${service.color}` })}
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{t[service.titleKey as keyof Translations]}</h3>
      <p className="text-xs text-muted-foreground">{t[service.descriptionKey as keyof Translations]}</p>
    </li>
  );

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      
      {/* Hero Section */}
      <section 
        className="w-full flex flex-col items-center text-center pt-3 pb-2 md:pt-5 md:pb-4 space-y-3"
      >
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter">
                <div
                  className="
                    inline-block p-0.5 rounded-lg
                    bg-[linear-gradient(to_bottom,hsl(var(--accent)),hsl(var(--primary)))]
                  "
                >
                  <div className="bg-background rounded-md px-4 py-2 text-foreground">
                    {t.appName}
                  </div>
                </div>
            </h1>
        </div>
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                {t.findSkilledArtisans} {t.orPostYourServices}
            </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            <Button size="lg" asChild className="text-sm px-6">
                <Link href="/services/search">
                  {t.browseServices}
                  <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-sm px-6">
                <Link href="/auth/register">
                  {t.register}
                </Link>
            </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-1 md:py-2">
        <div className="animate-fade-in-up text-center mb-3" style={{ animationFillMode: 'backwards' }}>
            <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground tracking-tighter">
                {t.services}
            </h2>
        </div>
        <div className="w-full overflow-x-auto pb-4 group" >
            <ul className="flex flex-nowrap items-stretch justify-start gap-4 px-8 md:px-16">
                {serviceCards.map((service, index) => renderServiceCard(service, index))}
            </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-muted/50 py-2.5">
          <div className="container max-w-4xl px-4 text-center">
            <div className="animate-fade-in-up text-center space-y-1.5" style={{ animationFillMode: 'backwards' }}>
              <h2 className="text-xl md:text-2xl font-bold tracking-tighter">{t.joinAsProvider}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{t.orPostYourServices}</p>
              <Button asChild size="lg" className="text-sm px-6">
                <Link href="/auth/register?role=provider">
                    {t.register}
                    <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
      </section>
    </div>
  );
}
