
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Call, updateCallStatus } from '@/lib/data';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, UserCircle, Phone } from 'lucide-react';
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

  const signalingStarted = useRef(false);

  useEffect(() => {
    if (!callId || !db) {
      setError(t.errorOccurred);
      setLoading(false);
      return;
    }

    pcRef.current = new RTCPeerConnection(servers);
    
    remoteStreamRef.current = new MediaStream();
    pcRef.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStreamRef.current?.addTrack(track);
        });
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
    };

    const callDocRef = doc(db, 'calls', callId);
    const unsubscribeCall = onSnapshot(callDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const callData = { id: docSnap.id, ...docSnap.data() } as Call;
        setCall(callData);

        if (!localStreamRef.current) {
            try {
                const constraints = { audio: true, video: callData.type === 'video' };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                localStreamRef.current = stream;
                 if (callData.type === 'video' && localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                stream.getTracks().forEach((track) => pcRef.current?.addTrack(track, stream));
            } catch (err) {
                console.error('Failed to get local stream', err);
                toast({ variant: 'destructive', title: t.mediaAccessDeniedTitle, description: t.mediaAccessDeniedDescription });
                setError(t.mediaAccessDeniedTitle as string);
                return;
            }
        }

        if (callData.status === 'ended' || callData.status === 'declined' || callData.status === 'unanswered') {
          toast({ title: t.callEnded, description: t.callHasBeenTerminated });
          router.push('/dashboard/messages');
        }

        if (pcRef.current && !pcRef.current.currentRemoteDescription && callData.answer) {
            pcRef.current.setRemoteDescription(new RTCSessionDescription(callData.answer));
        }
      } else {
        setError(t.errorOccurred);
        toast({ variant: "destructive", title: "Error", description: "Call not found." });
        router.push('/dashboard/messages');
      }
      setLoading(false);
    });

    return () => {
      unsubscribeCall();
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      pcRef.current?.close();
    };
  }, [callId, router, t, toast]);
  

  useEffect(() => {
    if (!pcRef.current || !auth.currentUser || !callId || !call || signalingStarted.current) return;

    const handleSignaling = async () => {
        const currentUserId = auth.currentUser!.uid;
        const callDocRef = doc(db, 'calls', callId);
        const callerCandidatesCollection = collection(callDocRef, 'callerCandidates');
        const calleeCandidatesCollection = collection(callDocRef, 'calleeCandidates');

        pcRef.current!.onicecandidate = (event) => {
            if (event.candidate) {
                const candidatesCollection = currentUserId === call.callerId ? callerCandidatesCollection : calleeCandidatesCollection;
                addDoc(candidatesCollection, event.candidate.toJSON());
            }
        };

        if (currentUserId === call.callerId) {
            onSnapshot(calleeCandidatesCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pcRef.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });

            const offerDescription = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offerDescription);
            await updateDoc(callDocRef, { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });

        } else if (currentUserId === call.calleeId) {
            onSnapshot(callerCandidatesCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pcRef.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });

            if (call.offer && !pcRef.current.currentRemoteDescription) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(call.offer));
                const answerDescription = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answerDescription);
                await updateDoc(callDocRef, { answer: { sdp: answerDescription.sdp, type: answerDescription.type } });
            }
        }
    };

    if ((call.status === 'active' && call.calleeId === auth.currentUser.uid) || 
        (call.status === 'ringing' && call.callerId === auth.currentUser.uid && call.offer)) {
        handleSignaling();
        signalingStarted.current = true;
    } else if(call.status === 'active' && call.callerId === auth.currentUser.uid) {
         handleSignaling();
         signalingStarted.current = true;
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
        ? { name: call.calleeName, avatar: call.calleeAvatar }
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
  const remoteVideoActive = remoteStreamRef.current && remoteStreamRef.current.active && remoteStreamRef.current.getVideoTracks().length > 0;
  const isAudioCall = call?.type === 'audio';

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative">
      {/* Remote View */}
      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
        {isAudioCall || !remoteVideoActive ? (
           <div className="flex flex-col items-center gap-4">
            <Avatar className="h-40 w-40 border-4 border-gray-700">
              <AvatarImage src={otherParticipant.avatar || undefined} />
              <AvatarFallback className="bg-gray-800"><UserCircle className="h-24 w-24 text-gray-600" /></AvatarFallback>
            </Avatar>
            <p className="text-2xl font-semibold">{otherParticipant.name}</p>
             {isAudioCall && <Phone className="h-8 w-8 text-gray-400" />}
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-lg">{call?.status === 'ringing' ? t.ringing : t.connecting}</span>
            </div>
          </div>
        ) : (
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
        )}
      </div>

      {/* Local Video Preview (only for video calls) */}
      {!isAudioCall && (
          <Card className="absolute bottom-24 right-6 md:bottom-28 md:right-8 h-48 w-36 md:h-64 md:w-48 bg-black border-2 border-gray-700 shadow-2xl overflow-hidden">
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

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-md flex items-center justify-center">
        <div className="flex items-center gap-6">
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
        </div>
      </div>
    </div>
  );
}
