
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogInIcon, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; // auth can be undefined
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);


  useEffect(() => {
    if (auth) {
      setIsAuthInitialized(true);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, redirect to dashboard or relevant page
          // router.push('/dashboard'); // Avoid redirecting if already on a page that requires auth state check
        }
      });
      return () => unsubscribe();
    } else {
      setIsAuthInitialized(false);
      console.warn("Firebase Auth is not initialized in LoginPage.");
    }
  }, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) {
      toast({
        variant: "destructive",
        title: "Service Unavailable",
        description: "Authentication or database service is not configured. Please contact support.",
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole: 'provider' | 'seeker' | null = null;
      let userNameFromDb: string | null = firebaseUser.displayName;
      let userEmailFromDb: string | null = firebaseUser.email;

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userRole = userData.role as 'provider' | 'seeker';
        userNameFromDb = userData.name || userNameFromDb;
        userEmailFromDb = userData.email || userEmailFromDb;
      } else {
        console.warn("User document not found in Firestore. Role might be missing.");
        // This is a critical issue if Firestore setup is expected
        // For now, let user log in, dashboard will handle redirect if role is missing from Firestore
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', firebaseUser.uid);
      localStorage.setItem('userName', userNameFromDb || email.split('@')[0]);
      localStorage.setItem('userEmail', userEmailFromDb || '');
      if (userRole) {
        localStorage.setItem('userRole', userRole);
      } else {
        localStorage.removeItem('userRole'); 
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userNameFromDb || email.split('@')[0]}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Firebase login error:", error);
      let errorMessage = "Login Failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/network-request-failed'){
        errorMessage = "Network error. Please check your internet connection.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogInIcon className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-headline">{t.login}</CardTitle>
          <CardDescription>{t.welcomeTo} {t.appName}! {t.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthInitialized && !auth && (
             <div className="p-4 mb-4 text-sm text-destructive-foreground bg-destructive rounded-md text-center">
                Authentication service is currently unavailable. Please try again later or contact support.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || !isAuthInitialized}>
              {isLoading ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : t.login}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.dontHaveAccount}{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              {t.register}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
