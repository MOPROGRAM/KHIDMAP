
"use client";

import React, { useEffect, useState, useCallback, FormEvent, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { UserProfile, getRatingsForUser, getUserProfileById, ServiceCategory, addRating, Rating, findOrCreateConversation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image';
import {
  ArrowLeft, MapPin, Phone, Mail, UserCircle, Info, Loader2, AlertTriangle, Hammer, Brush, SprayCan,
  GripVertical, HardHat, Layers, Star, Wrench, Zap, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { db, auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Brush,
  HomeCleaning: SprayCan,
  Construction: HardHat,
  Plastering: Layers,
  Other: GripVertical,
};

const StarRating = ({
  rating,
  setRating,
  size = 5,
  interactive = false,
  className
}: {
  rating: number;
  setRating?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
  className?: string;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizeClass = useMemo(() => {
    switch (size) {
      case 4: return 'h-4 w-4';
      case 6: return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  }, [size]);

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (interactive && setRating) {
      setRating(index);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={i}
            className={cn(
              'transition-colors',
              interactive ? 'cursor-pointer' : '',
              starValue <= (hoverRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground/50',
              starSizeClass
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          />
        );
      })}
    </div>
  );
};


export default function ProviderDetailsPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;
  const { toast } = useToast();

  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    // Set up auth listener
    if (!auth) {
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setUserRole(user ? localStorage.getItem('userRole') : null);
    });

    // Fetch provider data
    if (!db) {
        setError(t.serviceUnavailableMessage);
        setIsLoading(false);
        return () => unsubscribeAuth();
    }
    if (!providerId) {
      setError(t.providerIdMissing);
      setIsLoading(false);
      return () => unsubscribeAuth();
    }

    setIsLoading(true);
    setError(null);
    
    Promise.all([
        getUserProfileById(providerId),
        getRatingsForUser(providerId),
    ]).then(([foundProvider, foundRatings]) => {
      if (foundProvider) {
        setProvider(foundProvider);
        setRatings(foundRatings);

        if (foundRatings.length > 0) {
          const totalRating = foundRatings.reduce((acc, r) => acc + r.rating, 0);
          setAverageRating(totalRating / foundRatings.length);
        } else {
          setAverageRating(0);
        }
      } else {
        setError(t.providerNotFound);
      }
    }).catch((err: any) => {
      console.error("Error fetching provider details:", err);
      if (String(err.message).includes("requires an index")) {
        setError(t.firestoreIndexError);
      } else {
        setError(String(err.message) || t.failedLoadProviderDetails);
      }
    }).finally(() => {
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [providerId, t]);

  const handleRatingSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!authUser || !provider) {
          toast({ variant: "destructive", title: t.authError, description: t.loginToRate });
          return;
      }
      if (ratingInput === 0) {
          toast({ variant: "destructive", title: t.errorOccurred, description: t.selectRating });
          return;
      }
      setIsSubmitting(true);
      try {
          await addRating({
              ratedUserId: provider.uid,
              raterUserId: authUser.uid,
              raterName: authUser.displayName || "Anonymous",
              rating: ratingInput,
              comment: commentInput,
          });
          toast({ title: t.ratingSubmitted, description: t.thankYouForFeedback });
          setRatingInput(0);
          setCommentInput('');
          // Re-fetch ratings after submission
          getRatingsForUser(provider.uid).then(foundRatings => {
            setRatings(foundRatings);
            if (foundRatings.length > 0) {
                const totalRating = foundRatings.reduce((acc, r) => acc + r.rating, 0);
                setAverageRating(totalRating / foundRatings.length);
            } else {
                setAverageRating(0);
            }
          });
      } catch (error: any) {
          toast({ variant: "destructive", title: t.errorOccurred, description: String(error.message || t.failedSubmitRating) });
      } finally {
          setIsSubmitting(false);
      }
  }

  const handleStartConversation = async () => {
    if (!authUser || !provider) {
      toast({ variant: 'destructive', title: t.authError, description: t.userNotAuthenticated });
      return;
    }
    setIsCreatingConversation(true);
    try {
      const conversationId = await findOrCreateConversation(authUser.uid, provider.uid);
      if (conversationId) {
        router.push(`/dashboard/messages?conversationId=${conversationId}`);
      } else {
        throw new Error("Could not create or find conversation.");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({ variant: 'destructive', title: t.errorOccurred, description: "Could not start a conversation." });
    } finally {
      setIsCreatingConversation(false);
    }
  };
  
  const formatDate = (dateValue: Timestamp | { seconds: number; nanoseconds: number } | undefined): string => {
    if (!dateValue) {
      return 'N/A';
    }

    // Case 1: It's a Firestore Timestamp object from a direct client-side fetch
    if ('toDate' in dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Case 2: It's a plain object from server-side rendering (e.g., { seconds: ..., nanoseconds: ... })
    if ('seconds' in dateValue && typeof dateValue.seconds === 'number') {
      return new Date(dateValue.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Fallback for unexpected formats, though it might not be robust
    const d = new Date(dateValue as any);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    return 'N/A'; // Return N/A instead of 'Invalid Date' for cleaner UI
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 max-w-md mx-auto animate-fadeIn">
        <Card className="shadow-xl border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-destructive">
              <AlertTriangle className="h-8 w-8" />
              {t.errorOccurred}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{String(error)}</p>
            <Button asChild variant="outline" onClick={() => router.back()} className="hover:bg-destructive/10 hover:border-destructive transition-colors duration-200 group">
                <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" /> {t.backButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!provider) { 
     return (
      <div className="text-center py-10 max-w-md mx-auto animate-fadeIn">
        <Card className="shadow-xl border">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-foreground">
              <Info className="h-8 w-8 text-primary" />
               {t.providerNotFound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{t.providerDetailsNotAvailable}</p>
             <Button asChild variant="outline" onClick={() => router.back()} className="hover:bg-accent/10 hover:border-primary transition-colors duration-200 group">
                <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" /> {t.backButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-4 animate-fadeIn">
      <Button variant="outline" onClick={() => router.back()} className="mb-2 group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors group-hover:translate-x-[-2px]" /> {t.backToSearch}
      </Button>

      <Card className="overflow-hidden shadow-2xl border">
        <CardHeader className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <NextImage 
                src={provider.profilePictureUrl || "https://placehold.co/128x128.png"} 
                alt={provider.name} 
                width={128} 
                height={128} 
                className="rounded-full border-4 border-primary shadow-lg object-cover"
                data-ai-hint="person portrait"
                priority
            />
            <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">{provider.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} {t.of} 5 ({ratings.length} {t.reviews})
                    </span>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">{t.postedOnFull} {formatDate(provider.createdAt)}</p>
            </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4 animate-fadeIn animation-delay-200">
            {provider.qualifications && (
              <div>
                <h3 className="text-base font-semibold text-muted-foreground mb-1.5">{t.qualifications}:</h3>
                <p className="text-sm bg-muted/50 p-3 rounded-lg border whitespace-pre-wrap text-foreground/90 shadow-inner">{provider.qualifications}</p>
              </div>
            )}
            {provider.serviceCategories && provider.serviceCategories.length > 0 && (
                <div>
                    <h3 className="text-base font-semibold text-muted-foreground mb-1.5">{t.serviceCategoriesTitle}:</h3>
                    <div className="flex flex-wrap gap-2">
                        {provider.serviceCategories.map(cat => {
                        const ProviderCatIcon = categoryIcons[cat] || GripVertical;
                        const providerCatKey = cat.toLowerCase() as keyof Translations;
                        return (
                        <span key={cat} className="px-3 py-1.5 bg-accent text-accent-foreground text-sm rounded-full shadow-sm flex items-center gap-1.5">
                            <ProviderCatIcon className="h-4 w-4" />
                            {t[providerCatKey] || cat}
                        </span>
                        );
                        })}
                    </div>
                </div>
            )}
            {provider.serviceAreas && provider.serviceAreas.length > 0 && (
                <div>
                <h3 className="text-base font-semibold text-muted-foreground mb-1.5">{t.servesAreasTitle}:</h3>
                <p className="text-sm text-foreground/90">{provider.serviceAreas.join(', ')}</p>
                </div>
            )}
          </div>
          
          <Separator className="my-4" />

          {authUser && authUser.uid !== provider.uid && (
            <CardFooter className="p-0 pt-0 flex flex-col sm:flex-row gap-2">
              <Button
                size="lg"
                className="w-full text-base py-3 group"
                onClick={handleStartConversation}
                disabled={isCreatingConversation}
              >
                {isCreatingConversation ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="ltr:mr-2 rtl:ml-2 h-5 w-5" />}
                {t.messages}
              </Button>
            </CardFooter>
          )}

          <Separator className="my-4" />

          {/* Reviews Section */}
          <div className="space-y-4 animate-fadeIn animation-delay-400">
            <h2 className="text-xl font-semibold text-primary font-headline">{t.reviews}</h2>
            {ratings.length > 0 ? (
                <div className="space-y-4">
                    {ratings.map(rating => (
                        <Card key={rating.id} className="bg-muted/30 border p-4 shadow-sm">
                           <div className="flex justify-between items-start">
                             <div>
                               <p className="font-semibold text-foreground">{rating.raterName}</p>
                               <p className="text-xs text-muted-foreground">{formatDate(rating.createdAt)}</p>
                             </div>
                             <StarRating rating={rating.rating} />
                           </div>
                           {rating.comment && <p className="mt-2 text-sm text-foreground/80">{rating.comment}</p>}
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">{t.noReviewsYet}</p>
            )}
          </div>
          
          <Separator className="my-4" />

          {/* Rating Form */}
          {authUser && userRole === 'seeker' && authUser.uid !== providerId && (
            <div className="pt-2 animate-fadeIn animation-delay-600">
                <h2 className="text-xl font-semibold text-primary font-headline mb-4">{t.rateThisProvider}</h2>
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="rating">{t.rating}</Label>
                        <StarRating rating={ratingInput} setRating={setRatingInput} interactive={true} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="comment">{t.comment}</Label>
                        <Textarea 
                            id="comment" 
                            value={commentInput} 
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="..."
                            disabled={isSubmitting}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting || ratingInput === 0}>
                        {isSubmitting && <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />}
                        {t.submitRating}
                    </Button>
                </form>
            </div>
          )}
        </CardContent>
      </Card>
       <style jsx global>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        [style*="animation-delay"] {
          animation-fill-mode: backwards; 
        }
      `}</style>
    </div>
  );
}
