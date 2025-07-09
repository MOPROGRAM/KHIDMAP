"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Check, Briefcase, Users, DollarSign, GaugeCircle, Layers, FileText, Send, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getActiveAds, AdRequest } from '@/lib/data';
import { cn } from '@/lib/utils';

const whyUsItems = [
    {
      icon: <Check className="h-6 w-6 text-white" />,
      titleKey: 'whyUsTitle1',
      descriptionKey: 'whyUsDesc1',
    },
    {
      icon: <Check className="h-6 w-6 text-white" />,
      titleKey: 'whyUsTitle2',
      descriptionKey: 'whyUsDesc2',
    },
    {
      icon: <Check className="h-6 w-6 text-white" />,
      titleKey: 'whyUsTitle3',
      descriptionKey: 'whyUsDesc3',
    },
];

const serviceCards = [
    { icon: <Briefcase />, titleKey: 'servicesTitle1', descriptionKey: 'servicesDesc1' },
    { icon: <Layers />, titleKey: 'servicesTitle2', descriptionKey: 'servicesDesc2' },
    { icon: <GaugeCircle />, titleKey: 'servicesTitle3', descriptionKey: 'servicesDesc3' },
    { icon: <Users />, titleKey: 'servicesTitle4', descriptionKey: 'servicesDesc4' },
];

const pricingPlans = [
  {
    planKey: 'pricingFree',
    price: '0',
    features: ['pricingFeat1', 'pricingFeat2', 'pricingFeat3'],
    isFeatured: false,
  },
  {
    planKey: 'pricingBusiness',
    price: '29',
    features: ['pricingFeat1', 'pricingFeat2', 'pricingFeat3', 'pricingFeat4', 'pricingFeat5'],
    isFeatured: true,
  },
  {
    planKey: 'pricingDeveloper',
    price: '49',
    features: ['pricingFeat1', 'pricingFeat2', 'pricingFeat3', 'pricingFeat4', 'pricingFeat5', 'pricingFeat6'],
    isFeatured: false,
  },
];

