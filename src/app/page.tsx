
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ArrowRight, Wrench, Zap, Hammer, Brush, SprayCan, HardHat, Layers, GripVertical } from 'lucide-react';
import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const t = useTranslation();
  const { language } = useSettings();

  const serviceCards = [
    { icon: <Wrench />, titleKey: 'plumbing', descriptionKey: 'plumbingDescription', color: 'text-blue-500' },
    { icon: <Zap />, titleKey: 'electrical', descriptionKey: 'electricalDescription', color: 'text-yellow-500' },
    { icon: <Hammer />, titleKey: 'carpentry', descriptionKey: 'carpentryDescription', color: 'text-orange-500' },
    { icon: <Brush />, titleKey: 'painting', descriptionKey: 'paintingDescription', color: 'text-purple-500' },
    { icon: <SprayCan />, titleKey: 'homeCleaning', descriptionKey: 'homeCleaningDescription', color: 'text-green-500' },
    { icon: <HardHat />, titleKey: 'construction', descriptionKey: 'constructionDescription', color: 'text-red-500' },
    { icon: <Layers />, titleKey: 'plastering', descriptionKey: 'plasteringDescription', color: 'text-indigo-500' },
    { icon: <GripVertical />, titleKey: 'other', descriptionKey: 'otherServicesDescription', color: 'text-pink-500' },
  ];
  
  const renderServiceCard = (service: any, index: number) => (
    <Card 
        key={index}
        className="flex-shrink-0 w-[280px] h-full flex flex-col items-start text-left p-4 rounded-xl border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
        style={{ scrollSnapAlign: 'start' }}
    >
      <CardHeader className="p-0 mb-3">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg border-2 border-primary/20 bg-primary/10 mb-3">
          {React.cloneElement(service.icon, { className: `h-6 w-6 ${service.color}` })}
        </div>
        <CardTitle className="text-base font-bold text-foreground">{t[service.titleKey as keyof Translations]}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-sm text-muted-foreground">{t[service.descriptionKey as keyof Translations]}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col items-center">
      
      {/* Hero Section */}
      <section 
        className="w-full flex flex-col items-center text-center pt-16 pb-20 space-y-6"
      >
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
          <div className="relative inline-flex flex-col items-center group">
             <h1 className="relative px-2 text-5xl md:text-6xl font-extrabold tracking-tight text-foreground z-10">
                {t.appName}
            </h1>
             <div className="absolute bottom-1 h-[10px] w-[110%] bg-primary/80 z-0 transition-all duration-300 group-hover:h-[12px]"></div>
          </div>
        </div>
        <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.findSkilledArtisans} {t.orPostYourServices}
            </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            <Button size="lg" asChild>
                <Link href="/services/search">
                  {t.browseServices}
                  <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link href="/register">
                  {t.register}
                </Link>
            </Button>
        </div>
      </section>

      {/* Services Section */}
       <div className="w-full border-t bg-muted/30">
        <section className="w-full container mx-auto py-20 border-x bg-background">
          <div className="animate-fade-in-up text-center mb-12" style={{ animationFillMode: 'backwards' }}>
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground tracking-tighter">
                  {t.services}
              </h2>
          </div>
          <div className="relative w-full overflow-x-auto hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            <ul className="flex flex-nowrap items-stretch justify-start gap-6 px-4 md:px-8 py-4">
                {serviceCards.map((service, index) => renderServiceCard(service, index))}
            </ul>
          </div>
        </section>
      </div>

       {/* Ad Section */}
       <div className="w-full border-t">
        <section className="w-full container mx-auto bg-background py-20 border-x">
          <Card className="max-w-4xl mx-auto p-8 items-center gap-8 bg-accent/10 border-primary/20 shadow-lg text-center">
            <div className="space-y-4">
              <Badge variant="outline">{t.advertisement}</Badge>
              <h3 className="text-2xl font-bold text-foreground">{t.adPlaceholderTitle}</h3>
              <p className="text-muted-foreground">{t.adPlaceholderDescription}</p>
              <Button asChild>
                <Link href="/dashboard/provider/ads/new">{t.advertiseWithUs}</Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>


      {/* CTA Section */}
       <div className="w-full border-t">
        <section className="w-full container mx-auto bg-background py-20 border-x">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="animate-fade-in-up text-center space-y-4" style={{ animationFillMode: 'backwards' }}>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">{t.joinAsProvider}</h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">{t.orPostYourServices}</p>
                <Button asChild size="lg">
                  <Link href="/register?role=provider">
                      {t.register}
                      <ArrowRight className="ltr:ml-2 rtl:ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
        </section>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
