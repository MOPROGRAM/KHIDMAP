// --- Type and Interface Definitions ---

export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';
export type OrderStatus = 'pending_approval' | 'pending_payment' | 'paid' | 'pending_completion' | 'completed' | 'disputed' | 'declined' | 'resolved';
export type SupportRequestType = 'inquiry' | 'complaint' | 'payment_issue' | 'other';
export type AdRequestStatus = 'pending_review' | 'pending_payment' | 'payment_review' | 'active' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface SupportRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: SupportRequestType;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: any;
    updatedAt: any;
    adminReply?: string;
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



export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';
export type OrderStatus = 'pending_approval' | 'pending_payment' | 'paid' | 'pending_completion' | 'completed' | 'disputed' | 'declined' | 'resolved';
export type SupportRequestType = 'inquiry' | 'complaint' | 'payment_issue' | 'other';
export type AdRequestStatus = 'pending_review' | 'pending_payment' | 'payment_review' | 'active' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;

// --- Type and Interface Definitions ---

export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'HomeCleaning' | 'Construction' | 'Plastering' | 'Other';
export type UserRole = 'provider' | 'seeker' | 'admin';
export type OrderStatus = 'pending_approval' | 'pending_payment' | 'paid' | 'pending_completion' | 'completed' | 'disputed' | 'declined' | 'resolved';
export type SupportRequestType = 'inquiry' | 'complaint' | 'payment_issue' | 'other';
export type AdRequestStatus = 'pending_review' | 'pending_payment' | 'payment_review' | 'active' | 'rejected';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface SupportRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: SupportRequestType;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: any;
    updatedAt: any;
    adminReply?: string;
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
    updatedAt: any;
}

export interface SupportRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: SupportRequestType;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: any;
    updatedAt: any;
    adminReply?: string;
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
    updatedAt: any;
}

export interface SupportRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: SupportRequestType;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: any;
    updatedAt: any;
    adminReply?: string;
}













// --- Call Functions ---

export const initiateCall = async (chatId: string, calleeId: string, callType: 'audio' | 'video'): Promise<string | null> => {
    if (!db || !auth?.currentUser) {
        throw new Error("User not authenticated or database is unavailable.");
    }
    const callerId = auth.currentUser.uid;

    if (calleeId === callerId) {
        throw new Error("You cannot call yourself.");
    }

    try {
        const [callerDoc, calleeDoc] = await Promise.all([
             getDoc(doc(db, "users", callerId)),
             getDoc(doc(db, "users", calleeId))
        ]);

        const callerName = callerDoc.exists() ? (callerDoc.data().name || "Unknown Caller") : "Unknown Caller";
        const callerAvatar = callerDoc.exists() ? (callerDoc.data().images?.[0] || null) : null;
        const calleeName = calleeDoc.exists() ? (calleeDoc.data().name || "User") : "User";
        const calleeAvatar = calleeDoc.exists() ? (calleeDoc.data().images?.[0] || null) : null;
        
        const newCallData: Omit<Call, 'id'> = {
            chatId,
            callerId,
            callerName,
            callerAvatar,
            calleeId,
            calleeName,
            calleeAvatar,
            status: 'ringing',
            type: callType,
            participantIds: [callerId, calleeId],
            createdAt: serverTimestamp() as Timestamp,
        };

        const callDocRef = await addDoc(collection(db, "calls"), newCallData);
        
        // Add a timeout to automatically set the call to 'unanswered' if not picked up
        setTimeout(async () => {
            const currentCallDoc = await getDoc(callDocRef);
            if (currentCallDoc.exists() && currentCallDoc.data().status === 'ringing') {

    // Call AI for verification, now including the seeker's and provider's name
    let verificationResult;
    try {
        const verifyPaymentInput: VerifyPaymentInput = {
            photoDataUri,
            expectedAmount: order.amount,
            expectedCurrency: order.currency,
            expectedPayerName: order.seekerName,
            expectedPayeeName: order.providerName
        };
        verificationResult = await verifyPayment(verifyPaymentInput);
    } catch (aiError: any) {
        console.error("AI verification flow failed:", aiError);
        verificationResult = { isVerified: false, reason: `AI analysis failed: ${aiError.message}. Please review manually.` };
    }
    
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `payment_proofs/${orderId}/${seekerId}/${safeFileName}`;
    const metadata = { customMetadata: { 'userId': seekerId } };
    await uploadBytes(fileRef, file, metadata);
    const downloadURL = await getDownloadURL(fileRef);

    const orderRef = doc(db, "orders", orderId);
    if (verificationResult.isVerified) {
        // AI approved, update status to paid
        await updateDoc(orderRef, {
            proofOfPaymentUrl: downloadURL,
            status: 'paid',
            paymentApprovedAt: serverTimestamp(),
            verificationNotes: verificationResult.reason || "AI Approval: Accepted. All details match."
        });
        await createNotification(
            order.providerId,
            'paymentReceivedTitle',
            'paymentReceivedMessage',
            `/dashboard/orders/${order.id}`,
            { seekerName: order.seekerName }
        );
    } else {
    // AI rejected, update with proof and notes for manual review
    await updateDoc(orderRef, {
        proofOfPaymentUrl: downloadURL,
        status: 'pending_payment', // Stays pending
        verificationNotes: verificationResult.reason || "AI Approval: Rejected. The receipt could not be verified. Please review manually."
    });
}

export async function deletePaymentProof(orderId: string): Promise<void> {
    if (!db || !auth?.currentUser) {
        throw new Error("Authentication or services are unavailable.");
    }
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        throw new Error("Order not found.");
    }

    const orderData = orderSnap.data() as Order;
    const proofUrl = orderData.proofOfPaymentUrl;

    if (proofUrl) {
        try {
            await deleteObject(fileRef);
        } catch (error: any) {
            // يمكن إضافة معالجة للخطأ هنا إذا لزم الأمر
        }
    }

    await updateDoc(orderRef, {
        proofOfPaymentUrl: deleteField(),
        verificationNotes: deleteField()
    });
}


export async function getOrdersForUser(userId: string): Promise<Order[]> {
    if (!db) throw new Error("Database not initialized.");
    
    const seekerQuery = query(collection(db, "orders"), where("seekerId", "==", userId));
    const providerQuery = query(collection(db, "orders"), where("providerId", "==", userId));

    const [seekerSnap, providerSnap] = await Promise.all([getDocs(seekerQuery), getDocs(providerQuery)]);
    
    const orders = [
        ...seekerSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)),
        ...providerSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
    ];
    
    // Remove duplicates and sort by date
    const uniqueOrders = Array.from(new Map(orders.map(o => [o.id, o])).values());
    uniqueOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    
    return uniqueOrders;
}

export async function getPendingPaymentOrders(): Promise<Order[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "orders"), 
        where("status", "==", "pending_payment")
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    // Sort client-side to avoid needing a composite index
    orders.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
    return orders;
}

export async function approvePayment(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'paid',
        paymentApprovedAt: serverTimestamp(),
        verificationNotes: "Manual Approval: Accepted."
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.providerId,
            'paymentReceivedTitle',
            'paymentReceivedMessage',
            `/dashboard/orders/${order.id}`,
            { seekerName: order.seekerName }
        );
    }
}


