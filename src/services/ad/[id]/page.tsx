"use client";

import React, { useEffect, useState, useCallback, FormEvent, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { ServiceCategory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, MapPin, Mail, UserCircle, Info, Loader2, AlertTriangle, Hammer, Brush, SprayCan,
  GripVertical, HardHat, Layers, Star, Wrench, Zap, Briefcase, BotMessageSquare, Sparkles, Building, PhoneCall, Camera, Video as VideoIcon, MessageSquare, PlusCircle, BadgeCheck
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';

// Define UserProfile and Rating types based on backend/prisma/schema.prisma
interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  verificationStatus?: string;
  qualifications?: string;
  serviceCategories?: string[];
  serviceAreas?: string[];
  phoneNumber?: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Rating {
  id: number;
  ratedUserId: number;
  raterUserId: number;
  raterName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

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
  
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const userRole = authUser?.role;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);


  const fetchProviderData = useCallback(async () => {
    if (!providerId) {
      setError(t.providerIdMissing || 'Provider ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
        const providerRes = await fetch(`/api/users/${providerId}`);
        if (providerRes.ok) {
            const foundProvider: UserProfile = await providerRes.json();
            setProvider(foundProvider);
        } else {
            setError(t.providerNotFound || 'Provider not found.');
        }
        
        const ratingsRes = await fetch(`${apiUrl}/ratings/provider/${providerId}`);
        if (ratingsRes.ok) {
            const foundRatings: Rating[] = await ratingsRes.json();
            foundRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
        setError(t.failedLoadProviderDetails || 'Failed to load provider details.');
    } finally {
        setIsLoading(false);
    }
  }, [providerId, t]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchProviderData();
    }
  }, [fetchProviderData, isAuthLoading]);


  const handleRatingSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!authUser || !provider) {
          toast({ variant: "destructive", title: t.authError || 'Authentication Error', description: t.loginToRate || 'Please log in to submit a rating.' });
          return;
      }
      if (ratingInput === 0) {
          toast({ variant: "destructive", title: t.errorOccurred || 'Error', description: t.selectRating || 'Please select a rating.' });
          return;
      }
      setIsSubmitting(true);
      try {
          const res = await fetch(`/api/ratings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              ratedUserId: provider.id,
              raterUserId: authUser.id,
              raterName: authUser.name || t.unknownUser || 'Unknown User',
              rating: ratingInput,
              comment: commentInput,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to submit rating');
          }
          toast({ title: t.ratingSubmitted || 'Rating Submitted', description: t.thankYouForFeedback || 'Thank you for your feedback!' });
          setRatingInput(0);
          setCommentInput('');
          fetchProviderData();
      } catch (error: any) {
          toast({ variant: "destructive", title: t.errorOccurred || 'Error', description: String(error.message || t.failedSubmitRating || 'Failed to submit rating.') });
      } finally {
          setIsSubmitting(false);
      }
  }

  const handleStartChat = async () => {
    if (!authUser || !provider) {
        toast({ variant: "destructive", title: t.authError || 'Authentication Error', description: t.loginToMessage || 'Please log in to message the provider.' });
        return;
    }
    setIsStartingChat(true);
    try {
        const res = await fetch(`/api/messages/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ participantId: provider.id }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to start chat');
        }
        const { chatId } = await res.json();
        router.push(`/dashboard/messages?chatId=${chatId}`);
    } catch (error: any) {
        console.error("Error starting chat:", error);
        toast({ variant: "destructive", title: t.startChatError || 'Chat Error', description: error.message || 'Failed to start chat.' });
    } finally {
        setIsStartingChat(false);
    }
  };
  
  const formatDate = (dateValue: string | undefined): string => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const serviceCategories = useMemo(() => Array.isArray(provider?.serviceCategories) ? provider.serviceCategories.filter(Boolean) as ServiceCategory[] : [], [provider]);
  const serviceAreas = useMemo(() => Array.isArray(provider?.serviceAreas) ? provider.serviceAreas.filter(Boolean) : [], [provider]);
  const images = useMemo(() => Array.isArray(provider?.images) ? provider.images : [], [provider]);
  const videos = useMemo(() => Array.isArray(provider?.videos) ? provider.videos : [], [provider]);
  const cleanPhoneNumber = useMemo(() => provider?.phoneNumber?.replace(/[^0-9+]/g, '') || '', [provider?.phoneNumber]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t.loading || 'Loading...'}</p>
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
              {t.errorOccurred || 'An Error Occurred'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{String(error)}</p>
            <Button asChild variant="outline" onClick={() => router.back()} className="hover:bg-destructive/10 hover:border-destructive transition-colors duration-200 group">
                <>
                  <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" /> {t.backButton || 'Back'}
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
               {t.providerNotFound || 'Provider Not Found'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{t.providerDetailsNotAvailable || 'Provider details are not available.'}</p>
             <Button asChild variant="outline" onClick={() => router.back()} className="hover:bg-accent/10 hover:border-primary transition-colors duration-200 group">
                <>
                  <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" /> {t.backButton || 'Back'}
                </>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const whatsappMessage = encodeURIComponent(t.whatsappMessage?.replace('{appName}', t.appName || 'Khidmap') || 'Hello from Khidmap!');


  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fadeIn">
      <Button variant="outline" onClick={() => router.back()} className="mb-2 group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 group-hover:text-primary transition-colors group-hover:translate-x-[-2px]" /> {t.backToSearch || 'Back to Search'}
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
                                        <p>{t.verifiedProvider || 'Verified Provider'}</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        )}
                    </div>
                    
                    {serviceCategories?.[0] && (
                        <p className="text-lg text-primary font-semibold">
                            {t[serviceCategories[0].toLowerCase() as keyof typeof t] || serviceCategories[0]}
                        </p>
                    )}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <StarRating rating={averageRating} />
                        <span className="text-sm text-muted-foreground">
                            {averageRating > 0 ? `${averageRating.toFixed(1)} (${ratings.length} ${t.reviews || 'reviews'})` : t.noReviewsYet || 'No reviews yet.'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        <Separator/>

        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                {authUser && userRole === 'seeker' && authUser.id !== provider.id && (
                    <Button asChild size="lg" className="w-full group">
                        <Link href={`/request-service/${provider.id}`}>
                            <PlusCircle className="ltr:mr-2 rtl:ml-2"/>
                            {t.requestService || 'Request Service'}
                        </Link>
                    </Button>
                )}
                 {provider.phoneNumber && (
                    <Button asChild size="lg" className="w-full group">
                        <a href={`tel:${cleanPhoneNumber}`}>
                          <PhoneCall className="ltr:mr-2 rtl:ml-2"/> {t.callNow || 'Call Now'}
                        </a>
                    </Button>
                )}
                 {authUser && userRole === 'seeker' && authUser.id !== provider.id && (
                  <Button onClick={handleStartChat} disabled={isStartingChat} size="lg" variant="outline" className="w-full group">
                      {isStartingChat ? <Loader2 className="animate-spin h-5 w-5 ltr:mr-2 rtl:ml-2" /> : <MessageSquare className="ltr:mr-2 rtl:ml-2"/>}
                      {t.messageProvider?.replace('{providerName}', provider.name.split(' ')[0]) || 'Message Provider'}
                  </Button>
                )}
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
              {/* Main Content Column */}
              <div className="md:col-span-2 space-y-8">
                  {provider.qualifications && (
                    <div>
                      <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-3"><Sparkles/> {t.aboutProvider?.replace('{name}', provider.name || t.provider || 'provider')}</h2>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{provider.qualifications}</p>
                    </div>
                  )}

                  {serviceAreas.length > 0 && (
                    <div>
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-3"><Building/> {t.servesAreasTitle || 'Service Areas'}</h2>
                       <p className="text-muted-foreground">{serviceAreas.join(', ')}</p>
                    </div>
                  )}
              </div>

              {/* Specialties Column */}
              <div className="space-y-4">
                 {serviceCategories.length > 0 && (
                    <div>
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Briefcase/> {t.specialties || 'Specialties'}</h2>
                       <div className="flex flex-col gap-3">
                            {serviceCategories.map((cat: ServiceCategory) => {
                                if (!cat || typeof cat !== 'string') return null;
                                const CatIcon = categoryIcons[cat] || GripVertical;
                                return(
                                  <div key={cat} className="flex items-center gap-2 text-muted-foreground">
                                    <CatIcon className="h-4 w-4 text-primary" />
                                    <span>{t[cat.toLowerCase() as keyof typeof t] || cat}</span>
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
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Camera/> {t.portfolioTitle || 'Portfolio'} {t.images || 'Images'}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((url: string, index: number) => (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer">
                                    <Image src={url} alt={`${t.portfolioImage || 'Portfolio Image'} ${index + 1}`} layout="fill" className="object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-black/40 transition-all duration-300">
                                        <Camera className="w-10 h-10 text-white transition-transform group-hover:scale-110" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
                                <DialogTitle className="sr-only">{t.portfolioImage || 'Portfolio Image'} {index + 1}</DialogTitle>
                                <DialogDescription className="sr-only">{t.fullscreenViewOf || 'Fullscreen view of'} {t.portfolioImage || 'Portfolio Image'} {index + 1}</DialogDescription>
                                <Image src={url} alt={`${t.portfolioImage || 'Portfolio Image'} ${index + 1}`} width={1920} height={1080} className="rounded-lg object-contain max-h-[90vh] w-full" />
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </div>
            )}
            
            {videos.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><VideoIcon/> {t.portfolioTitle || 'Portfolio'} {t.videos || 'Videos'}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {videos.map((url: string, index: number) => (
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
                                <DialogTitle className="sr-only">{t.portfolioVideo || 'Portfolio Video'} {index + 1}</DialogTitle>
                                 <DialogDescription className="sr-only">{t.fullscreenViewOf || 'Fullscreen view of'} {t.portfolioVideo || 'Portfolio Video'} {index + 1}</DialogDescription>
                                <video src={url} controls autoPlay className="w-full max-h-[90vh] rounded-lg" />
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </div>
            )}
             
            <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4"><Star/> {t.reviews || 'Reviews'}</h2>
                {ratings.length > 0 ? (
                    <div className="space-y-4">
                        {ratings.map((rating: Rating) => (
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
                    <p className="text-muted-foreground">{t.noReviewsYet || 'No reviews yet.'}</p>
                )}
            </div>
            
            {authUser && userRole === 'seeker' && authUser.id !== provider.id && (
                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-semibold text-primary font-headline mb-4">{t.rateThisProvider || 'Rate This Provider'}</h2>
                    <form onSubmit={handleRatingSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="rating">{t.rating || 'Rating'}</Label>
                            <StarRating rating={ratingInput} setRating={setRatingInput} interactive={true} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="comment">{t.comment || 'Comment'}</Label>
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
                            {t.submitRating || 'Submit Rating'}
                        </Button>
                    </form>
                </div>
            )}
