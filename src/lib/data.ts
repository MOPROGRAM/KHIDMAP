
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy, setDoc } from 'firebase/firestore';
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
      
      // Explicitly construct the object to avoid spreading raw Timestamp objects
      return {
        uid: docSnap.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        qualifications: data.qualifications,
        serviceCategories: data.serviceCategories,
        serviceAreas: data.serviceAreas,
        profilePictureUrl: data.profilePictureUrl,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        searchHistory: (data.searchHistory || []).map((item: any) => ({
          ...item,
          date: item.date instanceof Timestamp ? item.date.toDate().toISOString() : item.date,
        })),
        emailVerified: data.emailVerified || false,
      } as UserProfile;
    } else {
      console.log(`No user profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Firestore: ", error);
    throw error; // Re-throw to be caught by caller
  }
};

// --- ServiceAd Firestore Functions ---

export const uploadAdImage = async (file: File, providerId: string, adId: string): Promise<string> => {
  if (!auth?.currentUser) {
    console.error("User not authenticated for image upload.");
    throw new Error("User not authenticated for image upload.");
  }
  if (!providerId || !adId) {
    console.error("Provider ID and Ad ID are required for image path.");
    throw new Error("Provider ID and Ad ID are required for image path.");
  }
  const storage = getStorage();
  const cleanAdId = adId.replace(/[^a-zA-Z0-9-_]/g, ''); 
  const imagePath = `serviceAds/${providerId}/${cleanAdId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, imagePath);
  
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Firebase Storage uploadAdImage error (raw):", error);
    let message = "Failed to upload image.";
     if (error.code) { // Firebase errors have a 'code' property
        message = `Failed to upload image. Firebase Storage Error: ${error.code} - ${error.message}`;
    } else if (error instanceof Error) {
        message = `Failed to upload image: ${error.message}`;
    }
    console.error("Detailed Firebase Storage uploadAdImage error:", message);
    throw new Error(message);
  }
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
      console.log("Image not found in Storage, skipping delete:", imageUrl);
    } else {
      console.error("Error deleting ad image from Storage: ", error);
    }
  }
};


export const addServiceAd = async (
  adData: {
    providerId: string;
    providerName: string; 
    title: string;
    description: string;
    category: ServiceCategory;
    address: string;
    imageUrl?: string;
  },
  forcedAdId?: string 
): Promise<string> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in addServiceAd.");
    throw new Error("Database service is not available to post ad.");
  }
   if (!auth?.currentUser) {
    console.error("User not authenticated to post ad.");
    throw new Error("User not authenticated to post ad.");
  }
  if (!adData.providerId || adData.providerId !== auth.currentUser.uid) {
    console.error("Provider ID mismatch or missing.");
    throw new Error("Provider ID is invalid or does not match authenticated user.");
  }
  if (!adData.providerName) {
    console.error("Provider name is missing for the ad.");
    throw new Error("Provider name is required to post an ad.");
  }


  const dataToSave = {
    ...adData,
    postedDate: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    if (forcedAdId) {
      const adDocRef = doc(db, "serviceAds", forcedAdId);
      await setDoc(adDocRef, dataToSave);
      return forcedAdId;
    } else {
      const adDocRef = await addDoc(collection(db, "serviceAds"), dataToSave);
      return adDocRef.id;
    }
  } catch (error) {
    console.error("Error adding service ad to Firestore: ", error);
    throw error;
  }
};

export const updateServiceAd = async (adId: string, adData: Partial<Omit<ServiceAd, 'id' | 'providerId' | 'postedDate' | 'createdAt'>>): Promise<void> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in updateServiceAd.");
    throw new Error("Database service is not available to update ad.");
  }
  if (!auth?.currentUser) {
    console.error("User not authenticated to update ad.");
    throw new Error("User not authenticated to update ad.");
  }
  if (!adId) {
    console.error("Ad ID is required for update.");
    throw new Error("Ad ID is required for update.");
  }

  try {
    const adDocRef = doc(db, "serviceAds", adId);
    await updateDoc(adDocRef, {
      ...adData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating service ad in Firestore: ", error);
    throw error; // Re-throw
  }
};


export const getAdsByProviderId = async (providerId: string): Promise<ServiceAd[]> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in getAdsByProviderId.");
    throw new Error("Database service is not available to fetch ads.");
  }
  if (!auth?.currentUser) {
     console.warn("Attempted to fetch ads by provider ID without authenticated user.");
     throw new Error("User authentication required to fetch their ads.");
  }
  if (providerId !== auth.currentUser.uid) {
     console.error("Attempted to fetch ads for a different provider ID.");
     throw new Error("Unauthorized to fetch ads for this provider.");
  }

  try {
    const adsQuery = query(collection(db, "serviceAds"), where("providerId", "==", providerId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(adsQuery);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
      } as ServiceAd;
    });
  } catch (error) {
    console.error("Error fetching ads by provider ID from Firestore: ", error);
    throw error;
  }
};


export const deleteServiceAd = async (adId: string, imageUrl?: string): Promise<void> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in deleteServiceAd.");
    throw new Error("Database service is not available to delete ad.");
  }
   if (!auth?.currentUser) {
    console.error("User not authenticated to delete ad.");
    throw new Error("User not authenticated to delete ad.");
  }

  if (imageUrl) {
    await deleteAdImage(imageUrl); 
  }
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    await deleteDoc(adDocRef);
  } catch (error) {
    console.error("Error deleting service ad from Firestore: ", error);
    throw error;
  }
};

export const getAdById = async (adId: string): Promise<ServiceAd | null> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in getAdById.");
    throw new Error("Database service is not available.");
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
    throw error;
  }
};

export const getAllServiceAds = async (): Promise<ServiceAd[]> => {
  if (!db) {
    console.error("Firestore (db) is not initialized in getAllServiceAds.");
    throw new Error("Database service is not available to fetch all ads.");
  }
  try {
    const adsQuery = query(collection(db, "serviceAds"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(adsQuery);
    const ads: ServiceAd[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      let providerName = data.providerName;
      if (!providerName && data.providerId) { 
        try {
            const providerProfile = await getUserProfileById(data.providerId);
            providerName = providerProfile?.name || 'Anonymous Provider'; 
        } catch (profileError) {
            console.warn(`Could not fetch profile for provider ${data.providerId}:`, profileError);
            providerName = 'Anonymous Provider';
        }
      } else if (!providerName) {
        providerName = 'Anonymous Provider'; 
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
    throw error;
  }
};
