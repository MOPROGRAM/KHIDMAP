"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: t.serviceUnavailableTitle,
        description: t.serviceUnavailableMessage,
      });
      return;
    }
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      // We always show the success message to prevent email enumeration attacks.
      setIsSubmitted(true);
    } catch (error: any) {
      // We only catch genuine errors (like invalid email format), not "user not found".
      // Firebase itself will still throw an error for a malformed email.
      if (error.code === 'auth/invalid-email') {
         toast({
            variant: "destructive",
            title: t.resetPasswordErrorTitle,
            description: t.invalidEmail,
          });
      } else {
        // For any other error (including user-not-found), we still show the success message to the user,
        // but log the error for debugging. This is a security best practice.
        console.error("Forgot password error (gracefully handled):", error);
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-headline">{t.forgotPassword}</CardTitle>
           {!isSubmitted && <CardDescription>{t.forgotPasswordDescription}</CardDescription>}
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
             <div className="p-6 my-6 text-center bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-md shadow-md">
              <MailCheck className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">{t.resetLinkSentTitle}</h3>
              <p className="text-muted-foreground">{t.resetLinkSentDescription?.replace('{email}', email)}</p>
              <Button asChild className="mt-6">
                <Link href="/login">{t.backToLogin}</Link>
              </Button>
            </div>
          ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : t.sendResetLink}
              </Button>
            </form>
             <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline inline-flex items-center gap-1">
                 <ArrowLeft className="h-4 w-4" /> {t.backToLogin}
              </Link>
            </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
