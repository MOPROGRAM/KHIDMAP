
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, serverTimestamp, Timestamp, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
  serviceAreas?: string[]; // Changed from zipCodesServed
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
  address: string; // Changed from zipCode
  imageUrl?: string; // For a single image for now
  // imageUrls?: string[]; // For multiple images/videos in the future
  postedDate: Timestamp | string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  providerName?: string;
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

// --- ServiceAd Firestore Functions ---

// Helper function to upload image to Firebase Storage
export const uploadAdImage = async (file: File, providerId: string, adIdOrTemp: string): Promise<string> => {
  if (!auth?.currentUser) throw new Error("User not authenticated for image upload.");
  const storage = getStorage();
  // Use adIdOrTemp which could be a temporary ID before ad creation or the actual adId during edit
  const imagePath = `serviceAds/${providerId}/${adIdOrTemp}/${file.name}`;
  const storageRef = ref(storage, imagePath);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const deleteAdImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl.startsWith('gs://') && !imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
    console.warn("Not a Firebase Storage URL, skipping delete:", imageUrl);
    return;
  }
  try {
    const storage = getStorage();
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // It's okay if the image doesn't exist (e.g., already deleted)
    if (error.code === 'storage/object-not-found') {
      console.log("Image not found, skipping delete:", imageUrl);
    } else {
      console.error("Error deleting ad image from Storage: ", error);
      // Don't throw an error that blocks ad deletion if image deletion fails
    }
  }
};


export const addServiceAd = async (adData: {
  providerId: string;
  providerName?: string;
  title: string;
  description: string;
  category: ServiceCategory;
  address: string; // Changed
  imageUrl?: string;
}): Promise<string> => {
  if (!db) throw new Error("Firestore is not initialized.");
  try {
    const adDocRef = await addDoc(collection(db, "serviceAds"), {
      ...adData,
      postedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // imageUrl is already provided in adData if uploaded
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
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined,
      } as ServiceAd;
    });
  } catch (error) {
    console.error("Error fetching ads by provider ID from Firestore: ", error);
    throw new Error("Failed to fetch ads.");
  }
};


export const deleteServiceAd = async (adId: string): Promise<void> => {
  if (!db) throw new Error("Firestore is not initialized.");
  const ad = await getAdById(adId);
  if (ad?.imageUrl) {
    await deleteAdImage(ad.imageUrl);
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

    