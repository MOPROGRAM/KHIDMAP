
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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
  createdAt?: string | Timestamp; // Allow Firestore Timestamp for creation
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
  // Add new fields like createdAt if needed for sorting, Firestore serverTimestamp() can be used
  createdAt?: Timestamp;
}

export interface ServiceProvider {
  id: string;
  name: string;
  email: string; 
  phoneNumber: string;
  qualifications: string;
  serviceCategories: ServiceCategory[];
  zipCodesServed: string[];
  profilePictureUrl?: string;
}

export interface ServiceSeeker {
  id: string;
  name: string;
  email: string; 
  searchHistory: { query: string; date: string }[];
}

// Mock Data for providers and seekers can be phased out or used for fields not yet in UserProfile
export let mockProviders: ServiceProvider[] = [
  {
    id: 'provider1_mock_uid', 
    name: 'John Doe Plumbing',
    email: 'john.provider@example.com',
    phoneNumber: '555-1234',
    qualifications: 'Licensed Master Plumber, 10 years experience',
    serviceCategories: ['Plumbing'],
    zipCodesServed: ['90210', '90211'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
  },
  {
    id: 'provider2_mock_uid',
    name: 'Jane Spark Electrical',
    email: 'jane.provider@example.com',
    phoneNumber: '555-5678',
    qualifications: 'Certified Electrician, Specialized in residential wiring',
    serviceCategories: ['Electrical'],
    zipCodesServed: ['90210', '90001'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
  },
];

export let mockSeekers: ServiceSeeker[] = [
    {
        id: 'seeker1_mock_uid',
        name: 'Alice Wonderland',
        email: 'alice.seeker@example.com',
        searchHistory: [
            { query: 'plumber 90210', date: new Date(Date.now() - 86400000).toISOString() },
            { query: 'electrical repair', date: new Date(Date.now() - 2 * 86400000).toISOString() },
        ],
    }
];

export const getProviderById = (id: string): ServiceProvider | undefined => {
  // This function will also need to be updated to fetch from 'users' collection in Firestore
  // For now, if it's used by ad details page, it might return mock data or be part of UserProfile fetch
  console.warn("getProviderById is using mock data. Transition to Firestore 'users' collection pending for full provider profile.");
  return mockProviders.find(p => p.id === id);
};

// --- ServiceAd Firestore Functions ---

export const addServiceAd = async (adData: {
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
}): Promise<string> => {
  try {
    const adDocRef = await addDoc(collection(db, "serviceAds"), {
      ...adData,
      postedDate: serverTimestamp(), // Use serverTimestamp for consistent dates
      createdAt: serverTimestamp(),   // Also good for sorting/tracking
      imageUrl: adData.imageUrl || 'https://placehold.co/600x400.png'
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
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ads.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for easier handling in components if needed
        // Or handle Timestamp object directly in component
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: data.createdAt as Timestamp, // Keep as Timestamp or convert
      } as ServiceAd);
    });
    // Sort by creation date, newest first
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

// Function to fetch a single ad by ID (will be used by ad details page)
export const getAdById = async (adId: string): Promise<ServiceAd | null> => {
  try {
    const adDocRef = doc(db, "serviceAds", adId);
    const docSnap = await getDocs(query(collection(db, "serviceAds"), where("__name__", "==", adId))); // A bit verbose way to get a single doc by ID
    
    if (!docSnap.empty) {
      const adData = docSnap.docs[0].data();
      return {
        id: docSnap.docs[0].id,
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

// Function to fetch all ads (will be used by search page)
export const getAllServiceAds = async (): Promise<ServiceAd[]> => {
  try {
    const adsQuery = query(collection(db, "serviceAds")); // Consider adding orderBy and limits for pagination later
    const querySnapshot = await getDocs(adsQuery);
    const ads: ServiceAd[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ads.push({
        id: doc.id,
        ...data,
        postedDate: (data.postedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: data.createdAt as Timestamp,
      } as ServiceAd);
    });
     // Sort by creation date, newest first
    ads.sort((a, b) => {
        const dateA = (a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(0)).getTime();
        const dateB = (b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(0)).getTime();
        return dateB - dateA;
    });
    return ads;
  } catch (error) {
    console.error("Error fetching all service ads from Firestore: ", error);
    throw new Error("Failed to fetch service ads.");
  }
};
