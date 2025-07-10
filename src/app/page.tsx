
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Wrench, Zap, Hammer } from 'lucide-react';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const serviceCards = [
    { icon: <Wrench />, titleKey: 'plumbing', descriptionKey: 'plumbingDescription' },
    { icon: <Zap />, titleKey: 'electrical', descriptionKey: 'electricalDescription' },
    { icon: <Hammer />, titleKey: 'carpentry', descriptionKey: 'carpentryDescription' },
];

export default function HomePage() {
  const t = useTranslation();

  return (
    <div className="flex flex-col items-center py-8 md:py-12 space-y-12 md:space-y-16">

      {/* Hero Section */}
      <section className="text-center w-full">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{t.appName}</h1>
        <div className="w-24 h-1.5 bg-primary mx-auto my-4 rounded-full"></div>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          {t.findSkilledArtisans} {t.orPostYourServices}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/services/search">{t.browseServices} <ArrowRight className="ml-2 h-5 w-5"/></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">{t.register}</Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-8">{t.services}</h2>
        <div className="relative">
          <div className="flex space-x-8 overflow-x-auto pb-4 no-scrollbar">
            {serviceCards.map((card, index) => (
              <Card key={index} className="flex-shrink-0 w-72 text-center hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                    {React.cloneElement(card.icon, { className: "h-8 w-8" })}
                  </div>
                  <CardTitle>{t[card.titleKey as keyof Translations]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{t[card.descriptionKey as keyof Translations]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Advertisement Placeholder Section */}
      <section className="w-full max-w-4xl px-4">
        <Card className="bg-card shadow-md">
            <CardHeader>
                <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{t.advertisement}</div>
                <CardTitle>{t.adPlaceholderTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t.adPlaceholderDescription}</p>
            </CardContent>
            <CardContent>
                 <Button asChild variant="outline">
                    <Link href="/dashboard/provider/ads/new">{t.advertiseWithUs}</Link>
                </Button>
            </CardContent>
        </Card>
      </section>

      {/* Join as a Provider Section */}
      <section className="text-center w-full max-w-4xl">
        <h2 className="text-3xl font-bold">{t.joinAsProvider}</h2>
        <p className="max-w-xl mx-auto text-muted-foreground mt-2 mb-6">
          {t.orPostYourServices}
        </p>
        <Button size="lg" variant="default" asChild>
          <Link href="/register?role=provider">{t.register} <ArrowRight className="ml-2 h-5 w-5"/></Link>
        </Button>
      </section>

    </div>
  );
}
