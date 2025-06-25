
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Call, updateCallStatus } from '@/lib/data';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, UserCircle, Phone, Speaker } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

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
  const [callDuration, setCallDuration] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState(false);

  const [isSpeakerphoneOn, setIsSpeakerphoneOn] = useState(false);
  const [isSpeakerphoneSupported, setIsSpeakerphoneSupported] = useState(false);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const signalingStarted = useRef(false);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [localStreamReady, setLocalStreamReady] = useState(false);


  // Effect to check for speakerphone support
  useEffect(() => {
    if (navigator.mediaDevices && typeof (remoteVideoRef.current as any)?.setSinkId !== 'undefined') {
        setIsSpeakerphoneSupported(true);
    }
  }, []);

  // Main effect to setup and listen to the call document
  useEffect(() => {
    if (!callId || !db) {
      setError(t.errorOccurred);
      setLoading(false);
      return;
    }

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.ontrack = (event) => {
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.play().catch(e => console.error("Remote video play failed", e));
            const videoTrack = event.streams[0].getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onunmute = () => setIsRemoteVideoActive(true);
                videoTrack.onmute = () => setIsRemoteVideoActive(false);
                setIsRemoteVideoActive(!videoTrack.muted);
            } else {
                 setIsRemoteVideoActive(false); // For audio-only streams
            }
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

                stream.getTracks().forEach((track) => {
                    pcRef.current?.addTrack(track, stream);
                });
                
                setLocalStreamReady(true);

                 if (callData.type === 'video' && localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Failed to get local stream', err);
                toast({ variant: 'destructive', title: t.mediaAccessDeniedTitle, description: t.mediaAccessDeniedDescription });
                setError(t.mediaAccessDeniedTitle as string);
                return;
            }
        }
        
        if (callData.status === 'ended' || callData.status === 'declined' || callData.status === 'unanswered') {
          toast({ title: t.callEnded, description: t.callHasBeenTerminated });
           setTimeout(() => router.push(`/dashboard/messages?chatId=${callData.chatId}`), 2000);
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
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [callId, router, t, toast]);
  
  // Effect for handling WebRTC signaling
  useEffect(() => {
    if (!pcRef.current || !auth.currentUser || !callId || !call || signalingStarted.current || !localStreamReady) return;

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
                await updateDoc(callDocRef, { answer: { sdp: answerDescription.sdp, type: answerDescription.type }, status: 'active', startedAt: Timestamp.now() });
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
  }, [call, callId, localStreamReady]);
  
  // Effect for handling the call timer
  useEffect(() => {
    if (call?.status === 'active') {
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    } else {
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    }

    return () => {
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [call?.status]);

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

  const toggleSpeakerphone = async () => {
    if (!isSpeakerphoneSupported || !remoteVideoRef.current) return;
    const videoElement = remoteVideoRef.current as any;
    try {
        if (isSpeakerphoneOn) {
            // Attempt to switch to default (earpiece on mobile)
            await videoElement.setSinkId('');
        } else {
            // Attempt to switch to speaker
            const devices = await navigator.mediaDevices.enumerateDevices();
            const speaker = devices.find(d => d.kind === 'audiooutput' && d.deviceId === 'default');
             if (speaker) {
                 await videoElement.setSinkId(speaker.deviceId);
             } else {
                 // Fallback if no specific speaker found, try the first available output
                 const anyAudioOutput = devices.find(d => d.kind === 'audiooutput');
                 if (anyAudioOutput) await videoElement.setSinkId(anyAudioOutput.deviceId);
             }
        }
        setIsSpeakerphoneOn(prev => !prev);
        toast({ title: !isSpeakerphoneOn ? "Speaker On" : "Speaker Off" });
    } catch (error) {
        console.error('Error setting audio output device:', error);
        toast({ variant: 'destructive', title: "Error", description: "Could not switch audio device." });
    }
  };

  const getOtherParticipant = () => {
    if (!call || !auth.currentUser) return { name: "User", avatar: undefined };
    return auth.currentUser.uid === call.callerId
        ? { name: call.calleeName, avatar: call.calleeAvatar }
        : { name: call.callerName, avatar: call.callerAvatar };
  }
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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
  const isAudioCall = call?.type === 'audio';
  const isCallActive = call?.status === 'active';

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative">
      
      {/* Remote View Area */}
      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
        {/* Remote video is always in the DOM to ensure audio plays, but visibility is controlled by opacity */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
            isRemoteVideoActive && !isAudioCall ? "opacity-100" : "opacity-0"
          )} 
        />
        
        {/* Overlay for audio call UI or when remote video is off */}
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
                    <span className="text-lg">{call?.status === 'ringing' ? t.ringing : t.connecting}</span>
                </div>
            )}

            {isAudioCall && !isCallActive && <Phone className="h-8 w-8 text-gray-400 mt-2" />}
          </div>
        )}
      </div>

      {/* Local Video Preview (only for video calls) */}
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
      
      {isCallActive && !isAudioCall && isRemoteVideoActive && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-lg font-mono z-20">
            {formatDuration(callDuration)}
        </div>
      )}

      {/* Controls */}
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
          <Button onClick={toggleSpeakerphone} variant="outline" size="lg" className={cn("rounded-full h-14 w-14 p-0 bg-white/10 border-none hover:bg-white/20", isSpeakerphoneOn && "bg-primary text-primary-foreground hover:bg-primary/90")} disabled={!isSpeakerphoneSupported}>
            <Speaker className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
