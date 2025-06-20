
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff, Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; 
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }),
  password: z.string().min(6, { message: "passwordTooShort" }),
  confirmPassword: z.string().min(6, { message: "passwordTooShort" }),
  role: z.enum(['provider', 'seeker'], { errorMap: () => ({ message: "requiredField" }) })
}).refine(data => data.password === data.confirmPassword, {
  message: "passwordsDoNotMatch",
  path: ["confirmPassword"],
});


export default function RegisterPage() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPasswordState] = useState(''); // Renamed to avoid conflict
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [role, setRole] = useState<'provider' | 'seeker' | ''>(searchParams.get('role') as 'provider' | 'seeker' || '');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthServiceAvailable, setIsAuthServiceAvailable] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);


  useEffect(() => {
    const initialRole = searchParams.get('role');
    if (initialRole === 'provider' || initialRole === 'seeker') {
      setRole(initialRole);
    }
    if (auth && db) {
      setIsAuthServiceAvailable(true);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // Optional: redirect if already logged in
        // if (user) { router.push('/dashboard'); }
      });
      return () => unsubscribe();
    } else {
      setIsAuthServiceAvailable(false);
      console.warn("Firebase Auth or DB is not initialized in RegisterPage.");
    }
  }, [searchParams, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) { 
       toast({
        variant: "destructive",
        title: t.serviceUnavailableTitle,
        description: t.serviceUnavailableMessage,
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrors({});
    setShowVerificationMessage(false);

    const validationResult = RegisterSchema.safeParse({ name, email, password: password, confirmPassword, role });

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
      const userCredential = await createUserWithEmailAndPassword(auth, validationResult.data.email, validationResult.data.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: validationResult.data.name });
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        name: validationResult.data.name,
        email: firebaseUser.email,
        role: validationResult.data.role,
        createdAt: Timestamp.now(), 
        emailVerified: firebaseUser.emailVerified, 
      });

      await sendEmailVerification(firebaseUser);
      setShowVerificationMessage(true);
      
      toast({
        title: t.emailVerificationSent,
        description: t.checkYourEmailForVerification,
        duration: 10000, 
      });

    } catch (error: any) {
      console.error("Firebase registration error:", error);
      let errorMessage = t.registrationFailedGeneric;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t.emailAlreadyInUse;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t.invalidEmail;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t.passwordTooWeak;
      } else if (error.code === 'auth/network-request-failed'){
        errorMessage = t.networkError;
      }
      toast({
        variant: "destructive",
        title: t.registrationFailedTitle,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center py-12 min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{t.register}</CardTitle>
          <CardDescription>{t.createAccount} {t.appName}</CardDescription>
        </CardHeader>
        <CardContent>
           {!isAuthServiceAvailable && (
             <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md text-center flex items-center gap-2 justify-center">
                <AlertTriangle className="h-5 w-5" />
                <span>{t.authServiceUnavailable}</span>
            </div>
          )}
          {showVerificationMessage ? (
            <div className="p-6 my-6 text-center bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-md shadow-md">
              <MailCheck className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">{t.emailVerificationSent}</h3>
              <p className="text-muted-foreground">{t.checkYourEmailForVerification}</p>
              <Button asChild className="mt-6">
                <Link href="/auth/login">{t.login}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={!isAuthServiceAvailable || isLoading} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!isAuthServiceAvailable || isLoading} />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPasswordState(e.target.value)} required disabled={!isAuthServiceAvailable || isLoading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)} disabled={!isAuthServiceAvailable || isLoading}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={!isAuthServiceAvailable || isLoading}/>
                  <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={!isAuthServiceAvailable || isLoading}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              <div className="space-y-3">
                <Label>{t.registerAs}</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'provider' | 'seeker')} className="flex gap-4" disabled={!isAuthServiceAvailable || isLoading}>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="provider" id="role-provider" disabled={!isAuthServiceAvailable || isLoading} />
                    <Label htmlFor="role-provider" className="font-normal">{t.provider}</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="seeker" id="role-seeker" disabled={!isAuthServiceAvailable || isLoading}/>
                    <Label htmlFor="role-seeker" className="font-normal">{t.seeker}</Label>
                  </div>
                </RadioGroup>
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || !isAuthServiceAvailable}>
                {isLoading ?  <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : t.register}
              </Button>
            </form>
          )}
          {!showVerificationMessage && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.alreadyHaveAccount}{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                {t.login}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
