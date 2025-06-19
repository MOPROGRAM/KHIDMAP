
// Firebase Auth handles user creation/login. Firestore will store user profiles.
// Mock data arrays (mockProviders, mockServiceAds, mockSeekers) will be replaced by Firestore calls in future steps.
// For now, mockServiceAds is still used. mockProviders/mockSeekers are less relevant for user profiles.

export type ServiceCategory = 'Plumbing' | 'Electrical';
export type UserRole = 'provider' | 'seeker';

// This will be the primary structure for documents in the 'users' Firestore collection
export interface UserProfile {
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  qualifications?: string; // Specific to providers
  serviceCategories?: ServiceCategory[]; // Specific to providers
  zipCodesServed?: string[]; // Specific to providers
  profilePictureUrl?: string;
  searchHistory?: { query: string; date: string }[]; // Specific to seekers
  createdAt?: string; // ISO string or Firebase Timestamp
  // Add other fields as needed, differentiating by role if necessary
}


export interface ServiceAd {
  id: string; // Firestore document ID for the ad itself
  providerId: string; // UID of the provider from Firebase Auth (references a doc in 'users' collection)
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
  postedDate: string; // ISO string or Firebase Timestamp
}

// Represents a provider's specific data, largely overlapping with UserProfile if role is 'provider'
// The 'id' here is the Firebase Auth UID.
export interface ServiceProvider {
  id: string; // UID from Firebase Auth, also document ID in 'users' collection
  name: string;
  email: string; 
  phoneNumber: string;
  qualifications: string;
  serviceCategories: ServiceCategory[];
  zipCodesServed: string[];
  profilePictureUrl?: string;
  // role: 'provider'; // Role is now part of UserProfile in Firestore 'users' collection
}

// Represents a seeker's specific data, largely overlapping with UserProfile if role is 'seeker'
// The 'id' here is the Firebase Auth UID.
export interface ServiceSeeker {
  id: string; // UID from Firebase Auth, also document ID in 'users' collection
  name: string;
  email: string; 
  searchHistory: { query: string; date: string }[]; // ISO string for date
  // role: 'seeker'; // Role is now part of UserProfile in Firestore 'users' collection
}

// Mock Data (Service Ads will be moved to Firestore next)
// mockProviders and mockSeekers are now primarily for attributes NOT YET stored in Firestore user profiles (e.g. qualifications, full search history objects)
// The primary source for user name, email, role will be Firestore 'users' collection.
export let mockProviders: ServiceProvider[] = [
  {
    id: 'provider1_mock_uid', 
    name: 'John Doe Plumbing', // This will come from Firestore 'users' collection eventually
    email: 'john.provider@example.com', // This will come from Firestore 'users' collection
    phoneNumber: '555-1234',
    qualifications: 'Licensed Master Plumber, 10 years experience',
    serviceCategories: ['Plumbing'],
    zipCodesServed: ['90210', '90211'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
  },
  {
    id: 'provider2_mock_uid',
    name: 'Jane Spark Electrical', // This will come from Firestore 'users' collection
    email: 'jane.provider@example.com', // This will come from Firestore 'users' collection
    phoneNumber: '555-5678',
    qualifications: 'Certified Electrician, Specialized in residential wiring',
    serviceCategories: ['Electrical'],
    zipCodesServed: ['90210', '90001'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
  },
];

export let mockServiceAds: ServiceAd[] = [
  {
    id: 'ad1_mock_id',
    providerId: 'provider1_mock_uid',
    title: 'Emergency Plumbing Services 24/7',
    description: 'Leaky pipes? Clogged drains? We fix it all, anytime!',
    category: 'Plumbing',
    zipCode: '90210',
    imageUrl: 'https://placehold.co/600x400.png',
    postedDate: new Date().toISOString(),
  },
  {
    id: 'ad2_mock_id',
    providerId: 'provider2_mock_uid',
    title: 'Expert Electrical Wiring and Repairs',
    description: 'Safe and reliable electrical installations and troubleshooting for your home.',
    category: 'Electrical',
    zipCode: '90210',
    imageUrl: 'https://placehold.co/600x400.png',
    postedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

export let mockSeekers: ServiceSeeker[] = [
    {
        id: 'seeker1_mock_uid',
        name: 'Alice Wonderland', // This will come from Firestore 'users' collection
        email: 'alice.seeker@example.com', // This will come from Firestore 'users' collection
        searchHistory: [
            { query: 'plumber 90210', date: new Date(Date.now() - 86400000).toISOString() },
            { query: 'electrical repair', date: new Date(Date.now() - 2 * 86400000).toISOString() },
        ],
    }
];

// Helper function to get provider details (mock, to be replaced by Firestore 'users' collection read)
export const getProviderById = (id: string): ServiceProvider | undefined => {
  console.warn("getProviderById is using mock data. Transition to Firestore 'users' collection pending for full provider profile.");
  return mockProviders.find(p => p.id === id);
}

// Helper function to get ads by provider (mock, to be replaced by Firestore queries)
export const getAdsByProviderId = (providerId: string): ServiceAd[] =>
  mockServiceAds.filter(ad => ad.providerId === providerId);

// Helper function to add an ad (mock, to be replaced by Firestore write to an 'ads' collection)
export const addServiceAd = (adData: {
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
}): ServiceAd => {
  const newAd: ServiceAd = {
    ...adData,
    id: `ad_mock_${mockServiceAds.length + 1}`, 
    postedDate: new Date().toISOString(),
    imageUrl: adData.imageUrl || 'https://placehold.co/600x400.png'
  };
  mockServiceAds.unshift(newAd); 
  console.log("Mock ad added. In a real app, this would write to an 'ads' collection in Firestore.");
  return newAd;
};

// Helper to update provider profile (mock, to be replaced by Firestore update to 'users' collection doc)
export const updateProviderProfile = (profileData: Partial<ServiceProvider> & { id: string }): ServiceProvider | undefined => {
  console.warn("updateProviderProfile is using mock data. Transition to Firestore 'users' collection pending for full provider profile update.");
  const index = mockProviders.findIndex(p => p.id === profileData.id);
  if (index !== -1) {
    // Ensure all fields from ServiceProvider are maintained or updated
    const currentProvider = mockProviders[index];
    mockProviders[index] = {
      id: currentProvider.id, // Keep original ID
      name: profileData.name || currentProvider.name,
      email: profileData.email || currentProvider.email,
      phoneNumber: profileData.phoneNumber || currentProvider.phoneNumber,
      qualifications: profileData.qualifications || currentProvider.qualifications,
      serviceCategories: profileData.serviceCategories || currentProvider.serviceCategories,
      zipCodesServed: profileData.zipCodesServed || currentProvider.zipCodesServed,
      profilePictureUrl: profileData.profilePictureUrl !== undefined ? profileData.profilePictureUrl : currentProvider.profilePictureUrl,
    };
    return mockProviders[index];
  }
  // This part for creating new provider if not found is less relevant now,
  // as user creation in 'users' collection happens at registration.
  // Provider-specific details are added/updated on their profile page.
  return undefined;
}
