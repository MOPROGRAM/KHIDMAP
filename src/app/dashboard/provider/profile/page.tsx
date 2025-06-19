
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
import { ServiceProvider, ServiceCategory, getProviderById, updateProviderProfile } from '@/lib/data';
import { Loader2, UserCircle, Save } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

const ProfileSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }),
  phoneNumber: z.string().min(1, { message: "requiredField" }),
  qualifications: z.string().min(1, { message: "requiredField" }),
  zipCodesServed: z.string().min(1, { message: "requiredField" }), // Assuming comma-separated string for simplicity
  serviceCategories: z.array(z.enum(['Plumbing', 'Electrical'])).min(1, { message: "requiredField" })
});


export default function ProviderProfilePage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Partial<ServiceProvider>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [zipCodesServed, setZipCodesServed] = useState(''); // Storing as comma-separated string
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setProviderId(id);
      const providerData = getProviderById(id);
      if (providerData) {
        setProfile(providerData);
        setName(providerData.name);
        setEmail(providerData.email);
        setPhoneNumber(providerData.phoneNumber);
        setQualifications(providerData.qualifications);
        setZipCodesServed(providerData.zipCodesServed.join(', '));
        setServiceCategories(providerData.serviceCategories);
      } else {
         toast({ variant: "destructive", title: "Error", description: "Provider data not found." });
      }
    } else {
      toast({ variant: "destructive", title: "Error", description: "User not identified. Please log in again." });
      router.push('/auth/login');
    }
    setIsFetching(false);
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!providerId) {
      toast({ variant: "destructive", title: "Error", description: "Provider ID is missing." });
      setIsLoading(false);
      return;
    }
    
    const currentServiceCategories = (document.getElementById('serviceCategoriesTrigger') as HTMLButtonElement)?.dataset.value?.split(',') as ServiceCategory[] || [];

    const validationResult = ProfileSchema.safeParse({ 
      name, 
      email, 
      phoneNumber, 
      qualifications, 
      zipCodesServed,
      serviceCategories: currentServiceCategories.filter(Boolean) // Ensure no empty strings if select is not touched
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

    try {
      const updatedProfileData = {
        id: providerId,
        name: validationResult.data.name,
        email: validationResult.data.email,
        phoneNumber: validationResult.data.phoneNumber,
        qualifications: validationResult.data.qualifications,
        zipCodesServed: validationResult.data.zipCodesServed.split(',').map(zip => zip.trim()).filter(Boolean),
        serviceCategories: validationResult.data.serviceCategories,
        // profilePictureUrl: profile.profilePictureUrl // keep existing or handle upload
      };
      
      updateProviderProfile(updatedProfileData); // Mock update
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
          {/* Placeholder for profile picture */}
          <div className="flex justify-center">
            <Image 
              src={profile.profilePictureUrl || "https://placehold.co/150x150.png"} 
              alt="Profile Picture" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-primary shadow-md"
              data-ai-hint="profile avatar"
            />
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
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
              {/* This is a simplified multi-select. A better component might be needed for UX. */}
              <Select
                value={serviceCategories.join(',')}
                onValueChange={(value) => setServiceCategories(value.split(',') as ServiceCategory[])}
              >
                <SelectTrigger id="serviceCategoriesTrigger" data-value={serviceCategories.join(',')}>
                  <SelectValue placeholder={`${t.selectCategory} (Multiple)`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">{t.plumbing}</SelectItem>
                  <SelectItem value="Electrical">{t.electrical}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Ctrl/Cmd + click to select multiple (or use a proper multi-select component for better UX).</p>
              {errors.serviceCategories && <p className="text-sm text-destructive">{errors.serviceCategories}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCodesServed">{t.zipCode} Served (comma-separated)</Label>
              <Input id="zipCodesServed" value={zipCodesServed} onChange={(e) => setZipCodesServed(e.target.value)} placeholder="e.g., 90210, 90001" />
              {errors.zipCodesServed && <p className="text-sm text-destructive">{errors.zipCodesServed}</p>}
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
