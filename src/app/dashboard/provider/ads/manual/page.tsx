"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Send, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { createAdRequest } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ManualAdSchema = z.object({
  title: z.string().min(5, { message: "adTitleTooShort" }).max(60, { message: "adTitleTooLong" }),
  message: z.string().min(20, { message: "adBodyTooShort" }),
});

export default function ManualAdPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user) {
        setAuthUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

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

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      toast({ variant: "destructive", title: t.authError, description: t.loginToSubmitAd });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: t.imageRequired, description: t.imageRequiredForAd });
        return;
    }
    
    setErrors({});
    const validation = ManualAdSchema.safeParse({ title, message });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach(err => {
            if (err.path[0]) {
            // @ts-ignore
            fieldErrors[err.path[0] as string] = t[err.message as keyof Translations] || err.message;
            }
        });
      setErrors(fieldErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const adData = {
          name: authUser.displayName || '',
          email: authUser.email || '',
          title,
          message,
      };
      const adId = await createAdRequest(adData, imageFile);
      toast({
        title: t.requestSubmittedTitle,
        description: t.requestSubmittedDescription,
      });
      router.push(`/dashboard/provider/ads/edit/${adId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.messageSentErrorTitle,
        description: error.message || t.messageSentErrorDescription,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 group">
            <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t.backButton}
        </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Edit className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">{t.createAdManually}</CardTitle>
              <CardDescription>{t.createManuallyDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmitAd} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t.adTitle}</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t.adBody}</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={8} disabled={isSubmitting} />
                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ad-image">{t.adImageRequired}</Label>
                <Card className="p-4 border-dashed flex flex-col items-center gap-4 text-center">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Ad preview" width={200} height={150} className="rounded-md object-cover" />
                    ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                    <input id="ad-image" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                        <Upload className="mr-2 h-4 w-4" />
                        {imageFile ? t.changeImage : t.uploadImage}
                    </Button>
                     <p className="text-xs text-muted-foreground">{t.adImageHint}</p>
                </Card>
              </div>

              <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || !imageFile}>
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                  {t.submitForApproval}
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
