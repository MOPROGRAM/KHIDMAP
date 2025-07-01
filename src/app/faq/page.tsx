
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation, Translations } from "@/hooks/useTranslation";
import { HelpCircle } from "lucide-react";

export default function FaqPage() {
    const t = useTranslation();

    const faqItems: { questionKey: keyof Translations, answerKey: keyof Translations }[] = [
        { questionKey: 'faqQ1', answerKey: 'faqA1' },
        { questionKey: 'faqQ2', answerKey: 'faqA2' },
        { questionKey: 'faqQ3', answerKey: 'faqA3' },
        { questionKey: 'faqQ4', answerKey: 'faqA4' },
    ];

    return (
        <div className="max-w-3xl mx-auto py-6 animate-fadeIn">
            <Card className="shadow-xl">
                <CardHeader className="text-center">
                    <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-xl font-headline">{t.faqTitle}</CardTitle>
                    <CardDescription>{t.faqDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                             <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-semibold">{t[item.questionKey]}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {t[item.answerKey]}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
