
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
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

export default function LoginPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user role from Firestore
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
        // Fallback or error if user document doesn't exist in Firestore
        // This might happen for users created before Firestore integration
        console.warn("User document not found in Firestore. Role might be missing.");
        // For now, we won't set a role, dashboard layout will handle fetching or redirect.
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', firebaseUser.uid);
      localStorage.setItem('userName', userNameFromDb || email.split('@')[0]);
      localStorage.setItem('userEmail', userEmailFromDb || '');
      if (userRole) {
        localStorage.setItem('userRole', userRole);
      } else {
        localStorage.removeItem('userRole'); // Ensure no stale role
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
          <CardTitle className="text-3xl font-headline">{t.login}</CardTitle>
          <CardDescription>{t.welcomeTo} {t.appName}! {t.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
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
