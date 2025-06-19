
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
import { UserProfile, ServiceCategory } from '@/lib/data'; // UserProfile now covers provider data
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Loader2, UserCircle, Save } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

// Updated Zod schema to align with UserProfile fields used in the form
const ProfileFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }), // Email might be read-only or managed via Firebase Auth profile
  phoneNumber: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  qualifications: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')),
  zipCodesServedString: z.string().min(1, { message: "requiredField" }).optional().or(z.literal('')), // For UI input
  serviceCategories: z.array(z.enum(['Plumbing', 'Electrical'])).min(0).optional(), // Allow empty array if nothing selected
  // profilePictureUrl is managed separately
});


export default function ProviderProfilePage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Typically from authUser, potentially display-only
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [zipCodesServedString, setZipCodesServedString] = useState(''); // UI state for comma-separated zips
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        setEmail(user.email || ''); // Set email from auth user
        setName(user.displayName || ''); // Set name from auth user initially

        // Fetch profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const firestoreProfile = docSnap.data() as UserProfile;
            setProfileData(firestoreProfile);
            setName(firestoreProfile.name || user.displayName || ''); // Prioritize Firestore name
            // Email is usually managed by auth provider, but if stored, can be displayed
            setPhoneNumber(firestoreProfile.phoneNumber || '');
            setQualifications(firestoreProfile.qualifications || '');
            setZipCodesServedString((firestoreProfile.zipCodesServed || []).join(', '));
            setServiceCategories(firestoreProfile.serviceCategories || []);
            setProfilePictureUrl(firestoreProfile.profilePictureUrl);
          } else {
            // No profile yet, initialize with auth data or defaults
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
  }, [router, t, toast]);

  const handleServiceCategoriesChange = (value: string) => {
    // This Select component is single-select by default with ShadCN
    // For true multi-select, a different component or UI pattern is needed.
    // Current behavior: it will store the selected value as an array of one.
    // If an empty string is passed (e.g. placeholder selected), it results in an empty array.
    if (value) {
      setServiceCategories([value as ServiceCategory]);
    } else {
      setServiceCategories([]);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
      return;
    }
    setIsLoading(true);
    setErrors({});

    const validationResult = ProfileFormSchema.safeParse({ 
      name, 
      email, // email is from auth, not typically user-editable here
      phoneNumber, 
      qualifications, 
      zipCodesServedString,
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
    const updatedProfile: Partial<UserProfile> = {
      uid: authUser.uid,
      name: data.name,
      email: authUser.email, // Keep email from auth
      role: 'provider', // Ensure role is set
      phoneNumber: data.phoneNumber,
      qualifications: data.qualifications,
      zipCodesServed: data.zipCodesServedString ? data.zipCodesServedString.split(',').map(zip => zip.trim()).filter(Boolean) : [],
      serviceCategories: data.serviceCategories || [], // Ensure it's an array
      profilePictureUrl: profilePictureUrl, // Preserve existing or handle upload logic elsewhere
      // createdAt can be set on initial creation, updatedAt for updates
    };

    try {
      const userDocRef = doc(db, "users", authUser.uid);
      // Use setDoc with merge:true to create or update, or updateDoc if sure doc exists
      await setDoc(userDocRef, updatedProfile, { merge: true }); 
      
      // Update localStorage for userName as other components might still rely on it for quick display
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
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">{t.loading}</span></div>;
  }


  return (
    <div className="max-w-3xl mx-auto">
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
            <Image 
              src={profilePictureUrl || "https://placehold.co/150x150.png"} 
              alt="Profile Picture" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-primary shadow-md"
              data-ai-hint="profile avatar"
            />
            {/* TODO: Add profile picture upload functionality */}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
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
              <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">{t.qualifications}</Label>
              <Textarea id="qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} rows={4} />
              {errors.qualifications && <p className="text-sm text-destructive">{errors.qualifications}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceCategories">{t.serviceCategory}</Label>
              <Select
                value={serviceCategories.length > 0 ? serviceCategories[0] : ""} // Show first category or empty for single select
                onValueChange={handleServiceCategoriesChange}
              >
                <SelectTrigger id="serviceCategoriesTrigger">
                  <SelectValue placeholder={`${t.selectCategory}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">{t.plumbing}</SelectItem>
                  <SelectItem value="Electrical">{t.electrical}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select your primary service category. For multiple categories, future updates will enhance this section.</p>
              {errors.serviceCategories && <p className="text-sm text-destructive">{errors.serviceCategories}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCodesServed">{t.zipCode} Served (comma-separated)</Label>
              <Input id="zipCodesServed" value={zipCodesServedString} onChange={(e) => setZipCodesServedString(e.target.value)} placeholder="e.g., 90210, 90001" />
              {errors.zipCodesServedString && <p className="text-sm text-destructive">{errors.zipCodesServedString}</p>}
            </div>

            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> : <Save className="ltr:mr-2 rtl:ml-2 h-4 w-4"/>}
              {t.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

