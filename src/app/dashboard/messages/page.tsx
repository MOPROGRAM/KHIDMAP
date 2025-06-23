
"use client";

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Chat, Message, sendMessage } from '@/lib/data';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare, UserCircle, Frown, ArrowLeft, Mic, StopCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

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
  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (chatIdFromUrl) {
      setSelectedChatId(chatIdFromUrl);
      // Clean the URL
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
      where('participants', 'array-contains', authUser.uid)
      // NOTE: We are not ordering by 'lastMessageAt' here to avoid needing a composite index.
      // We will sort the results on the client-side instead.
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      
      // Sort client-side
      convos.sort((a, b) => {
        const dateA = a.lastMessageAt?.toDate()?.getTime() || 0;
        const dateB = b.lastMessageAt?.toDate()?.getTime() || 0;
        return dateB - dateA;
      });

      setChats(convos);
      setIsLoadingChats(false);
    }, (err) => {
      console.error("Error fetching chats:", err);
      let errorMessage = t.errorOccurred;
      if (err.message.includes("indexes") || err.message.includes("permission-denied")) {
        errorMessage = t.firestoreIndexError || "The database is being set up or rules are incorrect. Chat will be available in a moment.";
      }
      toast({ variant: "destructive", title: t.errorOccurred, description: errorMessage });
      setError(errorMessage);
      setIsLoadingChats(false);
    });

    return () => unsubscribe();
  }, [authUser, t, toast]);

  useEffect(() => {
    if (!selectedChatId || !db) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const messagesRef = collection(db, 'messages', selectedChatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setIsLoadingMessages(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, (err) => {
      console.error(`Error fetching messages for ${selectedChatId}:`, err);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Could not load messages." });
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedChatId, t, toast]);
  
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

  const handleStartRecording = async () => {
    if (isRecording) {
        handleStopRecording();
        return;
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: "destructive", title: "Audio Recording Not Supported", description: "Your browser does not support audio recording." });
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        
        recorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        
        recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                if (selectedChatId && base64String) {
                    setIsSending(true);
                    try {
                        await sendMessage(selectedChatId, base64String, 'audio');
                    } catch (err: any) {
                         console.error("Error sending audio message:", err);
                         toast({ variant: "destructive", title: t.errorOccurred, description: err.message });
                    } finally {
                        setIsSending(false);
                    }
                }
            };
            stream.getTracks().forEach(track => track.stop());
        };
        
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingIntervalRef.current = setInterval(() => {
            setRecordingTime(prevTime => prevTime + 1);
        }, 1000);

    } catch (err) {
        console.error("Error starting recording:", err);
        toast({ variant: "destructive", title: "Microphone Access Denied", description: "Please enable microphone access in your browser settings." });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.onondataavailable = null;
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        audioChunksRef.current = [];
    }
  };
  
  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const getOtherParticipant = (chat: Chat) => {
    if (!authUser) return { id: '', name: 'Unknown User', avatar: undefined };
    const otherId = chat.participants.find(p => p !== authUser.uid);
    return {
      id: otherId || '',
      name: chat.participantNames?.[otherId || ''] || 'Unknown User',
      avatar: chat.participantAvatars?.[otherId || ''] || undefined
    };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex border rounded-lg shadow-xl bg-card animate-fadeIn">
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
                const otherParticipant = getOtherParticipant(chat);
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
                        <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                        <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold truncate">{otherParticipant.name}</h3>
                          <span className="text-xs text-muted-foreground">{formatDate(chat.lastMessageAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessageSenderId === authUser?.uid ? "You: " : ""}{chat.lastMessage}</p>
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
        {selectedChat ? (
          <>
            <header className="p-3 border-b flex items-center gap-3">
               <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChatId(null)}>
                  <ArrowLeft className="h-5 w-5" />
               </Button>
              <Avatar>
                <AvatarImage src={getOtherParticipant(selectedChat).avatar} />
                <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{getOtherParticipant(selectedChat).name}</h3>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={cn("flex gap-2", msg.senderId === authUser?.uid ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "p-3 rounded-lg max-w-xs lg:max-w-md",
                      msg.senderId === authUser?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                       {msg.type === 'audio' && msg.content.startsWith('data:audio') ? (
                            <audio src={msg.content} controls className="w-full" />
                        ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      <p className={cn("text-xs mt-1 text-right", msg.senderId === authUser?.uid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t">
              {isRecording ? (
                  <div className="flex items-center justify-between gap-2">
                      <Button variant="ghost" size="icon" onClick={handleCancelRecording} className="text-destructive">
                          <Trash2 className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-2 text-sm text-destructive font-mono">
                          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                          <span>{formatRecordingTime(recordingTime)}</span>
                      </div>
                      <Button size="icon" onClick={handleStopRecording} className="bg-destructive hover:bg-destructive/90">
                          <StopCircle className="h-5 w-5" />
                      </Button>
                  </div>
              ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t.typeYourMessage}
                          autoComplete="off"
                          disabled={isSending}
                      />
                      {newMessage.trim() ? (
                          <Button type="submit" size="icon" disabled={isSending}>
                              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                      ) : (
                          <Button type="button" size="icon" onClick={handleStartRecording} disabled={isSending}>
                              <Mic className="h-4 w-4" />
                          </Button>
                      )}
                  </form>
              )}
            </footer>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
             {isLoadingChats ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             ) : chats.length > 0 ? (
                <>
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">{t.selectConversation}</h2>
                  <p className="text-muted-foreground">Choose a conversation from the list to see messages.</p>
                </>
             ) : (
                <>
                  <Frown className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">{t.noConversations}</h2>
                  <p className="text-muted-foreground">Find a service provider to start a new conversation.</p>
                    <Button asChild className="mt-4">
                      <Link href="/services/search">{t.browseServices}</Link>
                    </Button>
                </>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
