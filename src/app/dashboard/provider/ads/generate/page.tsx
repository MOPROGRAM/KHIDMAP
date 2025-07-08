"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Send, CheckCircle, Upload, Image as ImageIcon, Edit, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { createAdRequest } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { generateAd } from '@/ai/flows/generate-ad-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSettings } from '@/contexts/SettingsContext';

const AdGenerationSchema = z.object({
  serviceType: z.string().min(3, { message: "provideServiceType" }),
  serviceAreas: z.string().min(3, { message: "provideServiceArea" }),
  contactInfo: z.string().optional(),
  keywords: z.string().optional(),
});

export default function GenerateAdPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useSettings();

  // --- State Management ---
  // Step 1: User Input
  const [serviceType, setServiceType] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Step 2: AI Generation & Review
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Control State
  const [currentStep, setCurrentStep] = useState<'input' | 'review'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user) {
        setAuthUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGenerateAd = async () => {
    const validation = AdGenerationSchema.safeParse({ serviceType, serviceAreas });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach(err => {
            if (err.path[0]) {
            // @ts-ignore
            fieldErrors[err.path[0] as string] = t[err.message as keyof Translations] || err.message;
            }
        });
      toast({ variant: 'destructive', title: t.validationError, description: fieldErrors.serviceType || fieldErrors.serviceAreas });
      return;
    }
    if (!authUser?.displayName) {
        toast({ variant: 'destructive', title: t.errorOccurred, description: t.profileNameMissing });
        return;
    }

    setIsLoading(true);
    try {
      const result = await generateAd({
        serviceType,
        serviceAreas,
        contactInfo,
        keywords,
        providerName: authUser.displayName,
        language,
      });
      setGeneratedTitle(result.title);
      setGeneratedBody(result.body);
      setCurrentStep('review');
    } catch (error: any) {
      toast({ variant: "destructive", title: t.aiGenerationFailed, description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: t.fileTooLargeTitle, description: t.fileTooLargeDescription?.replace('{size}', '5MB') });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAd = async () => {
    if (!authUser) {
      toast({ variant: "destructive", title: t.authError, description: t.loginToSubmitAd });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: t.imageRequired, description: t.imageRequiredForAd });
        return;
    }
    
    setIsSubmitting(true);
    try {
      const adData = {
          name: authUser.displayName || '',
          email: authUser.email || '',
          title: generatedTitle,
          message: generatedBody,
      };
      const adId = await createAdRequest(adData, imageFile);
      toast({
        title: t.requestSubmittedTitle,
        description: t.requestSubmittedDescription,
      });
      router.push(`/dashboard/provider/ads/edit/${adId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.messageSentErrorTitle,
        description: error.message || t.messageSentErrorDescription,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">{t.aiAdGenerationTitle}</CardTitle>
              <CardDescription>{t.aiAdGenerationDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 'input' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">{t.primaryService}</Label>
                <Input id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder={t.primaryServicePlaceholder} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceAreas">{t.serviceAreas}</Label>
                <Input id="serviceAreas" value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} placeholder={t.serviceAreasPlaceholderAI} disabled={isLoading} />
                <p className="text-xs text-muted-foreground">{t.commaSeparated}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactInfo">{t.contactInfoOptional}</Label>
                <Input id="contactInfo" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder={t.contactInfoPlaceholder} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">{t.keywordsOptional}</Label>
                <Textarea id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t.keywordsPlaceholder} disabled={isLoading} />
              </div>
              <Button onClick={handleGenerateAd} className="w-full text-lg py-3" disabled={isLoading || !serviceType || !serviceAreas}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                {t.generateAd}
              </Button>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
                <Alert>
                    <Sparkles className="h-4 w-4"/>
                    <AlertTitle>{t.reviewAiAd}</AlertTitle>
                    <AlertDescription>{t.reviewAiAdDescription}</AlertDescription>
                </Alert>

              <div className="space-y-2">
                <Label htmlFor="generatedTitle">{t.adTitle}</Label>
                <Input id="generatedTitle" value={generatedTitle} onChange={(e) => setGeneratedTitle(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generatedBody">{t.adBody}</Label>
                <Textarea id="generatedBody" value={generatedBody} onChange={(e) => setGeneratedBody(e.target.value)} rows={8} disabled={isSubmitting} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ad-image">{t.adImageRequired}</Label>
                <Card className="p-4 border-dashed flex flex-col items-center gap-4 text-center">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Ad preview" width={200} height={150} className="rounded-md object-cover" />
                    ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                    <input id="ad-image" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                        <Upload className="mr-2 h-4 w-4" />
                        {imageFile ? t.changeImage : t.uploadImage}
                    </Button>
                     <p className="text-xs text-muted-foreground">{t.adImageHint}</p>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setCurrentStep('input')} className="w-full" disabled={isSubmitting}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t.backToEditInfo}
                </Button>
                <Button onClick={handleSubmitAd} className="w-full" disabled={isSubmitting || !imageFile}>
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                    {t.submitForApproval}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
