
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy, limit, writeBatch, GeoPoint, arrayUnion, arrayRemove } from 'firebase/firestore';

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
    participants: string[]; // Array of user UIDs
    participantNames: { [key: string]: string };
    participantAvatars: { [key: string]: string | null };
    lastMessage: string;
    lastMessageAt: Timestamp;
    lastMessageSenderId: string;
    createdAt: Timestamp;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string; // For text, this is the message. For audio, it's the data URI.
    type: 'text' | 'audio';
    createdAt: Timestamp;
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

        // Sort client-side to avoid needing a composite index
        ratings.sort((a, b) => {
            const dateA = a.createdAt?.toDate()?.getTime() || 0;
            const dateB = b.createdAt?.toDate()?.getTime() || 0;
            return dateB - dateA;
        });

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

    const chatsRef = collection(db, 'chats');
    // A more efficient query to find a chat between two specific users
    // We sort the UIDs to create a canonical participants array for querying.
    const participants = [seekerId, providerId].sort();
    const q = query(chatsRef, where('participants', '==', participants));
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Chat already exists
        return querySnapshot.docs[0].id;
    }

    // If chat doesn't exist, create it
    const [seekerProfile, providerProfile] = await Promise.all([
        getUserProfileById(seekerId),
        getUserProfileById(providerId)
    ]);

    if (!seekerProfile || !providerProfile) {
        throw new Error("Could not find user profiles for one or both participants.");
    }

    const newChatData: Omit<Chat, 'id'> = {
        participants,
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
        lastMessageSenderId: "", // System message, no sender
        createdAt: serverTimestamp() as Timestamp,
    };

    const newChatDocRef = await addDoc(collection(db, "chats"), newChatData);
    return newChatDocRef.id;
};


export const sendMessage = async (
    chatId: string, 
    content: string,
    type: 'text' | 'audio'
): Promise<void> => {
    if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    const senderId = auth.currentUser.uid;
    const cleanContent = type === 'text' ? content.trim() : content;
    if (!cleanContent) return;

    const chatRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(chatRef, "messages");

    const batch = writeBatch(db);

    const newMessageRef = doc(messagesCollectionRef);
    batch.set(newMessageRef, {
        chatId,
        senderId,
        content: cleanContent,
        type,
        createdAt: serverTimestamp(),
    });

    batch.update(chatRef, {
        lastMessage: type === 'audio' ? "🎤 Audio Message" : cleanContent,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
    });
    
    await batch.commit();
};
