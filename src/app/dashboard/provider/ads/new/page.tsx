
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { ServiceCategory, addServiceAd, UserProfile, uploadAdImage } from '@/lib/data';
import { Loader2, Wand2, PlusCircle, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

const AdFormSchema = z.object({
  title: z.string().min(1, { message: "requiredField" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  address: z.string().min(1, { message: "requiredField" }), // Changed from zipCode
  category: z.enum(['Plumbing', 'Electrical'], { errorMap: (issue, ctx) => ({ message: issue.code === 'invalid_enum_value' ? ctx.data || "requiredField" : "requiredField" }) }),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional(),
});

export default function NewAdPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(''); // Changed from zipCode
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [detectedCategory, setDetectedCategory] = useState<ServiceCategory | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [adImagePreview, setAdImagePreview] = useState<string | null>(null);
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth && db) {
      setIsFirebaseReady(true);
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setProviderId(user.uid);
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            setProviderName(userData.name);
          } else {
             setProviderName(user.displayName || "Anonymous Provider"); 
          }
        } else {
          toast({ variant: "destructive", title: "Error", description: "User not identified. Please log in again." });
          router.push('/auth/login');
        }
      });
       return () => unsubscribe();
    } else {
      setIsFirebaseReady(false);
      console.warn("Firebase Auth or DB not initialized in NewAdPage.");
      toast({ variant: "destructive", title: "Service Unavailable", description: "Core services are not ready." });
    }
  }, [router, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAdImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAdImageFile(null);
      setAdImagePreview(null);
    }
  };

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
    if (!isFirebaseReady || !db) {
      toast({ variant: "destructive", title: "Service Unavailable", description: "Cannot post ad. Core services are not ready." });
      return;
    }
    setIsLoading(true);
    setIsUploadingImage(false);
    setErrors({});

    if (!providerId || !providerName) {
      toast({ variant: "destructive", title: "Error", description: "Provider information is missing. Please try again." });
      setIsLoading(false);
      return;
    }

    let uploadedImageUrl: string | undefined = undefined;
    if (adImageFile) {
      setIsUploadingImage(true);
      try {
        // Using a temporary ad ID for image path, or you could generate one client-side
        const tempAdId = `temp_${Date.now()}`; 
        uploadedImageUrl = await uploadAdImage(adImageFile, providerId, tempAdId);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to upload image." });
        setIsLoading(false);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    const validationResult = AdFormSchema.safeParse({ title, description, address, category, imageUrl: uploadedImageUrl });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        const fieldName = err.path[0] as string;
        // @ts-ignore
        fieldErrors[fieldName] = t[err.message as keyof typeof t] || err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      await addServiceAd({
        providerId,
        providerName, 
        title: validationResult.data.title,
        description: validationResult.data.description,
        category: validationResult.data.category,
        address: validationResult.data.address,
        imageUrl: validationResult.data.imageUrl,
      });
      toast({ title: t.adPostedSuccessfully });
      router.push('/dashboard/provider/ads'); 
    } catch (error) {
      console.error("Error posting ad:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: (error as Error).message || "Failed to post ad." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">{t.newAd}</CardTitle>
          </div>
          <CardDescription>{t.fillYourProfile} {t.appName}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isFirebaseReady && (
            <div className="p-4 mb-4 text-sm text-destructive-foreground bg-destructive rounded-md text-center">
              Posting ads is currently unavailable. Core services are not configured.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.adTitle}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isFirebaseReady || isLoading} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.adDescription}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} disabled={!isFirebaseReady || isLoading}/>
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            
            <Button type="button" variant="outline" onClick={handleDetectCategory} disabled={isCategorizing || !description || !isFirebaseReady || isLoading} className="w-full sm:w-auto">
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
              <Select value={category} onValueChange={(value) => setCategory(value as ServiceCategory)} disabled={!isFirebaseReady || isLoading}>
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
              <Label htmlFor="address">{t.address}</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isFirebaseReady || isLoading} placeholder="e.g., 123 Main St, City" />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adImage">{t.adImage}</Label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {adImagePreview ? (
                    <Image src={adImagePreview} alt={t.imagePreview} width={200} height={200} className="mx-auto h-24 w-auto object-contain rounded-md" />
                  ) : (
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="flex text-sm text-muted-foreground">
                    <span className="relative rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                      <span>{t.uploadAdImage}</span>
                      <Input id="adImage" name="adImage" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/*" disabled={!isFirebaseReady || isLoading} />
                    </span>
                    <p className="pl-1 rtl:pr-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
              {isUploadingImage && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
                  Uploading image...
                </div>
              )}
            </div>


            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || !providerId || !isFirebaseReady || isUploadingImage}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : t.postAd}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    