export async function markOrderAsCompleted(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'completed',
        completedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.providerId,
            'orderCompletedTitle',
            'orderCompletedMessage',
            `/dashboard/orders/${order.id}`,
            { seekerName: order.seekerName }
        );
    }
}

export async function disputeOrder(orderId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'disputed',
        disputeReason: reason
    });

    const order = await getOrderById(orderId);
    const user = auth.currentUser;
    if (order && user) {
        const otherPartyId = user.uid === order.seekerId ? order.providerId : order.seekerId;
        await createNotification(
            otherPartyId,
            'orderDisputedTitle',
            'orderDisputedMessage',
            `/dashboard/orders/${order.id}`,
            { userName: user.displayName || 'A user' }
        );
    }
}

export async function acceptOrder(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'pending_payment',
        approvedByProviderAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'orderAcceptedTitle',
            'orderAcceptedMessage',
            `/dashboard/orders/${order.id}`,
            { providerName: order.providerName }
        );
    }
}

export async function declineOrder(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'declined',
        declinedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'orderDeclinedTitle',
            'orderDeclinedMessage',
            `/dashboard/orders/${orderId}`,
            { providerName: order.providerName }
        );
    }
}

export async function startService(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        serviceStartedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'serviceStartedTitle',
            'serviceStartedMessage',
            `/dashboard/orders/${order.id}`,
            { providerName: order.providerName }
        );
    }
}

export async function grantGracePeriod(orderId: string, days: number): Promise<void> {
    if (!db || days < 1 || days > 3) throw new Error("Invalid input.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        gracePeriodInDays: days
    });
}

export async function markWorkAsFinishedByProvider(orderId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'pending_completion',
        workFinishedAt: serverTimestamp()
    });

    const order = await getOrderById(orderId);
    if (order) {
        await createNotification(
            order.seekerId,
            'workFinishedTitle',
            'workFinishedMessage',
            `/dashboard/orders/${order.id}`,
            { providerName: order.providerName }
        );
    }
}

