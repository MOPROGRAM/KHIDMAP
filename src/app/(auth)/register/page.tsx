
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
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { mockRegister } from '@/lib/data'; // Mock registration function
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'provider' | 'seeker' | ''>(searchParams.get('role') as 'provider' | 'seeker' || '');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialRole = searchParams.get('role');
    if (initialRole === 'provider' || initialRole === 'seeker') {
      setRole(initialRole);
    }
  }, [searchParams]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationResult = RegisterSchema.safeParse({ name, email, password, confirmPassword, role });

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
    
    // Simulate API call for registration
    const registeredUser = mockRegister({name, email, role: validationResult.data.role});

    setTimeout(() => {
      if (registeredUser) {
        // Mock login after registration
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', registeredUser.role);
        localStorage.setItem('userId', registeredUser.id);
        localStorage.setItem('userName', registeredUser.name);
        localStorage.setItem('userEmail', registeredUser.email);

        toast({
          title: "Registration Successful",
          description: `Welcome, ${registeredUser.name}! Your account has been created.`,
        });
        router.push(registeredUser.role === 'provider' ? '/dashboard/provider/profile' : '/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An error occurred during registration. Please try again.",
        });
      }
      setIsLoading(false);
    }, 1000);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            <div className="space-y-3">
              <Label>{t.registerAs}</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'provider' | 'seeker')} className="flex gap-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="provider" id="role-provider" />
                  <Label htmlFor="role-provider" className="font-normal">{t.provider}</Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="seeker" id="role-seeker" />
                  <Label htmlFor="role-seeker" className="font-normal">{t.seeker}</Label>
                </div>
              </RadioGroup>
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? t.loading : t.register}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.alreadyHaveAccount}{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              {t.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
