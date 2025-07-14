// --- Type and Interface Definitions ---

export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';
export type OrderStatus = 'pending_approval' | 'pending_payment' | 'paid' | 'pending_completion' | 'completed' | 'disputed' | 'declined' | 'resolved';
export type SupportRequestType = 'inquiry' | 'complaint' | 'payment_issue' | 'other';
export type AdRequestStatus = 'pending_review' | 'pending_payment' | 'payment_review' | 'active' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface SupportRequest {
    currency: string;
    commission: number;
    payoutAmount: number;
    status: OrderStatus;
    proofOfPaymentUrl?: string;
    createdAt?: any;
    approvedByProviderAt?: any;
    paymentApprovedAt?: any;
    completedAt?: any;
    declinedAt?: any;
    serviceStartDate?: any;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  qualifications?: string;
  serviceCategories?: ServiceCategory[];
  serviceAreas?: string[];
  location?: any;
  images?: string[];
  videos?: string[];
  createdAt?: any;
  updatedAt?: any;
  emailVerified?: boolean;
  videoCallsEnabled?: boolean;
  verificationStatus?: VerificationStatus;
  verificationDocuments?: string[];
  verificationRejectionReason?: string;
}

export interface Call {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string | null;
  calleeId: string;
  calleeName: string;
  calleeAvatar?: string | null;
  status: 'ringing' | 'active' | 'declined' | 'ended' | 'unanswered';
  type: 'video' | 'audio';
  participantIds: string[];
  createdAt: any;
  startedAt?: any;
  offer?: { sdp: string; type: 'offer' };
  answer?: { sdp: string; type: 'answer' };
}

export interface Order {
    id: string;
    seekerId: string;
    providerId: string;
    seekerName: string;
    providerName: string;
    serviceDescription: string;
    amount: number;
    currency: string;
    commission: number;
    payoutAmount: number;
    status: OrderStatus;
    proofOfPaymentUrl?: string;
    createdAt?: any;
    approvedByProviderAt?: any;
    paymentApprovedAt?: any;
    completedAt?: any;
    declinedAt?: any;
    serviceStartDate?: any;
    gracePeriodInDays?: number;
    serviceStartedAt?: any;
    workFinishedAt?: any;
    disputeReason?: string;
    verificationNotes?: string;
    chatId?: string;
    resolutionNotes?: string;
    disputeResolution?: 'seeker_favor' | 'provider_favor';
}

export interface Notification {
    id: string;
    userId: string;
    titleKey: string;
    messageKey: string;
    messageParams?: { [key: string]: string };
    link: string;
    isRead: boolean;
    createdAt: any;
}

export interface AdRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    title: string;
    message: string;
    imageUrl?: string;
    status: AdRequestStatus;
    price?: number;
    currency?: string;
    paymentProofUrl?: string;
    rejectionReason?: string;
    verificationNotes?: string;
    createdAt: any;
}

export async function createSupportRequest(data: any): Promise<string> {
  // Placeholder implementation for support request creation
  // Replace with actual API call or database logic as needed
  console.log('Support request data received:', data);
  // Simulate ticket ID generation
  const ticketId = 'TICKET-' + Math.floor(Math.random() * 1000000);
  return ticketId;
}

export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export interface Rating {
  id: string;
  ratedUserId: string;
  raterUserId: string;
  raterName: string;
  rating: number;
  comment?: string;
  createdAt?: any;
}

export async function getRatingsForUser(userId: string): Promise<Rating[]> {
  try {
    const response = await fetch(`/api/ratings/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }
    const data = await response.json();
    return data as Rating[];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

export async function addRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<void> {
  try {
    const response = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rating),
    });
    if (!response.ok) {
      throw new Error('Failed to add rating');
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
}

export async function startOrGetChat(providerId: string): Promise<string> {
  // Placeholder implementation, replace with actual API call
  return 'chatId-placeholder';
}
