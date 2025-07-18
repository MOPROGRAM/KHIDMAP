"use client";

import React, { useEffect, useState, useCallback, FormEvent, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Translations } from '@/lib/translations';
import { UserProfile, getRatingsForUser, getUserProfileById, ServiceCategory, addRating, startOrGetChat, Rating } from '@/lib/data';
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
    if (!providerId) {
      setError(t.providerIdMissing || 'Provider ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const foundProvider = await getUserProfileById(providerId);
      if (foundProvider) {
        setProvider(foundProvider);
      } else {
        setError(t.providerNotFound || 'Provider not found.');
      }

      const foundRatings = await getRatingsForUser(providerId);
      if (foundRatings) {
        foundRatings.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
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
    fetchProviderData();
  }, [fetchProviderData]);

  const handleRatingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!provider) {
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
        raterUserId: '', // TODO: Provide current user ID if available
        raterName: '', // TODO: Provide current user name if available
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
  };

  const handleStartChat = async () => {
    // TODO: Implement chat start logic with current user info
    toast({ variant: "destructive", title: t.authError, description: t.loginToMessage });
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    let date: Date;
    if (typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      const d = new Date(dateValue);
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
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-15rem)]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          {t.goBack || 'Go Back'}
        </Button>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-15rem)]">
        <p className="text-lg text-muted-foreground">{t.providerNotFound || 'Provider not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.backToSearch || 'Back to Search'}
      </Button>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={provider.photoURL || undefined} alt={provider.displayName || 'Provider'} />
            <AvatarFallback>
              <UserCircle className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl font-bold">{provider.displayName}</CardTitle>
              {provider.isVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <BadgeCheck className="h-6 w-6 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.verifiedProvider || 'Verified Provider'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={averageRating} size={5} />
              <span className="text-muted-foreground">({ratings.length} {t.reviews || 'reviews'})</span>
            </div>
            {provider.bio && <p className="text-muted-foreground mt-2">{provider.bio}</p>}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{t.contactInformation || 'Contact Information'}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{provider.email}</span>
                </div>
                {provider.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-muted-foreground" />
                    <span>{provider.phoneNumber}</span>
                  </div>
                )}
                {provider.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{provider.location}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                {cleanPhoneNumber && (
                  <Button asChild>
                    <a href={`https://wa.me/${cleanPhoneNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon />
                      <span className="ml-2">WhatsApp</span>
                    </a>
                  </Button>
                )}
                <Button onClick={handleStartChat} disabled={isStartingChat}>
                  {isStartingChat ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                  {t.chat || 'Chat'}
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/call/${provider.uid}`}>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    {t.call || 'Call'}
                  </Link>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{t.services || 'Services'}</h3>
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map((category) => {
                  const Icon = categoryIcons[category] || GripVertical;
                  return (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">
                      <Icon className="h-4 w-4" />
                      {t[category.toLowerCase() as keyof Translations] || category}
                    </Badge>
                  );
                })}
              </div>
              <h3 className="font-semibold text-lg mt-4 mb-2">{t.serviceAreas || 'Service Areas'}</h3>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <Badge key={area} variant="outline">{area}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="font-semibold text-lg mb-2">{t.portfolio || 'Portfolio'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <Image src={image} alt={`Portfolio image ${index + 1}`} width={200} height={200} className="rounded-lg object-cover aspect-square cursor-pointer" />
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <Image src={image} alt={`Portfolio image ${index + 1}`} width={800} height={600} className="rounded-lg object-contain" />
                  </DialogContent>
                </Dialog>
              ))}
              {videos.map((video, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="relative rounded-lg overflow-hidden cursor-pointer group">
                      <video src={video} className="object-cover aspect-square" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <VideoIcon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <video src={video} controls autoPlay className="w-full rounded-lg" />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="font-semibold text-lg mb-4">{t.ratingsAndReviews || 'Ratings & Reviews'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-6">
                <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
                <StarRating rating={averageRating} size={6} />
                <p className="text-muted-foreground mt-2">{t.basedOn.replace('{count}', String(ratings.length))}</p>
              </div>
              <div className="md:col-span-2">
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <h4 className="font-semibold">{t.leaveAReview || 'Leave a Review'}</h4>
                  <div>
                    <Label htmlFor="rating">{t.yourRating || 'Your Rating'}</Label>
                    <StarRating rating={ratingInput} setRating={setRatingInput} interactive={true} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="comment">{t.comment || 'Comment'}</Label>
                    <Textarea
                      id="comment"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={t.shareYourExperience || 'Share your experience...'}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.submitReview || 'Submit Review'}
                  </Button>
                </form>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {ratings.map((r) => (
                <div key={r.id} className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{r.raterName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{r.raterName || t.anonymous}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  <StarRating rating={r.rating || 0} className="my-1" />
                  <p className="text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
