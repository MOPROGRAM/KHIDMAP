
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { ArrowRight, Search, Wrench, Zap, Hammer, Brush, SprayCan, HardHat, Layers, GripVertical } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const t = useTranslation();

  const serviceCards = [
    { icon: <Wrench className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'plumbing', description: "Expert plumbing services for repairs, installations, and maintenance." },
    { icon: <Zap className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'electrical', description: "Safe and reliable electrical solutions for your home and business." },
    { icon: <Hammer className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'carpentry', description: "Skilled carpentry for furniture, repairs, and custom projects." },
    { icon: <Brush className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'painting', description: "Professional painting services for a fresh new look." },
    { icon: <SprayCan className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'homeCleaning', description: "Reliable home cleaning services for a spotless living space." },
    { icon: <HardHat className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'construction', description: "Comprehensive construction services from foundation to finish." },
    { icon: <Layers className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'plastering', description: "Quality plastering for smooth and durable walls and ceilings." },
    { icon: <GripVertical className="h-12 w-12 text-primary mb-4 mx-auto group-hover:animate-subtle-bounce" />, titleKey: 'other', description: "Various other services to meet your unique needs." },
  ];


  return (
    <div className="flex flex-col items-center text-center space-y-16 md:space-y-24 py-8 md:py-16">
      <section className="w-full max-w-4xl px-4 animate-fadeIn">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-foreground">
          {t.welcomeTo} <span className="text-primary drop-shadow-md">{t.appName}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t.findSkilledArtisans} {t.orPostYourServices}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="animate-slideUp animation-delay-200 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 group"
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
            className="animate-slideUp animation-delay-400 shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 group"
          >
            <Link href="/auth/register">
              {t.getStarted}
              <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="w-full max-w-5xl px-4 animate-fadeIn animation-delay-600">
         <div className="grid md:grid-cols-1 gap-8 items-center text-center md:text-center"> {/* Centered text */}
            <div className="space-y-4">
              <h2 className="text-3xl font-headline font-semibold text-foreground">{t.joinAsProvider}</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t.orPostYourServices}
              </p>
              <Button asChild size="lg" className="shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 group">
                <Link href="/auth/register?role=provider">{t.joinAsProvider} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"/></Link>
              </Button>
            </div>
          </div>
      </section>

      <section className="w-full max-w-5xl px-4 animate-fadeIn animation-delay-800">
         <div className="grid md:grid-cols-1 gap-8 items-center text-center md:text-center"> {/* Centered text */}
           <div className="space-y-4">
              <h2 className="text-3xl font-headline font-semibold text-foreground">{t.joinAsSeeker}</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t.findSkilledArtisans}
              </p>
              <Button asChild size="lg" className="shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 group">
                <Link href="/auth/register?role=seeker">{t.joinAsSeeker} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"/></Link>
              </Button>
            </div>
          </div>
      </section>

      <section className="w-full max-w-5xl px-4 animate-fadeIn animation-delay-1000">
        <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-12 text-foreground">{t.services}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {serviceCards.map((service, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-xl shadow-lg border border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
            >
              {service.icon}
              <h3 className="text-2xl font-semibold mb-3 font-headline text-foreground">{t[service.titleKey as keyof Translations]}</h3>
              <p className="text-muted-foreground text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
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
