
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowRight, Search, Wrench, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const t = useTranslation();

  return (
    <div className="flex flex-col items-center text-center space-y-12 py-8 md:py-16">
      <section className="w-full max-w-4xl px-4 animate-fadeIn">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6">
          {t.welcomeTo} <span className="text-primary">{t.appName}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t.findSkilledArtisans} {t.orPostYourServices}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild className="animate-slideUp animation-delay-200">
            <Link href="/services/search">
              {t.browseServices}
              <Search className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="animate-slideUp animation-delay-400">
            <Link href="/auth/register">
              {t.getStarted}
              <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="w-full max-w-5xl px-4 animate-fadeIn animation-delay-600">
         <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl group">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Technician working"
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
                data-ai-hint="technician work"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               <h3 className="absolute bottom-4 left-4 text-2xl font-semibold text-white">{t.serviceProviders}</h3>
            </div>
            <div className="space-y-4 text-left rtl:text-right">
              <h2 className="text-3xl font-headline font-semibold">{t.joinAsProvider}</h2>
              <p className="text-muted-foreground">
                {t.orPostYourServices}
              </p>
              <Button asChild>
                <Link href="/auth/register?role=provider">{t.joinAsProvider} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4"/></Link>
              </Button>
            </div>
          </div>
      </section>
      
      <section className="w-full max-w-5xl px-4 animate-fadeIn animation-delay-800">
         <div className="grid md:grid-cols-2 gap-8 items-center">
           <div className="space-y-4 text-left rtl:text-right md:order-last">
              <h2 className="text-3xl font-headline font-semibold">{t.joinAsSeeker}</h2>
              <p className="text-muted-foreground">
                {t.findSkilledArtisans}
              </p>
              <Button asChild>
                <Link href="/auth/register?role=seeker">{t.joinAsSeeker} <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4"/></Link>
              </Button>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl group md:order-first">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Home improvement"
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
                data-ai-hint="home improvement"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <h3 className="absolute bottom-4 left-4 text-2xl font-semibold text-white">{t.serviceSeekers}</h3>
            </div>
          </div>
      </section>

      <section className="w-full max-w-4xl px-4 animate-fadeIn animation-delay-1000">
        <h2 className="text-3xl font-headline font-semibold mb-8">{t.services}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-lg shadow-lg border border-border transition-all hover:shadow-xl">
            <Wrench className="h-12 w-12 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">{t.plumbing}</h3>
            <p className="text-muted-foreground text-sm">
              {/* Placeholder description */}
              Expert plumbing services for repairs, installations, and maintenance.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-lg border border-border transition-all hover:shadow-xl">
            <Zap className="h-12 w-12 text-primary mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">{t.electrical}</h3>
            <p className="text-muted-foreground text-sm">
              {/* Placeholder description */}
              Safe and reliable electrical solutions for your home and business.
            </p>
          </div>
        </div>
      </section>
      <style jsx global>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        [class*="animation-delay"] {
          animation-fill-mode: backwards; /* Ensures element is not visible before animation starts */
        }
      `}</style>
    </div>
  );
}
