"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ArrowRight, Search, Wrench, Zap, Hammer, Brush, SprayCan, HardHat, Layers, GripVertical, CheckCircle } from 'lucide-react';
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
    <div className="flex flex-col items-center space-y-20 md:space-y-28 py-8 md:py-16">
      
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-4 animate-fadeIn">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-extrabold font-headline mb-6 text-foreground tracking-tight">
                    {t.welcomeTo} <span className="text-primary drop-shadow-sm">{t.appName}</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
                    {t.findSkilledArtisans} {t.orPostYourServices}
                </p>
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                    <Button
                        size="lg"
                        asChild
                        className="animate-slideUp animation-delay-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 group"
                    >
                        <Link href="/services/search">
                        {t.browseServices}
                        <Search className="ltr:ml-2 rtl:mr-2 h-5 w-5 group-hover:animate-pulse-glow" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="animate-slideUp animation-delay-400"
                    >
                        <Link href="/auth/register">
                        {t.getStarted}
                        <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="hidden md:block animate-fadeIn animation-delay-600">
                <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Artisans working"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint="craftsman tools"
                    priority
                />
            </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-6xl px-4 animate-fadeIn animation-delay-1000">
        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-12 text-foreground text-center">{t.services}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCards.map((service, index) => (
            <Card
              key={index}
              className="p-6 text-center bg-card rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-2 group flex flex-col items-center"
            >
                <CardHeader className="p-0 mb-4">
                    {service.icon}
                </CardHeader>
                <CardContent className="p-0">
                    <h3 className="text-xl font-bold mb-2 font-headline text-foreground">{t[service.titleKey as keyof Translations]}</h3>
                    <p className="text-muted-foreground text-sm">
                        {t[service.descriptionKey as keyof Translations]}
                    </p>
                </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl px-4 text-center animate-fadeIn animation-delay-1000">
        <Card className="p-8 md:p-12 bg-primary text-primary-foreground shadow-xl">
          <h2 className="text-3xl font-extrabold mb-4">{t.joinAsProvider}</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">{t.orPostYourServices}</p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg text-lg py-3 px-8 h-auto">
            <Link href="/auth/register?role=provider">{t.register}</Link>
          </Button>
        </Card>
      </section>


      <style jsx global>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1.0s; }
        [class*="animation-delay"] {
          animation-fill-mode: backwards;
        }
      `}</style>
    </div>
  );
}
