
"use client";

import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Chat, Message, sendMessage, markChatAsRead, initiateCall } from '@/lib/data';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare, UserCircle, Frown, ArrowLeft, Mic, StopCircle, Trash2, Check, CheckCheck, Paperclip, Image as ImageIcon, Video as VideoIcon, Phone, PhoneOff, PhoneMissed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import AudioPlayer from '@/components/chat/AudioPlayer';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';


const formatDate = (date: Timestamp | undefined): string => {
  if (!date) return '';
  const jsDate = date.toDate();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (jsDate.toDateString() === today.toDateString()) {
    return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (jsDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return jsDate.toLocaleDateString();
};

const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};


export default function MessagesPage() {
  const t = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSelectionDone = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setAuthUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId');
    if (chatIdFromUrl && !initialSelectionDone.current) {
      setSelectedChatId(chatIdFromUrl);
      initialSelectionDone.current = true;
      const newUrl = pathname;
      router.replace(newUrl, {scroll: false});
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (!authUser || !db) return;

    setIsLoadingChats(true);
    setError(null);
    const q = query(
      collection(db, 'messages'),
      where(`participantIds.${authUser.uid}`, '==', true)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let convos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      
      // Sort client-side to avoid needing a composite index
      convos.sort((a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0));
      
      setChats(convos);
      setIsLoadingChats(false);
      
      if (!initialSelectionDone.current && convos.length > 0) {
        const chatIdFromUrl = searchParams.get('chatId');
        setSelectedChatId(chatIdFromUrl || convos[0].id);
        initialSelectionDone.current = true;
      }
    }, (err) => {
      console.error("Error fetching chats:", err);
      setError(t.errorOccurred);
      setIsLoadingChats(false);
    });

    return () => unsubscribe();
  }, [authUser, t, searchParams]);

  useEffect(() => {
    if (!selectedChatId || !db) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const messagesRef = collection(db, 'messages', selectedChatId, 'messages');
    
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      setMessages(msgs);
      setIsLoadingMessages(false);
    }, (err) => {
      console.error(`Error fetching messages for ${selectedChatId}:`, err);
      let errorMessage = "Could not load messages.";
      toast({ variant: "destructive", title: t.errorOccurred, description: errorMessage, duration: 20000 });
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedChatId, t, toast]);
  
  useEffect(() => {
    if (selectedChatId && authUser) {
      markChatAsRead(selectedChatId);
    }
  }, [selectedChatId, authUser, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId || !authUser) return;

    setIsSending(true);
    try {
      await sendMessage(selectedChatId, newMessage, 'text');
      setNewMessage('');
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({ variant: "destructive", title: t.errorOccurred, description: err.message });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleInitiateCall = async (callType: 'audio' | 'video') => {
    if (!otherParticipantId || isInitiatingCall || !selectedChatId) return;
    setIsInitiatingCall(true);
    try {
        toast({ title: t.initiatingCall, description: `Calling ${getOtherParticipant(selectedChat).name}...` });
        const callId = await initiateCall(selectedChatId, otherParticipantId, callType);
        if (callId) {
            router.push(`/call/${callId}`);
        } else {
            throw new Error("Failed to get call ID");
        }
    } catch (error: any) {
        console.error("Error initiating call:", error);
        toast({ variant: "destructive", title: t.callFailed, description: error.message });
    } finally {
        setIsInitiatingCall(false);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording) {
        handleStopRecording();
        return;
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: "destructive", title: t.audioRecordingNotSupported, description: t.audioRecordingNotSupportedDescription });
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        
        recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
        recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            if (selectedChatId) {
                setIsSending(true);
                try {
                    await sendMessage(selectedChatId, audioBlob, 'audio');
                } catch (err: any) {
                     console.error("Error sending audio message:", err);
                     toast({ variant: "destructive", title: t.errorOccurred, description: err.message });
                } finally {
                    setIsSending(false);
                }
            }
            stream.getTracks().forEach(track => track.stop());
        };
        
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingIntervalRef.current = setInterval(() => setRecordingTime(prevTime => prevTime + 1), 1000);
    } catch (err) {
        console.error("Error starting recording:", err);
        toast({ variant: "destructive", title: t.microphoneAccessDenied, description: t.microphoneAccessDeniedDescription });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.onondataavailable = null;
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        audioChunksRef.current = [];
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChatId) return;

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
        toast({ variant: "destructive", title: t.fileTooLargeTitle, description: t.fileTooLargeDescription?.replace('{size}', '15MB') });
        return;
    }

    let fileType: 'image' | 'video' | 'file';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else {
        toast({ variant: "destructive", title: t.unsupportedFileTypeTitle, description: t.unsupportedFileTypeDescription });
        return;
    }
    
    setIsSending(true);
    try {
        await sendMessage(selectedChatId, file, fileType);
    } catch (err: any) {
        console.error("Error sending file:", err);
        toast({ variant: "destructive", title: t.fileUploadErrorTitle, description: err.message });
    } finally {
        setIsSending(false);
        if (event.target) event.target.value = ''; // Reset file input
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const getOtherParticipant = (chat: Chat | undefined) => {
    if (!chat || !authUser) return { id: '', name: 'Unknown User', avatar: undefined, videoCallsEnabled: true };
    const otherId = Object.keys(chat.participantIds).find(p => p !== authUser.uid);
    return {
      id: otherId || '',
      name: chat.participantNames?.[otherId || ''] || 'Unknown User',
      avatar: chat.participantAvatars?.[otherId || ''] || undefined,
      videoCallsEnabled: chat.participantSettings?.[otherId || '']?.videoCallsEnabled ?? true,
    };
  };
  
  const otherParticipant = useMemo(() => getOtherParticipant(selectedChat), [selectedChat, authUser]);
  const otherParticipantId = otherParticipant.id;

  return (
    <div className="flex-1 flex border rounded-lg shadow-xl bg-card animate-fadeIn overflow-hidden">
      <aside className={cn("w-full md:w-1/3 lg:w-1/4 border-r flex flex-col", selectedChatId && "hidden md:flex")}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold font-headline">{t.conversations}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="p-4 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
          ) : error ? (
             <div className="p-6 text-center text-destructive">
               <MessageSquare className="mx-auto h-12 w-12 mb-2" />
               <p>{error}</p>
             </div>
          ) : chats.length > 0 ? (
            <ul>
              {chats.map(chat => {
                const otherParticipantListItem = getOtherParticipant(chat);
                const unreadCount = chat.unreadCount?.[authUser?.uid || ''] || 0;
                return (
                  <li key={chat.id}>
                    <button
                      onClick={() => setSelectedChatId(chat.id)}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center gap-3",
                        selectedChatId === chat.id && "bg-muted"
                      )}
                    >
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={otherParticipantListItem.avatar} alt={otherParticipantListItem.name} />
                        <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold truncate">{otherParticipantListItem.name}</h3>
                          <span className="text-xs text-muted-foreground">{formatDate(chat.lastMessageAt)}</span>
                        </div>
                        <div className="flex justify-between items-start mt-1">
                          <p className="text-sm text-muted-foreground truncate pr-2 flex items-center gap-1">
                             {chat.lastMessageSenderId === authUser?.uid && <span>{t.you}:</span>}
                             {chat.lastMessage}
                          </p>
                          {unreadCount > 0 && (
                            <Badge className="h-5 min-w-[1.25rem] text-xs justify-center rounded-full px-1.5">{unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 mb-2" />
              <p>{t.noConversations}</p>
            </div>
          )}
        </div>
      </aside>

      <main className={cn("flex-1 flex flex-col", !selectedChatId && "hidden md:flex")}>
        <header className="p-3 border-b flex items-center gap-3 shrink-0 h-[65px]">
           {selectedChat ? (
             <>
               <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChatId(null)}>
                  <ArrowLeft className="h-5 w-5" />
               </Button>
              <Avatar>
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <h3 className="font-semibold flex-1 truncate">{otherParticipant.name}</h3>
              <Button onClick={() => handleInitiateCall('audio')} variant="ghost" size="icon" disabled={isInitiatingCall || !selectedChat}>
                  <Phone className="h-5 w-5" />
                  <span className="sr-only">{t.audioCall}</span>
              </Button>
              <div className="h-10 w-10">
                {otherParticipant.videoCallsEnabled && (
                    <Button onClick={() => handleInitiateCall('video')} variant="ghost" size="icon" disabled={isInitiatingCall || !selectedChat}>
                      <VideoIcon className="h-5 w-5" />
                      <span className="sr-only">{t.videoCall}</span>
                    </Button>
                )}
              </div>
             </>
           ) : (
             <div className="hidden md:flex items-center gap-3 w-full animate-pulse h-full">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-5 w-32 rounded-md bg-muted" />
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-10 w-10 rounded-full bg-muted" />
                </div>
              </div>
           )}
        </header>
            
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
          {!selectedChat ? (
            <div className="hidden md:flex flex-col justify-center items-center h-full text-center p-4">
              {isLoadingChats ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : chats.length > 0 ? (
                <>
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">{t.selectConversation}</h2>
                  <p className="text-muted-foreground">{t.selectConversationDescription}</p>
                </>
              ) : (
                <>
                  <Frown className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">{t.noConversations}</h2>
                  <p className="text-muted-foreground">{t.noConversationsDescription}</p>
                  <Button asChild className="mt-4"><Link href="/services/search">{t.browseServices}</Link></Button>
                </>
              )}
            </div>
          ) : isLoadingMessages ? (
            <div className="flex justify-center items-center h-full"> <Loader2 className="h-8 w-8 animate-spin" /> </div>
          ) : (
            messages.map(msg => {
              const isReadByOther = otherParticipantId ? msg.readBy?.[otherParticipantId] : false;
              if (msg.type === 'system_call_status') {
                 const callIcon = msg.content === 'unanswered' ? PhoneMissed : msg.content === 'declined' ? PhoneOff : Phone;
                 const callTypeIcon = msg.callMetadata?.type === 'video' ? VideoIcon : Phone;
                 const durationText = msg.callMetadata?.duration ? ` - ${formatCallDuration(msg.callMetadata.duration)}` : '';
                 return (
                     <div key={msg.id} className="flex items-center justify-center my-2">
                        <div className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-background/50 rounded-full border">
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
              return (
                <div key={msg.id} className={cn("flex gap-2.5", msg.senderId === authUser?.uid ? "justify-end" : "justify-start")}>
                  <div className={cn("p-2 rounded-lg max-w-sm lg:max-w-md shadow-sm", msg.senderId === authUser?.uid ? "bg-primary text-primary-foreground" : "bg-card border")}>
                      {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap px-1">{msg.content}</p>}
                      {msg.type === 'audio' && <AudioPlayer src={msg.content} />}
                      {msg.type === 'image' && (
                        <Dialog>
                            <DialogTrigger asChild><Image src={msg.content} alt={t.image || 'Image'} width={250} height={250} className="rounded-md cursor-pointer object-cover aspect-square" /></DialogTrigger>
                            <DialogContent className="max-w-4xl p-0 bg-transparent border-0"><Image src={msg.content} alt={t.image || 'Image'} width={1024} height={1024} className="rounded-lg object-contain max-h-[90vh] w-full" /></DialogContent>
                        </Dialog>
                      )}
                      {msg.type === 'video' && <video src={msg.content} controls className="rounded-md w-full max-w-[250px]" />}
                    
                    <div className={cn("text-xs mt-1.5 flex justify-end items-center gap-1", msg.senderId === authUser?.uid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                       {formatDate(msg.createdAt)}
                       {msg.senderId === authUser?.uid && (isReadByOther ? <CheckCheck className="h-4 w-4 text-blue-400" /> : <Check className="h-4 w-4" />)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-3 border-t bg-background shrink-0 h-16 flex items-center">
          {selectedChat ? (
            isRecording ? (
                <div className="flex items-center justify-between gap-2 w-full">
                    <Button variant="ghost" size="icon" onClick={handleCancelRecording} className="text-destructive"><Trash2 className="h-5 w-5" /></Button>
                    <div className="flex items-center gap-2 text-sm text-destructive font-mono">
                        <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                        <span>{formatRecordingTime(recordingTime)}</span>
                    </div>
                    <Button size="icon" onClick={handleStopRecording} className="bg-destructive hover:bg-destructive/90"><StopCircle className="h-5 w-5" /></Button>
                </div>
            ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t.typeYourMessage} autoComplete="off" disabled={isSending} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}><Paperclip className="h-4 w-4" /></Button>
                    {newMessage.trim() ? (
                        <Button type="submit" size="icon" disabled={isSending}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    ) : (
                        <Button type="button" size="icon" onClick={handleStartRecording} disabled={isSending}><Mic className="h-4 w-4" /></Button>
                    )}
                </form>
            )
          ) : (
             <div className="hidden md:flex items-center gap-2 w-full animate-pulse h-full">
                <div className="h-10 rounded-md bg-muted flex-1" />
                <div className="h-10 w-10 rounded-full bg-muted" />
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
