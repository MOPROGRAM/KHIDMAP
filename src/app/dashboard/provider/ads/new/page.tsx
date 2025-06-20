
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { categorizeAd, CategorizeAdOutput, ServiceCategoriesEnumType } from '@/ai/flows/categorize-ad';
import { ServiceCategory, addServiceAd, UserProfile, uploadAdImage } from '@/lib/data';
import { Loader2, Wand2, PlusCircle, UploadCloud, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, collection as firestoreCollection } from 'firebase/firestore'; 
import NextImage from 'next/image';

const AdFormSchema = z.object({
  title: z.string().min(1, { message: "requiredField" }),
  description: z.string().min(10, { message: "descriptionTooShortAd" }),
  address: z.string().min(1, { message: "requiredField" }),
  category: z.enum(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HomeCleaning', 'Construction', 'Plastering', 'Other'], { errorMap: (issue, ctx) => ({ message: issue.code === 'invalid_enum_value' ? ctx.data || "requiredField" : "requiredField" }) }),
  imageUrl: z.string().url({ message: "invalidImageUrl" }).optional().nullable(),
});

export default function NewAdPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [detectedCategory, setDetectedCategory] = useState<ServiceCategoriesEnumType | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [adImagePreview, setAdImagePreview] = useState<string | null>(null);
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null); 
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth && db) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setProviderId(user.uid);
          // Fetch provider name from Firestore
          const userDocRef = doc(db, "users", user.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as UserProfile;
              setProviderName(userData.name || user.displayName || t.anonymousProvider);
            } else {
               console.warn(`User document for ${user.uid} not found in Firestore for NewAdPage.`);
               setProviderName(user.displayName || t.anonymousProvider); 
            }
          } catch (error) {
             console.error("Error fetching user profile for NewAdPage:", error);
             setProviderName(user.displayName || t.anonymousProvider);
          }
        } else {
          toast({ variant: "destructive", title: t.authError, description: t.userNotIdentified });
          router.push('/auth/login');
        }
      });
       return () => unsubscribe();
    } else {
      setIsCoreServicesAvailable(false);
      console.warn("Firebase Auth or DB not initialized in NewAdPage.");
    }
  }, [router, toast, t]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAdImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, imageUrl: '' }));
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
      const categoryKey = result.category.toLowerCase() as keyof Translations;
      toast({ title: t.detectedCategoryTitle, description: `${t.serviceCategory}: ${t[categoryKey] || result.category}` });
    } catch (error) {
      console.error("Error detecting category:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: t.couldNotDetectCategory });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoreServicesAvailable || !db || !auth?.currentUser) { // Check auth.currentUser
      toast({ variant: "destructive", title: t.serviceUnavailableTitle, description: t.cannotPostAdCoreServices });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsUploadingImage(false);
    setErrors({});

    if (!providerId || !providerName) { 
      toast({ variant: "destructive", title: t.errorOccurred, description: t.providerInfoMissing });
      setIsLoading(false);
      return;
    }

    let uploadedImageUrl: string | undefined | null = null;
    // Generate a new Firestore ID for the ad, this ID will be used for the image path if an image is uploaded
    const adFirestoreId = doc(firestoreCollection(db, "serviceAds")).id;

    if (adImageFile) {
      setIsUploadingImage(true);
      try {
        uploadedImageUrl = await uploadAdImage(adImageFile, providerId, adFirestoreId);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: error.message || t.failedUploadImage });
        setIsLoading(false);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }
    
    const validationResult = AdFormSchema.safeParse({ 
        title, 
        description, 
        address, 
        category, 
        imageUrl: uploadedImageUrl 
    });

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
        category: validationResult.data.category as ServiceCategory,
        address: validationResult.data.address,
        imageUrl: validationResult.data.imageUrl === null ? undefined : validationResult.data.imageUrl,
      }, adFirestoreId); 
      toast({ title: t.adPostedSuccessfully, description: t.adLiveShortly });
      router.push('/dashboard/provider/ads'); 
    } catch (error: any) {
      console.error("Error posting ad:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: error.message || t.failedPostAd });
    } finally {
      setIsLoading(false);
    }
  };
  
  const serviceCategoryOptions: { value: ServiceCategory; labelKey: keyof Translations }[] = [
    { value: 'Plumbing', labelKey: 'plumbing' },
    { value: 'Electrical', labelKey: 'electrical' },
    { value: 'Carpentry', labelKey: 'carpentry' },
    { value: 'Painting', labelKey: 'painting' },
    { value: 'HomeCleaning', labelKey: 'homeCleaning' },
    { value: 'Construction', labelKey: 'construction'},
    { value: 'Plastering', labelKey: 'plastering'},
    { value: 'Other', labelKey: 'other' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">{t.newAd}</CardTitle>
          </div>
          <CardDescription>{t.newAdDescriptionPage?.replace("{appName}", t.appName)}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isCoreServicesAvailable && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md text-center flex items-center gap-2 justify-center">
              <AlertTriangle className="h-5 w-5" />
              <span>{t.postingAdsUnavailable}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.adTitle}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isCoreServicesAvailable || isLoading} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.adDescription}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} disabled={!isCoreServicesAvailable || isLoading}/>
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            
            <Button type="button" variant="outline" onClick={handleDetectCategory} disabled={isCategorizing || !description || !isCoreServicesAvailable || isLoading} className="w-full sm:w-auto group">
              {isCategorizing ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Wand2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:animate-pulse-glow"/>}
              {t.detectCategoryAI}
            </Button>

            {detectedCategory && (
              <div className="p-3 bg-accent/10 border border-accent rounded-md text-sm">
                <p className="font-medium">{t.detectedCategoryTitle}: <span className="text-accent font-semibold">{t[detectedCategory.toLowerCase() as keyof typeof t] || detectedCategory}</span></p>
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setCategory(detectedCategory as ServiceCategory)}>{t.confirmCategory}</Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ServiceCategory)} disabled={!isCoreServicesAvailable || isLoading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategoryOptions.map(opt => (
                     <SelectItem key={opt.value} value={opt.value}>{t[opt.labelKey]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t.address}</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isCoreServicesAvailable || isLoading} placeholder="e.g., 123 Main St, City" />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adImage">{t.adImage}</Label>
              <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-input border-dashed rounded-md group">
                 {adImagePreview ? (
                    <div className="mb-2">
                        <NextImage src={adImagePreview} alt={t.imagePreview || "Image preview"} width={200} height={200} className="mx-auto h-24 w-auto object-contain rounded-md shadow-md" />
                    </div>
                ) : (
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                )}
                <Input 
                    id="adImage" 
                    name="adImage" 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    disabled={!isCoreServicesAvailable || isLoading || isUploadingImage}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">{t.imageUploadHint}</p>
              </div>
              {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
              {isUploadingImage && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
                  {t.uploadingImage}...
                </div>
              )}
            </div>

            <Button type="submit" className="w-full text-lg py-3 transform active:scale-95" disabled={isLoading || !providerId || !isCoreServicesAvailable || isUploadingImage}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <PlusCircle className="ltr:mr-2 rtl:ml-2 h-5 w-5"/>}
              {t.postAd}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
    
