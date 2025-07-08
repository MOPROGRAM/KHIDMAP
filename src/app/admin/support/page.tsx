
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, LifeBuoy, Clock, Check, Eye } from 'lucide-react';
import type { SupportRequest } from '@/lib/data';
import { getSupportRequests, updateSupportRequestStatus } from '@/lib/data';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import type { Translations } from '@/lib/translations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const StatusBadge = ({ status, t }: { status: SupportRequest['status'], t: Translations }) => {
    const styles: Record<SupportRequest['status'], string> = {
        open: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
        closed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
    };
    const text: Record<SupportRequest['status'], keyof Translations> = {
        open: 'statusOpen',
        in_progress: 'statusInProgress',
        closed: 'statusClosed',
    };
    const Icon = {
        open: Clock,
        in_progress: Eye,
        closed: Check,
    }[status];
    return (
        <Badge variant="outline" className={`gap-1.5 ${styles[status]}`}>
            <Icon className="h-3.5 w-3.5" />
            {t[text[status]]}
        </Badge>
    );
};

const TypeBadge = ({ type, t }: { type: SupportRequest['type'], t: Translations }) => {
    const text: Record<SupportRequest['type'], keyof Translations> = {
        inquiry: 'inquiry',
        complaint: 'complaint',
        payment_issue: 'paymentIssue',
        other: 'other',
    };
    return <Badge variant="secondary">{t[text[type]]}</Badge>;
};


export default function AdminSupportPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const { language } = useSettings();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const supportRequests = await getSupportRequests();
      setRequests(supportRequests);
    } catch (err: any) {
      setError(t.errorOccurred + ": " + err.message);
      toast({ variant: 'destructive', title: t.errorOccurred, description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, status: 'in_progress' | 'closed', reply?: string) => {
    setProcessingId(requestId);
    try {
      await updateSupportRequestStatus(requestId, status, reply);
      toast({ title: t.ticketStatusUpdated, description: t.ticketStatusUpdatedDesc.replace('{status}', status.replace('_', ' ')) });
      fetchRequests(); // Re-fetch to update the list
      setReplyText(''); // Clear reply text after submission
    } catch (err: any) {
      toast({ variant: 'destructive', title: t.updateFailed, description: err.message });
    } finally {
      setProcessingId(null);
    }
  };
  
  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: language === 'ar' ? ar : enUS });
  }

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
             <LifeBuoy className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">{t.supportRequests}</CardTitle>
                <CardDescription>{t.supportRequestsDescription}</CardDescription>
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
          {requests.length === 0 && !error ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">{t.noSupportRequests}</h3>
              <p className="text-muted-foreground">{t.noSupportRequestsDescription}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                  <Card key={req.id} className="p-4">
                    <div className="grid md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                <StatusBadge status={req.status} t={t} />
                                <TypeBadge type={req.type} t={t} />
                                <span className="text-muted-foreground">{formatRelativeTime(req.createdAt)}</span>
                            </div>
                            <p><strong>{t.from}:</strong> {req.name} ({req.email})</p>
                            <p><strong>{t.subject}:</strong> {req.subject}</p>
                            <p className="text-sm text-muted-foreground pt-2 whitespace-pre-wrap bg-muted/50 p-3 rounded-md"><strong>{t.message}:</strong> {req.message}</p>
                            {req.status === 'closed' && req.adminReply && (
                                <Alert className="mt-2 bg-green-50 border-green-300 dark:bg-green-900/20">
                                  <AlertTitle className="font-semibold text-green-800 dark:text-green-300">{t.adminReply}</AlertTitle>
                                  <AlertDescription className="text-green-700 dark:text-green-400">{req.adminReply}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <div className="space-y-2 flex flex-col items-center justify-center">
                            {req.status !== 'closed' && (
                                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                                    {req.status === 'open' && (
                                        <Button onClick={() => handleUpdateStatus(req.id, 'in_progress')} disabled={!!processingId} className="w-full bg-blue-600 hover:bg-blue-700">
                                            {processingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                                            {t.markAsInProgress}
                                        </Button>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button disabled={!!processingId} className="w-full bg-green-600 hover:bg-green-700">
                                                <Check className="mr-2 h-4 w-4" />
                                                {t.markAsClosed}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t.closeSupportTicket}</AlertDialogTitle>
                                                <AlertDialogDescription>{t.closeSupportTicketDesc}</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="space-y-2">
                                                <Label htmlFor="reply">{t.reply}</Label>
                                                <Textarea id="reply" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={t.finalCommentPlaceholder}/>
                                            </div>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setReplyText('')}>{t.cancel}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleUpdateStatus(req.id, 'closed', replyText)} disabled={!replyText.trim() || processingId === req.id} className={buttonVariants({ variant: 'default' })}>
                                                    {processingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : t.sendReplyAndClose}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
