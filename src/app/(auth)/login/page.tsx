"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogInIcon, Loader2, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthServiceAvailable] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.user, data.token);

        toast({
          title: t.loginSuccessful || 'Login Successful',
          description: t.welcomeTo + ' ' + t.appName,
          duration: 5000,
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: t.loginFailedGeneric || 'Login Failed',
          description: data.message || t.loginFailedGeneric,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.loginFailedGeneric || 'Login Failed',
        description: t.loginFailedGeneric,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-6 min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogInIcon className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-headline">{t.login}</CardTitle>
          <CardDescription>{t.welcomeTo} {t.appName}! {t.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthServiceAvailable && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md text-center flex items-center gap-2 justify-center">
              <AlertTriangle className="h-5 w-5" />
              <span>{t.authServiceUnavailable}</span>
            </div>
          )}
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
                className="text-base"
                disabled={!isAuthServiceAvailable || isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.password}</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  {t.forgotPassword}?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                  disabled={!isAuthServiceAvailable || isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  disabled={!isAuthServiceAvailable || isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading || !isAuthServiceAvailable}>
              {isLoading ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : t.login}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.dontHaveAccount}{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t.register}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
