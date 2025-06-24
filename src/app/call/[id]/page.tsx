
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, addDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Call, updateCallStatus } from '@/lib/data';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, UserCircle } from 'lucide-react';
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

  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!callId || !db) {
      setError(t.errorOccurred);
      setLoading(false);
      return;
    }

    pcRef.current = new RTCPeerConnection(servers);

    // Get camera and microphone permissions and set up local stream
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Push tracks from local stream to peer connection
        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream);
        });

      } catch (err) {
        console.error('Failed to get local stream', err);
        toast({ variant: 'destructive', title: t.mediaAccessDeniedTitle, description: t.mediaAccessDeniedDescription });
        setError(t.mediaAccessDeniedTitle as string);
      }
    };
    
    // Handle remote stream
    pcRef.current.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    // Start media setup
    setupMedia();

    // Firestore call document listener
    const callDocRef = doc(db, 'calls', callId);
    const unsubscribeCall = onSnapshot(callDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const callData = { id: docSnap.id, ...docSnap.data() } as Call;
        setCall(callData);

        if (callData.status === 'ended' || callData.status === 'declined' || callData.status === 'unanswered') {
          toast({ title: t.callEnded, description: t.callHasBeenTerminated });
          router.push('/dashboard/messages');
        }

        // Handle WebRTC signaling based on document changes
        if (pcRef.current && !pcRef.current.currentRemoteDescription && callData.answer) {
            const answerDescription = new RTCSessionDescription(callData.answer);
            pcRef.current.setRemoteDescription(answerDescription);
        }

      } else {
        setError(t.errorOccurred);
        toast({ variant: "destructive", title: "Error", description: "Call not found." });
        router.push('/dashboard/messages');
      }
      setLoading(false);
    });

    // Cleanup logic
    return () => {
      unsubscribeCall();
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      pcRef.current?.close();
    };
  }, [callId, router, t, toast]);
  

  // Handle Offer/Answer and ICE candidates based on role
  useEffect(() => {
    if (!pcRef.current || !auth.currentUser || !callId) return;

    const currentUserId = auth.currentUser.uid;
    const callDocRef = doc(db, 'calls', callId);

    // ICE Candidate logic
    const callerCandidatesCollection = collection(callDocRef, 'callerCandidates');
    const calleeCandidatesCollection = collection(callDocRef, 'calleeCandidates');

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        const candidatesCollection = currentUserId === call?.callerId ? callerCandidatesCollection : calleeCandidatesCollection;
        addDoc(candidatesCollection, event.candidate.toJSON());
      }
    };
    
    const handleSignaling = async () => {
      if (currentUserId === call?.callerId) {
        // Listen for ICE candidates from callee
        onSnapshot(calleeCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    pcRef.current?.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });

        // Create offer
        const offerDescription = await pcRef.current?.createOffer();
        await pcRef.current?.setLocalDescription(offerDescription);
        await updateDoc(callDocRef, { offer: { sdp: offerDescription?.sdp, type: offerDescription?.type } });

      } else if (currentUserId === call?.calleeId) {
        // Listen for ICE candidates from caller
        onSnapshot(callerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    pcRef.current?.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });

        // Create answer
        if (call?.offer) {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(call.offer));
          const answerDescription = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answerDescription);
          await updateDoc(callDocRef, { answer: { sdp: answerDescription?.sdp, type: answerDescription?.type } });
        }
      }
    };

    if (call?.status === 'active') { // Only start signaling when call is active
      handleSignaling();
    } else if (call?.status === 'ringing' && call?.callerId === currentUserId) { // For caller, start signaling immediately
      handleSignaling();
    }

  }, [call, callId]);

  const handleEndCall = async () => {
    if (callId) {
      pcRef.current?.close();
      await updateCallStatus(callId, 'ended');
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
    return auth.currentUser.uid === call.callerId
        ? { name: "Callee", avatar: undefined } // In a real app, you'd fetch callee's info
        : { name: call.callerName, avatar: call.callerAvatar };
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
      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video ref={remoteVideoRef} autoPlay playsInline className={cn("h-full w-full object-contain", !remoteStreamRef.current && "hidden")} />
        {!remoteStreamRef.current && (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-40 w-40 border-4 border-gray-700">
              <AvatarImage src={otherParticipant.avatar || undefined} />
              <AvatarFallback className="bg-gray-800"><UserCircle className="h-24 w-24 text-gray-600" /></AvatarFallback>
            </Avatar>
            <p className="text-2xl font-semibold">{otherParticipant.name}</p>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-lg">{call?.status === 'ringing' ? t.ringing : t.connecting}</span>
            </div>
          </div>
        )}
      </div>

      {/* Local Video */}
      <Card className="absolute bottom-24 right-6 md:bottom-28 md:right-8 h-48 w-36 md:h-64 md:w-48 bg-black border-2 border-gray-700 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <video ref={localVideoRef} className={cn("h-full w-full object-cover", isVideoOff && "hidden")} autoPlay playsInline muted />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-md flex items-center justify-center">
        <div className="flex items-center gap-6">
          <Button onClick={toggleMute} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isMuted && "bg-destructive hover:bg-destructive/90")}>
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button onClick={toggleVideo} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isVideoOff && "bg-destructive hover:bg-destructive/90")}>
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
          <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full h-14 w-14 p-0">
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

