
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { categorizeAd, CategorizeAdOutput } from '@/ai/flows/categorize-ad';
import { ServiceCategory, addServiceAd } from '@/lib/data';
import { Loader2, Wand2, PlusCircle } from 'lucide-react';
import { z } from 'zod';

const AdFormSchema = z.object({
  title: z.string().min(1, { message: "requiredField" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }), // Example of a different message
  zipCode: z.string().min(1, { message: "requiredField" }),
  category: z.enum(['Plumbing', 'Electrical'], { errorMap: () => ({ message: "requiredField" }) }),
});

export default function NewAdPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [detectedCategory, setDetectedCategory] = useState<ServiceCategory | null>(null);
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setProviderId(id);
    } else {
      toast({ variant: "destructive", title: "Error", description: "User not identified. Please log in again." });
      router.push('/auth/login');
    }
  }, [router, toast]);

  const handleDetectCategory = async () => {
    if (!description) {
      setErrors(prev => ({ ...prev, description: t.requiredField }));
      return;
    }
    setErrors(prev => ({ ...prev, description: '' }));
    setIsCategorizing(true);
    setDetectedCategory(null);
    try {
      const result: CategorizeAdOutput = await categorizeAd({ description });
      setDetectedCategory(result.category);
      // Optionally auto-select the category
      // setCategory(result.category); 
      toast({ title: t.detectedCategory, description: `${t.serviceCategory}: ${t[result.category.toLowerCase() as keyof typeof t]}` });
    } catch (error) {
      console.error("Error detecting category:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Could not detect category automatically." });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!providerId) {
      toast({ variant: "destructive", title: "Error", description: "Provider ID is missing." });
      setIsLoading(false);
      return;
    }

    const validationResult = AdFormSchema.safeParse({ title, description, zipCode, category });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        if (err.path[0]) {
           // @ts-ignore
          fieldErrors[err.path[0] as string] = t[err.message as keyof typeof t] || err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    try {
      addServiceAd({
        providerId,
        title: validationResult.data.title,
        description: validationResult.data.description,
        category: validationResult.data.category,
        zipCode: validationResult.data.zipCode,
      });
      toast({ title: t.adPostedSuccessfully });
      router.push('/dashboard/provider/ads'); 
    } catch (error) {
      console.error("Error posting ad:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to post ad." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">{t.newAd}</CardTitle>
          </div>
          <CardDescription>{t.fillYourProfile} {t.appName}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.adTitle}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.adDescription}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            
            <Button type="button" variant="outline" onClick={handleDetectCategory} disabled={isCategorizing || !description} className="w-full sm:w-auto">
              {isCategorizing ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Wand2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />}
              {t.detectedCategory} AI
            </Button>

            {detectedCategory && (
              <div className="p-3 bg-accent/10 border border-accent rounded-md text-sm">
                <p className="font-medium">{t.detectedCategory}: <span className="text-accent font-semibold">{t[detectedCategory.toLowerCase() as keyof typeof t]}</span></p>
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setCategory(detectedCategory)}>{t.confirmCategory}</Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ServiceCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">{t.plumbing}</SelectItem>
                  <SelectItem value="Electrical">{t.electrical}</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">{t.zipCode}</Label>
              <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
              {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
            </div>

            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : t.postAd}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
