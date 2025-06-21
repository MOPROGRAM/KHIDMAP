
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
  GripVertical, HardHat, Layers, Star, Wrench, Zap, MessageSquare, Image as ImageIcon, Video, Briefcase, BotMessageSquare, Sparkles, Building, PhoneCall
} from 'lucide-react';
import Link from 'next/link';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { db, auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

  const fetchProviderData = useCallback(() => {
     if (!db) {
        setError(t.serviceUnavailableMessage);
        setIsLoading(false);
        return;
    }
    if (!providerId) {
      setError(t.providerIdMissing);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    Promise.all([
        getUserProfileById(providerId),
        getRatingsForUser(providerId),
    ]).then(([foundProvider, foundRatings]) => {
      if (foundProvider) {
        setProvider(foundProvider);
        if (Array.isArray(foundRatings)) {
            setRatings(foundRatings);
            if (foundRatings.length > 0) {
              const totalRating = foundRatings.reduce((acc, r) => acc + r.rating, 0);
              setAverageRating(totalRating / foundRatings.length);
            } else {
              setAverageRating(0);
            }
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
  }, [providerId, t]);

  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setUserRole(user ? localStorage.getItem('userRole') : null);
    });
    
    fetchProviderData();

    return () => {
      unsubscribeAuth();
    };
  }, [fetchProviderData]);

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
          fetchProviderData();
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
  
  const formatDate = (dateValue: Timestamp | { seconds: number; nanoseconds: number; } | undefined): string => {
    if (!dateValue) return 'N/A';
    let date: Date;
    if ('toDate' in dateValue && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if ('seconds' in dateValue && typeof dateValue.seconds === 'number') {
      date = new Date(dateValue.seconds * 1000);
    } else {
      const d = new Date(dateValue as any);
      if (!isNaN(d.getTime())) { date = d; } else { return 'N/A'; }
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const validMedia = useMemo(() => {
    if (!provider || !Array.isArray(provider.media)) return [];
    return provider.media.filter(item => item && item.id && item.url && item.type);
  }, [provider]);

  const serviceCategories = useMemo(() => Array.isArray(provider?.serviceCategories) ? provider.serviceCategories : [], [provider]);
  const serviceAreas = useMemo(() => Array.isArray(provider?.serviceAreas) ? provider.serviceAreas : [], [provider]);
  const cleanPhoneNumber = useMemo(() => provider?.phoneNumber?.replace(/[^0-9+]/g, '') || '', [provider?.phoneNumber]);

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
  
  const whatsappMessage = encodeURIComponent(`Hello, I found your profile on ${t.appName} and I'm interested in your services.`);


  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fadeIn">
      <Button variant="outline" onClick={() => router.back()} className="mb-2 group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors group-hover:translate-x-[-2px]" /> {t.backToSearch}
      </Button>

      <Card className="overflow-hidden shadow-2xl border-none">
        <div className="relative">
          <div className="h-40 md:h-56 w-full bg-muted">
            <NextImage 
              src="https://placehold.co/1000x400.png"
              alt={`${provider.name}'s banner`}
              layout="fill"
              objectFit="cover"
              className="opacity-50"
              data-ai-hint="tools workshop"
            />
          </div>
          <div className="absolute top-20 md:top-32 left-1/2 -translate-x-1/2 w-full px-4">
              <div className="flex flex-col items-center text-center">
                 <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                    <AvatarImage src={provider.profilePictureUrl} alt={provider.name} data-ai-hint="person portrait"/>
                    <AvatarFallback className="text-4xl"><UserCircle /></AvatarFallback>
                </Avatar>
              </div>
          </div>
        </div>

        <div className="pt-20 p-6 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{provider.name}</h1>
             {serviceCategories.length > 0 && (
                <p className="text-base text-muted-foreground mt-1">
                    {t[serviceCategories[0].toLowerCase() as keyof Translations] || serviceCategories[0]}
                </p>
             )}
            <div className="flex items-center gap-2 mt-3">
                <StarRating rating={averageRating} />
                <span className="text-sm text-muted-foreground">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} (${ratings.length} ${t.reviews})` : t.noReviewsYet}
                </span>
            </div>
        </div>
        
        <Separator/>

        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4">
                 {provider.phoneNumber && (
                    <Button asChild size="lg" className="w-full">
                        <a href={`tel:${cleanPhoneNumber}`}>
                          <PhoneCall className="ltr:mr-2 rtl:ml-2"/> {t.callNow}
                        </a>
                    </Button>
                )}
                 {provider.phoneNumber && (
                    <Button asChild size="lg" variant="outline" className="w-full">
                        <a href={`https://wa.me/${cleanPhoneNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                          <BotMessageSquare className="ltr:mr-2 rtl:ml-2" /> {t.contactOnWhatsApp}
                        </a>
                    </Button>
                )}
                {authUser && authUser.uid !== provider.uid && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={handleStartConversation}
                      disabled={isCreatingConversation}
                    >
                      {isCreatingConversation ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="ltr:mr-2 rtl:ml-2" />}
                      {t.messageProvider}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-6">
                     {provider.qualifications && (
                        <div className="space-y-2">
                           <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Sparkles/> {t.aboutProvider.replace('{name}', provider.name)}</h2>
                           <p className="text-muted-foreground whitespace-pre-wrap">{provider.qualifications}</p>
                        </div>
                     )}
                     {serviceAreas.length > 0 && (
                        <div className="space-y-2">
                           <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Building/> {t.servesAreasTitle}</h2>
                           <p className="text-muted-foreground">{serviceAreas.join(', ')}</p>
                        </div>
                     )}
                </div>
                 {serviceCategories.length > 0 && (
                    <div className="space-y-2">
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Briefcase/> {t.specialties}</h2>
                       <div className="flex flex-col gap-2">
                            {serviceCategories.map(cat => {
                                const CatIcon = categoryIcons[cat] || GripVertical;
                                return(
                                  <div key={cat} className="flex items-center gap-2 text-muted-foreground">
                                    <CatIcon className="h-4 w-4 text-primary" />
                                    <span>{t[cat.toLowerCase() as keyof Translations] || cat}</span>
                                  </div>
                                )
                            })}
                       </div>
                    </div>
                )}
            </div>

             {validMedia.length > 0 && (
                <div className="mt-8 space-y-4">
                  <Separator/>
                   <h2 className="text-xl font-bold text-primary flex items-center gap-2"><ImageIcon/> {t.gallery}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {validMedia.map(item => (
                           <div key={item.id} className="group aspect-square relative overflow-hidden rounded-lg shadow-md bg-muted">
                               {item.type === 'video' ? (
                                   <video
                                       src={item.url}
                                       controls
                                       className="w-full h-full object-cover"
                                       aria-label={t.mediaItem}
                                   >
                                       {t.videoNotSupported}
                                   </video>
                               ) : (
                                   <NextImage 
                                       src={item.url} 
                                       alt={t.mediaItem || 'Media Item'} 
                                       layout="fill" 
                                       objectFit="cover"
                                       className="group-hover:scale-105 transition-transform duration-300"
                                   />
                               )}
                                <div className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded-full pointer-events-none">
                                    {item.type === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                                </div>
                           </div>
                        ))}
                    </div>
                </div>
              )}
             
            <div className="mt-8 space-y-4">
                <Separator/>
                <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Star/> {t.reviews}</h2>
                {ratings.length > 0 ? (
                    <div className="space-y-4">
                        {ratings.map(rating => (
                            <Card key={rating.id} className="bg-muted/30 border p-4 shadow-sm">
                               <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                       <AvatarFallback>{rating.raterName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                       <p className="font-semibold text-foreground text-sm">{rating.raterName}</p>
                                       <p className="text-xs text-muted-foreground">{formatDate(rating.createdAt)}</p>
                                    </div>
                                 </div>
                                 <StarRating rating={rating.rating} />
                               </div>
                               {rating.comment && <p className="mt-3 text-sm text-foreground/80 pl-10">{rating.comment}</p>}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">{t.noReviewsYet}</p>
                )}
            </div>
            
            {authUser && userRole === 'seeker' && authUser.uid !== providerId && (
                <div className="mt-8 pt-4 border-t">
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
    </div>
  );
}
