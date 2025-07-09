


import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy, limit, writeBatch, GeoPoint, arrayUnion, arrayRemove, increment, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { verifyPayment, type VerifyPaymentInput } from '@/ai/flows/verify-payment-flow';
import type { Translations } from './translations';


export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';
export type OrderStatus = 'pending_approval' | 'pending_payment' | 'paid' | 'pending_completion' | 'completed' | 'disputed' | 'declined' | 'resolved';
export type SupportRequestType = 'inquiry' | 'complaint' | 'payment_issue' | 'other';
export type AdRequestStatus = 'pending_review' | 'pending_payment' | 'payment_review' | 'active' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';


export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  qualifications?: string;
  serviceCategories?: ServiceCategory[];
  serviceAreas?: string[]; 
  location?: GeoPoint | null;
  images?: string[];
  videos?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  emailVerified?: boolean;
  videoCallsEnabled?: boolean;
  verificationStatus?: VerificationStatus;
  verificationDocuments?: string[];
  verificationRejectionReason?: string;
}

export interface Rating {
    id: string;
    ratedUserId: string;
    raterUserId: string;
    raterName: string;
    rating: number; // 1-5
    comment: string;
    createdAt: Timestamp;
}

export interface Chat {
    id: string;
    participantIds: string[];
    participantNames: { [key: string]: string };
    participantAvatars: { [key: string]: string | null };
    participantSettings: { [key: string]: { videoCallsEnabled: boolean } };
    lastMessage: string;
    lastMessageAt: Timestamp;
    lastMessageSenderId: string;
    createdAt: Timestamp;
    unreadCount: { [key: string]: number };
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string; 
    type: 'text' | 'audio' | 'image' | 'video' | 'system_call_status';
    createdAt: Timestamp;
    readBy: { [key:string]: boolean };
    callMetadata?: {
        type: 'audio' | 'video';
        duration: number; // in seconds
    }
}

export interface Call {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string | null;
  calleeId: string;
  calleeName: string;
  calleeAvatar?: string | null;
  status: 'ringing' | 'active' | 'declined' | 'ended' | 'unanswered';
  type: 'video' | 'audio';
  participantIds: string[];
  createdAt: Timestamp;
  startedAt?: Timestamp; // To calculate duration
  // WebRTC signaling fields
  offer?: { sdp: string; type: 'offer' };
  answer?: { sdp: string; type: 'answer' };
}

export interface Order {
    id: string;
    seekerId: string;
    providerId: string;
    seekerName: string;
    providerName: string;
    serviceDescription: string;
    amount: number;
    currency: string;
    commission: number;
    payoutAmount: number;
    status: OrderStatus;
    proofOfPaymentUrl?: string;
    createdAt: Timestamp;
    approvedByProviderAt?: Timestamp;
    paymentApprovedAt?: Timestamp;
    completedAt?: Timestamp;
    declinedAt?: Timestamp;
    serviceStartDate?: Timestamp;
    gracePeriodInDays?: number;
    serviceStartedAt?: Timestamp;
    workFinishedAt?: Timestamp;
    disputeReason?: string;
    verificationNotes?: string;
    chatId?: string;
    resolutionNotes?: string;
    disputeResolution?: 'seeker_favor' | 'provider_favor';
}

export interface Notification {
    id: string;
    userId: string; // The user who should receive the notification
    titleKey: keyof Translations;
    messageKey: keyof Translations;
    messageParams?: { [key: string]: string };
    link: string; // e.g., `/dashboard/orders/${orderId}`
    isRead: boolean;
    createdAt: Timestamp;
}

export interface AdRequest {
    id: string;
    userId: string;
    name: string; // User's name
    email: string; // User's email
    title: string; // Ad Title
    message: string; // Ad Description
    imageUrl?: string; // URL for the ad image
    status: AdRequestStatus;
    price?: number; // Set by admin upon approval
    currency?: string; // Set by admin
    paymentProofUrl?: string; // Uploaded by user after price is set
    rejectionReason?: string; // Set by admin if rejected
    verificationNotes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


export interface SupportRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: SupportRequestType;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: Timestamp;
    updatedAt: Timestamp;
    adminReply?: string;
}


export async function createNotification(
    userId: string, 
    titleKey: keyof Translations, 
    messageKey: keyof Translations, 
    link: string, 
    messageParams?: { [key: string]: string }
): Promise<void> {
    if (!db) return;
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            titleKey,
            messageKey,
            messageParams: messageParams || {},
            link,
            isRead: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        // Don't throw, as notification failure shouldn't block the main action.
    }
}

