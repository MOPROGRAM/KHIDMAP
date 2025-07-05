"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, Megaphone, Clock } from 'lucide-react';
import type { AdRequest } from '@/lib/data';
import { getAdRequests, updateAdRequestStatus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import type { Translations } from '@/lib/translations';

const StatusBadge = ({ status, t }: { status: AdRequest['status'], t: Translations }) => {
    const styles: Record<AdRequest['status'], string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300',
        approved: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300',
    };
    const text: Record<AdRequest['status'], keyof Translations> = {
        pending: 'pending',
        approved: 'approved',
        rejected: 'rejected',
    };
    const Icon = {
        pending: Clock,
        approved: ThumbsUp,
        rejected: ThumbsDown,
    }[status];
    return (
        <Badge variant="outline" className={`gap-1.5 ${styles[status]}`}>
            <Icon className="h-3.5 w-3.5" />
            {t[text[status]]}
        </Badge>
    );
};


export default function AdminAdRequestsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const { language } = useSettings();
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const adRequests = await getAdRequests();
      setRequests(adRequests);
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

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      await updateAdRequestStatus(requestId, status);
      toast({ title: "Request Updated", description: `The request has been ${status}.` });
      fetchRequests(); // Re-fetch to update the list
    } catch (err: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: err.message });
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
             <Megaphone className="h-10 w-10 text-primary" />
            <div>
                <CardTitle className="text-2xl font-headline">Advertisement Requests</CardTitle>
                <CardDescription>Review, approve, or reject advertisement inquiries from users.</CardDescription>
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
              <h3 className="text-xl font-semibold">No Ad Requests</h3>
              <p className="text-muted-foreground">There are currently no pending advertisement requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                  <Card key={req.id} className="p-4">
                    <div className="grid md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <StatusBadge status={req.status} t={t} />
                                <span className="text-muted-foreground">{formatRelativeTime(req.createdAt)}</span>
                            </div>
                            <p><strong>From:</strong> {req.name} ({req.email})</p>
                            {req.company && <p><strong>Company:</strong> {req.company}</p>}
                            <p className="text-sm text-muted-foreground pt-2 whitespace-pre-wrap bg-muted/50 p-3 rounded-md"><strong>Message:</strong> {req.message}</p>
                        </div>
                        <div className="space-y-2 flex flex-col items-center justify-center">
                            {req.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                                    <Button onClick={() => handleUpdateStatus(req.id, 'approved')} disabled={!!processingId} className="w-full bg-green-600 hover:bg-green-700">
                                        {processingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                        Approve
                                    </Button>
                                    <Button onClick={() => handleUpdateStatus(req.id, 'rejected')} disabled={!!processingId} variant="destructive" className="w-full">
                                        {processingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
                                        Reject
                                    </Button>
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
