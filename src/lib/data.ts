
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy, limit, writeBatch, GeoPoint, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';

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
    participantIds: { [key: string]: true };
    participantNames: { [key: string]: string };
    participantAvatars: { [key: string]: string | null };
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
    type: 'text' | 'audio' | 'image' | 'video';
    createdAt: Timestamp;
    readBy: { [key:string]: boolean };
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
        const ratingsQuery = query(
            collection(db, "ratings"),
            where("ratedUserId", "==", userId)
        );
        const querySnapshot = await getDocs(ratingsQuery);
        const ratings = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
        } as Rating));

        ratings.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

        return ratings;
    } catch (error: any) {
        console.error(`Error fetching ratings for user ${userId}. Code: ${error.code}. Message: ${error.message}`);
        if (String(error.message).includes("index")) {
             throw new Error("The database is being updated. Please try again in a few minutes.");
        }
        throw error;
    }
};


// --- Messaging Firestore Functions ---

export const startOrGetChat = async (providerId: string): Promise<string> => {
    if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    const seekerId = auth.currentUser.uid;

    if (providerId === seekerId) {
        throw new Error("Cannot start a chat with yourself.");
    }

    const messagesRef = collection(db, 'messages');
    
    const q = query(
        messagesRef, 
        where(`participantIds.${seekerId}`, '==', true),
        where(`participantIds.${providerId}`, '==', true),
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
        participantIds: {
            [seekerId]: true,
            [providerId]: true,
        },
        participantNames: {
            [seekerId]: seekerProfile.name || "User",
            [providerId]: providerProfile.name || "Provider",
        },
        participantAvatars: {
             [seekerId]: seekerProfile.images?.[0] || null,
             [providerId]: providerProfile.images?.[0] || null,
        },
        lastMessage: "Conversation started.",
        lastMessageAt: serverTimestamp() as Timestamp,
        lastMessageSenderId: "",
        createdAt: serverTimestamp() as Timestamp,
        unreadCount: {
            [seekerId]: 0,
            [providerId]: 0,
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
    const senderId = auth.currentUser.uid;

    let messageContent: string;
    let lastMessageText: string;

    if (content instanceof File || content instanceof Blob) {
        if (!storage) throw new Error("Storage service is not available.");
        
        const filePath = `chats/${chatId}/${new Date().getTime()}_${(content instanceof File ? content.name : type)}`;
        const fileRef = ref(storage, filePath);
        await uploadBytes(fileRef, content);
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
    const receiverId = Object.keys(chatData.participantIds).find(id => id !== senderId);
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

    