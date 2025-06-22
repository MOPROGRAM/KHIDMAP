
"use client";

import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslation, Translations } from '@/hooks/useTranslation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Conversation, Message, sendMessage } from '@/lib/data';
import { collection, query, where, orderBy, onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, MessageSquare, UserCircle, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setAuthUser(user);
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('conversationId');
    if (conversationIdFromUrl) {
      setSelectedConversationId(conversationIdFromUrl);
      // Clean up URL
      router.replace(pathname, {scroll: false});
    }
  }, [searchParams, router, pathname]);

  // Fetch conversations in real-time
  useEffect(() => {
    if (!authUser || !db) return;

    setIsLoadingConversations(true);
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', authUser.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convos);
      setIsLoadingConversations(false);
    }, (err) => {
      console.error("Error fetching conversations:", err);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Could not load conversations." });
      setError("Could not load conversations.");
      setIsLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [authUser, t, toast]);

  // Fetch messages for selected conversation in real-time
  useEffect(() => {
    if (!selectedConversationId || !db) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const messagesRef = collection(db, 'conversations', selectedConversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setIsLoadingMessages(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, (err) => {
      console.error(`Error fetching messages for ${selectedConversationId}:`, err);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Could not load messages." });
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversationId, t, toast]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !authUser) return;

    setIsSending(true);
    try {
      await sendMessage(selectedConversationId, newMessage);
      setNewMessage('');
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({ variant: "destructive", title: t.errorOccurred, description: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const getOtherParticipant = (convo: Conversation) => {
    const otherId = convo.participants.find(p => p !== authUser?.uid);
    return {
      id: otherId || '',
      name: convo.participantNames[otherId || ''] || 'Unknown User',
      avatar: convo.participantAvatars?.[otherId || ''] || undefined
    };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex border rounded-lg shadow-xl bg-card animate-fadeIn">
      {/* Conversations List Panel */}
      <aside className={cn("w-full md:w-1/3 lg:w-1/4 border-r flex flex-col", selectedConversationId && "hidden md:flex")}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold font-headline">{t.conversations}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Loader2 key={i} className="w-full h-16 animate-pulse text-muted" />)}
            </div>
          ) : conversations.length > 0 ? (
            <ul>
              {conversations.map(convo => {
                const otherParticipant = getOtherParticipant(convo);
                return (
                  <li key={convo.id}>
                    <button
                      onClick={() => setSelectedConversationId(convo.id)}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center gap-3",
                        selectedConversationId === convo.id && "bg-muted"
                      )}
                    >
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                        <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold truncate">{otherParticipant.name}</h3>
                          <span className="text-xs text-muted-foreground">{formatDate(convo.lastMessageAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessageSenderId === authUser?.uid ? "You: " : ""}{convo.lastMessage}</p>
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

      {/* Messages Panel */}
      <main className={cn("flex-1 flex flex-col", !selectedConversationId && "hidden md:flex")}>
        {selectedConversation ? (
          <>
            <header className="p-3 border-b flex items-center gap-3">
               <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversationId(null)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
               </Button>
              <Avatar>
                <AvatarImage src={getOtherParticipant(selectedConversation).avatar} />
                <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{getOtherParticipant(selectedConversation).name}</h3>
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
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={cn("text-xs mt-1", msg.senderId === authUser?.uid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t.typeYourMessage}
                  autoComplete="off"
                  disabled={isSending}
                />
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
             {conversations.length > 0 ? (
                <>
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">{t.selectConversation}</h2>
                  <p className="text-muted-foreground">Choose a conversation from the list to see messages.</p>
                </>
             ) : (
                 !isLoadingConversations && (
                    <>
                      <Frown className="h-16 w-16 text-muted-foreground mb-4" />
                      <h2 className="text-xl font-semibold">{t.noConversations}</h2>
                      <p className="text-muted-foreground">Find a service provider to start a new conversation.</p>
                       <Button asChild className="mt-4">
                          <Link href="/services/search">{t.browseServices}</Link>
                       </Button>
                    </>
                 )
             )}
              {isLoadingConversations && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          </div>
        )}
      </main>
    </div>
  );
}

