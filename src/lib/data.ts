
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy } from 'firebase/firestore';

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
  searchHistory?: { query: string; date: string }[]; 
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface ServiceAd {
  id: string; 
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
  postedDate: Timestamp | string; 
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  providerName?: string; 
}


export interface ServiceProvider {
  id: string; 
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
  if (!uid || !db) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;
      
      const searchHistory = (data.searchHistory || []).map((item: any) => ({
        ...item,
        date: item.date instanceof Timestamp ? item.date.toDate().toISOString() : item.date,
      }));

      return {
        uid: docSnap.id,
        ...data,
        createdAt,
        updatedAt,
        searchHistory,
      } as UserProfile;
    } else {
      console.log(`No user profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Firestore: ", error);
    return null;
  }
};


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
  providerName?: string;
}): Promise<string> => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const adDocRef = await addDoc(collection(db, "serviceAds"), {
      ...adData,
      postedDate: serverTimestamp(), 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      imageUrl: adData.imageUrl || 'https://placehold.co/600x400.png',
      providerName: adData.providerName || 'N/A'
    });
    return adDocRef.id;
  } catch (error) {
    console.error("Error adding service ad to Firestore: ", error);
    throw new Error("Failed to post ad.");
  }
};

export const updateServiceAd = async (adId: string, adData: Partial<Omit<ServiceAd, 'id' | 'providerId' | 'postedDate' | 'createdAt'>>): Promise<void> => {
  if (!db) throw new Error("Firestore is not initialized.");
  if (!adId) throw new Error("Ad ID is required for update.");
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    await updateDoc(adDocRef, {
      ...adData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating service ad in Firestore: ", error);
    throw new Error("Failed to update ad.");
  }
};


export const getAdsByProviderId = async (providerId: string): Promise<ServiceAd[]> => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const adsQuery = query(collection(db, "serviceAds"), where("providerId", "==", providerId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(adsQuery);
    const ads: ServiceAd[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      ads.push({
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
      } as ServiceAd);
    });
    return ads;
  } catch (error) {
    console.error("Error fetching ads by provider ID from Firestore: ", error);
    throw new Error("Failed to fetch ads.");
  }
};


export const deleteServiceAd = async (adId: string): Promise<void> => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    await deleteDoc(adDocRef);
  } catch (error) {
    console.error("Error deleting service ad from Firestore: ", error);
    throw new Error("Failed to delete ad.");
  }
};

export const getAdById = async (adId: string): Promise<ServiceAd | null> => {
  if (!db) {
    console.error("Firestore is not initialized in getAdById.");
    return null;
  }
  if (!adId) {
    console.error("No adId provided to getAdById.");
    return null;
  }
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    const docSnap = await getDoc(adDocRef);
    
    if (docSnap.exists()) {
      const adData = docSnap.data();
      return {
        id: docSnap.id,
        ...adData,
        postedDate: (adData.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: (adData.createdAt as Timestamp)?.toDate().toISOString() || undefined,
        updatedAt: (adData.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
      } as ServiceAd;
    } else {
      console.log("No such ad document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching ad by ID from Firestore: ", error);
    return null; 
  }
};

export const getAllServiceAds = async (): Promise<ServiceAd[]> => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const adsQuery = query(collection(db, "serviceAds"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(adsQuery);
    const ads: ServiceAd[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      let providerName = data.providerName;
      if (!providerName && data.providerId) {
        const providerProfile = await getUserProfileById(data.providerId);
        providerName = providerProfile?.name || 'N/A';
      }

      ads.push({
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
        providerName: providerName,
      } as ServiceAd);
    }
    return ads;
  } catch (error) {
    console.error("Error fetching all service ads from Firestore: ", error);
    throw new Error("Failed to fetch service ads.");
  }
};
