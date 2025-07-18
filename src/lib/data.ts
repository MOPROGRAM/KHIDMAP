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
  displayName?: string;
  photoURL?: string;
  bio?: string;
  isVerified?: boolean;
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

// --- Placeholder Functions to resolve build errors ---

export async function approveAdRequestAndSetPrice(id: string, price: number): Promise<void> { console.log('approveAdRequestAndSetPrice', id, price); }
export async function rejectAdRequest(id: string, reason: string): Promise<void> { console.log('rejectAdRequest', id, reason); }
export async function confirmAdPayment(id: string): Promise<void> { console.log('confirmAdPayment', id); }
export async function rejectAdPayment(id: string, reason: string): Promise<void> { console.log('rejectAdPayment', id, reason); }
export async function getAdRequests(): Promise<AdRequest[]> { console.log('getAdRequests'); return []; }
export async function getOrderById(id: string): Promise<Order | null> { console.log('getOrderById', id); return null; }
export async function resolveDispute(orderId: string, resolution: 'seeker_favor' | 'provider_favor', notes: string): Promise<void> { console.log('resolveDispute', orderId, resolution, notes); }
export async function sendMessage(chatId: string, content: string, senderId: string, messageType?: string, mediaUrl?: string): Promise<void> { console.log('sendMessage', chatId, content, senderId); }
export async function getDisputedOrders(): Promise<Order[]> { console.log('getDisputedOrders'); return []; }
export async function getPendingPaymentOrders(): Promise<Order[]> { console.log('getPendingPaymentOrders'); return []; }
export async function approvePayment(orderId: string): Promise<void> { console.log('approvePayment', orderId); }
export async function rejectPayment(orderId: string): Promise<void> { console.log('rejectPayment', orderId); }
export async function getSupportRequests(): Promise<SupportRequest[]> { console.log('getSupportRequests'); return []; }
export async function updateSupportRequestStatus(id: string, status: string): Promise<void> { console.log('updateSupportRequestStatus', id, status); }
export async function getPendingVerifications(): Promise<UserProfile[]> { console.log('getPendingVerifications'); return []; }
export async function approveVerification(userId: string): Promise<void> { console.log('approveVerification', userId); }
export async function rejectVerification(userId: string, reason: string): Promise<void> { console.log('rejectVerification', userId, reason); }
export async function markChatAsRead(chatId: string, userId: string): Promise<void> { console.log('markChatAsRead', chatId, userId); }
export async function initiateCall(chatId: string, type: 'audio' | 'video'): Promise<string | null> { console.log('initiateCall', chatId, type); return 'call-id-placeholder'; }
export async function getAllNotificationsForUser(userId: string): Promise<Notification[]> { console.log('getAllNotificationsForUser', userId); return []; }
export async function uploadPaymentProofAndUpdateOrder(orderId: string, file: File): Promise<string | null> { console.log('uploadPaymentProofAndUpdateOrder', orderId, file.name); return 'url-placeholder'; }
export async function deletePaymentProof(orderId: string, url: string): Promise<void> { console.log('deletePaymentProof', orderId, url); }
export async function markOrderAsCompleted(orderId: string): Promise<void> { console.log('markOrderAsCompleted', orderId); }
export async function disputeOrder(orderId: string, reason: string): Promise<void> { console.log('disputeOrder', orderId, reason); }
export async function acceptOrder(orderId: string): Promise<void> { console.log('acceptOrder', orderId); }
export async function declineOrder(orderId: string): Promise<void> { console.log('declineOrder', orderId); }
export async function startService(orderId: string): Promise<void> { console.log('startService', orderId); }
export async function grantGracePeriod(orderId: string): Promise<void> { console.log('grantGracePeriod', orderId); }
export async function markWorkAsFinishedByProvider(orderId: string): Promise<void> { console.log('markWorkAsFinishedByProvider', orderId); }
export async function getOrdersForUser(userId: string): Promise<Order[]> { console.log('getOrdersForUser', userId); return []; }
export async function getAdRequestById(id: string): Promise<AdRequest | null> { console.log('getAdRequestById', id); return null; }
export async function uploadAdPaymentProof(adId: string, file: File): Promise<string | null> { console.log('uploadAdPaymentProof', adId, file.name); return 'url-placeholder'; }
export async function createAdRequest(data: any): Promise<string | null> { console.log('createAdRequest', data); return 'ad-request-id-placeholder'; }
export async function getAdRequestsForUser(userId: string): Promise<AdRequest[]> { console.log('getAdRequestsForUser', userId); return []; }
export async function uploadVerificationDocuments(userId: string, files: File[]): Promise<string[]> { console.log('uploadVerificationDocuments', userId, files.length); return []; }
export async function createOrder(data: any): Promise<string | null> { console.log('createOrder', data); return 'order-id-placeholder'; }
export async function updateCallStatus(callId: string, status: string): Promise<void> { console.log('updateCallStatus', callId, status); }
