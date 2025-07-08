
"use client";

import React, { useEffect, useState, useCallback, FormEvent, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { UserProfile, getRatingsForUser, getUserProfileById, ServiceCategory, addRating, startOrGetChat } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, MapPin, Mail, UserCircle, Info, Loader2, AlertTriangle, Hammer, Brush, SprayCan,
  GripVertical, HardHat, Layers, Star, Wrench, Zap, Briefcase, BotMessageSquare, Sparkles, Building, PhoneCall, Camera, Video as VideoIcon, MessageSquare, PlusCircle, BadgeCheck
} from 'lucide-react';
import Link from 'next/link';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { db, auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { toast } = useToast();

  const providerId = useMemo(() => {
    const id = params.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params.id]);


  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);

  const WhatsAppIcon = () => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52s-.67-.816-.916-1.123c-.246-.306-.5-.337-.67-.342-.173-.005-.371-.005-.57-.005-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );


  const fetchProviderData = useCallback(async () => {
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
    
    try {
        const foundProvider = await getUserProfileById(providerId);
        if (foundProvider) {
            setProvider(foundProvider);
        } else {
            setError(t.providerNotFound);
        }
        
        const foundRatings = await getRatingsForUser(providerId);
        if (foundRatings) {
            // Sort client-side now that the Firestore query doesn't order them.
            foundRatings.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setRatings(foundRatings);
            if (foundRatings.length > 0) {
                const totalRating = foundRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
                setAverageRating(totalRating / foundRatings.length);
            } else {
                setAverageRating(0);
            }
        }
    } catch (err: any) {
        console.error("Error fetching provider details:", err);
        setError(t.failedLoadProviderDetails);
    } finally {
        setIsLoading(false);
    }
  }, [providerId, t]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        // Fetch definitive role from Firestore to ensure button visibility is correct
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;
            setUserRole(role);
            localStorage.setItem('userRole', role); // Keep localStorage in sync
          } else {
             setUserRole(null); // No profile, no role
          }
        } catch (e) {
            console.error("Error fetching user role for details page:", e);
            setUserRole(null);
        }
      } else {
        setAuthUser(null);
        setUserRole(null);
      }
      setIsAuthLoading(false);
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
              raterName: authUser.displayName || t.unknownUser,
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

  const handleStartChat = async () => {
    if (!authUser || !provider) {
        toast({ variant: "destructive", title: t.authError, description: t.loginToMessage });
        return;
    }
    setIsStartingChat(true);
    try {
        const chatId = await startOrGetChat(provider.uid);
        router.push(`/dashboard/messages?chatId=${chatId}`);
    } catch (error: any) {
        console.error("Error starting chat:", error);
        toast({ variant: "destructive", title: t.startChatError, description: error.message });
    } finally {
        setIsStartingChat(false);
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
  
  const serviceCategories = useMemo(() => Array.isArray(provider?.serviceCategories) ? provider.serviceCategories.filter(Boolean) as ServiceCategory[] : [], [provider]);
  const serviceAreas = useMemo(() => Array.isArray(provider?.serviceAreas) ? provider.serviceAreas.filter(Boolean) : [], [provider]);
  const images = useMemo(() => Array.isArray(provider?.images) ? provider.images : [], [provider]);
  const videos = useMemo(() => Array.isArray(provider?.videos) ? provider.videos : [], [provider]);
  const cleanPhoneNumber = useMemo(() => provider?.phoneNumber?.replace(/[^0-9+]/g, '') || '', [provider?.phoneNumber]);
  const whatsappMessage = encodeURIComponent((t.whatsappMessage || "Hello, I found your profile on {appName} and I'm interested in your services.").replace('{appName}', t.appName));


  if (isLoading || isAuthLoading) {
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
                <>
                  <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" /> {t.backButton}
                </>
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
                <>
                  <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" /> {t.backButton}
                </>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fadeIn">
      <Button variant="outline" onClick={() => router.back()} className="mb-2 group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors group-hover:translate-x-[-2px]" /> {t.backToSearch}
      </Button>

      <Card className="overflow-hidden shadow-2xl border-none">
        <div className="bg-card-foreground/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                    <AvatarImage src={images.length > 0 ? images[0] : undefined} alt={provider.name || 'Provider avatar'} />
                    <AvatarFallback className="bg-transparent text-6xl">
                       <UserCircle className="w-full h-full text-muted" />
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{provider.name || ''}</h1>
                        {provider.verificationStatus === 'verified' && (
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <BadgeCheck className="h-7 w-7 text-green-500"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t.verifiedProvider}</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        )}
                    </div>
                    
                    {serviceCategories?.[0] && (
                        <p className="text-lg text-primary font-semibold">
                            {t[(serviceCategories[0]).toLowerCase() as keyof Translations] || serviceCategories[0]}
                        </p>
                    )}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <StarRating rating={averageRating} />
                        <span className="text-sm text-muted-foreground">
                            {averageRating > 0 ? `${averageRating.toFixed(1)} (${ratings.length} ${t.reviews})` : t.noReviewsYet}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        <Separator/>

        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                {authUser && userRole === 'seeker' && authUser.uid !== providerId && (
                    <Button asChild size="lg" className="w-full group">
                        <Link href={`/request-service/${providerId}`}>
                            <PlusCircle className="ltr:mr-2 rtl:ml-2"/>
                            {t.requestService}
                        </Link>
                    </Button>
                )}
                 {provider.phoneNumber && (
                    <Button asChild size="lg" className="w-full group">
                        <a href={`tel:${cleanPhoneNumber}`}>
                          <PhoneCall className="ltr:mr-2 rtl:ml-2"/> {t.callNow}
                        </a>
                    </Button>
                )}
                {provider.phoneNumber && (
                    <Button asChild size="lg" className="w-full group bg-green-500 hover:bg-green-600 text-white">
                        <a href={`https://wa.me/${cleanPhoneNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                           <WhatsAppIcon /> {t.contactOnWhatsApp}
                        </a>
                    </Button>
                )}
                 {authUser && userRole === 'seeker' && authUser.uid !== providerId && (
                  <Button onClick={handleStartChat} disabled={isStartingChat} size="lg" variant="outline" className="w-full group">
                      {isStartingChat ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : <MessageSquare className="ltr:mr-2 rtl:ml-2"/>}
                      {t.messageProvider?.replace('{providerName}', provider.name.split(' ')[0])}
                  </Button>
                )}
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
              {/* Main Content Column */}
              <div className="md:col-span-2 space-y-8">
                  {provider.qualifications && (
                    <div>
                      <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-3"><Sparkles/> {t.aboutProvider?.replace('{name}', provider.name || t.provider)}</h2>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{provider.qualifications}</p>
                    </div>
                  )}

                  {serviceAreas.length > 0 && (
                    <div>
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-3"><Building/> {t.servesAreasTitle}</h2>
                       <p className="text-muted-foreground">{serviceAreas.join(', ')}</p>
                    </div>
                  )}
              </div>

              {/* Specialties Column */}
              <div className="space-y-4">
                 {serviceCategories.length > 0 && (
                    <div>
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Briefcase/> {t.specialties}</h2>
                       <div className="flex flex-col gap-3">
                            {serviceCategories.map(cat => {
                                if (!cat || typeof cat !== 'string') return null;
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
            </div>
            
            {images.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Camera/> {t.portfolioTitle} {t.images}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((url, index) => (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer">
                                    <Image src={url} alt={`${t.portfolioImage} ${index + 1}`} layout="fill" className="object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-black/40 transition-all duration-300">
                                        <Camera className="w-10 h-10 text-white transition-transform group-hover:scale-110" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
                                <DialogTitle className="sr-only">{t.portfolioImage} {index + 1}</DialogTitle>
                                <DialogDescription className="sr-only">{t.fullscreenViewOf} {t.portfolioImage} {index + 1}</DialogDescription>
                                <Image src={url} alt={`${t.portfolioImage} ${index + 1}`} width={1920} height={1080} className="rounded-lg object-contain max-h-[90vh] w-full" />
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </div>
            )}
            
            {videos.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><VideoIcon/> {t.portfolioTitle} {t.videos}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {videos.map((url, index) => (
                        <Dialog key={index}>
                             <DialogTrigger asChild>
                                <div className="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer">
                                   <video src={url} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-black/40 transition-all duration-300">
                                        <VideoIcon className="w-10 h-10 text-white transition-transform group-hover:scale-110" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
                                <DialogTitle className="sr-only">{t.portfolioVideo} {index + 1}</DialogTitle>
                                 <DialogDescription className="sr-only">{t.fullscreenViewOf} {t.portfolioVideo} {index + 1}</DialogDescription>
                                <video src={url} controls autoPlay className="w-full max-h-[90vh] rounded-lg" />
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </div>
            )}
             
            <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Star/> {t.reviews}</h2>
                {ratings.length > 0 ? (
                    <div className="space-y-4">
                        {ratings.map(rating => (
                            <Card key={rating.id} className="bg-muted/30 border p-4 shadow-sm">
                               <div className="flex justify-between items-start gap-4">
                                 <div className="flex items-center gap-3 flex-1">
                                    <Avatar className="h-10 w-10">
                                       <AvatarFallback>{rating.raterName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                       <p className="font-semibold text-foreground text-sm">{rating.raterName}</p>
                                       <p className="text-xs text-muted-foreground">{formatDate(rating.createdAt)}</p>
                                    </div>
                                 </div>
                                 <div className="flex-shrink-0">
                                    <StarRating rating={rating.rating} />
                                 </div>
                               </div>
                               {rating.comment && <p className="mt-3 text-sm text-foreground/80 ltr:pl-12 rtl:pr-12">{rating.comment}</p>}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">{t.noReviewsYet}</p>
                )}
            </div>
            
            {authUser && userRole === 'seeker' && authUser.uid !== providerId && (
                <div className="mt-8 pt-8 border-t">
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