export async function getDisputedOrders(): Promise<Order[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "orders"),
        where("status", "==", "disputed")
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    
    // Sort client-side to avoid needing an index
    orders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

    return orders;
}

export async function resolveDispute(orderId: string, resolution: 'seeker' | 'provider', notes: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'resolved',
        disputeResolution: resolution === 'seeker' ? 'seeker_favor' : 'provider_favor',
        resolutionNotes: notes,
    });

    const order = await getOrderById(orderId);
    if (order) {
        const resolutionMessage = resolution === 'seeker' ? 'disputeResolvedSeekerFavorMessage' : 'disputeResolvedProviderFavorMessage';
        await createNotification(
            order.seekerId,
            'disputeResolvedTitle',
            resolutionMessage,
            `/dashboard/orders/${order.id}`,
            { orderId: order.id.slice(0, 6) }
        );
        await createNotification(
            order.providerId,
            'disputeResolvedTitle',
            resolutionMessage,
            `/dashboard/orders/${order.id}`,
            { orderId: order.id.slice(0, 6) }
        );
    }
}


// --- Ad Request Functions ---

export async function createAdRequest(
    data: { name: string; email: string; title: string; message: string; },
    imageFile: File
): Promise<string> {

    const userId = auth.currentUser.uid;
    const filePath = `ad_images/${userId}/${Date.now()}_${imageFile.name}`;

    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);

    const adRequestData = {
        ...data,
        imageUrl,
        userId,
        status: 'pending_review' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const adRequestRef = await addDoc(collection(db, 'adRequests'), adRequestData);
    return adRequestRef.id;
}


export async function getAdRequests(): Promise<AdRequest[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "adRequests"),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdRequest));
}

export async function getActiveAds(): Promise<AdRequest[]> {
  if (!db) throw new Error("Database not initialized.");
  const q = query(collection(db, 'adRequests'), where('status', '==', 'active'), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AdRequest));
}

export async function getAdRequestById(id: string): Promise<AdRequest | null> {
    if (!db) throw new Error("Database not initialized.");
    const docRef = doc(db, 'adRequests', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as AdRequest;
    }
    return null;
}

export async function getAdRequestsForUser(userId: string): Promise<AdRequest[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, 'adRequests'),
        where('userId', '==', userId)
        // orderBy('createdAt', 'desc') // Removed to avoid needing a composite index that might not be deployed.
    );
    const querySnapshot = await getDocs(q);
    const adRequests = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdRequest));
    // Sort client-side instead
    adRequests.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    return adRequests;
}


export async function approveAdRequestAndSetPrice(requestId: string, price: number, currency: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
    
    await updateDoc(requestRef, {
        status: 'pending_payment',
        price,
        currency,
        updatedAt: serverTimestamp()
    });

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as AdRequest;
        await createNotification(
            requestData.userId,
            'adRequestApprovedTitle',
            'adRequestApprovedMessage',
            `/dashboard/provider/ads/edit/${requestId}`,
            { price: `${price} ${currency}` }
        );
    }
}

export async function rejectAdRequest(requestId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
    
    await updateDoc(requestRef, {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
    });

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as AdRequest;
        await createNotification(
            requestData.userId,
            'adRequestRejectedTitle',
            'adRequestRejectedMessage',
            `/dashboard/provider/ads/edit/${requestId}`,
            { reason }
        );
    }
}


export async function uploadAdPaymentProof(requestId: string, file: File): Promise<void> {
        throw new Error("Authentication session is invalid or services are unavailable. Please log in again.");
    }

    const adRequest = await getAdRequestById(requestId);
    if (!adRequest) throw new Error("Ad Request not found.");
    if (adRequest.userId !== auth.currentUser.uid) throw new Error("You are not authorized to upload proof for this ad.");
    if (!adRequest.price || !adRequest.currency) throw new Error("Ad price has not been set by the admin yet.");

    // Helper to convert file to data URI for AI
    const fileToDataUri = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const photoDataUri = await fileToDataUri(file);

    let verificationResult;
    try {
        const verifyPaymentInput: VerifyPaymentInput = {
            photoDataUri,
            expectedAmount: adRequest.price,
            expectedCurrency: adRequest.currency,
            expectedPayerName: adRequest.name,
            expectedPayeeName: "Khidmap" // The name of the platform
        };
        verificationResult = await verifyPayment(verifyPaymentInput);
    } catch (aiError: any) {
        console.error("AI verification flow for ads failed:", aiError);
        verificationResult = { isVerified: false, reason: `AI analysis failed: ${aiError.message}. Please review manually.` };
    }
    
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `ad_payments/${requestId}/${adRequest.userId}/${safeFileName}`;
    const metadata = { customMetadata: { 'userId': adRequest.userId } };
    await uploadBytes(fileRef, file, metadata);
    const downloadURL = await getDownloadURL(fileRef);

    const requestRef = doc(db, "adRequests", requestId);

    if (verificationResult.isVerified) {
        await updateDoc(requestRef, {
            status: 'active',
            paymentProofUrl: downloadURL,
            verificationNotes: verificationResult.reason || "AI Approval: Accepted. Payment verified.",
            updatedAt: serverTimestamp()
        });
        await createNotification(
            adRequest.userId,
            'adPaymentConfirmedTitle',
            'adPaymentConfirmedMessage',
            `/dashboard/provider/ads/edit/${requestId}`
        );
    } else {
        await updateDoc(requestRef, {
            status: 'payment_review', // Status for manual admin review
            paymentProofUrl: downloadURL,
            verificationNotes: verificationResult.reason || "AI Approval: Rejected. Needs manual review.",
            updatedAt: serverTimestamp()
        });
        await createNotification(
            adRequest.userId,
            'statusPaymentReview',
            'adRequestInPaymentReviewMessage',
            `/dashboard/provider/ads/edit/${requestId}`
        );
    }
}

