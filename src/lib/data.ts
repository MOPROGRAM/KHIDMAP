
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
    return null;
  }
  if (!uid) {
      console.error("getUserProfileById called with no UID.");
      return null;
  }
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
    console.error(`Error fetching user profile for UID ${uid}: `, error);
    return null;
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
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
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
        await addDoc(collection(db, "ratings"), {
            ...ratingData,
            createdAt: serverTimestamp(),
        });
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

        ratings.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA;
        });

        return ratings;
    } catch (error) {
        console.error(`Error fetching ratings for user ${userId}:`, error);
        return null;
    }
};

// --- Messaging Functions ---

export const getConversationsForUser = async (userId: string): Promise<Conversation[] | null> => {
    if (!db) {
        console.error("Firestore (db) is not initialized in getConversationsForUser.");
        return null;
    }
    try {
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", userId)
        );
        const querySnapshot = await getDocs(q);
        const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
        
        conversations.sort((a, b) => {
            const dateA = a.updatedAt?.toMillis() || 0;
            const dateB = b.updatedAt?.toMillis() || 0;
            return dateB - dateA;
        });
        
        return conversations;
    } catch (error) {
        console.error(`Error fetching conversations for user ${userId}:`, error);
        return null;
    }
};

export const findOrCreateConversation = async (user1Id: string, user2Id: string): Promise<string | null> => {
    if (!db) {
        console.error("Firestore (db) is not initialized in findOrCreateConversation.");
        return null;
    }
    try {
        // More robust query that doesn't require a composite index
        const conversationsRef = collection(db, "conversations");
        const q = query(conversationsRef, where("participants", "array-contains", user1Id));
        const querySnapshot = await getDocs(q);

        let existingConvoId: string | null = null;
        for (const doc of querySnapshot.docs) {
            const convo = doc.data() as Conversation;
            if (convo.participants.includes(user2Id)) {
                existingConvoId = doc.id;
                break;
            }
        }

        if (existingConvoId) {
            return existingConvoId;
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
            participants: [user1Id, user2Id].sort(),
            participantNames: {
                [user1Id]: user1Profile.name,
                [user2Id]: user2Profile.name,
            },
            lastMessage: "Conversation started.",
            lastMessageSenderId: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(newConversationRef, newConversationData);
        
        return newConversationRef.id;
    } catch (error) {
        console.error(`Error finding or creating conversation between ${user1Id} and ${user2Id}:`, error);
        return null;
    }
};

    
