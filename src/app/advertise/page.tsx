
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Loader2, Send, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { createAdRequest } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AdvertiseFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }),
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function AdvertisePage() {
  const t = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
      }
    });
    return () => unsubscribe();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: t.fileTooLargeTitle, description: t.fileTooLargeDescription?.replace('{size}', '5MB') });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      toast({
        variant: "destructive",
        title: t.authError,
        description: t.loginToSubmitAd,
      });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: t.imageRequired, description: t.imageRequiredDesc });
        return;
    }
    
    setIsLoading(true);
    setErrors({});
    setIsSubmitted(false);

    const validationResult = AdvertiseFormSchema.safeParse({ name, email, title, message });
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
      const adId = await createAdRequest(validationResult.data, imageFile);
      toast({
        title: t.requestSubmittedTitle,
        description: t.requestSubmittedDescription,
      });
      setIsSubmitted(true);
      router.push(`/dashboard/provider/ads/edit/${adId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.messageSentErrorTitle,
        description: error.message || t.messageSentErrorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Megaphone className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-xl font-headline">{t.advertiseWithUs}</CardTitle>
          <CardDescription>{t.advertiseDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg shadow-md animate-fadeIn">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">{t.requestSubmittedTitle}</h3>
              <p className="text-muted-foreground">{t.requestSubmittedDescription}</p>
              <Button asChild className="mt-6">
                <Link href="/dashboard/provider/ads">{t.myAds}</Link>
              </Button>
            </div>
          ) : !authUser ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-4">{t.loginToSubmitAd}</p>
              <Button asChild>
                 <Link href="/login">
                  {t.login}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.yourName}</Label>
                    <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading || !!authUser?.displayName} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.yourEmail}</Label>
                    <Input id="email" name="email" type="email" value={email} disabled={true} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="title">{t.adTitle}</Label>
                  <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.message}</Label>
                  <Textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.adInquiryPlaceholder} rows={5} disabled={isLoading}/>
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="ad-image">{t.adImage}</Label>
                    <Card className="p-4 border-dashed flex flex-col items-center gap-4 text-center">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Ad preview" width={200} height={150} className="rounded-md object-cover" />
                        ) : (
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                        <Input id="ad-image" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                            <Upload className="mr-2 h-4 w-4" />
                            {imageFile ? t.changeImage : t.uploadImage}
                        </Button>
                         <p className="text-xs text-muted-foreground">{t.adImageHint}</p>
                    </Card>
                </div>

                <Button type="submit" className="w-full text-lg py-3 group" disabled={isLoading || !imageFile}>
                  {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <Send className="ltr:mr-2 rtl:ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300"/>}
                  {t.submitRequest}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
