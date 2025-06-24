"use client";

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Call, updateCallStatus } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, UserCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CallNotification() {
  const t = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !db) return;

    const q = query(
      collection(db, "calls"),
      where("calleeId", "==", currentUser.uid),
      where("status", "==", "ringing")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callDoc = snapshot.docs[0];
        setIncomingCall({ id: callDoc.id, ...callDoc.data() } as Call);
      } else {
        setIncomingCall(null);
      }
    }, (error) => {
        console.error("Error listening for incoming calls:", error);
        toast({ variant: "destructive", title: t.errorOccurred, description: "Failed to listen for calls." });
    });

    return () => unsubscribe();
  }, [toast, t]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    try {
        await updateCallStatus(incomingCall.id, 'active');
        toast({ title: t.callAccepted, description: t.connecting });
        router.push(`/call/${incomingCall.id}`);
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to accept call." });
    }
  };

  const handleDecline = async () => {
    if (!incomingCall) return;
     try {
        await updateCallStatus(incomingCall.id, 'declined');
        setIncomingCall(null);
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to decline call." });
    }
  };

  return (
    <AlertDialog open={!!incomingCall}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center text-center">
          <Avatar className="h-20 w-20 mb-4 border-4 border-primary">
            <AvatarImage src={incomingCall?.callerAvatar || undefined} alt={incomingCall?.callerName} />
            <AvatarFallback><UserCircle className="h-12 w-12" /></AvatarFallback>
          </Avatar>
          <AlertDialogTitle className="text-2xl">{t.incomingCall}</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {incomingCall?.callerName} {t.isCallingYou}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center gap-6 mt-4">
          <Button onClick={handleDecline} variant="destructive" size="lg" className="rounded-full h-16 w-16 p-0 flex items-center justify-center">
            <PhoneOff className="h-8 w-8" />
            <span className="sr-only">{t.decline}</span>
          </Button>
          <Button onClick={handleAccept} size="lg" className="rounded-full h-16 w-16 p-0 flex items-center justify-center bg-green-500 hover:bg-green-600">
            <Phone className="h-8 w-8" />
            <span className="sr-only">{t.accept}</span>
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
