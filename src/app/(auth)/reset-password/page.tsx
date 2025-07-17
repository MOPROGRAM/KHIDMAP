"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { z } from "zod";

const ResetPasswordSchema = z.object({
  password: z.string().min(6, { message: "passwordTooShort" }),
  confirmPassword: z.string().min(6, { message: "passwordTooShort" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "passwordsDoNotMatch",
  path: ["confirmPassword"],
});

function safeT(t: any, key: string): string {
  return (t && typeof t[key] === 'string') ? t[key] : key;
}

export default function ResetPasswordPage() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        variant: "destructive",
        title: t.errorOccurred || "Invalid Link",
        description: t.invalidEmail || "The password reset link is missing or invalid.",
      });
      router.replace('/forgot-password'); // Redirect if no token
    }
  }, [searchParams, router, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationResult = ResetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        if (err.path[0]) {
          // @ts-ignore
          fieldErrors[err.path[0] as string] = safeT(t, err.message) || err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    if (!token) {
      toast({
        variant: "destructive",
        title: t.errorOccurred || "Invalid Link",
        description: t.invalidEmail || "The password reset token is missing.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsResetSuccess(true);
        toast({
          title: t.loginSuccessful || 'Password Reset Successful', // Using an existing translation key
          description: t.checkYourEmailForVerification || 'Your password has been reset successfully. You can now log in.', // Using an existing translation key
          duration: 5000,
        });
      } else {
        toast({
          variant: 'destructive',
          title: t.loginFailedGeneric || 'Password Reset Failed', // Using an existing translation key
          description: data.message || t.loginFailedGeneric || 'An error occurred while resetting your password.', // Using an existing translation key
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        variant: 'destructive',
        title: t.loginFailedGeneric || 'Password Reset Failed', // Using an existing translation key
        description: t.loginFailedGeneric || 'An error occurred while resetting your password.', // Using an existing translation key
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-headline">{t.forgotPassword || 'Reset Password'}</CardTitle> {/* Using a generic key */}
          {!isResetSuccess && <CardDescription>{t.forgotPasswordDescription || 'Enter your new password.'}</CardDescription>} {/* Using an existing translation key */}
        </CardHeader>
        <CardContent>
          {isResetSuccess ? (
            <div className="p-6 my-6 text-center bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-md shadow-md">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">{t.loginSuccessful || 'Password Reset Successful'}</h3> {/* Using an existing translation key */}
              <p className="text-muted-foreground">{t.checkYourEmailForVerification || 'Your password has been reset successfully. You can now log in.'}</p> {/* Using an existing translation key */}
              <Button asChild className="mt-6">
                <Link href="/login">{t.login}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t.password || 'New Password'}</Label> {/* Using an existing translation key */}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword || 'Confirm New Password'}</Label> {/* Using an existing translation key */}
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : t.resetPassword || 'Reset Password'} {/* Using a generic key */}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}