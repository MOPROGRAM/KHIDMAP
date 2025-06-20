
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { categorizeAd, CategorizeAdOutput } from '@/ai/flows/categorize-ad';
import { ServiceAd, ServiceCategory, getAdById, updateServiceAd, uploadAdImage, deleteAdImage } from '@/lib/data';
import { Loader2, Wand2, Edit3, Save, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import NextImage from 'next/image'; // Renamed to avoid conflict

const EditAdFormSchema = z.object({
  title: z.string().min(1, { message: "requiredField" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  address: z.string().min(1, { message: "requiredField" }), // Changed
  category: z.enum(['Plumbing', 'Electrical'], { errorMap: (issue, ctx) => ({ message: issue.code === 'invalid_enum_value' ? ctx.data || "requiredField" : "requiredField" }) }),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional(),
});

export default function EditAdPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;
  const { toast } = useToast();

  const [ad, setAd] = useState<ServiceAd | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(''); // Changed
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [detectedCategory, setDetectedCategory] = useState<ServiceCategory | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [adImagePreview, setAdImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAd, setIsFetchingAd] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth && db) {
      setIsFirebaseReady(true);
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          toast({ variant: "destructive", title: "Error", description: "User not authenticated. Please log in again." });
          router.push('/auth/login');
        }
      });
       return () => unsubscribe();
    } else {
      setIsFirebaseReady(false);
      console.warn("Firebase Auth or DB not initialized in EditAdPage.");
      toast({ variant: "destructive", title: "Service Unavailable", description: "Core services are not ready." });
    }
  }, [router, toast]);

  const fetchAdData = useCallback(async () => {
    if (!adId || !isFirebaseReady) return;
    setIsFetchingAd(true);
    try {
      const fetchedAd = await getAdById(adId);
      if (fetchedAd) {
        if (currentUser && fetchedAd.providerId !== currentUser.uid) {
          toast({ variant: "destructive", title: "Unauthorized", description: "You are not authorized to edit this ad." });
          router.push('/dashboard/provider/ads');
          return;
        }
        setAd(fetchedAd);
        setTitle(fetchedAd.title);
        setDescription(fetchedAd.description);
        setAddress(fetchedAd.address); // Changed
        setCategory(fetchedAd.category);
        setCurrentImageUrl(fetchedAd.imageUrl);
        setAdImagePreview(fetchedAd.imageUrl || null);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Ad not found." });
        router.push('/dashboard/provider/ads');
      }
    } catch (error) {
      console.error("Error fetching ad for edit:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to load ad data for editing." });
      router.push('/dashboard/provider/ads');
    } finally {
      setIsFetchingAd(false);
    }
  }, [adId, router, toast, t, currentUser, isFirebaseReady]);

  useEffect(() => {
    if (adId && currentUser && isFirebaseReady) {
      fetchAdData();
    }
  }, [adId, fetchAdData, currentUser, isFirebaseReady]);

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
      // If no new file is selected, keep the existing preview if available
      // setAdImagePreview(currentImageUrl || null); // this might revert immediately
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
    if (!isFirebaseReady || !db || !ad || !currentUser) {
      toast({ variant: "destructive", title: "Service Unavailable", description: "Cannot update ad. Core services are not ready or user not authenticated." });
      return;
    }
    if (ad.providerId !== currentUser.uid) {
        toast({ variant: "destructive", title: "Unauthorized", description: "You are not authorized to edit this ad." });
        return;
    }
    setIsLoading(true);
    setIsUploadingImage(false);
    setErrors({});

    let newImageUrl = currentImageUrl;
    if (adImageFile) {
      setIsUploadingImage(true);
      try {
        // If there was an old image, and a new one is uploaded, delete the old one
        if (currentImageUrl && currentImageUrl !== adImagePreview) { // Check if preview changed due to new file
             // No need to await this, can happen in background
             // await deleteAdImage(currentImageUrl); 
        }
        newImageUrl = await uploadAdImage(adImageFile, currentUser.uid, ad.id);
      } catch (error) {
        console.error("Error uploading new image:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to upload new image." });
        setIsLoading(false);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }


    const validationResult = EditAdFormSchema.safeParse({ title, description, address, category, imageUrl: newImageUrl });

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
      const updateData: Partial<Omit<ServiceAd, 'id' | 'providerId' | 'postedDate' | 'createdAt'>> = {
        title: validationResult.data.title,
        description: validationResult.data.description,
        category: validationResult.data.category,
        address: validationResult.data.address, // Changed
        imageUrl: validationResult.data.imageUrl,
      };
      
      // If a new image was uploaded AND the old image existed, try to delete old one AFTER successful update
      // This is safer: only delete old image if update definitely succeeds with new image URL.
      const oldImageUrlToDelete = (adImageFile && currentImageUrl && currentImageUrl !== newImageUrl) ? currentImageUrl : undefined;


      await updateServiceAd(ad.id, updateData);

      if (oldImageUrlToDelete) {
        await deleteAdImage(oldImageUrlToDelete); // Delete old image after successful update
      }

      toast({ title: "Ad Updated", description: "Your ad has been successfully updated." });
      router.push('/dashboard/provider/ads'); 
    } catch (error) {
      console.error("Error updating ad:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: (error as Error).message || "Failed to update ad." });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetchingAd || !isFirebaseReady) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading} ad details...</p>
      </div>
    );
  }

  if (!ad && !isFetchingAd) {
     return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <p className="text-destructive">{t.errorOccurred} or ad not found.</p>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Edit3 className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">{t.editAd}</CardTitle>
          </div>
          <CardDescription>Update the details of your service advertisement.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.adTitle}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.adDescription}</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} disabled={isLoading}/>
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            
            <Button type="button" variant="outline" onClick={handleDetectCategory} disabled={isCategorizing || !description || isLoading} className="w-full sm:w-auto">
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
              <Select value={category} onValueChange={(value) => setCategory(value as ServiceCategory)} disabled={isLoading}>
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
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} placeholder="e.g., 123 Main St, City" />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adImageEdit">{t.adImage}</Label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {adImagePreview ? (
                    <NextImage src={adImagePreview} alt={t.imagePreview} width={200} height={200} className="mx-auto h-24 w-auto object-contain rounded-md" />
                  ) : (
                     <div className="flex flex-col items-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{t.noImageUploaded}</p>
                     </div>
                  )}
                  <div className="flex text-sm text-muted-foreground">
                    <span className="relative rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                      <span>{currentImageUrl ? t.changeImage : t.uploadAdImage}</span>
                      <Input id="adImageEdit" name="adImageEdit" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/*" disabled={isLoading} />
                    </span>
                    {!currentImageUrl && <p className="pl-1 rtl:pr-1">or drag and drop</p>}
                  </div>
                  {!currentImageUrl && <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>}
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


            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || isFetchingAd || isUploadingImage}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Save className="ltr:mr-2 rtl:ml-2 h-4 w-4"/> }
              {t.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    