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
