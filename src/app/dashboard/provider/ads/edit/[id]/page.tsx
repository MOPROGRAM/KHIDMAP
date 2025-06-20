
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { categorizeAd, CategorizeAdOutput, ServiceCategoriesEnumType } from '@/ai/flows/categorize-ad';
import { ServiceAd, ServiceCategory, getAdById, updateServiceAd, uploadAdImage, deleteAdImage, UserProfile } from '@/lib/data';
import { Loader2, Wand2, Edit3, Save, UploadCloud, Image as ImageIcon, Trash2, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import NextImage from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getDoc, doc } from 'firebase/firestore';

const EditAdFormSchema = z.object({
  title: z.string().min(1, { message: "requiredField" }),
  description: z.string().min(10, { message: "descriptionTooShortAd" }),
  address: z.string().min(1, { message: "requiredField" }),
  category: z.enum(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HomeCleaning', 'Construction', 'Plastering', 'Other'], { errorMap: (issue, ctx) => ({ message: issue.code === 'invalid_enum_value' ? ctx.data || "requiredField" : "requiredField" }) }),
  imageUrl: z.string().url({ message: "invalidImageUrl" }).optional().nullable(),
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
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [detectedCategory, setDetectedCategory] = useState<ServiceCategoriesEnumType | null>(null);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [adImagePreview, setAdImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAd, setIsFetchingAd] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);
  const [providerName, setProviderName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth && db) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          // Fetch provider name if not already set (e.g., from ad data)
          if (!providerName) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as UserProfile;
                    setProviderName(userData.name || user.displayName || t.anonymousProvider);
                } else {
                    setProviderName(user.displayName || t.anonymousProvider);
                }
            } catch (error) {
                console.error("Error fetching user profile for EditAdPage:", error);
                setProviderName(user.displayName || t.anonymousProvider);
            }
          }
        } else {
          toast({ variant: "destructive", title: t.authError, description: t.userNotAuthenticated });
          router.push('/auth/login');
        }
      });
       return () => unsubscribe();
    } else {
      setIsCoreServicesAvailable(false);
      console.warn("Firebase Auth or DB not initialized in EditAdPage.");
    }
  }, [router, toast, t, providerName]); // Added providerName to dependency array

  const fetchAdData = useCallback(async () => {
    if (!adId || !isCoreServicesAvailable) {
        if(!isCoreServicesAvailable && adId) setIsFetchingAd(false); // Stop fetching if services are down
        return;
    }
    setIsFetchingAd(true);
    try {
      const fetchedAd = await getAdById(adId);
      if (fetchedAd) {
        if (currentUser && fetchedAd.providerId !== currentUser.uid) {
          toast({ variant: "destructive", title: t.unauthorized, description: t.notAuthorizedEditAd });
          router.push('/dashboard/provider/ads');
          return;
        }
        setAd(fetchedAd);
        setTitle(fetchedAd.title);
        setDescription(fetchedAd.description);
        setAddress(fetchedAd.address);
        setCategory(fetchedAd.category);
        setCurrentImageUrl(fetchedAd.imageUrl);
        setAdImagePreview(fetchedAd.imageUrl || null);
        setProviderName(fetchedAd.providerName || providerName || t.anonymousProvider); 
      } else {
        toast({ variant: "destructive", title: t.errorOccurred, description: t.adNotFound });
        router.push('/dashboard/provider/ads');
      }
    } catch (error: any) {
      console.error("Error fetching ad for edit:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: error.message || t.failedLoadAdData });
      router.push('/dashboard/provider/ads');
    } finally {
      setIsFetchingAd(false);
    }
  }, [adId, router, toast, t, currentUser, isCoreServicesAvailable, providerName]);

  useEffect(() => {
    if (adId && currentUser && isCoreServicesAvailable) {
      fetchAdData();
    }
  }, [adId, fetchAdData, currentUser, isCoreServicesAvailable]);

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
    }
  };

  const handleRemoveImage = async () => {
     setAdImageFile(null); 
     setAdImagePreview(null); 
     // currentImageUrl will be handled during submit if it was present
  }

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
    if (!isCoreServicesAvailable || !db || !ad || !currentUser) {
      toast({ variant: "destructive", title: t.serviceUnavailableTitle, description: t.cannotUpdateAdCoreServices });
      setIsLoading(false);
      return;
    }
    if (ad.providerId !== currentUser.uid) {
        toast({ variant: "destructive", title: t.unauthorized, description: t.notAuthorizedEditAd });
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setIsUploadingImage(false);
    setErrors({});

    let finalImageUrl: string | undefined | null = currentImageUrl; 
    let imageToDeleteAfterSuccess: string | undefined = undefined;

    if (adImageFile) { // New image selected
      setIsUploadingImage(true);
      try {
        // Upload new image. Use ad.id as it's an existing ad.
        finalImageUrl = await uploadAdImage(adImageFile, currentUser.uid, ad.id);
        if (currentImageUrl && currentImageUrl !== finalImageUrl) { 
            imageToDeleteAfterSuccess = currentImageUrl; // Mark old image for deletion after successful update
        }
      } catch (error: any) {
        console.error("Error uploading new image:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: error.message || t.failedUploadImage });
        setIsLoading(false);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    } else if (adImagePreview === null && currentImageUrl) { // Image was explicitly removed
        finalImageUrl = undefined; 
        imageToDeleteAfterSuccess = currentImageUrl; // Mark old image for deletion
    }


    const validationResult = EditAdFormSchema.safeParse({ 
        title, 
        description, 
        address, 
        category, 
        imageUrl: finalImageUrl // Use the potentially updated finalImageUrl
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
      const currentProviderName = providerName || currentUser.displayName || t.anonymousProvider;
      if (!currentProviderName) {
        toast({ variant: "destructive", title: t.errorOccurred, description: t.providerInfoMissing });
        setIsLoading(false);
        return;
      }

      const updateData: Partial<Omit<ServiceAd, 'id' | 'providerId' | 'postedDate' | 'createdAt'>> = {
        title: validationResult.data.title,
        description: validationResult.data.description,
        category: validationResult.data.category as ServiceCategory,
        address: validationResult.data.address,
        imageUrl: validationResult.data.imageUrl === null ? undefined : validationResult.data.imageUrl,
        providerName: currentProviderName,
      };
      
      await updateServiceAd(ad.id, updateData);

      // If update was successful and an old image was marked for deletion, delete it now.
      if (imageToDeleteAfterSuccess) {
          await deleteAdImage(imageToDeleteAfterSuccess);
      }

      toast({ title: t.adUpdatedTitle, description: t.adUpdatedSuccess });
      router.push('/dashboard/provider/ads'); 
    } catch (error: any) {
      console.error("Error updating ad:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: error.message || t.failedUpdateAd });
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

  if (isFetchingAd) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loadingAdDetails}</p>
      </div>
    );
  }

  if (!isCoreServicesAvailable && !isFetchingAd) {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card className="shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-7 w-7"/> {t.serviceUnavailableTitle}
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p>{t.editingAdsUnavailable}</p>
                 </CardContent>
            </Card>
        </div>
    );
  }

  if (!ad && !isFetchingAd) { // Ad not found or error occurred during fetch
     return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <p className="text-destructive">{t.errorOrAdNotFound}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Edit3 className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">{t.editAd}</CardTitle>
          </div>
          <CardDescription>{t.editAdDescriptionPage}</CardDescription>
        </CardHeader>
        <CardContent>
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
              {isCategorizing ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Wand2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:animate-pulse-glow" />}
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
              <Label htmlFor="adImageEdit">{t.adImage}</Label>
              <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-input border-dashed rounded-md group">
                <div className="space-y-1 text-center mb-2">
                  {adImagePreview ? (
                    <div className="relative group/img">
                        <NextImage src={adImagePreview} alt={t.imagePreview || "Image Preview"} width={200} height={200} className="mx-auto h-24 w-auto object-contain rounded-md shadow-md" />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" type="button" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity" disabled={!isCoreServicesAvailable || isLoading || isUploadingImage}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t.removeImageTitle || "Remove Image?"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t.removeImageConfirm || "Are you sure you want to remove the current ad image? This action will permanently delete the image if you save the changes."}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel type="button">{t.cancel}</AlertDialogCancel>
                                <AlertDialogAction type="button" onClick={handleRemoveImage} className="bg-destructive hover:bg-destructive/90">
                                    {t.removeImageButton || "Remove Image"}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  ) : (
                     <div className="flex flex-col items-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-sm text-muted-foreground">{t.noImageUploaded}</p>
                     </div>
                  )}
                </div>
                <Input 
                    id="adImageEdit" 
                    name="adImageEdit" 
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

            <Button type="submit" className="w-full text-lg py-3 transform active:scale-95" disabled={!isCoreServicesAvailable || isLoading || isFetchingAd || isUploadingImage}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <Save className="ltr:mr-2 rtl:ml-2 h-5 w-5"/> }
              {t.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
