
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy, limit, writeBatch, GeoPoint, arrayUnion, arrayRemove, increment, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { verifyPayment, type VerifyPaymentInput } from '@/ai/flows/verify-payment-flow';
import type { Translations } from './translations';


export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';
export type OrderStatus = 'pending_approval' | 'pending_payment' | 'paid' | 'completed' | 'disputed' | 'declined';


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
    disputeReason?: string;
    verificationNotes?: string;
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
    name: string;
    email: string;
    company?: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
    updatedAt: Timestamp;
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
    const receiverId = chatData.participantIds.find(id => id !== senderId);
    if (!receiverId) throw new Error("Could not find recipient for the message.");

    const messagesCollectionRef = collection(chatRef, "messages");
    const batch = writeBatch(db);
    const newMessageRef = doc(messagesCollectionRef);

    batch.set(newMessageRef, {
        chatId,
        senderId,
        content: messageContent,
        type,
        createdAt: serverTimestamp(),
        readBy: { [senderId]: true, [receiverId]: false }
    });

    batch.update(chatRef, {
        lastMessage: lastMessageText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        [`unreadCount.${receiverId}`]: increment(1)
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

  const orderData = orderSnap.data();
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
            `/dashboard/orders/${orderId}`,
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
            `/dashboard/orders/${orderId}`,
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
}

export async function grantGracePeriod(orderId: string, days: number): Promise<void> {
    if (!db || days < 1 || days > 3) throw new Error("Invalid input.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        gracePeriodInDays: days
    });
}

// --- Ad Request Functions ---

export async function createAdRequest(data: { name: string; email: string; company?: string; message: string; }): Promise<string> {
    if (!db) throw new Error("Database not initialized.");
    if (!auth.currentUser) throw new Error("User must be logged in to submit a request.");

    const adRequestData = {
        ...data,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: auth.currentUser.uid,
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

export async function updateAdRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
    
    await updateDoc(requestRef, {
        status: status,
        updatedAt: serverTimestamp()
    });

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as AdRequest;
        await createNotification(
            requestData.userId,
            status === 'approved' ? 'adRequestApprovedTitle' : 'adRequestRejectedTitle',
            status === 'approved' ? 'adRequestApprovedMessage' : 'adRequestRejectedMessage',
            '/advertise'
        );
    }
}
