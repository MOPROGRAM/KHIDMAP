
"use client";

import { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { UserProfile, ServiceCategory, VerificationStatus, uploadVerificationDocuments } from '@/lib/data'; 
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, serverTimestamp, GeoPoint, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged, User as FirebaseUser, updateProfile as updateAuthProfile } from 'firebase/auth';
import { Loader2, UserCircle, Save, AlertTriangle, MapPin, Upload, Trash2, Image as ImageIcon, Video as VideoIcon, AtSign, BadgeCheck, Shield, Clock, ShieldAlert } from 'lucide-react';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ProfileFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }), 
  phoneNumber: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  qualifications: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  serviceAreasString: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  serviceCategories: z.array(z.enum(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'HomeCleaning', 'Construction', 'Plastering', 'Other'])).min(0).optional(), 
  videoCallsEnabled: z.boolean().optional(),
});

export default function ProviderProfilePage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const verificationFileInputRef = useRef<HTMLInputElement>(null);

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [serviceAreasString, setServiceAreasString] = useState('');
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoCallsEnabled, setVideoCallsEnabled] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_submitted');
  const [verificationRejectionReason, setVerificationRejectionReason] = useState<string | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingVerification, setIsUploadingVerification] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCoreServicesAvailable, setIsCoreServicesAvailable] = useState(false);

  const fetchProfile = useCallback(async (user: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const firestoreProfile = docSnap.data() as Omit<UserProfile, 'uid'>;
        setName(firestoreProfile.name || user.displayName || ''); 
        setPhoneNumber(firestoreProfile.phoneNumber || '');
        setQualifications(firestoreProfile.qualifications || '');
        setServiceAreasString((firestoreProfile.serviceAreas || []).join(', ')); 
        setServiceCategories(firestoreProfile.serviceCategories || []);
        setImages(firestoreProfile.images || []);
        setVideos(firestoreProfile.videos || []);
        setVideoCallsEnabled(firestoreProfile.videoCallsEnabled ?? true);
        setVerificationStatus(firestoreProfile.verificationStatus || 'not_submitted');
        setVerificationRejectionReason(firestoreProfile.verificationRejectionReason);
        
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
    } finally {
      setIsFetching(false);
    }
  }, [t, toast]);


  useEffect(() => {
    if (auth && db && storage) {
      setIsCoreServicesAvailable(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setAuthUser(user);
          setEmail(user.email || ''); 
          setName(user.displayName || ''); 
          await fetchProfile(user);
        } else {
          toast({ variant: "destructive", title: t.authError, description: t.userNotIdentified });
          router.push('/login');
          setIsFetching(false);
        }
      });
      return () => unsubscribe();
    } else {
      setIsCoreServicesAvailable(false);
      setIsFetching(false);
      console.warn("Firebase Auth, DB, or Storage not initialized in ProviderProfilePage.");
    }
  }, [router, t, toast, fetchProfile]);
  

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'image' | 'video'
  ) => {
    if (!authUser || !db || !storage) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const config = {
      image: {
        limit: 3,
        state: images,
        setState: setImages,
        setLoading: setIsUploadingImage,
        firestoreField: 'images',
        storageFolder: 'images',
        accept: 'image/*',
        errorLimit: "Image portfolio limit reached (3 max).",
        errorType: "Please upload a valid image file.",
      },
      video: {
        limit: 2,
        state: videos,
        setState: setVideos,
        setLoading: setIsUploadingVideo,
        firestoreField: 'videos',
        storageFolder: 'videos',
        accept: 'video/*',
        errorLimit: "Video portfolio limit reached (2 max).",
        errorType: "Please upload a valid video file.",
      },
    }[fileType];

    if (config.state.length >= config.limit) {
      toast({ variant: "destructive", title: "Upload Limit Reached", description: config.errorLimit });
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast({ variant: "destructive", title: t.fileTooLargeTitle, description: t.fileTooLargeDescription });
      return;
    }

    if (!file.type.startsWith(`${fileType}/`)) {
       toast({ variant: "destructive", title: t.unsupportedFileTypeTitle, description: config.errorType });
       return;
    }

    config.setLoading(true);
    const fileInput = event.target;

    try {
      const filePath = `serviceAds/${authUser.uid}/${config.storageFolder}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, filePath);
      
      const metadata = { customMetadata: { 'userId': authUser.uid } };
      await uploadBytes(fileRef, file, metadata);
      
      const downloadURL = await getDownloadURL(fileRef);

      const userDocRef = doc(db, "users", authUser.uid);
      await updateDoc(userDocRef, {
        [config.firestoreField]: arrayUnion(downloadURL)
      });

      config.setState(prev => [...prev, downloadURL]);
      toast({ title: t.fileUploadedSuccessTitle });
    } catch (error: any) {
      console.error("File upload error:", error);
      let description = t.fileUploadErrorDescription;
      if (error.code === 'storage/unauthorized') {
        description = t.storageUnauthorizedError;
      }
      toast({ variant: "destructive", title: t.fileUploadErrorTitle, description });
    } finally {
      config.setLoading(false);
      if (fileInput) fileInput.value = '';
    }
  };
  
  const handleFileDelete = async (urlToDelete: string, fileType: 'image' | 'video') => {
    if (!authUser || !db || !storage || deletingUrl) return;

    setDeletingUrl(urlToDelete);

    const config = {
        image: { setState: setImages, firestoreField: 'images' },
        video: { setState: setVideos, firestoreField: 'videos' },
    }[fileType];

    try {
      const fileRef = ref(storage, urlToDelete);
      await deleteObject(fileRef);

      const userDocRef = doc(db, "users", authUser.uid);
      await updateDoc(userDocRef, {
        [config.firestoreField]: arrayRemove(urlToDelete)
      });

      config.setState(prev => prev.filter(url => url !== urlToDelete));
      toast({ title: t.fileDeletedSuccessTitle });
    } catch (error: any)
     {
      console.error("File deletion error:", error);
      let description = t.fileDeleteErrorDescription;
      if (error.code === 'storage/object-not-found') {
        description = t.fileNotFoundInStorage || "File not found. It may have already been deleted.";
        // Clean up firestore just in case
        try {
            const userDocRef = doc(db, "users", authUser.uid);
            await updateDoc(userDocRef, { [config.firestoreField]: arrayRemove(urlToDelete) });
            config.setState(prev => prev.filter(url => url !== urlToDelete));
        } catch (dbError) {
             console.error("Secondary Firestore deletion error:", dbError);
        }
      } else if (error.code === 'storage/unauthorized') {
        description = t.storageUnauthorizedDeleteError;
      }
      toast({ variant: "destructive", title: t.fileDeleteErrorTitle, description });
    } finally {
        setDeletingUrl(null);
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
  
  const handleVerificationUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingVerification(true);
    try {
      await uploadVerificationDocuments(e.target.files);
      toast({ title: t.verificationDocsUploadedTitle, description: t.verificationDocsUploadedDescription });
      if (authUser) await fetchProfile(authUser);
    } catch (err: any) {
      toast({ variant: "destructive", title: t.fileUploadErrorTitle, description: err.message });
    } finally {
      setIsUploadingVerification(false);
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
      serviceCategories,
      videoCallsEnabled
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
      videoCallsEnabled: data.videoCallsEnabled,
    };

    try {
      if (authUser.displayName !== data.name) {
        await updateAuthProfile(authUser, { displayName: data.name });
      }

      const userDocRef = doc(db, "users", authUser.uid);
      await setDoc(userDocRef, updatedProfileData , { merge: true }); 
      
      localStorage.setItem('userName', data.name);

      toast({ title: t.profileUpdatedSuccessfully, description: t.profileChangesSaved });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      let description = t.failedUpdateProfile;
      if (error.code === 'permission-denied') {
          description = t.permissionDeniedError;
      }
      toast({ variant: "destructive", title: t.errorOccurred, description });
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

             <div className="space-y-1.5">
                <Label>{t.settings}</Label>
                <Card className="p-4 bg-muted/50 border-dashed">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="video-calls-switch" className="font-medium">{t.enableVideoCalls}</Label>
                            <p className="text-xs text-muted-foreground">{t.enableVideoCallsDescription}</p>
                        </div>
                        <Switch
                            id="video-calls-switch"
                            checked={videoCallsEnabled}
                            onCheckedChange={setVideoCallsEnabled}
                            disabled={!isCoreServicesAvailable || isLoading}
                        />
                    </div>
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
                <Shield className="h-6 w-6 text-primary"/>
                {t.identityVerification}
            </CardTitle>
            <CardDescription>{t.identityVerificationDescription}</CardDescription>
        </CardHeader>
        <CardContent>
            {verificationStatus === 'not_submitted' && (
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">{t.verificationNotSubmitted}</p>
                    <Button onClick={() => verificationFileInputRef.current?.click()} disabled={isUploadingVerification || isLoading}>
                        {isUploadingVerification ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                        {t.uploadDocuments}
                    </Button>
                </div>
            )}
            {verificationStatus === 'pending' && (
                <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>{t.verificationPendingTitle}</AlertTitle>
                    <AlertDescription>{t.verificationPendingDescription}</AlertDescription>
                </Alert>
            )}
            {verificationStatus === 'verified' && (
                <Alert variant="default" className="bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <BadgeCheck className="h-4 w-4" />
                    <AlertTitle>{t.verificationVerifiedTitle}</AlertTitle>
                    <AlertDescription>{t.verificationVerifiedDescription}</AlertDescription>
                </Alert>
            )}
            {verificationStatus === 'rejected' && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>{t.verificationRejectedTitle}</AlertTitle>
                    <AlertDescription>
                        <p>{t.verificationRejectedDescription}</p>
                        <p className="font-semibold mt-2">{t.rejectionReason}: {verificationRejectionReason}</p>
                         <Button onClick={() => verificationFileInputRef.current?.click()} size="sm" className="mt-4" disabled={isUploadingVerification || isLoading}>
                            {isUploadingVerification ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                            {t.reUploadDocuments}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
             <input type="file" ref={verificationFileInputRef} onChange={handleVerificationUpload} multiple className="hidden" accept="image/jpeg,image/png,application/pdf" />
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            {t.portfolioTitle} Images
          </CardTitle>
          <CardDescription>Upload up to 3 images (max 10MB each).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {images.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <Image src={url} alt={`Portfolio image ${index + 1}`} width={150} height={150} className="rounded-lg object-cover w-full h-full border"/>
                {deletingUrl === url ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" disabled={!!deletingUrl}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>{t.confirmDeleteFileTitle}</AlertDialogTitle><AlertDialogDescription>{t.confirmDeleteFileDescription}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleFileDelete(url, 'image')} className="bg-destructive hover:bg-destructive/90">{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </div>
            ))}
          </div>

          {images.length < 3 && (
             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                <Label htmlFor="image-upload" className={cn(buttonVariants({ variant: 'outline' }), 'w-full cursor-pointer', (isUploadingImage || !isCoreServicesAvailable) && 'opacity-50 cursor-not-allowed')}>
                  <div className="flex items-center justify-center">
                    {isUploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                    <span>{isUploadingImage ? t.uploading : t.uploadMedia}</span>
                  </div>
                </Label>
                <Input id="image-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" disabled={isUploadingImage || !isCoreServicesAvailable}/>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-6 w-6 text-primary" />
            {t.portfolioTitle} Videos
          </CardTitle>
          <CardDescription>Upload up to 2 videos (max 10MB each).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {videos.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <video src={url} controls={false} className="rounded-lg object-cover w-full h-full border" />
                 {deletingUrl === url ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" disabled={!!deletingUrl}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>{t.confirmDeleteFileTitle}</AlertDialogTitle><AlertDialogDescription>{t.confirmDeleteFileDescription}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleFileDelete(url, 'video')} className="bg-destructive hover:bg-destructive/90">{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </div>
            ))}
          </div>

          {videos.length < 2 && (
             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                <Label htmlFor="video-upload" className={cn(buttonVariants({ variant: 'outline' }),'w-full cursor-pointer',(isUploadingVideo || !isCoreServicesAvailable) && 'opacity-50 cursor-not-allowed')}>
                  <div className="flex items-center justify-center">
                    {isUploadingVideo ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                    <span>{isUploadingVideo ? t.uploading : t.uploadMedia}</span>
                  </div>
                </Label>
                <Input id="video-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} accept="video/*" disabled={isUploadingVideo || !isCoreServicesAvailable}/>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