export async function getAllNotificationsForUser(userId: string): Promise<Notification[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
}


// --- UserProfile Firestore Functions ---
export const getUserProfileById = async (uid: string): Promise<UserProfile | null> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in getUserProfileById.");
    throw new Error("Database service is not configured.");
  }
  if (!uid) {
      console.error("getUserProfileById called with no UID.");
      throw new Error("Provider ID is missing.");
  }
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        ...data,
      } as UserProfile;
    } else {
      console.log(`No user profile found for UID: ${uid}`);
      return null;
    }
  } catch (error: any) {
    console.error(`Error fetching user profile for UID ${uid}. Code: ${error.code}. Message: ${error.message}`);
    throw error;
  }
};

export const getAllProviders = async (): Promise<UserProfile[]> => {
    if (!db) {
        console.error("Firestore (db) is not initialized in getAllProviders.");
        return [];
    }
    try {
        const providersQuery = query(collection(db, "users"), where("role", "==", "provider"));
        const querySnapshot = await getDocs(providersQuery);
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                uid: docSnap.id,
                ...data,
            } as UserProfile;
        });
    } catch (error) {
        console.error("Error fetching all providers from Firestore: ", error);
        return [];
    }
};

export async function uploadVerificationDocuments(files: FileList): Promise<void> {
  if (!storage || !db || !auth.currentUser) throw new Error("Services not initialized or user not logged in.");
  
  const user = auth.currentUser;
  const userDocRef = doc(db, "users", user.uid);

  for (const file of Array.from(files)) {
    const filePath = `verification_documents/${user.uid}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    await updateDoc(userDocRef, {
      verificationDocuments: arrayUnion(downloadURL)
    });
  }

  await updateDoc(userDocRef, {
    verificationStatus: 'pending',
    updatedAt: serverTimestamp()
  });
}

export async function getPendingVerifications(): Promise<UserProfile[]> {
  if (!db) throw new Error("Database not initialized.");
  const q = query(
    collection(db, "users"),
    where("verificationStatus", "==", "pending")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
}

export async function approveVerification(userId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized.");
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    verificationStatus: 'verified',
    verificationRejectionReason: deleteField()
  });
  await createNotification(userId, 'verificationApprovedTitle', 'verificationApprovedMessage', '/dashboard/provider/profile');
}

export async function rejectVerification(userId: string, reason: string): Promise<void> {
  if (!db) throw new Error("Database not initialized.");
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    verificationStatus: 'rejected',
    verificationRejectionReason: reason
  });
  await createNotification(userId, 'verificationRejectedTitle', 'verificationRejectedMessage', '/dashboard/provider/profile', { reason });
}

// --- Rating Firestore Functions ---
export const addRating = async (ratingData: {
    ratedUserId: string;
    raterUserId: string;
    raterName: string;
    rating: number;
    comment: string;
}): Promise<void> => {
    if (!db) {
        throw new Error("Database service is not available.");
    }
    if (!auth?.currentUser || auth.currentUser.uid !== ratingData.raterUserId) {
        throw new Error("User must be logged in to post a rating.");
    }

    try {
        const batch = writeBatch(db);
        const ratingRef = doc(collection(db, "ratings"));
        batch.set(ratingRef, {
             ...ratingData,
            createdAt: serverTimestamp(),
        });
        
        await batch.commit();

    } catch (error) {
        console.error("Error adding rating to Firestore: ", error);
        throw error;
    }
};


export const getRatingsForUser = async (userId: string): Promise<Rating[] | null> => {
    if (!db) {
        console.error("Firestore (db) is not initialized in getRatingsForUser.");
        return null;
    }
    if (!userId) {
        console.error("getRatingsForUser called with no userId.");
        return null;
    }
    try {
        // The orderBy clause was removed to avoid needing a composite index.
        // The sorting is handled client-side in the component that calls this function.
        const ratingsQuery = query(
            collection(db, "ratings"),
            where("ratedUserId", "==", userId)
        );
        const querySnapshot = await getDocs(ratingsQuery);
        return querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
        } as Rating));

    } catch (error: any) {
        console.error(`Error fetching ratings for user ${userId}. Code: ${error.code}. Message: ${error.message}`);
        throw error;
    }
};


// --- Messaging Firestore Functions ---
const logCallEventInChat = async (
    chatId: string,
    callType: 'audio' | 'video',
    status: 'unanswered' | 'ended' | 'declined',
    duration: number = 0
) => {
    if (!db || !auth?.currentUser) return;

    const chatRef = doc(db, 'messages', chatId);
    const messagesCollectionRef = collection(chatRef, 'messages');
    const newMessageRef = doc(messagesCollectionRef);

    const batch = writeBatch(db);

    batch.set(newMessageRef, {
        chatId,
        senderId: 'system', // Special sender for system messages
        content: status,
        type: 'system_call_status',
        createdAt: serverTimestamp(),
        readBy: {},
        callMetadata: { type: callType, duration },
    });

    let lastMessageText = '';
    if (status === 'unanswered') lastMessageText = `Missed ${callType} call`;
    if (status === 'ended') lastMessageText = `Call ended - ${callType}`;
    if (status === 'declined') lastMessageText = `Declined ${callType} call`;


    batch.update(chatRef, {
        lastMessage: lastMessageText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: 'system',
    });

    await batch.commit();
}


export const startOrGetChat = async (providerId: string): Promise<string> => {
    if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    const seekerId = auth.currentUser.uid;

    if (providerId === seekerId) {
        throw new Error("Cannot start a chat with yourself.");
    }
    
    // Create a deterministic chat ID by sorting UIDs
    const participants = [seekerId, providerId].sort();

    const messagesRef = collection(db, 'messages');
    
    const q = query(
        messagesRef, 
        where('participantIds', '==', participants),
        limit(1)
    );
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }

    const [seekerProfile, providerProfile] = await Promise.all([
        getUserProfileById(seekerId),
        getUserProfileById(providerId)
    ]);

    if (!seekerProfile || !providerProfile) {
        throw new Error("Could not find user profiles for one or both participants.");
    }

    const newChatData: Omit<Chat, 'id'> = {
        participantIds: participants,
        participantNames: {
            [seekerId]: seekerProfile.name || "User",
            [providerId]: providerProfile.name || "Provider",
        },
        participantAvatars: {
             [seekerId]: seekerProfile.images?.[0] || null,
             [providerId]: providerProfile.images?.[0] || null,
        },
        participantSettings: {
            [seekerId]: { videoCallsEnabled: seekerProfile.videoCallsEnabled ?? true },
            [providerId]: { videoCallsEnabled: providerProfile.videoCallsEnabled ?? true },
        },
        lastMessage: "Conversation started.",
        lastMessageAt: serverTimestamp() as Timestamp,
        lastMessageSenderId: "",
        createdAt: serverTimestamp() as Timestamp,
        unreadCount: {
            [seekerId]: 0,
            [providerId]: 1, // Start with 1 unread for the provider
        },
    };

    const newChatDocRef = await addDoc(collection(db, "messages"), newChatData);
    return newChatDocRef.id;
};


export const sendMessage = async (
    chatId: string, 
    content: string | File | Blob,
    type: 'text' | 'audio' | 'image' | 'video'
): Promise<void> => {
    if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    if (!storage) {
        throw new Error("Storage service is not configured.");
    }

    const senderId = auth.currentUser.uid;
    const metadata = {
        customMetadata: {
            'userId': senderId
        }
    };
    let messageContent: string;
    let lastMessageText: string;

    if (content instanceof File || content instanceof Blob) {
        const originalName = content instanceof File ? content.name : "media";
        const safeFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `chats/${chatId}/${new Date().getTime()}_${safeFileName}`;
        const fileRef = ref(storage, filePath);
        
        await uploadBytes(fileRef, content, metadata);
        
        messageContent = await getDownloadURL(fileRef);

        if (type === 'image') lastMessageText = "📷 Image";
        else if (type === 'video') lastMessageText = "📹 Video";
        else if (type === 'audio') lastMessageText = "🎤 Audio Message";
        else lastMessageText = "📎 File";
    } else {
        messageContent = content.trim();
        lastMessageText = messageContent;
    }
    
    if (!messageContent) return;

    const chatRef = doc(db, "messages", chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) throw new Error("Chat does not exist.");
    
    const chatData = chatSnap.data() as Chat;
    
    const messagesCollectionRef = collection(chatRef, "messages");
    const batch = writeBatch(db);
    const newMessageRef = doc(messagesCollectionRef);

    const initialReadBy = chatData.participantIds.reduce((acc, pid) => ({...acc, [pid]: pid === senderId }), {});

    batch.set(newMessageRef, {
        chatId,
        senderId,
        content: messageContent,
        type,
        createdAt: serverTimestamp(),
        readBy: initialReadBy
    });
    
    const unreadUpdates: { [key: string]: any } = {};
    const isSenderParticipant = chatData.participantIds.includes(senderId);

    chatData.participantIds.forEach(participantId => {
        // If the sender is a participant, only increment for the other participant.
        // If the sender is NOT a participant (i.e., an admin), increment for EVERYONE.
        if (isSenderParticipant) {
            if (participantId !== senderId) {
                unreadUpdates[`unreadCount.${participantId}`] = increment(1);
            }
        } else {
            // This is an admin message, increment for all actual participants
            unreadUpdates[`unreadCount.${participantId}`] = increment(1);
        }
    });

    batch.update(chatRef, {
        lastMessage: lastMessageText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        ...unreadUpdates
    });
    
    await batch.commit();
};


export const markChatAsRead = async (chatId: string): Promise<void> => {
    if (!db || !auth?.currentUser) return;
    const userId = auth.currentUser.uid;

    const chatRef = doc(db, 'messages', chatId);
    const unreadCountUpdate = { [`unreadCount.${userId}`]: 0 };

    const unreadMessagesQuery = query(
        collection(db, 'messages', chatId, 'messages'),
        where(`readBy.${userId}`, '==', false)
    );
    
    try {
        const batch = writeBatch(db);
        batch.update(chatRef, unreadCountUpdate);

        const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
        unreadMessagesSnapshot.forEach(messageDoc => {
            const messageRef = doc(db, 'messages', chatId, 'messages', messageDoc.id);
            batch.update(messageRef, { [`readBy.${userId}`]: true });
        });

        await batch.commit();
    } catch(error) {
        // This can sometimes fail if there's nothing to commit, which is fine.
        // We log other errors.
        if (error instanceof Error && !error.message.includes('empty')) {
             console.error("Error marking chat as read: ", error);
        }
    }
};

export async function getMessagesForChat(chatId: string): Promise<Message[]> {
    if (!db) throw new Error("Database not initialized.");
    const messagesRef = collection(db, 'messages', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
}


// --- Call Functions ---

export const initiateCall = async (chatId: string, calleeId: string, callType: 'audio' | 'video'): Promise<string | null> => {
    if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    const callerId = auth.currentUser.uid;

    if (calleeId === callerId) {
        throw new Error("You cannot call yourself.");
    }

    try {
        const [callerDoc, calleeDoc] = await Promise.all([
             getDoc(doc(db, "users", callerId)),
             getDoc(doc(db, "users", calleeId))
        ]);

        const callerName = callerDoc.exists() ? (callerDoc.data().name || "Unknown Caller") : "Unknown Caller";
        const callerAvatar = callerDoc.exists() ? (callerDoc.data().images?.[0] || null) : null;
        const calleeName = calleeDoc.exists() ? (calleeDoc.data().name || "User") : "User";
        const calleeAvatar = calleeDoc.exists() ? (calleeDoc.data().images?.[0] || null) : null;
        
        const newCallData: Omit<Call, 'id'> = {
            chatId,
            callerId,
            callerName,
            callerAvatar,
            calleeId,
            calleeName,
            calleeAvatar,
            status: 'ringing',
            type: callType,
            participantIds: [callerId, calleeId],
            createdAt: serverTimestamp() as Timestamp,
        };

        const callDocRef = await addDoc(collection(db, "calls"), newCallData);
        
        // Add a timeout to automatically set the call to 'unanswered' if not picked up
        setTimeout(async () => {
            const currentCallDoc = await getDoc(callDocRef);
            if (currentCallDoc.exists() && currentCallDoc.data().status === 'ringing') {
                await updateCallStatus(callDocRef.id, 'unanswered');
            }
        }, 30000); // 30 seconds to answer

        return callDocRef.id;
    } catch (error) {
        console.error("Error initiating call:", error);
        throw error;
    }
}

export const updateCallStatus = async (callId: string, status: Call['status']): Promise<void> => {
     if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    try {
        const callDocRef = doc(db, "calls", callId);
        const callSnap = await getDoc(callDocRef);

        if (!callSnap.exists()) {
            throw new Error("Call not found.");
        }
        const callData = callSnap.data() as Call;

        const updateData: Partial<Call> = { status };

        if (status === 'active' && !callData.startedAt) {
            updateData.startedAt = serverTimestamp() as Timestamp;
        }

        await updateDoc(callDocRef, updateData);

        if (status === 'ended' || status === 'unanswered' || status === 'declined') {
            let duration = 0;
            if (status === 'ended' && callData.startedAt) {
                 const now = Timestamp.now();
                 duration = now.seconds - callData.startedAt.seconds;
            }
            await logCallEventInChat(callData.chatId, callData.type, status, duration);
        }

    } catch (error) {
        console.error(`Error updating call ${callId} to ${status}:`, error);
        throw error;
    }
}


// --- Order Management Functions ---

export async function createOrder(providerId: string, serviceDescription: string, amount: number, currency: string, serviceStartDate: Date | null): Promise<string> {
  if (!db || !auth.currentUser) throw new Error("Authentication or database error.");
  
  const seekerId = auth.currentUser.uid;
  const [seekerProfile, providerProfile] = await Promise.all([
    getUserProfileById(seekerId),
    getUserProfileById(providerId),
  ]);

  if (!seekerProfile || !providerProfile) {
    throw new Error("Could not find profiles for one or both users.");
  }

  const commissionRate = 0.05; // 5%
  const commission = amount * commissionRate;
  const payoutAmount = amount - commission;

  const chatId = await startOrGetChat(providerId);

  const orderData: any = {
    seekerId,
    providerId,
    seekerName: seekerProfile.name,
    providerName: providerProfile.name,
    serviceDescription,
    amount,
    currency,
    commission,
    payoutAmount,
    status: 'pending_approval',
    createdAt: serverTimestamp(),
    chatId: chatId,
  };

  if (serviceStartDate) {
    orderData.serviceStartDate = Timestamp.fromDate(serviceStartDate);
  }

  const orderRef = await addDoc(collection(db, 'orders'), orderData);
  
  await createNotification(
    providerId,
    'newOrderRequestTitle',
    'newOrderRequestMessage',
    `/dashboard/orders/${orderRef.id}`,
    { seekerName: seekerProfile.name }
  );
  
  return orderRef.id;
}


export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!db) throw new Error("Database not initialized.");
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  return orderSnap.exists() ? { id: orderSnap.id, ...orderSnap.data() } as Order : null;
}

export async function uploadPaymentProofAndUpdateOrder(orderId: string, file: File): Promise<void> {
    if (!db || !storage || !auth.currentUser) {
        throw new Error("Authentication session is invalid or services are unavailable. Please log in again.");
    }
    const seekerId = auth.currentUser.uid;

    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order not found.");
    if (order.seekerId !== seekerId) throw new Error("You are not authorized to upload proof for this order.");


    // Helper to convert file to data URI for AI
    const fileToDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const photoDataUri = await fileToDataUri(file);

    // Call AI for verification, now including the seeker's and provider's name
    let verificationResult;
    try {
        const verifyPaymentInput: VerifyPaymentInput = {
            photoDataUri,
            expectedAmount: order.amount,
            expectedCurrency: order.currency,
            expectedPayerName: order.seekerName,
            expectedPayeeName: order.providerName
        };
        verificationResult = await verifyPayment(verifyPaymentInput);
    } catch (aiError: any) {
        console.error("AI verification flow failed:", aiError);
        verificationResult = { isVerified: false, reason: `AI analysis failed: ${aiError.message}. Please review manually.` };
    }
    
    // Upload file to storage regardless of verification result
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `payment_proofs/${orderId}/${seekerId}/${safeFileName}`;
    const fileRef = ref(storage, filePath);
    const metadata = { customMetadata: { 'userId': seekerId } };
    await uploadBytes(fileRef, file, metadata);
    const downloadURL = await getDownloadURL(fileRef);

    // Update Firestore based on verification
    const orderRef = doc(db, "orders", orderId);
    if (verificationResult.isVerified) {
        // AI approved, update status to paid
        await updateDoc(orderRef, {
            proofOfPaymentUrl: downloadURL,
            status: 'paid',
            paymentApprovedAt: serverTimestamp(),
            verificationNotes: verificationResult.reason || "AI Approval: Accepted. All details match."
        });
        await createNotification(
            order.providerId,
            'paymentReceivedTitle',
            'paymentReceivedMessage',
            `/dashboard/orders/${order.id}`,
            { seekerName: order.seekerName }
        );
    } else {
        // AI rejected, update with proof and notes for manual review
        await updateDoc(orderRef, {
            proofOfPaymentUrl: downloadURL,
            status: 'pending_payment', // Stays pending
            verificationNotes: verificationResult.reason || "AI Approval: Rejected. The receipt could not be verified. Please review manually."
        });
    }
}

export async function deletePaymentProof(orderId: string): Promise<void> {
  if (!db || !storage || !auth.currentUser) {
    throw new Error("Authentication or services are unavailable.");
  }
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error("Order not found.");
  }

  const orderData = orderSnap.data() as Order;
  const proofUrl = orderData.proofOfPaymentUrl;

  if (proofUrl) {
    try {
      const fileRef = ref(storage, proofUrl);
      await deleteObject(fileRef);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting file from storage:", error);
        throw new Error("Failed to delete the existing proof from storage.");
      }
    }
  }

  await updateDoc(orderRef, {
    proofOfPaymentUrl: deleteField(),
    verificationNotes: deleteField()
  });
}


export async function getOrdersForUser(userId: string): Promise<Order[]> {
    if (!db) throw new Error("Database not initialized.");
    
    const seekerQuery = query(collection(db, "orders"), where("seekerId", "==", userId));
    const providerQuery = query(collection(db, "orders"), where("providerId", "==", userId));

    const [seekerSnap, providerSnap] = await Promise.all([getDocs(seekerQuery), getDocs(providerQuery)]);
    
    const orders = [
        ...seekerSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)),
        ...providerSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
    ];
    
    // Remove duplicates and sort by date
    const uniqueOrders = Array.from(new Map(orders.map(o => [o.id, o])).values());
    uniqueOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    
    return uniqueOrders;
}

export async function getPendingPaymentOrders(): Promise<Order[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "orders"), 
        where("status", "==", "pending_payment")
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    // Sort client-side to avoid needing a composite index
    orders.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
    return orders;
}

export async function approvePayment(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'paid',
        paymentApprovedAt: serverTimestamp(),
        verificationNotes: "Manual Approval: Accepted."
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.providerId,
            'paymentReceivedTitle',
            'paymentReceivedMessage',
            `/dashboard/orders/${order.id}`,
            { seekerName: order.seekerName }
        );
    }
}

export async function rejectPayment(orderId: string, reason: string): Promise<void> {
  if (!db || !storage || !auth.currentUser) {
    throw new Error("Authentication or services are unavailable.");
  }
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error("Order not found.");
  }

  const orderData = orderSnap.data() as Order;
  const proofUrl = orderData.proofOfPaymentUrl;

  if (proofUrl) {
    try {
      const fileRef = ref(storage, proofUrl);
      await deleteObject(fileRef);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting file from storage:", error);
        throw new Error("Failed to delete the existing proof from storage.");
      }
    }
  }

  await updateDoc(orderRef, {
    proofOfPaymentUrl: deleteField(),
    verificationNotes: `Manual Rejection: ${reason || 'The uploaded proof was invalid.'}`
  });

  await createNotification(
    orderData.seekerId,
    'paymentRejectedTitle',
    'paymentRejectedMessage',
    `/dashboard/orders/${orderId}`,
    { orderId: orderId.slice(0, 6) }
  );
}

export async function markOrderAsCompleted(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'completed',
        completedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.providerId,
            'orderCompletedTitle',
            'orderCompletedMessage',
            `/dashboard/orders/${order.id}`,
            { seekerName: order.seekerName }
        );
    }
}

export async function disputeOrder(orderId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'disputed',
        disputeReason: reason
    });

    const order = await getOrderById(orderId);
    const user = auth.currentUser;
    if (order && user) {
        const otherPartyId = user.uid === order.seekerId ? order.providerId : order.seekerId;
        await createNotification(
            otherPartyId,
            'orderDisputedTitle',
            'orderDisputedMessage',
            `/dashboard/orders/${order.id}`,
            { userName: user.displayName || 'A user' }
        );
    }
}

export async function acceptOrder(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'pending_payment',
        approvedByProviderAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'orderAcceptedTitle',
            'orderAcceptedMessage',
            `/dashboard/orders/${order.id}`,
            { providerName: order.providerName }
        );
    }
}

export async function declineOrder(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'declined',
        declinedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'orderDeclinedTitle',
            'orderDeclinedMessage',
            `/dashboard/orders/${orderId}`,
            { providerName: order.providerName }
        );
    }
}

export async function startService(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        serviceStartedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'serviceStartedTitle',
            'serviceStartedMessage',
            `/dashboard/orders/${order.id}`,
            { providerName: order.providerName }
        );
    }
}

export async function grantGracePeriod(orderId: string, days: number): Promise<void> {
    if (!db || days < 1 || days > 3) throw new Error("Invalid input.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        gracePeriodInDays: days
    });
}

export async function markWorkAsFinishedByProvider(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'pending_completion',
        workFinishedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'workFinishedTitle',
            'workFinishedMessage',
            `/dashboard/orders/${order.id}`,
            { providerName: order.providerName }
        );
    }
}

export async function getDisputedOrders(): Promise<Order[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "orders"),
        where("status", "==", "disputed")
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    
    // Sort client-side to avoid needing an index
    orders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

    return orders;
}

export async function resolveDispute(orderId: string, resolution: 'seeker' | 'provider', notes: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'resolved',
        disputeResolution: resolution === 'seeker' ? 'seeker_favor' : 'provider_favor',
        resolutionNotes: notes,
    });

    const order = await getOrderById(orderId);
    if (order) {
        const resolutionMessage = resolution === 'seeker' ? 'disputeResolvedSeekerFavorMessage' : 'disputeResolvedProviderFavorMessage';
        await createNotification(
            order.seekerId,
            'disputeResolvedTitle',
            resolutionMessage,
            `/dashboard/orders/${order.id}`,
            { orderId: order.id.slice(0, 6) }
        );
        await createNotification(
            order.providerId,
            'disputeResolvedTitle',
            resolutionMessage,
            `/dashboard/orders/${order.id}`,
            { orderId: order.id.slice(0, 6) }
        );
    }
}


// --- Ad Request Functions ---

export async function createAdRequest(
    data: { name: string; email: string; title: string; message: string; },
    imageFile: File
): Promise<string> {
    if (!db || !storage || !auth.currentUser) throw new Error("Authentication or services are unavailable.");

    const userId = auth.currentUser.uid;
    const filePath = `ad_images/${userId}/${Date.now()}_${imageFile.name}`;
    const imageRef = ref(storage, filePath);

    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);

    const adRequestData = {
        ...data,
        imageUrl,
        userId,
        status: 'pending_review' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const adRequestRef = await addDoc(collection(db, 'adRequests'), adRequestData);
    return adRequestRef.id;
}


export async function getAdRequests(): Promise<AdRequest[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "adRequests"),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdRequest));
}

export async function getActiveAds(): Promise<AdRequest[]> {
  if (!db) throw new Error("Database not initialized.");
  const q = query(collection(db, 'adRequests'), where('status', '==', 'active'), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AdRequest));
}

export async function getAdRequestById(id: string): Promise<AdRequest | null> {
    if (!db) throw new Error("Database not initialized.");
    const docRef = doc(db, 'adRequests', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as AdRequest;
    }
    return null;
}

export async function getAdRequestsForUser(userId: string): Promise<AdRequest[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, 'adRequests'),
        where('userId', '==', userId)
        // orderBy('createdAt', 'desc') // Removed to avoid needing a composite index that might not be deployed.
    );
    const querySnapshot = await getDocs(q);
    const adRequests = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdRequest));
    // Sort client-side instead
    adRequests.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    return adRequests;
}


export async function approveAdRequestAndSetPrice(requestId: string, price: number, currency: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
    
    await updateDoc(requestRef, {
        status: 'pending_payment',
        price,
        currency,
        updatedAt: serverTimestamp()
    });

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as AdRequest;
        await createNotification(
            requestData.userId,
            'adRequestApprovedTitle',
            'adRequestApprovedMessage',
            `/dashboard/provider/ads/edit/${requestId}`,
            { price: `${price} ${currency}` }
        );
    }
}

export async function rejectAdRequest(requestId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
    
    await updateDoc(requestRef, {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
    });

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as AdRequest;
        await createNotification(
            requestData.userId,
            'adRequestRejectedTitle',
            'adRequestRejectedMessage',
            `/dashboard/provider/ads/edit/${requestId}`,
            { reason }
        );
    }
}


export async function uploadAdPaymentProof(requestId: string, file: File): Promise<void> {
    if (!db || !storage || !auth.currentUser) {
        throw new Error("Authentication session is invalid or services are unavailable. Please log in again.");
    }

    const adRequest = await getAdRequestById(requestId);
    if (!adRequest) throw new Error("Ad Request not found.");
    if (adRequest.userId !== auth.currentUser.uid) throw new Error("You are not authorized to upload proof for this ad.");
    if (!adRequest.price || !adRequest.currency) throw new Error("Ad price has not been set by the admin yet.");

    // Helper to convert file to data URI for AI
    const fileToDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const photoDataUri = await fileToDataUri(file);

    let verificationResult;
    try {
        const verifyPaymentInput: VerifyPaymentInput = {
            photoDataUri,
            expectedAmount: adRequest.price,
            expectedCurrency: adRequest.currency,
            expectedPayerName: adRequest.name,
            expectedPayeeName: "Khidmap" // The name of the platform
        };
        verificationResult = await verifyPayment(verifyPaymentInput);
    } catch (aiError: any) {
        console.error("AI verification flow for ads failed:", aiError);
        verificationResult = { isVerified: false, reason: `AI analysis failed: ${aiError.message}. Please review manually.` };
    }
    
    // Upload file to storage regardless of verification result
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `ad_payments/${requestId}/${adRequest.userId}/${safeFileName}`;
    const fileRef = ref(storage, filePath);
    const metadata = { customMetadata: { 'userId': adRequest.userId } };
    await uploadBytes(fileRef, file, metadata);
    const downloadURL = await getDownloadURL(fileRef);

    const requestRef = doc(db, "adRequests", requestId);

    if (verificationResult.isVerified) {
        await updateDoc(requestRef, {
            status: 'active',
            paymentProofUrl: downloadURL,
            verificationNotes: verificationResult.reason || "AI Approval: Accepted. Payment verified.",
            updatedAt: serverTimestamp()
        });
        await createNotification(
            adRequest.userId,
            'adPaymentConfirmedTitle',
            'adPaymentConfirmedMessage',
            `/dashboard/provider/ads/edit/${requestId}`
        );
    } else {
        await updateDoc(requestRef, {
            status: 'payment_review', // Status for manual admin review
            paymentProofUrl: downloadURL,
            verificationNotes: verificationResult.reason || "AI Approval: Rejected. Needs manual review.",
            updatedAt: serverTimestamp()
        });
        await createNotification(
            adRequest.userId,
            'statusPaymentReview',
            'adRequestInPaymentReviewMessage',
            `/dashboard/provider/ads/edit/${requestId}`
        );
    }
}

export async function confirmAdPayment(requestId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);

    await updateDoc(requestRef, {
        status: 'active',
        verificationNotes: "Manual Approval: Accepted.",
        updatedAt: serverTimestamp()
    });
    
    const requestSnap = await getDoc(requestRef);
    if (requestSnap.exists()) {
        const adData = requestSnap.data() as AdRequest;
         await createNotification(
            adData.userId,
            'adPaymentConfirmedTitle',
            'adPaymentConfirmedMessage',
            `/dashboard/provider/ads/edit/${requestId}`
        );
    }
}

export async function rejectAdPayment(requestId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
     const adSnap = await getDoc(requestRef);
    if (!adSnap.exists()) throw new Error("Ad request not found.");

    const adData = adSnap.data() as AdRequest;
    if(adData.paymentProofUrl) {
         try {
            const fileRef = ref(storage, adData.paymentProofUrl);
            await deleteObject(fileRef);
         } catch(e) {
            console.error("Could not delete previous payment proof, it might not exist.", e)
         }
    }

    await updateDoc(requestRef, {
        status: 'pending_payment',
        rejectionReason: reason,
        paymentProofUrl: deleteField(),
        verificationNotes: deleteField(),
        updatedAt: serverTimestamp()
    });
    
     await createNotification(
        adData.userId,
        'adPaymentRejectedTitle',
        'adPaymentRejectedMessage',
        `/dashboard/provider/ads/edit/${requestId}`,
        { reason }
    );
}



// --- Support Request Functions ---

export async function createSupportRequest(data: { name: string; email: string; subject: string; message: string; type: SupportRequestType; }): Promise<string> {
    if (!db) throw new Error("Database not initialized.");
    if (!auth.currentUser) throw new Error("User must be logged in to submit a request.");

    const supportRequestData = {
        ...data,
        status: 'open' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: auth.currentUser.uid,
    };

    const supportRequestRef = await addDoc(collection(db, 'supportRequests'), supportRequestData);
    return supportRequestRef.id;
}

export async function getSupportRequests(): Promise<SupportRequest[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "supportRequests"),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupportRequest));
}

export async function updateSupportRequestStatus(requestId: string, status: 'in_progress' | 'closed', adminReply?: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "supportRequests", requestId);
    
    const updateData: any = {
        status: status,
        updatedAt: serverTimestamp()
    };
    if (status === 'closed' && adminReply) {
        updateData.adminReply = adminReply;
    }

    await updateDoc(requestRef, updateData);

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as SupportRequest;
        let titleKey: keyof Translations = 'supportRequestInProgressTitle';
        let messageKey: keyof Translations = 'supportRequestInProgressMessage';
        let params: { [key: string]: string } = { ticketId: requestId.slice(0, 6) };

        if (status === 'closed') {
            titleKey = 'supportRequestClosedTitle';
            if (adminReply) {
                messageKey = 'supportRequestClosedWithReplyMessage';
                params.reply = adminReply;
            } else {
                messageKey = 'supportRequestClosedMessage';
            }
        }
        
        await createNotification(
            requestData.userId,
            titleKey,
            messageKey,
            '/contact', 
            params
        );
    }
}
