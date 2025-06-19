
export type ServiceCategory = 'Plumbing' | 'Electrical';

export interface ServiceAd {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  zipCode: string;
  imageUrl?: string;
  postedDate: string; // ISO string
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
  searchHistory: { query: string; date: string }[]; // ISO string for date
}

// Mock Data
export const mockProviders: ServiceProvider[] = [
  {
    id: 'provider1',
    name: 'John Doe Plumbing',
    email: 'john.doe@example.com',
    phoneNumber: '555-1234',
    qualifications: 'Licensed Master Plumber, 10 years experience',
    serviceCategories: ['Plumbing'],
    zipCodesServed: ['90210', '90211'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
  },
  {
    id: 'provider2',
    name: 'Jane Spark Electrical',
    email: 'jane.spark@example.com',
    phoneNumber: '555-5678',
    qualifications: 'Certified Electrician, Specialized in residential wiring',
    serviceCategories: ['Electrical'],
    zipCodesServed: ['90210', '90001'],
    profilePictureUrl: 'https://placehold.co/150x150.png',
  },
];

export const mockServiceAds: ServiceAd[] = [
  {
    id: 'ad1',
    providerId: 'provider1',
    title: 'Emergency Plumbing Services 24/7',
    description: 'Leaky pipes? Clogged drains? We fix it all, anytime!',
    category: 'Plumbing',
    zipCode: '90210',
    imageUrl: 'https://placehold.co/600x400.png',
    postedDate: new Date().toISOString(),
  },
  {
    id: 'ad2',
    providerId: 'provider2',
    title: 'Expert Electrical Wiring and Repairs',
    description: 'Safe and reliable electrical installations and troubleshooting for your home.',
    category: 'Electrical',
    zipCode: '90210',
    imageUrl: 'https://placehold.co/600x400.png',
    postedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'ad3',
    providerId: 'provider1',
    title: 'Kitchen & Bath Plumbing Remodels',
    description: 'Upgrade your kitchen or bathroom with our expert plumbing renovation services.',
    category: 'Plumbing',
    zipCode: '90211',
    imageUrl: 'https://placehold.co/600x400.png',
    postedDate: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
  },
];

export const mockSeekers: ServiceSeeker[] = [
    {
        id: 'seeker1',
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        searchHistory: [
            { query: 'plumber 90210', date: new Date(Date.now() - 86400000).toISOString() },
            { query: 'electrical repair', date: new Date(Date.now() - 2 * 86400000).toISOString() },
        ]
    }
];

// Helper function to get provider details (mock)
export const getProviderById = (id: string): ServiceProvider | undefined => 
  mockProviders.find(p => p.id === id);

// Helper function to get ads by provider (mock)
export const getAdsByProviderId = (providerId: string): ServiceAd[] =>
  mockServiceAds.filter(ad => ad.providerId === providerId);

// Helper function to add an ad (mock)
export const addServiceAd = (ad: Omit<ServiceAd, 'id' | 'postedDate'>): ServiceAd => {
  const newAd: ServiceAd = {
    ...ad,
    id: `ad${mockServiceAds.length + 1}`,
    postedDate: new Date().toISOString(),
    imageUrl: ad.imageUrl || 'https://placehold.co/600x400.png'
  };
  mockServiceAds.unshift(newAd); // Add to the beginning of the array
  return newAd;
};

// Helper to update provider profile
export const updateProviderProfile = (profileData: Partial<ServiceProvider> & { id: string }): ServiceProvider | undefined => {
  const index = mockProviders.findIndex(p => p.id === profileData.id);
  if (index !== -1) {
    mockProviders[index] = { ...mockProviders[index], ...profileData };
    return mockProviders[index];
  }
  return undefined;
}

// Function to simulate user login (very basic)
export const mockLogin = (email: string, role: 'provider' | 'seeker'): { id: string, name: string, email: string, role: 'provider' | 'seeker' } | null => {
  if (role === 'provider') {
    const provider = mockProviders.find(p => p.email === email);
    if (provider) return { id: provider.id, name: provider.name, email: provider.email, role: 'provider' };
  } else {
    const seeker = mockSeekers.find(s => s.email === email);
     if (seeker) return { id: seeker.id, name: seeker.name, email: seeker.email, role: 'seeker' };
  }
  // If not found, create a mock user for demo purposes
  const mockId = role === 'provider' ? `provider${mockProviders.length + 1}` : `seeker${mockSeekers.length + 1}`;
  const mockUser = { id: mockId, name: `Mock ${role === 'provider' ? 'Provider' : 'Seeker'}`, email, role };
  if (role === 'provider') {
    mockProviders.push({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      phoneNumber: '000-0000',
      qualifications: 'New Provider',
      serviceCategories: [],
      zipCodesServed: []
    });
  } else {
     mockSeekers.push({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      searchHistory: []
    });
  }
  return mockUser;
};

// Mock registration
export const mockRegister = (userData: {name: string, email: string, role: 'provider' | 'seeker'}): { id: string, name: string, email: string, role: 'provider' | 'seeker' } => {
  const { name, email, role } = userData;
  const id = role === 'provider' ? `provider${mockProviders.length + 1}` : `seeker${mockSeekers.length + 1}`;
  
  if (role === 'provider') {
    const newProvider: ServiceProvider = {
      id,
      name,
      email,
      phoneNumber: '',
      qualifications: '',
      serviceCategories: [],
      zipCodesServed: [],
    };
    mockProviders.push(newProvider);
    return { id, name, email, role: 'provider' };
  } else {
    const newSeeker: ServiceSeeker = {
      id,
      name,
      email,
      searchHistory: [],
    };
    mockSeekers.push(newSeeker);
    return { id, name, email, role: 'seeker' };
  }
};
