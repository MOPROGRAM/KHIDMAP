
// We are moving towards Firebase for authentication and data storage.
// Mock login/register functions are removed.
// Mock data arrays (mockProviders, mockServiceAds, mockSeekers) will be replaced by Firestore calls in future steps.

export type ServiceCategory = 'Plumbing' | 'Electrical';

export interface ServiceAd {
  id: string; // Firestore document ID
  providerId: string; // UID of the provider from Firebase Auth
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
  postedDate: string; // ISO string or Firebase Timestamp
}

export interface ServiceProvider {
  id: string; // UID from Firebase Auth, also document ID in 'users' or 'providers' collection
  name: string;
  email: string; // From Firebase Auth
  phoneNumber: string;
  qualifications: string;
  serviceCategories: ServiceCategory[];
  zipCodesServed: string[];
  profilePictureUrl?: string;
  role: 'provider'; // Explicitly set role
}

export interface ServiceSeeker {
  id: string; // UID from Firebase Auth, also document ID in 'users' or 'seekers' collection
  name: string;
  email: string; // From Firebase Auth
  searchHistory: { query: string; date: string }[]; // ISO string for date
  role: 'seeker'; // Explicitly set role
}

// Mock Data (will be replaced by Firestore)
export let mockProviders: ServiceProvider[] = [
  {
    id: 'provider1_mock_uid', // Using mock UIDs for now
    name: 'John Doe Plumbing',
    email: 'john.provider@example.com', // Example provider email
    phoneNumber: '555-1234',
    qualifications: 'Licensed Master Plumber, 10 years experience',
    serviceCategories: ['Plumbing'],
    zipCodesServed: ['90210', '90211'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
    role: 'provider',
  },
  {
    id: 'provider2_mock_uid',
    name: 'Jane Spark Electrical',
    email: 'jane.provider@example.com', // Example provider email
    phoneNumber: '555-5678',
    qualifications: 'Certified Electrician, Specialized in residential wiring',
    serviceCategories: ['Electrical'],
    zipCodesServed: ['90210', '90001'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
    role: 'provider',
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
        name: 'Alice Wonderland',
        email: 'alice.seeker@example.com', // Example seeker email
        searchHistory: [
            { query: 'plumber 90210', date: new Date(Date.now() - 86400000).toISOString() },
            { query: 'electrical repair', date: new Date(Date.now() - 2 * 86400000).toISOString() },
        ],
        role: 'seeker',
    }
];

// Helper function to get provider details (mock, to be replaced by Firestore)
export const getProviderById = (id: string): ServiceProvider | undefined => 
  mockProviders.find(p => p.id === id);

// Helper function to get ads by provider (mock, to be replaced by Firestore)
export const getAdsByProviderId = (providerId: string): ServiceAd[] =>
  mockServiceAds.filter(ad => ad.providerId === providerId);

// Helper function to add an ad (mock, to be replaced by Firestore)
// Note: providerId will be the Firebase UID of the logged-in provider.
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
    id: `ad_mock_${mockServiceAds.length + 1}`, // Temporary mock ID
    postedDate: new Date().toISOString(),
    imageUrl: adData.imageUrl || 'https://placehold.co/600x400.png'
  };
  mockServiceAds.unshift(newAd); // Add to the beginning of the array
  console.log("Mock ad added. In a real app, this would write to Firestore.");
  return newAd;
};

// Helper to update provider profile (mock, to be replaced by Firestore)
// Note: profileData.id will be the Firebase UID.
export const updateProviderProfile = (profileData: Partial<ServiceProvider> & { id: string }): ServiceProvider | undefined => {
  const index = mockProviders.findIndex(p => p.id === profileData.id);
  if (index !== -1) {
    mockProviders[index] = { ...mockProviders[index], ...profileData, role: 'provider' }; // ensure role is set
    console.log("Mock provider profile updated. In a real app, this would update Firestore.");
    return mockProviders[index];
  }
  // If provider not found in mock (e.g., new Firebase user), we could add them for mock purposes,
  // but ideally, profile creation happens after registration and writes to Firestore.
  if (profileData.email && profileData.name) {
    const newProvider: ServiceProvider = {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber || '',
      qualifications: profileData.qualifications || '',
      serviceCategories: profileData.serviceCategories || [],
      zipCodesServed: profileData.zipCodesServed || [],
      profilePictureUrl: profileData.profilePictureUrl,
      role: 'provider',
    };
    mockProviders.push(newProvider);
    console.log("Mock provider profile created for new user. In a real app, this would be a Firestore document.");
    return newProvider;
  }
  return undefined;
}

// The mockLogin and mockRegister functions are no longer needed as Firebase Auth handles this.
// User creation and profile data (like role) will eventually be managed in Firestore.
