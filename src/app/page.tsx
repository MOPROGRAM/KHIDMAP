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
  
  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      
      {/* Hero Section */}
      <section 
        className="w-full flex flex-col items-center text-center pt-24 pb-20 md:pt-40 md:pb-32 space-y-8"
      >
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
            <h1 className="text-5xl md:text-8xl font-bold font-headline text-foreground tracking-tighter">
                {t.appName}
            </h1>
        </div>
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.tagline} {t.orPostYourServices}
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

      {/* Visual Element */}
      <div 
        className="w-full max-w-6xl px-4 animate-fade-in-up" 
        style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
      >
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
              <NextImage
                  src="https://placehold.co/1200x600.png"
                  alt="Abstract services visual"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="abstract geometric blue"
              />
          </div>
      </div>

      {/* Services Section */}
      <section className="w-full max-w-6xl px-4 py-24 md:py-32">
        <div className="animate-fade-in-up" style={{ animationFillMode: 'backwards' }}>
            <h2 className="text-4xl md:text-6xl font-bold font-headline mb-16 text-foreground text-center tracking-tighter">
                {t.services}
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceCards.map((service, index) => (
            <div 
                key={index} 
                className="flex flex-col items-start text-left animate-fade-in-up p-6 rounded-3xl border border-transparent hover:border-border hover:bg-card/50 transition-all"
                style={{ animationDelay: `${0.2 + index * 0.05}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-5">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t[service.titleKey as keyof Translations]}</h3>
              <p className="text-muted-foreground text-base">{t[service.descriptionKey as keyof Translations]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-muted/50 py-24">
          <div className="container max-w-4xl px-4 text-center">
            <div className="animate-fade-in-up" style={{ animationFillMode: 'backwards' }}>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">{t.joinAsProvider}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t.orPostYourServices}</p>
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
