
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Loader2, Send, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createSupportRequest, SupportRequestType } from '@/lib/data';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const ContactFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }),
  subject: z.string().min(1, { message: "requiredField" }),
  message: z.string().min(10, { message: "messageTooShort" }),
  type: z.enum(['inquiry', 'complaint', 'payment_issue', 'other'], { errorMap: () => ({ message: "requiredField" }) }),
});

export default function ContactPage() {
  const t = useTranslation();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SupportRequestType | ''>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      toast({
        variant: "destructive",
        title: t.authError,
        description: t.loginToContactSupport,
      });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    const validationResult = ContactFormSchema.safeParse({ name, email, subject, message, type: type as SupportRequestType });
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
      const ticketId = await createSupportRequest(validationResult.data);
      toast({
        title: t.supportRequestSentTitle,
        description: t.supportRequestSentDescription?.replace('{ticketId}', ticketId.slice(0, 6)),
      });
      setIsSubmitted(true);
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
  
  const requestTypes: { value: SupportRequestType, labelKey: keyof Translations }[] = [
      { value: 'inquiry', labelKey: 'inquiry' },
      { value: 'complaint', labelKey: 'complaint' },
      { value: 'payment_issue', labelKey: 'paymentIssue' },
      { value: 'other', labelKey: 'other' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <LifeBuoy className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-xl font-headline">{t.contactSupport}</CardTitle>
          <CardDescription>{t.contactPageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg shadow-md animate-fadeIn">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">{t.supportRequestSentTitle}</h3>
              <p className="text-muted-foreground">{t.supportRequestSentSuccess}</p>
              <Button asChild className="mt-6">
                <Link href="/dashboard">{t.backToDashboard}</Link>
              </Button>
            </div>
          ) : !authUser ? (
             <div className="text-center p-6">
              <p className="text-muted-foreground mb-4">{t.loginToContactSupport}</p>
              <Button asChild>
                 <Link href="/login">{t.login}</Link>
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
                    <Label htmlFor="type">{t.requestType}</Label>
                    <Select value={type} onValueChange={(v) => setType(v as SupportRequestType)} disabled={isLoading}>
                        <SelectTrigger><SelectValue placeholder={t.selectRequestType} /></SelectTrigger>
                        <SelectContent>
                            {requestTypes.map(rt => <SelectItem key={rt.value} value={rt.value}>{t[rt.labelKey]}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.subject}</Label>
                  <Input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={isLoading} />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.message}</Label>
                  <Textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} disabled={isLoading}/>
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" className="w-full text-lg py-3 group" disabled={isLoading}>
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
