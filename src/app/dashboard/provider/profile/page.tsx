
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { UserProfile, ServiceCategory } from '@/lib/data'; 
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, serverTimestamp, GeoPoint, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged, User as FirebaseUser, updateProfile as updateAuthProfile } from 'firebase/auth';
import { Loader2, UserCircle, Save, AlertTriangle, MapPin, Upload, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from 'next/image';

const ProfileFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }), 
  phoneNumber: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  qualifications: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  serviceAreasString: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  serviceCategories: z.array(z.enum(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HomeCleaning', 'Construction', 'Plastering', 'Other'])).min(0).optional(), 
});

export default function ProviderProfilePage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [serviceAreasString, setServiceAreasString] = useState('');
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);

  useEffect(() => {
    if (auth && db && storage) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setAuthUser(user);
          setEmail(user.email || ''); 
          setName(user.displayName || ''); 

          const userDocRef = doc(db, "users", user.uid);
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const firestoreProfile = docSnap.data() as UserProfile;
              setName(firestoreProfile.name || user.displayName || ''); 
              setPhoneNumber(firestoreProfile.phoneNumber || '');
              setQualifications(firestoreProfile.qualifications || '');
              setServiceAreasString((firestoreProfile.serviceAreas || []).join(', ')); 
              setServiceCategories(firestoreProfile.serviceCategories || []);
              setMedia(firestoreProfile.media || []);
              
              if (firestoreProfile.location) {
                setLocation({
                  latitude: firestoreProfile.location.latitude,
                  longitude: firestoreProfile.location.longitude,
                });
              }
            } else {
              toast({ variant: "default", title: t.welcome, description: t.completeYourProfile });
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            toast({ variant: "destructive", title: t.errorOccurred, description: t.couldNotFetchProfile });
          }
        } else {
          toast({ variant: "destructive", title: t.authError, description: t.userNotIdentified });
          router.push('/auth/login');
        }
        setIsFetching(false);
      });
      return () => unsubscribe();
    } else {
      setIsCoreServicesAvailable(false);
      setIsFetching(false);
      console.warn("Firebase Auth, DB, or Storage not initialized in ProviderProfilePage.");
    }
  }, [router, t, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser || !db || !storage) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (media.length >= 5) {
        toast({ variant: "destructive", title: t.portfolioLimitReachedTitle, description: t.portfolioLimitReachedDescription });
        return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        toast({ variant: "destructive", title: t.fileTooLargeTitle, description: t.fileTooLargeDescription });
        return;
    }

    const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-matroska'];
    if (!SUPPORTED_TYPES.includes(file.type)) {
        toast({ variant: "destructive", title: t.unsupportedFileTypeTitle, description: t.unsupportedFileTypeDescription });
        return;
    }

    setIsUploading(true);
    const fileInput = event.target;

    try {
        const fileType = file.type.startsWith('image') ? 'image' : 'video';
        const filePath = `portfolios/${authUser.uid}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, filePath);
        
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);

        const newMediaItem = { url: downloadURL, type: fileType };

        const userDocRef = doc(db, "users", authUser.uid);
        await updateDoc(userDocRef, {
            media: arrayUnion(newMediaItem)
        });

        setMedia(prev => [...prev, newMediaItem]);
        toast({ title: t.fileUploadedSuccessTitle });
    } catch (error: any) {
        console.error("File upload error:", error);
        let description = t.fileUploadErrorDescription;
        if (error.code === 'storage/unauthorized') {
            description = t.storageUnauthorizedError || "Permission Denied. Please check your Firebase Storage security rules to allow uploads.";
        }
        toast({ variant: "destructive", title: t.fileUploadErrorTitle, description });
    } finally {
        setIsUploading(false);
        if (fileInput) {
            fileInput.value = '';
        }
    }
  };

  const handleFileDelete = async (fileToDelete: { url: string; type: 'image' | 'video' }) => {
    if (!authUser || !db || !storage) return;

    try {
        const userDocRef = doc(db, "users", authUser.uid);
        await updateDoc(userDocRef, {
            media: arrayRemove(fileToDelete)
        });

        const fileRef = ref(storage, fileToDelete.url);
        await deleteObject(fileRef);

        setMedia(prev => prev.filter(item => item.url !== fileToDelete.url));
        toast({ title: t.fileDeletedSuccessTitle });

    } catch (error: any) {
        console.error("File deletion error:", error);
        let description = t.fileDeleteErrorDescription;
        if (error.code === 'storage/unauthorized') {
            description = t.storageUnauthorizedDeleteError || "Permission Denied. Please check your Firebase Storage security rules to allow file deletion.";
        }
        toast({ variant: "destructive", title: t.fileDeleteErrorTitle, description });
    }
  };


  const handleServiceCategoriesChange = (value: string) => {
    const categoryValue = value as ServiceCategory;
    if (value) {
      setServiceCategories([categoryValue]);
    } else {
      setServiceCategories([]);
    }
  };

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: t.locationError, description: t.locationUnavailable });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast({ title: t.locationSet });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let description = t.locationError;
        if (error.code === error.PERMISSION_DENIED) {
            description = t.locationPermissionDenied;
        }
        toast({ variant: "destructive", title: t.locationError, description });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoreServicesAvailable || !auth || !db || !authUser) {
      toast({ variant: "destructive", title: t.errorOccurred, description: t.userNotAuthOrServiceUnavailable });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrors({});

    const validationResult = ProfileFormSchema.safeParse({ 
      name, 
      email, 
      phoneNumber, 
      qualifications, 
      serviceAreasString, 
      serviceCategories 
    });

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
    
    const { data } = validationResult;
    const updatedProfileData: Partial<UserProfile> = {
      name: data.name,
      email: authUser.email, 
      phoneNumber: data.phoneNumber,
      qualifications: data.qualifications,
      serviceAreas: data.serviceAreasString ? data.serviceAreasString.split(',').map(area => area.trim()).filter(Boolean) : [],
      serviceCategories: data.serviceCategories || [], 
      role: 'provider',
      updatedAt: serverTimestamp(),
      location: location ? new GeoPoint(location.latitude, location.longitude) : null,
    };

    try {
      if (authUser.displayName !== data.name) {
        await updateAuthProfile(authUser, { displayName: data.name });
      }

      const userDocRef = doc(db, "users", authUser.uid);
      await setDoc(userDocRef, updatedProfileData , { merge: true }); 
      
      localStorage.setItem('userName', data.name);

      toast({ title: t.profileUpdatedSuccessfully, description: t.profileChangesSaved });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: t.failedUpdateProfile });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching && isCoreServicesAvailable) { 
    return <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">{t.loading}</span></div>;
  }

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
    <div className="max-w-3xl mx-auto py-2 space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">{t.profile}</CardTitle>
              <CardDescription className="text-xs">{t.profilePageDescription?.replace("{appName}", t.appName)}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           {!isCoreServicesAvailable && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md text-center flex items-center gap-2 justify-center">
                <AlertTriangle className="h-5 w-5" />
                <span>{t.profileEditingUnavailable}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isCoreServicesAvailable || isLoading} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" value={email} readOnly disabled className="bg-muted/50 cursor-not-allowed"/>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
              <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!isCoreServicesAvailable || isLoading}/>
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualifications">{t.qualifications}</Label>
              <Textarea id="qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} rows={3} disabled={!isCoreServicesAvailable || isLoading}/>
              {errors.qualifications && <p className="text-sm text-destructive">{errors.qualifications}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="serviceCategories">{t.serviceCategory}</Label>
              <Select
                value={serviceCategories.length > 0 ? serviceCategories[0] : ""} 
                onValueChange={handleServiceCategoriesChange}
                disabled={!isCoreServicesAvailable || isLoading}
              >
                <SelectTrigger id="serviceCategoriesTrigger">
                  <SelectValue placeholder={`${t.selectCategory}`} />
                </SelectTrigger>
                <SelectContent>
                   {serviceCategoryOptions.map(opt => (
                     <SelectItem key={opt.value} value={opt.value}>{t[opt.labelKey]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t.profileHelpTextCategory}</p>
              {errors.serviceCategories && <p className="text-sm text-destructive">{errors.serviceCategories}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="serviceAreas">{t.serviceAreas}</Label>
              <Input id="serviceAreas" value={serviceAreasString} onChange={(e) => setServiceAreasString(e.target.value)} placeholder={t.serviceAreasPlaceholder} disabled={!isCoreServicesAvailable || isLoading}/>
              {errors.serviceAreasString && <p className="text-sm text-destructive">{errors.serviceAreasString}</p>}
            </div>

             <div className="space-y-1.5">
                <Label>{t.location}</Label>
                <Card className="p-4 bg-muted/50 border-dashed">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSetLocation}
                            disabled={isGettingLocation || !isCoreServicesAvailable || isLoading}
                            className="flex-shrink-0"
                        >
                            {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                            {t.useCurrentLocation}
                        </Button>
                        <div className="text-sm text-muted-foreground text-center sm:text-left">
                            {location
                                ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`
                                : t.locationNotSet
                            }
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground mt-3">{t.locationHelpText}</p>
                </Card>
             </div>
            <Button type="submit" className="w-full text-base py-2.5" disabled={isLoading || !isCoreServicesAvailable}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Save className="ltr:mr-2 rtl:ml-2 h-4 w-4"/>}
              {t.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            {t.portfolioTitle}
          </CardTitle>
          <CardDescription>{t.portfolioDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            {media.map((item, index) => (
              <div key={index} className="relative group aspect-square">
                {item.type === 'image' ? (
                  <Image src={item.url} alt={`${t.portfolioTitle} ${index + 1}`} width={150} height={150} className="rounded-lg object-cover w-full h-full border"/>
                ) : (
                  <video src={item.url} controls={false} className="rounded-lg object-cover w-full h-full border" />
                )}
                <div className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full">
                  {item.type === 'image' ? <ImageIcon className="h-3 w-3"/> : <Video className="h-3 w-3"/>}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.confirmDeleteFileTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.confirmDeleteFileDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleFileDelete(item)} className="bg-destructive hover:bg-destructive/90">{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>

          {media.length < 5 ? (
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                <Label htmlFor="file-upload" className="w-full">
                    <Button asChild variant="outline" className="w-full cursor-pointer" disabled={isUploading || !isCoreServicesAvailable}>
                        <div>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                            {isUploading ? t.uploading : t.uploadMedia}
                        </div>
                    </Button>
                </Label>
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-matroska" disabled={isUploading || !isCoreServicesAvailable}/>
                <p className="text-xs text-muted-foreground mt-2">{t.mediaUploadDescription}</p>
            </div>
          ) : (
             <div className="p-4 bg-muted text-center rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">{t.portfolioLimitReachedDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
