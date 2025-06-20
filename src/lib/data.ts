
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { ServiceCategoriesEnumType } from '@/ai/flows/categorize-ad'; // Import the enum type

// Updated ServiceCategory type to include new categories and 'Other'
export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  qualifications?: string;
  serviceCategories?: ServiceCategory[]; // Use the updated ServiceCategory type
  serviceAreas?: string[]; 
  profilePictureUrl?: string;
  searchHistory?: { query: string; date: string }[];
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  emailVerified?: boolean;
}

export interface ServiceAd {
  id: string;
  providerId: string;
  providerName?: string;
  title: string;
  description: string;
  category: ServiceCategory; // Use the updated ServiceCategory type
  address: string; 
  imageUrl?: string; 
  postedDate: Timestamp | string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}


// --- UserProfile Firestore Functions ---
export const getUserProfileById = async (uid: string): Promise<UserProfile | null> => {
  if (!uid || !db) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toISOString() : data.createdAt;
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toISOString() : data.updatedAt;
      
      const searchHistory = (data.searchHistory || []).map((item: any) => ({
        ...item,
        date: item.date instanceof Timestamp ? item.date.toISOString() : item.date,
      }));

      return {
        uid: docSnap.id,
        ...data,
        createdAt,
        updatedAt,
        searchHistory,
        emailVerified: data.emailVerified || false,
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

// --- ServiceAd Firestore Functions ---

export const uploadAdImage = async (file: File, providerId: string, adIdOrTemp: string): Promise<string> => {
  if (!auth?.currentUser) throw new Error("User not authenticated for image upload.");
  if (!providerId || !adIdOrTemp) throw new Error("Provider ID and Ad ID/Temp ID are required for image path.");
  const storage = getStorage();
  const imagePath = `serviceAds/${providerId}/${adIdOrTemp}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, imagePath);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const deleteAdImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl || (!imageUrl.startsWith('gs://') && !imageUrl.startsWith('https://firebasestorage.googleapis.com'))) {
    console.warn("Not a valid Firebase Storage URL or empty, skipping delete:", imageUrl);
    return;
  }
  try {
    const storage = getStorage();
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.log("Image not found, skipping delete:", imageUrl);
    } else {
      console.error("Error deleting ad image from Storage: ", error);
    }
  }
};


export const addServiceAd = async (adData: {
  providerId: string;
  providerName?: string;
  title: string;
  description: string;
  category: ServiceCategory;
  address: string; 
  imageUrl?: string;
}): Promise<string> => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const adDocRef = await addDoc(collection(db, "serviceAds"), {
      ...adData,
      postedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toISOString() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toISOString() || undefined,
      } as ServiceAd;
    });
  } catch (error) {
    console.error("Error fetching ads by provider ID from Firestore: ", error);
    throw new Error("Failed to fetch ads.");
  }
};


export const deleteServiceAd = async (adId: string, imageUrl?: string): Promise<void> => {
  if (!db) throw new Error("Firestore is not initialized.");
  if (imageUrl) {
    await deleteAdImage(imageUrl);
  }
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
        postedDate: (adData.postedDate as Timestamp)?.toISOString() || new Date().toISOString(),
        createdAt: (adData.createdAt as Timestamp)?.toISOString() || undefined,
        updatedAt: (adData.updatedAt as Timestamp)?.toISOString() || undefined,
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
      } else if (!providerName) {
        providerName = 'N/A';
      }

      ads.push({
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toISOString() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toISOString() || undefined,
        providerName: providerName,
      } as ServiceAd);
    }
    return ads;
  } catch (error) {
    console.error("Error fetching all service ads from Firestore: ", error);
    throw new Error("Failed to fetch service ads.");
  }
};

