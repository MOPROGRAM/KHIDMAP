"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles, Edit, Megaphone, ArrowRight } from 'lucide-react';

export default function NewAdPage() {
  const t = useTranslation();

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Megaphone className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-xl font-headline">{t.createNewAd}</CardTitle>
          <CardDescription>{t.chooseAdCreationMethod}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/provider/ads/generate" className="group">
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t.createWithAi}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.createWithAiDescription}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="link" className="p-0 group-hover:text-primary">
                    {t.startNow} <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                 </Button>
              </CardFooter>
            </Card>
          </Link>
          <Link href="/dashboard/provider/ads/manual" className="group">
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <Edit className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t.createManually}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.createManuallyDescription}</p>
              </CardContent>
               <CardFooter>
                 <Button variant="link" className="p-0 group-hover:text-primary">
                    {t.startNow} <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                 </Button>
              </CardFooter>
            </Card>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
