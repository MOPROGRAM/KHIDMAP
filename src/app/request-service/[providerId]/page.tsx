
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from "@/hooks/use-toast";
import { UserProfile, getUserProfileById, createOrder } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { Loader2, Send, UserCircle, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function RequestServicePage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const providerId = Array.isArray(params.providerId) ? params.providerId[0] : params.providerId;

  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setError("Provider ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchProvider = async () => {
      try {
        const profile = await getUserProfileById(providerId);
        if (profile) {
          setProvider(profile);
        } else {
          setError("Provider not found.");
        }
      } catch (err) {
        setError("Failed to fetch provider details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);
  
  useEffect(() => {
     const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        toast({
          variant: 'destructive',
          title: t.authError,
          description: "Please log in to request a service.",
        });
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, t, toast]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ variant: 'destructive', title: "Description Required", description: "Please describe the service you need." });
      return;
    }
    setIsSubmitting(true);
    try {
        const orderId = await createOrder(providerId, description);
        toast({
            title: "Order Created Successfully!",
            description: "You will now be redirected to the payment page."
        });
        router.push(`/dashboard/orders/${orderId}`);
    } catch (err: any) {
        toast({
            variant: 'destructive',
            title: "Failed to Create Order",
            description: err.message
        });
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error || !provider) {
    return <div className="text-center text-destructive">{error || "Provider could not be loaded."}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
       <Button variant="outline" onClick={() => router.back()} className="mb-4 group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors group-hover:translate-x-[-2px]" />
        Back to Profile
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16 border">
                <AvatarImage src={provider.images?.[0] || undefined} alt={provider.name} />
                <AvatarFallback><UserCircle className="h-8 w-8"/></AvatarFallback>
             </Avatar>
             <div>
                <CardDescription>Requesting Service from</CardDescription>
                <CardTitle className="text-2xl font-headline">{provider.name}</CardTitle>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Service Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the job you need done in detail..."
                rows={6}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-2">The provider will see this description. Be as clear as possible.</p>
            </div>
            <Button type="submit" className="w-full text-lg py-3 group" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="ltr:mr-2 rtl:ml-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="ltr:mr-2 rtl:ml-2 h-5 w-5" />
              )}
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