export default function HomePage() {
  const t = useTranslation();
  const [activeAds, setActiveAds] = useState<AdRequest[]>([]);
  
  useEffect(() => {
    async function fetchAds() {
      try {
        const ads = await getActiveAds();
        setActiveAds(ads);
      } catch (error) {
        console.error("Failed to fetch active ads:", error);
      }
    }
    fetchAds();
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-primary text-primary-foreground">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center py-12 md:py-24">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{t.heroTitle}</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">{t.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">{t.getStarted}</Link>
              </Button>
              <Button size="lg" variant="ghost" className="hover:bg-primary/20 hover:text-primary-foreground" asChild>
                <Link href="#services">{t.ourServices}</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96" style={{display: 'none'}}>
             <Image src="https://placehold.co/600x400.png" data-ai-hint="business team collaboration" alt={t.heroAlt} layout="fill" objectFit="contain" className="drop-shadow-2xl"/>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="w-full py-12 md:py-20 bg-background">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">{t.aboutTitle}</h2>
            <p className="text-muted-foreground">{t.aboutText1}</p>
            <ul className="space-y-2">
            {whyUsItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center mt-1">
                        <Check className="h-4 w-4" />
                    </div>
                    <span className="text-muted-foreground">{t[item.descriptionKey as keyof Translations]}</span>
                </li>
            ))}
            </ul>
          </div>
          <div className="space-y-4">
             <p className="text-muted-foreground">{t.aboutText2}</p>
             <Button variant="outline" asChild>
                <Link href="#contact">{t.learnMore}</Link>
             </Button>
          </div>
        </div>
      </section>

       {/* Services Section */}
      <section id="services" className="w-full py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{t.services}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.servicesDescription}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCards.map((card, index) => (
              <Card key={index} className="text-center hover:shadow-lg hover:-translate-y-2 transition-transform duration-300">
                <CardHeader className="items-center">
                  <div className="border-2 border-transparent p-4 rounded-full mb-4">
                    {React.cloneElement(card.icon, { className: "h-8 w-8 text-primary" })}
                  </div>
                  <CardTitle>{t[card.titleKey as keyof Translations]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t[card.descriptionKey as keyof Translations]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners/Ads Section */}
      {activeAds.length > 0 && (
        <section id="partners" className="w-full py-12 md:py-20 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">{t.ourPartners}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t.ourPartnersDescription}</p>
            </div>
            <div className="relative w-full overflow-hidden group">
              <div className="flex animate-scroll group-hover:pause">
                {[...activeAds, ...activeAds].map((ad, index) => (
                  <div key={`${ad.id}-${index}`} className="flex-shrink-0 w-64 mx-4">
                    <Card className="overflow-hidden">
                      <div className="relative h-40">
                        <Image src={ad.imageUrl || 'https://placehold.co/600x400.png'} alt={ad.title} layout="fill" objectFit="cover" />
                      </div>
                      <CardContent className="p-4">
                        <p className="font-semibold text-center truncate">{ad.title}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{t.pricingTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.pricingDescription}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={cn(plan.isFeatured && 'border-2 border-primary shadow-2xl relative')}>
                 {plan.isFeatured && <Badge className="absolute -top-3 right-4">{t.pricingFeatured}</Badge>}
                <CardHeader>
                  <CardTitle>{t[plan.planKey as keyof Translations]}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground"> / {t.pricingMonth}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{t[feature as keyof Translations]}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.isFeatured ? 'default' : 'outline'}>{t.buyNow}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* FAQ Section */}
      <section id="faq" className="w-full py-12 md:py-20 bg-background">
        <div className="container mx-auto max-w-4xl">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">{t.faqTitle}</h2>
              <p className="text-muted-foreground">{t.faqDescription}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>{t.faqQ1}</h3>
                     <p className="text-muted-foreground">{t.faqA1}</p>
                </div>
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>{t.faqQ2}</h3>
                     <p className="text-muted-foreground">{t.faqA2}</p>
                </div>
                 <div className="space-y-4">
                     <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>{t.faqQ3}</h3>
                     <p className="text-muted-foreground">{t.faqA3}</p>
                </div>
                 <div className="space-y-4">
                     <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>{t.faqQ4}</h3>
                     <p className="text-muted-foreground">{t.faqA4}</p>
                </div>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-12 md:py-20 bg-muted/30" style={{display: 'none'}}>
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">{t.contactTitle}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t.contactDescription}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-md mt-1"><MapPin className="h-6 w-6 text-primary"/></div>
                        <div>
                            <h3 className="text-lg font-semibold">{t.contactLocation}</h3>
                            <p className="text-muted-foreground">{t.contactAddress}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-md mt-1"><Mail className="h-6 w-6 text-primary"/></div>
                        <div>
                            <h3 className="text-lg font-semibold">{t.contactEmail}</h3>
                            <p className="text-muted-foreground">{t.contactEmailAddress}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-md mt-1"><Phone className="h-6 w-6 text-primary"/></div>
                        <div>
                            <h3 className="text-lg font-semibold">{t.contactCall}</h3>
                            <p className="text-muted-foreground">{t.contactPhoneNumber}</p>
                        </div>
                    </div>
                </div>
                <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <input type="text" placeholder={t.yourName} className="w-full p-3 rounded-md border bg-background" />
                        <input type="email" placeholder={t.yourEmail} className="w-full p-3 rounded-md border bg-background" />
                    </div>
                    <input type="text" placeholder={t.subject} className="w-full p-3 rounded-md border bg-background" />
                    <textarea placeholder={t.message} rows={5} className="w-full p-3 rounded-md border bg-background"></textarea>
                    <div className="text-center">
                        <Button type="submit">{t.sendMessage}</Button>
                    </div>
                </form>
            </div>
        </div>
      </section>
    </div>
  );
}
