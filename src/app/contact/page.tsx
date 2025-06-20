
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

const ContactFormSchema = z.object({
  name: z.string().min(1, { message: "requiredField" }),
  email: z.string().email({ message: "invalidEmail" }),
  subject: z.string().min(1, { message: "requiredField" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }), // Custom message for length
});

type ContactFormInputs = z.infer<typeof ContactFormSchema>;

export default function ContactPage() {
  const t = useTranslation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContactFormInputs>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setIsSubmitted(false);

    const validationResult = ContactFormSchema.safeParse(formData);
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
      const response = await fetch('https://formsubmit.co/mobusinessarena@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
            ...validationResult.data,
            _subject: `KHIDMAP Contact: ${validationResult.data.subject}`,
            _replyto: validationResult.data.email,
        }),
      });

      if (response.ok) {
        toast({
          title: t.messageSentSuccessTitle,
          description: t.messageSentSuccessDescription,
        });
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: t.messageSentErrorTitle,
          description: errorData.message || t.messageSentErrorDescription,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.messageSentErrorTitle,
        description: t.messageSentErrorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">{t.contactUs}</CardTitle>
          <CardDescription>{t.contactPageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg shadow-md animate-fadeIn">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-2xl font-semibold text-green-700 dark:text-green-300 mb-2">{t.messageSentSuccessTitle}</h3>
              <p className="text-muted-foreground">{t.messageSentSuccessDescription}</p>
              <Button onClick={() => setIsSubmitted(false)} className="mt-6">
                {t.sendMessage} {t.other}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6 text-center">{t.contactFormIntro}</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.yourName}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.yourEmail}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.subject}</Label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} disabled={isLoading} />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.message}</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} disabled={isLoading}/>
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>
                 <input type="hidden" name="_captcha" value="false" /> 
                 <input type="hidden" name="_template" value="table" />
                <Button type="submit" className="w-full text-lg py-3 group" disabled={isLoading}>
                  {isLoading ? <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" /> : <Send className="ltr:mr-2 rtl:ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300"/>}
                  {t.sendMessage}
                </Button>
              </form>
              <p className="mt-6 text-xs text-muted-foreground text-center">
                {t.formSubmitActivationNote}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    