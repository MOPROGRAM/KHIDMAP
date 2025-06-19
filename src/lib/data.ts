
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore';

export type ServiceCategory = 'Plumbing' | 'Electrical';
export type UserRole = 'provider' | 'seeker';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  qualifications?: string;
  serviceCategories?: ServiceCategory[];
  zipCodesServed?: string[];
  profilePictureUrl?: string;
  searchHistory?: { query: string; date: string }[]; // ISO string for date
  createdAt?: Timestamp | string;
}

export interface ServiceAd {
  id: string; // Firestore document ID
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
  postedDate: Timestamp | string; // Firestore Timestamp or ISO string after conversion
  createdAt?: Timestamp;
  providerName?: string; // Optional: denormalized for easier display on search
}

// This interface can be phased out as UserProfile covers provider details.
// Kept for any component still relying on its specific structure, will be gradually removed.
export interface ServiceProvider {
  id: string; // This is the UserProfile UID
  name: string;
  email: string;
  phoneNumber?: string;
  qualifications?: string;
  serviceCategories?: ServiceCategory[];
  zipCodesServed?: string[];
  profilePictureUrl?: string;
}

export interface ServiceSeeker {
  id: string;
  name: string;
  email: string;
  searchHistory: { query: string; date: string }[];
}


// --- UserProfile Firestore Functions ---
export const getUserProfileById = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert Timestamps to ISO strings if they exist
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
      
      // Ensure searchHistory dates are strings
      const searchHistory = (data.searchHistory || []).map((item: any) => ({
        ...item,
        date: item.date instanceof Timestamp ? item.date.toDate().toISOString() : item.date,
      }));

      return {
        uid: docSnap.id,
        ...data,
        createdAt,
        searchHistory,
      } as UserProfile;
    } else {
      console.log(`No user profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Firestore: ", error);
    // throw new Error("Failed to fetch user profile."); // Avoid throwing, return null
    return null;
  }
};


// Updated to use Firestore, but ideally, components should fetch UserProfile directly
export const getProviderById = async (id: string): Promise<ServiceProvider | null> => {
  const userProfile = await getUserProfileById(id);
  if (userProfile && userProfile.role === 'provider') {
    return {
      id: userProfile.uid,
      name: userProfile.name,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber,
      qualifications: userProfile.qualifications,
      serviceCategories: userProfile.serviceCategories,
      zipCodesServed: userProfile.zipCodesServed,
      profilePictureUrl: userProfile.profilePictureUrl,
    };
  }
  return null;
};


// --- ServiceAd Firestore Functions ---

export const addServiceAd = async (adData: {
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
  providerName?: string; // Denormalized provider name
}): Promise<string> => {
  try {
    const adDocRef = await addDoc(collection(db, "serviceAds"), {
      ...adData,
      postedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      imageUrl: adData.imageUrl || 'https://placehold.co/600x400.png',
      providerName: adData.providerName || 'N/A' // Store provider name
    });
    return adDocRef.id;
  } catch (error) {
    console.error("Error adding service ad to Firestore: ", error);
    throw new Error("Failed to post ad.");
  }
};

export const getAdsByProviderId = async (providerId: string): Promise<ServiceAd[]> => {
  try {
    const adsQuery = query(collection(db, "serviceAds"), where("providerId", "==", providerId));
    const querySnapshot = await getDocs(adsQuery);
    const ads: ServiceAd[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      ads.push({
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: data.createdAt as Timestamp,
      } as ServiceAd);
    });
    ads.sort((a, b) => {
        const dateA = (a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(0)).getTime();
        const dateB = (b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(0)).getTime();
        return dateB - dateA;
    });
    return ads;
  } catch (error) {
    console.error("Error fetching ads by provider ID from Firestore: ", error);
    throw new Error("Failed to fetch ads.");
  }
};


export const deleteServiceAd = async (adId: string): Promise<void> => {
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    await deleteDoc(adDocRef);
  } catch (error) {
    console.error("Error deleting service ad from Firestore: ", error);
    throw new Error("Failed to delete ad.");
  }
};

export const getAdById = async (adId: string): Promise<ServiceAd | null> => {
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    const docSnap = await getDoc(adDocRef);
    
    if (docSnap.exists()) {
      const adData = docSnap.data();
      return {
        id: docSnap.id,
        ...adData,
        postedDate: (adData.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: adData.createdAt as Timestamp,
      } as ServiceAd;
    } else {
      console.log("No such ad document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching ad by ID from Firestore: ", error);
    throw new Error("Failed to fetch ad details.");
  }
};

export const getAllServiceAds = async (): Promise<ServiceAd[]> => {
  try {
    // Order by creation date, newest first
    const adsQuery = query(collection(db, "serviceAds")/*, orderBy("createdAt", "desc")*/); // orderBy needs composite index
    const querySnapshot = await getDocs(adsQuery);
    const ads: ServiceAd[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Fetch provider name if not already denormalized
      let providerName = data.providerName;
      if (!providerName && data.providerId) {
        const providerProfile = await getUserProfileById(data.providerId);
        providerName = providerProfile?.name || 'N/A';
      }

      ads.push({
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: data.createdAt as Timestamp,
        providerName: providerName, // Add providerName here
      } as ServiceAd);
    }
    // Sort client-side if orderBy in query is problematic without index
     ads.sort((a, b) => {
        const dateA = (a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt || 0)).getTime();
        const dateB = (b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt || 0)).getTime();
        return dateB - dateA;
    });
    return ads;
  } catch (error) {
    console.error("Error fetching all service ads from Firestore: ", error);
    throw new Error("Failed to fetch service ads.");
  }
};
