
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy, limit, writeBatch, GeoPoint, arrayUnion, arrayRemove } from 'firebase/firestore';

// ServiceCategory is still relevant for provider profiles
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
  media?: { url: string; type: 'image' | 'video' }[];
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

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage: string;
  lastMessageSenderId: string;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}


// --- UserProfile Firestore Functions ---
export const getUserProfileById = async (uid: string): Promise<UserProfile | null> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in getUserProfileById.");
    throw new Error("Database service is not available.");
  }
  if (!uid) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as UserProfile;
    } else {
      console.log(`No user profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Firestore: ", error);
    throw error;
  }
};

export const getAllProviders = async (): Promise<UserProfile[]> => {
    if (!db) {
        console.error("Firestore (db) is not initialized in getAllProviders.");
        throw new Error("Database service is not available to fetch providers.");
    }
    try {
        const providersQuery = query(collection(db, "users"), where("role", "==", "provider"));
        const querySnapshot = await getDocs(providersQuery);
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                uid: docSnap.id,
                ...data,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            } as UserProfile;
        });
    } catch (error) {
        console.error("Error fetching all providers from Firestore: ", error);
        throw error;
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
        await addDoc(collection(db, "ratings"), {
            ...ratingData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding rating to Firestore: ", error);
        throw error;
    }
};


export const getRatingsForUser = async (userId: string): Promise<Rating[]> => {
    if (!db) {
        throw new Error("Database service is not available.");
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

        // Sort ratings by date on the client-side to avoid complex indexes
        ratings.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA; // Sort descending (newest first)
        });

        return ratings;
    } catch (error) {
        console.error("Error fetching ratings from Firestore: ", error);
        throw error;
    }
};

// --- Messaging Functions ---

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    if (!db) throw new Error("Database service is not available.");
    const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
    
    // Sort conversations by last update time on the client-side
    conversations.sort((a, b) => {
        const dateA = a.updatedAt?.toMillis() || 0;
        const dateB = b.updatedAt?.toMillis() || 0;
        return dateB - dateA; // Sort descending (newest first)
    });
    
    return conversations;
};

export const findOrCreateConversation = async (user1Id: string, user2Id: string): Promise<string> => {
    if (!db) throw new Error("Database service is not available.");
    
    // Sort IDs to create a consistent, predictable query and document structure
    const participants = [user1Id, user2Id].sort();
    
    // Query for an existing conversation with the exact sorted participants array
    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, where("participants", "==", participants), limit(1));

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        // Conversation already exists
        return querySnapshot.docs[0].id;
    }

    // If no conversation exists, create a new one
    const [user1Profile, user2Profile] = await Promise.all([
        getUserProfileById(user1Id),
        getUserProfileById(user2Id)
    ]);

    if (!user1Profile || !user2Profile) {
        throw new Error("Could not find user profiles to start conversation.");
    }

    const newConversationRef = doc(collection(db, 'conversations'));
    const newConversationData = {
        participants: participants, // Use the sorted array
        participantNames: {
            [user1Id]: user1Profile.name,
            [user2Id]: user2Profile.name,
        },
        lastMessage: "Conversation started.",
        lastMessageSenderId: '', // System message
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await setDoc(newConversationRef, newConversationData);
    
    return newConversationRef.id;
};
