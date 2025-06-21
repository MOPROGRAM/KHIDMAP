
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import type { Conversation, Message } from '@/lib/data';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, type Timestamp, where } from 'firebase/firestore';
import { Loader2, Send, MessageSquare, ArrowLeft, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOtherParticipant = useCallback((conversation?: Conversation | null) => {
    if (!conversation || !Array.isArray(conversation.participants) || !authUser) {
      return { id: null, name: 'Unknown' };
    }
    const otherId = conversation.participants.find(p => p !== authUser.uid);
    if (!otherId) {
      return { id: null, name: 'Unknown User' };
    }
    return {
      id: otherId,
      name: conversation.participantNames?.[otherId] || 'Unknown User',
    };
  }, [authUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!authUser || !db) return;

    setLoadingConversations(true);
    const unsubscribeConversations = onSnapshot(
      query(collection(db, 'conversations'), where('participants', 'array-contains', authUser.uid), orderBy('updatedAt', 'desc')),
      (snapshot) => {
        const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
        setConversations(convos);
        
        const convoIdFromUrl = searchParams.get('conversationId');
        if (convoIdFromUrl) {
            const convoToSelect = convos.find(c => c.id === convoIdFromUrl);
            if (convoToSelect) {
                setSelectedConversation(convoToSelect);
            }
        }
        setLoadingConversations(false);
      },
      (error) => {
        console.error("Error fetching conversations: ", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to load conversations." });
        setLoadingConversations(false);
      }
    );

    return () => unsubscribeConversations();
  }, [authUser, searchParams, t.errorOccurred, toast, db]);

  useEffect(() => {
    if (!selectedConversation?.id || !db) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const messagesQuery = query(collection(db, 'conversations', selectedConversation.id, 'messages'), orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoadingMessages(false);
    }, (error) => {
        console.error("Error fetching messages: ", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to load messages." });
        setLoadingMessages(false);
    });

    return () => unsubscribeMessages();
  }, [selectedConversation, t.errorOccurred, toast, db]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !authUser || !selectedConversation || !db) return;

    setSendingMessage(true);
    const conversationId = selectedConversation.id;
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesColRef = collection(db, 'conversations', conversationId, 'messages');

    try {
      await addDoc(messagesColRef, {
        senderId: authUser.uid,
        text: newMessage,
        createdAt: serverTimestamp(),
      });

      await updateDoc(conversationRef, {
        lastMessage: newMessage,
        lastMessageSenderId: authUser.uid,
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to send message." });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTimestamp = (timestamp: Timestamp | { seconds: number; nanoseconds: number; } | null): string => {
    if (!timestamp) {
        return '';
    }

    let date: Date;
    if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if ('seconds' in timestamp && typeof timestamp.seconds === 'number') {
        date = new Date(timestamp.seconds * 1000);
    } else {
        const d = new Date(timestamp as any);
        if (!isNaN(d.getTime())) {
            date = d;
        } else {
            return ''; 
        }
    }
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const otherParticipantInSelectedConvo = useMemo(() => getOtherParticipant(selectedConversation), [selectedConversation, getOtherParticipant]);

  return (
    <div className="h-[calc(100vh-8rem)] flex animate-fadeIn border rounded-lg shadow-lg bg-card">
      {/* Conversations List */}
      <div className={cn("w-full md:w-1/3 border-r flex flex-col", selectedConversation && "hidden md:flex")}>
        <div className="p-4 border-b">
          <CardTitle>{t.messages}</CardTitle>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">{t.noConversations}</div>
          ) : (
            conversations.map(convo => {
              if (!convo || !convo.id) return null;
              const otherUser = getOtherParticipant(convo);
              const isSelected = selectedConversation?.id === convo.id;
              const isLastMessageFromMe = convo.lastMessageSenderId === authUser?.uid;

              return (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={cn(
                    "p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 border-b",
                    isSelected && "bg-muted"
                  )}
                >
                  <Avatar>
                    <AvatarFallback>{otherUser.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{otherUser.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                        {isLastMessageFromMe ? `${t.you}: ` : ''}{convo.lastMessage || ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message View */}
      <div className={cn("w-full md:w-2/3 flex-col", !selectedConversation && "hidden md:flex")}>
        {!selectedConversation ? (
          <div className="flex flex-col h-full justify-center items-center text-center p-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">{t.selectAConversation}</h3>
            <p className="text-muted-foreground">{t.startTheConversation}</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar>
                  <AvatarFallback>{otherParticipantInSelectedConvo.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{otherParticipantInSelectedConvo.name}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground">{t.noMessagesYet}</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={cn("flex", msg.senderId === authUser?.uid ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "p-3 rounded-lg max-w-xs md:max-w-md shadow-sm",
                      msg.senderId === authUser?.uid ? "bg-primary text-primary-foreground" : "bg-background border"
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text || ''}</p>
                      <p className={cn("text-xs mt-1", msg.senderId === authUser?.uid ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left")}>
                        {formatMessageTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t.typeYourMessage}
                  disabled={sendingMessage || loadingMessages}
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={sendingMessage || !newMessage.trim()}>
                  {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
