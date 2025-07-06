
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Shield } from "lucide-react";

export default function TermsOfServicePage() {
    const t = useTranslation();

    const renderContent = (content: string) => {
        return content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('<h2>') && paragraph.endsWith('</h2>')) {
                return <h2 key={index} className="text-xl font-semibold mt-6 mb-2">{paragraph.replace(/<\/?h2>/g, '')}</h2>;
            }
            return <p key={index} className="mb-4">{paragraph}</p>;
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-6 animate-fadeIn">
            <Card className="shadow-xl">
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-headline">{t.termsTitle}</CardTitle>
                            <CardDescription>{t.termsDescription}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    {renderContent(t.termsContent)}
                </CardContent>
            </Card>
        </div>
    );
}
