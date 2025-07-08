
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, addDoc, updateDoc, Timestamp, getDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Call, updateCallStatus } from '@/lib/data';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, UserCircle, Phone, Speaker } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function CallPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const callId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [callData, setCallData] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null); // For robust audio playback

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerphoneOn, setIsSpeakerphoneOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Helper to format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // Effect to manage call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callData?.status === 'active') {
      const startTime = callData.startedAt?.toMillis() || Date.now();
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callData?.status, callData?.startedAt]);
  
  // Cleanup function
  const cleanupCall = useCallback(() => {
      console.log("Cleaning up call resources.");
      // Stop local media tracks
      localStreamRef.current?.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
      
      // Close peer connection
      if (pcRef.current?.connectionState !== 'closed') {
        pcRef.current?.close();
      }
      pcRef.current = null;

      // Nullify video element sources
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  }, []);

  // Main effect to set up the call
  useEffect(() => {
    if (!callId || !auth.currentUser) {
      setError(t.errorOccurred);
      setLoading(false);
      return;
    }

    const currentUserId = auth.currentUser.uid;
    const callDocRef = doc(db, 'calls', callId);

    // 1. Initialize Peer Connection
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;
    remoteStreamRef.current = new MediaStream();

    // 2. Get User Media and start signaling
    const setupCall = async () => {
      try {
        const docSnap = await getDoc(callDocRef);
        if (!docSnap.exists()) throw new Error("Call not found.");
        const initialCallData = { id: docSnap.id, ...docSnap.data() } as Call;
        setCallData(initialCallData);

        const constraints = { audio: true, video: initialCallData.type === 'video' };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Show local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle remote tracks
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            event.streams[0].getTracks().forEach(track => {
                remoteStreamRef.current?.addTrack(track);
            });
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStreamRef.current;
            }
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStreamRef.current;
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = event => {
          if (event.candidate) {
            const candidatesCollection = currentUserId === initialCallData.callerId 
              ? collection(callDocRef, 'callerCandidates') 
              : collection(callDocRef, 'calleeCandidates');
            addDoc(candidatesCollection, event.candidate.toJSON());
          }
        };
        
        pc.onconnectionstatechange = () => {
            console.log("Connection State:", pc.connectionState);
            if (pc.connectionState === "failed") {
                setError(t.callConnectionFailed);
            }
        };

        // Listen for remote ICE candidates
        const remoteCandidatesCollection = currentUserId === initialCallData.callerId
          ? collection(callDocRef, 'calleeCandidates')
          : collection(callDocRef, 'callerCandidates');
          
        onSnapshot(remoteCandidatesCollection, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.addIceCandidate(candidate).catch(e => console.error("Error adding ICE candidate:", e));
            }
          });
        });
        
        // Start offer/answer process if we are the caller
        if (currentUserId === initialCallData.callerId) {
          const offerDescription = await pc.createOffer();
          await pc.setLocalDescription(offerDescription);
          await updateDoc(callDocRef, { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to setup call", err);
        toast({ variant: 'destructive', title: t.mediaAccessDeniedTitle, description: t.mediaAccessDeniedDescription });
        setError(t.mediaAccessDeniedTitle as string);
        setLoading(false);
      }
    };
    
    setupCall();
    
    // Listen for call document changes (answers, status, etc.)
    const unsubscribeCall = onSnapshot(callDocRef, async (docSnap) => {
      const latestCallData = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Call : null;
      if (!latestCallData) {
        toast({ title: t.callEnded });
        router.push('/dashboard/messages');
        return;
      }
      
      setCallData(latestCallData);
      
      if (['ended', 'declined', 'unanswered'].includes(latestCallData.status)) {
        toast({ title: t.callEnded, description: t.callHasBeenTerminated });
        setTimeout(() => router.push(`/dashboard/messages?chatId=${latestCallData.chatId}`), 2000);
      }
      
      const pc = pcRef.current;
      if (!pc) return;

      // Callee logic: handle offer and create answer
      if (currentUserId === latestCallData.calleeId && latestCallData.offer && !pc.currentRemoteDescription) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(latestCallData.offer));
          const answerDescription = await pc.createAnswer();
          await pc.setLocalDescription(answerDescription);
          const batch = writeBatch(db);
          batch.update(callDocRef, {
            answer: { sdp: answerDescription.sdp, type: answerDescription.type },
            status: 'active',
            startedAt: serverTimestamp()
          });
          await batch.commit();
        } catch (e) {
          console.error("Error setting remote description or creating answer:", e);
        }
      }

      // Caller logic: handle answer
      if (currentUserId === latestCallData.callerId && latestCallData.answer && !pc.currentRemoteDescription) {
         try {
           await pc.setRemoteDescription(new RTCSessionDescription(latestCallData.answer));
         } catch(e) {
           console.error("Error setting remote description on caller side:", e);
         }
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeCall();
      cleanupCall();
    };

  }, [callId, router, t, toast, cleanupCall]);


  const handleEndCall = async () => {
    if (callId) {
      await updateCallStatus(callId, 'ended');
    }
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    });
  }
  
  const toggleSpeakerphone = () => {
    setIsSpeakerphoneOn(prev => !prev);
    if(remoteAudioRef.current){
        // @ts-ignore some browsers use this property
        remoteAudioRef.current.setSinkId?.(isSpeakerphoneOn ? 'default' : 'speaker')
    }
    toast({ title: !isSpeakerphoneOn ? t.speakerOn : t.speakerOff });
  };
  
  const getOtherParticipant = () => {
    if (!callData || !auth.currentUser) return { name: "User", avatar: undefined };
    return auth.currentUser.uid === callData.callerId
        ? { name: callData.calleeName, avatar: callData.calleeAvatar }
        : { name: callData.callerName, avatar: callData.callerAvatar };
  }

  const otherParticipant = getOtherParticipant();
  const isAudioCall = callData?.type === 'audio';
  const isCallActive = callData?.status === 'active';
  const isRinging = callData?.status === 'ringing';

  const isRemoteVideoActive = remoteStreamRef.current && remoteStreamRef.current.getVideoTracks().some(t => t.enabled && !t.muted);

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

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative">
      {/* This audio element is crucial for reliable audio playback on all devices */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline
          muted // The remote audio is handled by the <audio> tag, video should be muted
          className="h-full w-full object-contain" 
        />
        {(isAudioCall || !isRemoteVideoActive) && (
           <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900 z-10">
            <Avatar className="h-40 w-40 border-4 border-gray-700">
              <AvatarImage src={otherParticipant.avatar || undefined} />
              <AvatarFallback className="bg-gray-800"><UserCircle className="h-24 w-24 text-gray-600" /></AvatarFallback>
            </Avatar>
            <p className="text-2xl font-semibold">{otherParticipant.name}</p>
            
            {isCallActive ? (
                <div className="text-lg font-mono">{formatDuration(callDuration)}</div>
            ) : (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-lg">{isRinging ? t.ringing : t.connecting}</span>
                </div>
            )}
          </div>
        )}
      </div>

      {!isAudioCall && (
          <Card className="absolute bottom-24 right-6 md:bottom-28 md:right-8 h-48 w-36 md:h-64 md:w-48 bg-black border-2 border-gray-700 shadow-2xl overflow-hidden z-20">
            <CardContent className="p-0 h-full">
              <video ref={localVideoRef} className={cn("h-full w-full object-cover", isVideoOff && "hidden")} autoPlay playsInline muted />
               {isVideoOff && (
                <div className="h-full w-full flex items-center justify-center bg-black">
                    <UserCircle className="h-16 w-16 text-gray-600" />
                </div>
               )}
            </CardContent>
          </Card>
      )}
      
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-lg font-mono z-20">
          {formatDuration(callDuration)}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-md flex items-center justify-center z-20">
        <div className="flex items-center gap-4">
          <Button onClick={toggleMute} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isMuted && "bg-destructive hover:bg-destructive/90")}>
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          {!isAudioCall && (
            <Button onClick={toggleVideo} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isVideoOff && "bg-destructive hover:bg-destructive/90")}>
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}
          <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full h-14 w-14 p-0">
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button onClick={toggleSpeakerphone} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isSpeakerphoneOn && "bg-primary text-primary-foreground hover:bg-primary/90")}>
            <Speaker className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
