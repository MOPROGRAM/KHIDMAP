
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
import { UserProfile, ServiceCategory } from '@/lib/data'; 
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'; 
import { onAuthStateChanged, User as FirebaseUser, updateProfile as updateAuthProfile } from 'firebase/auth';
import { Loader2, UserCircle, Save } from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict
import { z } from 'zod';

const ProfileFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }), 
  phoneNumber: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  qualifications: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  serviceAreasString: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')), // Changed
  serviceCategories: z.array(z.enum(['Plumbing', 'Electrical'])).min(0).optional(), 
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
  const [serviceAreasString, setServiceAreasString] = useState(''); // Changed from zipCodesServedString
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (auth && db) {
      setIsFirebaseReady(true);
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
              setServiceAreasString((firestoreProfile.serviceAreas || []).join(', ')); // Changed
              setServiceCategories(firestoreProfile.serviceCategories || []);
              setProfilePictureUrl(firestoreProfile.profilePictureUrl);
            } else {
              toast({ variant: "default", title: "Welcome!", description: "Please complete your provider profile." });
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            toast({ variant: "destructive", title: t.errorOccurred, description: "Could not fetch profile data." });
          }
        } else {
          toast({ variant: "destructive", title: "Authentication Error", description: "User not identified. Please log in again." });
          router.push('/auth/login');
        }
        setIsFetching(false);
      });
      return () => unsubscribe();
    } else {
      setIsFirebaseReady(false);
      setIsFetching(false);
      console.warn("Firebase Auth or DB not initialized in ProviderProfilePage.");
      toast({ variant: "destructive", title: "Service Unavailable", description: "Profile service is not ready." });
    }
  }, [router, t, toast]);

  const handleServiceCategoriesChange = (value: string) => {
    if (value) {
      setServiceCategories([value as ServiceCategory]);
    } else {
      setServiceCategories([]);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseReady || !auth || !db || !authUser) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated or service unavailable." });
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
      serviceAreasString, // Changed
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
      serviceAreas: data.serviceAreasString ? data.serviceAreasString.split(',').map(area => area.trim()).filter(Boolean) : [], // Changed
      serviceCategories: data.serviceCategories || [], 
      profilePictureUrl: profilePictureUrl, // Note: Image upload for profile picture not implemented yet
    };

    try {
      if (authUser.displayName !== data.name) {
        await updateAuthProfile(authUser, { displayName: data.name });
      }

      const userDocRef = doc(db, "users", authUser.uid);
      await setDoc(userDocRef, { ...updatedProfileData, updatedAt: Timestamp.now() }, { merge: true }); 
      
      localStorage.setItem('userName', data.name);

      toast({ title: t.profileUpdatedSuccessfully });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to update profile." });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">{t.loading}</span></div>;
  }


  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <UserCircle className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-headline">{t.profile}</CardTitle>
              <CardDescription>{t.fillYourProfile} {t.appName}</CardDescription>
            </div>
          </div>
          <div className="flex justify-center">
            <NextImage 
              src={profilePictureUrl || "https://placehold.co/150x150.png"} 
              alt="Profile Picture" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-primary shadow-md object-cover"
              data-ai-hint="profile avatar"
            />
          </div>
        </CardHeader>
        <CardContent>
           {!isFirebaseReady && (
            <div className="p-4 mb-4 text-sm text-destructive-foreground bg-destructive rounded-md text-center">
              Profile editing is currently unavailable. Core services are not configured.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isFirebaseReady || isLoading} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" value={email} readOnly disabled className="bg-muted/50"/>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
              <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!isFirebaseReady || isLoading}/>
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">{t.qualifications}</Label>
              <Textarea id="qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} rows={4} disabled={!isFirebaseReady || isLoading}/>
              {errors.qualifications && <p className="text-sm text-destructive">{errors.qualifications}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceCategories">{t.serviceCategory}</Label>
              <Select
                value={serviceCategories.length > 0 ? serviceCategories[0] : ""} 
                onValueChange={handleServiceCategoriesChange}
                disabled={!isFirebaseReady || isLoading}
              >
                <SelectTrigger id="serviceCategoriesTrigger">
                  <SelectValue placeholder={`${t.selectCategory}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">{t.plumbing}</SelectItem>
                  <SelectItem value="Electrical">{t.electrical}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select your primary service category.</p>
              {errors.serviceCategories && <p className="text-sm text-destructive">{errors.serviceCategories}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceAreas">{t.serviceAreas}</Label>
              <Input id="serviceAreas" value={serviceAreasString} onChange={(e) => setServiceAreasString(e.target.value)} placeholder="e.g., Downtown, North Suburbs" disabled={!isFirebaseReady || isLoading}/>
              {errors.serviceAreasString && <p className="text-sm text-destructive">{errors.serviceAreasString}</p>}
            </div>

            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || !isFirebaseReady}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Save className="ltr:mr-2 rtl:ml-2 h-4 w-4"/>}
              {t.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    