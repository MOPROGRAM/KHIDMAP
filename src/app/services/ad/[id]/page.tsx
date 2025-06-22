
"use client";

import React, { useEffect, useState, useCallback, FormEvent, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { UserProfile, getRatingsForUser, getUserProfileById, ServiceCategory, addRating, Rating, startOrGetChat } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, MapPin, Phone, Mail, UserCircle, Info, Loader2, AlertTriangle, Hammer, Brush, SprayCan,
  GripVertical, HardHat, Layers, Star, Wrench, Zap, Briefcase, BotMessageSquare, Sparkles, Building, PhoneCall, Camera, Video as VideoIcon, MessageSquare
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);

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
  
  const whatsappMessage = encodeURIComponent(`Hello, I found your profile on ${t.appName} and I'm interested in your services.`);


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
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{provider.name || ''}</h1>
                    {serviceCategories?.[0] && (
                        <p className="text-lg text-primary font-semibold">
                            {t[(serviceCategories[0]).toLowerCase() as keyof Translations] || serviceCategories[0]}
                        </p>
                    )}
                    <div className="flex items-center justify-center sm:justify-start gap-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4">
                {authUser && userRole === 'seeker' && authUser.uid !== providerId && (
                  <Button onClick={handleStartChat} disabled={isStartingChat} size="lg" className="w-full group">
                      {isStartingChat ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : <MessageSquare className="ltr:mr-2 rtl:ml-2"/>}
                      {t.messageProvider?.replace('{providerName}', provider.name.split(' ')[0])}
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
                    <Button asChild size="lg" variant="outline" className="w-full group">
                        <a href={`https://wa.me/${cleanPhoneNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                          <BotMessageSquare className="ltr:mr-2 rtl:ml-2" /> {t.contactOnWhatsApp}
                        </a>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-6">
                     {(provider.qualifications || serviceAreas.length > 0) && <Separator/>}
                     {provider.qualifications && (
                        <div className="space-y-2">
                           <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Sparkles/> {t.aboutProvider.replace('{name}', provider.name || 'الماهر')}</h2>
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
                    <div className="space-y-4">
                       <Separator/>
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Briefcase/> {t.specialties}</h2>
                       <div className="flex flex-col gap-2">
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
            
            {images.length > 0 && (
                <div className="mt-8 space-y-4">
                    <Separator/>
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Camera/> {t.portfolioTitle} Images</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((url, index) => (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer">
                                    <Image src={url} alt={`Image portfolio ${index + 1}`} layout="fill" className="object-cover transition-transform group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
                                <DialogTitle className="sr-only">{`Portfolio Image ${index + 1}`}</DialogTitle>
                                <DialogDescription className="sr-only">{`Full screen view of portfolio image ${index + 1}`}</DialogDescription>
                                <Image src={url} alt={`Image portfolio ${index + 1}`} width={1920} height={1080} className="rounded-lg object-contain max-h-[90vh] w-full" />
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </div>
            )}
            
            {videos.length > 0 && (
                <div className="mt-8 space-y-4">
                    <Separator/>
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2"><VideoIcon/> {t.portfolioTitle} Videos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {videos.map((url, index) => (
                        <Dialog key={index}>
                             <DialogTrigger asChild>
                                <div className="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer">
                                   <video src={url} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <VideoIcon className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
                                <DialogTitle className="sr-only">{`Portfolio Video ${index + 1}`}</DialogTitle>
                                 <DialogDescription className="sr-only">{`Full screen view of portfolio video ${index + 1}`}</DialogDescription>
                                <video src={url} controls autoPlay className="w-full max-h-[90vh] rounded-lg" />
                            </DialogContent>
                        </Dialog>
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
                                       <AvatarFallback>{rating.raterName?.charAt(0) || 'U'}</AvatarFallback>
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

    