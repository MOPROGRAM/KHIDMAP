
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
import { UserProfile, ServiceCategory, MediaItem } from '@/lib/data'; 
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, serverTimestamp, GeoPoint, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { onAuthStateChanged, User as FirebaseUser, updateProfile as updateAuthProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Loader2, UserCircle, Save, AlertTriangle, MapPin, Upload, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import NextImage from 'next/image'; 
import { z } from 'zod';

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
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [fileUpload, setFileUpload] = useState<File | null>(null);

  const [isLoading, setIsLoading] =useState(false);
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
              setProfilePictureUrl(firestoreProfile.profilePictureUrl);
              
              const mediaData = firestoreProfile.media;
              if (Array.isArray(mediaData)) {
                  const validItems = mediaData.filter(item => item && item.id && item.url && item.type);
                  setMediaItems(validItems);
              } else {
                  setMediaItems([]);
              }

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
      console.warn("Firebase Auth, DB or Storage not initialized in ProviderProfilePage.");
    }
  }, [router, t, toast]);

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

  const handleFileUpload = async () => {
    if (!fileUpload || !authUser || !db || !storage) return;

    // Validation
    const MAX_FILES = 5;
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
    const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

    if (mediaItems.length >= MAX_FILES) {
        toast({ variant: "destructive", title: t.errorOccurred, description: t.mediaLimitReached });
        return;
    }
    if (!ALLOWED_TYPES.includes(fileUpload.type.toLowerCase())) {
        toast({ variant: "destructive", title: t.errorOccurred, description: t.invalidFileType });
        return;
    }
    if (fileUpload.size > MAX_SIZE_BYTES) {
        toast({ variant: "destructive", title: t.errorOccurred, description: t.fileTooLarge });
        return;
    }

    setIsUploading(true);
    const fileId = `${Date.now()}-${fileUpload.name}`;
    const fileRef = ref(storage, `media/${authUser.uid}/${fileId}`);

    try {
        const userDocRef = doc(db, "users", authUser.uid);
        
        await uploadBytes(fileRef, fileUpload);
        const downloadURL = await getDownloadURL(fileRef);
        const fileType = ALLOWED_VIDEO_TYPES.includes(fileUpload.type.toLowerCase()) ? 'video' : 'image';
        const newMediaItem: MediaItem = { id: fileId, url: downloadURL, type: fileType };

        await updateDoc(userDocRef, {
            media: arrayUnion(newMediaItem)
        });

        setMediaItems(prevItems => [...prevItems, newMediaItem]);
        setFileUpload(null); // Clear the file input after successful upload
        toast({ title: t.mediaUploadedSuccess });
    } catch (error) {
        console.error("Error uploading file:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: t.mediaUploadError });
        try { await deleteObject(fileRef); } catch (e) { console.error("Could not clean up orphaned file", e); }
    } finally {
        setIsUploading(false);
    }
  };

  const handleFileDelete = async (itemToDelete: MediaItem) => {
    if (!authUser || !db || !storage) return;
    
    const fileRef = ref(storage, `media/${authUser.uid}/${itemToDelete.id}`);
    const userDocRef = doc(db, "users", authUser.uid);

    try {
        await updateDoc(userDocRef, {
            media: arrayRemove(itemToDelete)
        });

        await deleteObject(fileRef);
        
        setMediaItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
        toast({ title: t.mediaDeletedSuccess });
    } catch (error) {
        console.error("Error deleting file:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: t.mediaDeleteError });
    }
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
      profilePictureUrl: profilePictureUrl || null, 
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

  const canUploadMore = mediaItems.length < 5;

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
          <div className="flex justify-center">
            {profilePictureUrl ? (
              <NextImage 
                src={profilePictureUrl} 
                alt={t.profilePictureAlt || "Profile Picture"} 
                width={120} 
                height={120} 
                className="rounded-full border-4 border-primary shadow-md object-cover"
                data-ai-hint="profile avatar"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full border-4 border-primary shadow-md bg-muted flex items-center justify-center">
                <UserCircle className="h-16 w-16 text-muted-foreground/70" />
              </div>
            )}
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
      
      {/* Media Gallery Section */}
      <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary"/>{t.mediaGallery}</CardTitle>
            <CardDescription>{t.mediaGalleryDescription}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Input 
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/mov"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setFileUpload(e.target.files[0]);
                            }
                        }}
                        disabled={!canUploadMore || isUploading || !isCoreServicesAvailable}
                        className="flex-1"
                    />
                    <Button onClick={handleFileUpload} disabled={!fileUpload || !canUploadMore || isUploading || !isCoreServicesAvailable}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                        {t.uploadFile}
                    </Button>
                </div>
                 {!canUploadMore && (
                    <p className="text-sm text-destructive text-center">{t.mediaLimitReached}</p>
                 )}
                
                {mediaItems.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {mediaItems.map(item => (
                            <div key={item.id} className="relative group aspect-square">
                                {item.type === 'video' ? (
                                    <video controls src={item.url} className="rounded-md object-cover w-full h-full bg-black" />
                                ) : (
                                    <NextImage src={item.url} alt={t.mediaItem || 'Media item'} layout="fill" className="rounded-md object-cover" />
                                )}
                                <div className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded-full pointer-events-none">
                                    {item.type === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                    <Button variant="destructive" size="icon" className="absolute z-10" onClick={() => handleFileDelete(item)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t.noMediaItems}</p>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
