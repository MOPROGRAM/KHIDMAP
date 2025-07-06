
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, ExternalLink, BadgeCheck, UserCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { UserProfile, getPendingVerifications, approveVerification, rejectVerification } from '@/lib/data';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AdminVerificationsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const pendingProfiles = await getPendingVerifications();
      setProfiles(pendingProfiles);
    } catch (err: any) {
      setError(t.errorOccurred + ": " + err.message);
      toast({
        variant: 'destructive',
        title: t.errorOccurred,
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      await approveVerification(userId);
      toast({
        title: "Verification Approved",
        description: `Provider has been marked as verified.`
      });
      fetchVerifications();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: "Approval Failed",
        description: err.message
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!userId) return;
    setProcessingId(userId);
    try {
      await rejectVerification(userId, rejectionReason || "The uploaded documents were not sufficient.");
      toast({
        title: "Verification Rejected",
        description: "The provider has been notified.",
      });
      setRejectionReason('');
      fetchVerifications();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: "Rejection Failed",
        description: err.message
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <BadgeCheck className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">{t.providerVerifications}</CardTitle>
                <CardDescription>{t.providerVerificationsDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-6 text-sm text-destructive-foreground bg-destructive rounded-md flex items-center gap-2 justify-center">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          {profiles.length === 0 && !error ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">{t.noPendingVerifications}</h3>
              <p className="text-muted-foreground">{t.noPendingVerificationsDescription}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => {
                const isProcessing = processingId === profile.uid;
                return (
                  <Card key={profile.uid} className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={profile.images?.[0]} />
                                <AvatarFallback><UserCircle/></AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{profile.name}</p>
                                <p className="text-sm text-muted-foreground">{profile.email}</p>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-2">{t.uploadedDocuments}:</h4>
                            <div className="flex flex-col gap-2">
                                {profile.verificationDocuments?.map((docUrl, index) => (
                                    <a href={docUrl} target="_blank" rel="noopener noreferrer" key={index} className="text-sm text-primary hover:underline flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4" /> Document {index + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                            <Button 
                              onClick={() => handleApprove(profile.uid)} 
                              disabled={isProcessing}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                              {t.approve}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  disabled={isProcessing}
                                >
                                  <ThumbsDown className="mr-2 h-4 w-4" />
                                  {t.reject}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t.confirmRejectVerificationTitle}</AlertDialogTitle>
                                  <AlertDialogDescription>{t.confirmRejectVerificationDescription}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2">
                                  <Label htmlFor={`rejection-reason-${profile.uid}`}>{t.rejectionReason}</Label>
                                  <Input
                                    id={`rejection-reason-${profile.uid}`}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={t.rejectionReasonPlaceholder}
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setRejectionReason('')}>{t.cancel}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(profile.uid)}
                                    disabled={isProcessing}
                                    className={buttonVariants({ variant: "destructive" })}
                                  >
                                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.reject}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
