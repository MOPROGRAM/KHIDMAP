
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Order, Message, getOrderById, resolveDispute, sendMessage, startOrGetChat } from '@/lib/data';
import { Loader2, ArrowLeft, ShieldAlert, User, MessageSquare, Check, CheckCheck, Phone, PhoneMissed, PhoneOff, Video as VideoIcon, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';


const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export default function DisputeDetailPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { language } = useSettings();

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  
  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: language === 'ar' ? ar : enUS });
  }

  useEffect(() => {
    const fetchDisputeDetails = async () => {
      if (!orderId) {
        setError(t.orderIdMissing);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fetchedOrder = await getOrderById(orderId);
        if (!fetchedOrder) {
          setError(t.orderNotFound);
          setIsLoading(false);
          return;
        }
        setOrder(fetchedOrder);
      } catch (err: any) {
        setError(t.failedToFetchDisputeDetails);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisputeDetails();
  }, [orderId, t]);

  useEffect(() => {
    if (!order?.chatId || !db) {
      setMessages([]);
      return;
    }
    
    const messagesRef = collection(db, 'messages', order.chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    }, (err) => {
      console.error(`Error fetching messages for dispute ${order.id}:`, err);
      toast({ variant: "destructive", title: t.errorOccurred, description: t.couldNotLoadMessages });
    });

    return () => unsubscribe();
  }, [order, toast, t]);


  const handleResolve = async (resolution: 'seeker' | 'provider') => {
    if (!orderId || !resolutionNotes.trim()) {
        toast({
            variant: 'destructive',
            title: t.errorOccurred,
            description: t.resolutionNotesRequired
        });
        return;
    }
    setIsSubmitting(true);
    try {
        await resolveDispute(orderId, resolution, resolutionNotes);
        toast({ title: t.resolutionSubmitted });
        router.push('/admin/disputes');
    } catch(err: any) {
        toast({
            variant: 'destructive',
            title: t.failedToSubmitResolution,
            description: err.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleAdminSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim() || !order?.chatId || !auth.currentUser) return;

    setIsSendingMessage(true);
    try {
        await sendMessage(order.chatId, adminMessage, 'text');
        
        // No need to manually add message, onSnapshot will handle it.
        setAdminMessage('');
    } catch(err: any) {
        toast({
            variant: 'destructive',
            title: t.messageSentErrorTitle,
            description: err.message
        });
    } finally {
        setIsSendingMessage(false);
    }
  }

  const handleStartPrivateChat = async (targetUserId: string) => {
    if (!auth.currentUser) {
        toast({ variant: "destructive", title: t.authError, description: t.userNotAuthOrServiceUnavailable });
        return;
    }
    setIsStartingChat(targetUserId);
    try {
        const chatId = await startOrGetChat(targetUserId);
        router.push(`/dashboard/messages?chatId=${chatId}`);
    } catch (error: any) {
        toast({ variant: "destructive", title: t.startChatError, description: error.message });
    } finally {
        setIsStartingChat(null);
    }
};

  const formatDate = (date: Timestamp | undefined): string => {
    if (!date) return 'N/A';
    return date.toDate().toLocaleString();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error || !order) {
    return <div className="text-center text-destructive p-8">{error || t.orderCouldNotBeLoaded}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Button variant="outline" onClick={() => router.push('/admin/disputes')} className="group">
        <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
        {t.disputeResolution}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="h-6 w-6"/>{t.disputeDetails}</CardTitle>
          <CardDescription>{t.orderId}: {order.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">{t.partiesInvolved}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <strong className="block text-muted-foreground">{t.seeker}</strong>
                            <div className="flex items-center justify-between">
                                <span>{order.seekerName}</span>
                                <Button onClick={() => handleStartPrivateChat(order.seekerId)} size="sm" variant="outline" disabled={!!isStartingChat}>
                                    {isStartingChat === order.seekerId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                                    {t.messageSeeker}
                                </Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <strong className="block text-muted-foreground">{t.provider}</strong>
                            <div className="flex items-center justify-between">
                                <span>{order.providerName}</span>
                                <Button onClick={() => handleStartPrivateChat(order.providerId)} size="sm" variant="outline" disabled={!!isStartingChat}>
                                    {isStartingChat === order.providerId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                                    {t.messageProvider}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">{t.orderSummary}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong className="block text-muted-foreground">{t.amount}</strong> {order.amount} {order.currency}</div>
                        <div><strong className="block text-muted-foreground">{t.disputedOn}</strong> {formatDate(order.createdAt)}</div>
                        <div className="col-span-2"><strong className="block text-muted-foreground">{t.disputeReason}</strong> {order.disputeReason || 'N/A'}</div>
                    </CardContent>
                </Card>
            </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MessageSquare className="h-5 w-5"/>{t.disputeConversation}</h3>
            <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-4 bg-background">
              {messages.length > 0 ? messages.map(msg => {
                 let senderName: string;
                 let messageAlignment: "start" | "end" | "center" = "start";
                 let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
                 let messageBg: string = "bg-muted";

                 if (msg.type === 'system_call_status') { // Corrected this line
                    const callIcon = msg.content === 'unanswered' ? PhoneMissed : msg.content === 'declined' ? PhoneOff : Phone;
                    const callTypeIcon = msg.callMetadata?.type === 'video' ? VideoIcon : Phone;
                    const durationText = msg.callMetadata?.duration ? ` - ${formatCallDuration(msg.callMetadata.duration)}` : '';
                    return (
                        <div key={msg.id} className="flex items-center justify-center my-2">
                            <div className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-muted rounded-full border">
                                {React.createElement(callIcon, { className: 'h-4 w-4' })}
                                <span>
                                    {msg.content === 'unanswered' && t.missedCall}
                                    {msg.content === 'ended' && t.callEnded}
                                    {msg.content === 'declined' && t.callDeclined}
                                </span>
                                {React.createElement(callTypeIcon, { className: 'h-4 w-4' })}
                                {durationText && <span className="font-mono">{durationText}</span>}
                            </div>
                        </div>
                    )
                  }

                 if(msg.senderId === order.seekerId){
                    senderName = order.seekerName;
                    messageAlignment = "start";
                 } else if (msg.senderId === order.providerId) {
                    senderName = order.providerName;
                    messageAlignment = "end";
                    badgeVariant = "default";
                    messageBg = "bg-primary text-primary-foreground";
                 } else { // Admin message
                    senderName = t.admin;
                    messageAlignment = "center";
                    badgeVariant = "destructive";
                    messageBg = "bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300";
                 }

                return (
                  <div key={msg.id} className={cn("flex flex-col", {
                    "items-start": messageAlignment === 'start',
                    "items-end": messageAlignment === 'end',
                    "items-center": messageAlignment === 'center'
                  })}>
                    <div className={cn("p-3 rounded-lg max-w-sm", messageBg)}>
                      {messageAlignment !== 'center' && <span className="text-xs font-bold block mb-1">{senderName.split(' ')[0]}</span>}
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-right mt-1 opacity-70">{formatRelativeTime(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              }) : <p className="text-muted-foreground text-center">{t.noConversations}</p>}
            </div>
            {order.chatId && (
                <form onSubmit={handleAdminSendMessage} className="mt-2 flex gap-2">
                    <Textarea value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} placeholder={t.sendMessageToParties} rows={1} disabled={isSendingMessage} className="flex-1"/>
                    <Button type="submit" size="icon" disabled={isSendingMessage || !adminMessage.trim()}>
                        {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                    </Button>
                </form>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">{t.resolution}</h3>
            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">{t.adminNotes}</Label>
              <Textarea id="resolutionNotes" value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder={t.explainDecision} rows={4} />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={!resolutionNotes.trim() || isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <User className="mr-2 h-4 w-4" />}
                        {t.sideWithProvider}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>{t.confirmResolutionTitle}</AlertDialogTitle><AlertDialogDescription>{t.confirmResolutionDescription}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => handleResolve('provider')}>{t.submitResolution}</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={!resolutionNotes.trim() || isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <User className="mr-2 h-4 w-4" />}
                        {t.sideWithSeeker}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>{t.confirmResolutionTitle}</AlertDialogTitle><AlertDialogDescription>{t.confirmResolutionDescription}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={() => handleResolve('seeker')} className="bg-destructive hover:bg-destructive/90">{t.submitResolution}</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