export async function confirmAdPayment(requestId: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);

    await updateDoc(requestRef, {
        status: 'active',
        verificationNotes: "Manual Approval: Accepted.",
        updatedAt: serverTimestamp()
    });
    
    const requestSnap = await getDoc(requestRef);
    if (requestSnap.exists()) {
        const adData = requestSnap.data() as AdRequest;
         await createNotification(
            adData.userId,
            'adPaymentConfirmedTitle',
            'adPaymentConfirmedMessage',
            `/dashboard/provider/ads/edit/${requestId}`
        );
    }
}

export async function rejectAdPayment(requestId: string, reason: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "adRequests", requestId);
     const adSnap = await getDoc(requestRef);
    if (!adSnap.exists()) throw new Error("Ad request not found.");

    const adData = adSnap.data() as AdRequest;
    if(adData.paymentProofUrl) {
         try {
            await deleteObject(fileRef);
         } catch(e) {
            console.error("Could not delete previous payment proof, it might not exist.", e)
         }
    }

    await updateDoc(requestRef, {
        status: 'pending_payment',
        rejectionReason: reason,
        paymentProofUrl: deleteField(),
        verificationNotes: deleteField(),
        updatedAt: serverTimestamp()
    });
    
     await createNotification(
        adData.userId,
        'adPaymentRejectedTitle',
        'adPaymentRejectedMessage',
        `/dashboard/provider/ads/edit/${requestId}`,
        { reason }
    );
}



// --- Support Request Functions ---

export async function createSupportRequest(data: { name: string; email: string; subject: string; message: string; type: SupportRequestType; }): Promise<string> {
    if (!db) throw new Error("Database not initialized.");
    if (!auth.currentUser) throw new Error("User must be logged in to submit a request.");

    const supportRequestData = {
        ...data,
        status: 'open' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: auth.currentUser.uid,
    };

    const supportRequestRef = await addDoc(collection(db, 'supportRequests'), supportRequestData);
    return supportRequestRef.id;
}

export async function getSupportRequests(): Promise<SupportRequest[]> {
    if (!db) throw new Error("Database not initialized.");
    const q = query(
        collection(db, "supportRequests"),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupportRequest));
}

export async function updateSupportRequestStatus(requestId: string, status: 'in_progress' | 'closed', adminReply?: string): Promise<void> {
    if (!db) throw new Error("Database not initialized.");
    const requestRef = doc(db, "supportRequests", requestId);
    
    const updateData: any = {
        status: status,
        updatedAt: serverTimestamp()
    };
    if (status === 'closed' && adminReply) {
        updateData.adminReply = adminReply;
    }

    await updateDoc(requestRef, updateData);

    const requestSnap = await getDoc(requestRef);
    if(requestSnap.exists()){
        const requestData = requestSnap.data() as SupportRequest;
        let titleKey: keyof Translations = 'supportRequestInProgressTitle';
        let messageKey: keyof Translations = 'supportRequestInProgressMessage';
        let params: { [key: string]: string } = { ticketId: requestId.slice(0, 6) };

        if (status === 'closed') {
            titleKey = 'supportRequestClosedTitle';
            if (adminReply) {
                messageKey = 'supportRequestClosedWithReplyMessage';
                params.reply = adminReply;
            } else {
                messageKey = 'supportRequestClosedMessage';
            }
        }
        
        await createNotification(
            requestData.userId,
            titleKey,
            messageKey,
            '/contact', 
            params
        );
    }
}
