"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Call, updateCallStatus } from '@/lib/data';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CallPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const callId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // In a real app, these would be managed by your WebRTC connection state.
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!callId || !db) {
      setError("Call ID is missing or database is unavailable.");
      setLoading(false);
      return;
    }
    
    const callDocRef = doc(db, 'calls', callId);
    const unsubscribe = onSnapshot(callDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const callData = { id: docSnap.id, ...docSnap.data() } as Call;
        setCall(callData);

        if (callData.status === 'ended' || callData.status === 'declined' || callData.status === 'unanswered') {
          toast({ title: t.callEnded, description: t.callHasBeenTerminated });
          router.push('/dashboard/messages');
        }

      } else {
        setError("Call not found.");
        toast({ variant: "destructive", title: "Error", description: "Call not found."});
        router.push('/dashboard/messages');
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching call:", err);
      setError("Failed to fetch call details.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [callId, router, t, toast]);


  // Get camera and microphone permissions
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.error('Failed to get local stream', err);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: t.mediaAccessDeniedTitle, description: t.mediaAccessDeniedDescription });
        setError(t.mediaAccessDeniedTitle as string);
      }
    };

    getMedia();
    
    // Cleanup: stop the stream when component unmounts
    return () => {
        localStreamRef.current?.getTracks().forEach(track => track.stop());
    }

  }, [toast, t]);

  const handleEndCall = async () => {
    if (callId) {
      await updateCallStatus(callId, 'ended');
      // The snapshot listener will handle the redirect
    }
  };
  
  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    setIsMuted(prev => !prev);
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    setIsVideoOff(prev => !prev);
  }

  const getOtherParticipant = () => {
    if (!call || !auth.currentUser) return { name: "User", avatar: undefined };
    const isCaller = auth.currentUser.uid === call.callerId;
    // This is a placeholder. In a real scenario, you'd fetch the callee's info.
    return { 
        name: isCaller ? "Callee" : call.callerName,
        avatar: isCaller ? undefined : call.callerAvatar
    };
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="ml-4 text-xl">{t.connecting}</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold text-destructive mb-2">{t.errorOccurred}</h1>
        <p className="text-center">{error}</p>
         <Button onClick={() => router.push('/dashboard')} className="mt-6">{t.backToDashboard}</Button>
      </div>
    );
  }
  
  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative">
      {/* Remote Video */}
      <div ref={remoteVideoRef} className="flex-1 bg-black flex items-center justify-center">
         {/* Placeholder for remote video stream */}
         <div className="flex flex-col items-center gap-4">
             <Avatar className="h-40 w-40 border-4 border-gray-700">
                <AvatarImage src={otherParticipant.avatar || undefined} />
                <AvatarFallback className="bg-gray-800"><UserCircle className="h-24 w-24 text-gray-600"/></AvatarFallback>
             </Avatar>
             <p className="text-2xl font-semibold">{otherParticipant.name}</p>
             <div className="flex items-center gap-2">
                 <Loader2 className="h-5 w-5 animate-spin" />
                 <span className="text-lg">{call?.status === 'ringing' ? t.ringing : t.connecting}</span>
             </div>
         </div>
      </div>
      
      {/* Local Video */}
      <Card className="absolute bottom-24 right-6 md:bottom-28 md:right-8 h-48 w-36 md:h-64 md:w-48 bg-black border-2 border-gray-700 shadow-2xl overflow-hidden">
        <video ref={localVideoRef} className={cn("h-full w-full object-cover", isVideoOff && "hidden")} autoPlay playsInline muted />
        {hasCameraPermission === false && (
            <div className="h-full w-full flex items-center justify-center text-center p-2 text-xs text-destructive">
                {t.cameraAccessRequired}
            </div>
        )}
      </Card>
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-md flex items-center justify-center">
         <div className="flex items-center gap-6">
            <Button onClick={toggleMute} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isMuted && "bg-destructive hover:bg-destructive/90")}>
                {isMuted ? <MicOff className="h-6 w-6"/> : <Mic className="h-6 w-6"/>}
            </Button>
             <Button onClick={toggleVideo} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isVideoOff && "bg-destructive hover:bg-destructive/90")}>
                {isVideoOff ? <VideoOff className="h-6 w-6"/> : <Video className="h-6 w-6"/>}
            </Button>
            <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full h-14 w-14 p-0">
                <PhoneOff className="h-6 w-6"/>
            </Button>
         </div>
      </div>
    </div>
  );
}
