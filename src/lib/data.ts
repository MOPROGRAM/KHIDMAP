import { PrismaClient, UserRole, ServiceCategory, OrderStatus, SupportRequestType, AdRequestStatus, VerificationStatus, Prisma } from '@prisma/client';
import type { Translations } from './translations';

const prisma = new PrismaClient();

export type { ServiceCategory, UserRole, OrderStatus, SupportRequestType, AdRequestStatus, VerificationStatus };

// Re-exporting Prisma types for use in components
export type UserProfile = Prisma.UserGetPayload<{}>;
export type Rating = Prisma.RatingGetPayload<{}>;
export type Chat = Prisma.ChatGetPayload<{ include: { participants: true } }>;
export type Message = Prisma.MessageGetPayload<{}>;
export type Call = Prisma.CallGetPayload<{}>;
export type Order = Prisma.OrderGetPayload<{}>;
export type Notification = Prisma.NotificationGetPayload<{}>;
export type AdRequest = Prisma.AdRequestGetPayload<{}>;
export type SupportRequest = Prisma.SupportRequestGetPayload<{}>;


export async function createNotification(
    userId: string,
    titleKey: keyof Translations,
    messageKey: keyof Translations,
    link: string,
    messageParams?: { [key: string]: string }
): Promise<void> {
    try {
        await prisma.notification.create({
            data: {
                userId,
                titleKey,
                messageKey,
                messageParams: messageParams || {},
                link,
                isRead: false,
            },
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        // Don't throw, as notification failure shouldn't block the main action.
    }
}

export async function getAllNotificationsForUser(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

// --- UserProfile Prisma Functions ---
export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) {
        console.error("getUserProfileById called with no userId.");
        throw new Error("User ID is missing.");
    }
    return prisma.user.findUnique({
        where: { id: userId },
    });
};

export const getAllProviders = async (): Promise<UserProfile[]> => {
    return prisma.user.findMany({
        where: { role: 'provider' },
    });
};

export async function uploadVerificationDocuments(userId: string, documentUrls: string[]): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            verificationDocuments: {
                push: documentUrls,
            },
            verificationStatus: 'pending',
        },
    });
}

export async function getPendingVerifications(): Promise<UserProfile[]> {
    return prisma.user.findMany({
        where: { verificationStatus: 'pending' },
    });
}

export async function approveVerification(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            verificationStatus: 'verified',
            verificationRejectionReason: null,
        },
    });
    await createNotification(userId, 'verificationVerifiedTitle', 'verificationVerifiedDescription', '/dashboard/provider/profile');
}

export async function rejectVerification(userId: string, reason: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            verificationStatus: 'rejected',
            verificationRejectionReason: reason,
        },
    });
    await createNotification(userId, 'verificationRejectedTitle', 'verificationRejectedDescription', '/dashboard/provider/profile', { reason });
}

// --- Rating Prisma Functions ---
export const addRating = async (ratingData: {
    ratedUserId: string;
    raterUserId: string;
    raterName: string;
    rating: number;
    comment: string;
}): Promise<Rating> => {
    return prisma.rating.create({
        data: ratingData,
    });
};

export const getRatingsForUser = async (userId: string): Promise<Rating[]> => {
    return prisma.rating.findMany({
        where: { ratedUserId: userId },
        orderBy: { createdAt: 'desc' },
    });
};

// --- Messaging Prisma Functions ---
export const startOrGetChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
    if (currentUserId === otherUserId) {
        throw new Error("Cannot start a chat with yourself.");
    }

    const participants = [currentUserId, otherUserId].sort();

    let chat = await prisma.chat.findFirst({
        where: {
            participantIds: {
                equals: participants,
            },
        },
    });

    if (chat) {
        return chat.id;
    }

    const [currentUser, otherUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: currentUserId } }),
        prisma.user.findUnique({ where: { id: otherUserId } })
    ]);

    if (!currentUser || !otherUser) {
        throw new Error("Could not find user profiles for one or both participants.");
    }

    const newChat = await prisma.chat.create({
        data: {
            participantIds: participants,
            participants: {
                connect: [{ id: currentUserId }, { id: otherUserId }],
            },
            participantNames: {
                [currentUserId]: currentUser.name || "User",
                [otherUserId]: otherUser.name || "User",
            },
            participantAvatars: {
                [currentUserId]: currentUser.image || null,
                [otherUserId]: otherUser.image || null,
            },
            lastMessage: "Conversation started.",
            lastMessageSenderId: "system",
        },
    });

    return newChat.id;
};

export const sendMessage = async (
    chatId: string,
    senderId: string,
    content: string,
    type: 'text' | 'audio' | 'image' | 'video' | 'system_call_status'
): Promise<Message> => {
    const message = await prisma.message.create({
        data: {
            chatId,
            senderId,
            content,
            type,
        },
    });

    // Update chat's last message in a separate, non-blocking call
    prisma.chat.update({
        where: { id: chatId },
        data: {
            lastMessage: type === 'text' ? content : `[${type}]`,
            lastMessageAt: new Date(),
            lastMessageSenderId: senderId,
        },
    }).catch(console.error);


    return message;
};

export async function getMessagesForChat(chatId: string): Promise<Message[]> {
    return prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });
}

// --- Order Management Functions ---
export async function createOrder(seekerId: string, providerId: string, serviceDescription: string, amount: number, currency: string, serviceStartDate: Date | null): Promise<Order> {
    const [seekerProfile, providerProfile] = await Promise.all([
        getUserProfileById(seekerId),
        getUserProfileById(providerId),
    ]);

    if (!seekerProfile || !providerProfile) {
        throw new Error("Could not find profiles for one or both users.");
    }

    const commissionRate = 0.05; // 5%
    const commission = amount * commissionRate;
    const payoutAmount = amount - commission;
    
    const chatId = await startOrGetChat(seekerId, providerId);

    const newOrder = await prisma.order.create({
        data: {
            seekerId,
            providerId,
            seekerName: seekerProfile.name || 'Seeker',
            providerName: providerProfile.name || 'Provider',
            serviceDescription,
            amount,
            currency,
            commission,
            payoutAmount,
            status: 'pending_approval',
            serviceStartDate,
            chatId,
        },
    });

    await createNotification(
        providerId,
        'newOrderRequestTitle',
        'newOrderRequestMessage',
        `/dashboard/orders/${newOrder.id}`,
        { seekerName: seekerProfile.name || 'A user' }
    );

    return newOrder;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id: orderId } });
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
        where: {
            OR: [
                { seekerId: userId },
                { providerId: userId },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getPendingPaymentOrders(): Promise<Order[]> {
    return prisma.order.findMany({
        where: { status: 'pending_payment' },
        orderBy: { createdAt: 'asc' },
    });
}

export async function approvePayment(orderId: string): Promise<Order> {
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'paid',
            paymentApprovedAt: new Date(),
            verificationNotes: "Manual Approval: Accepted."
        },
    });

    await createNotification(
        updatedOrder.providerId,
        'paymentReceivedTitle',
        'paymentReceivedMessage',
        `/dashboard/orders/${updatedOrder.id}`,
        { seekerName: updatedOrder.seekerName }
    );
    return updatedOrder;
}

export async function rejectPayment(orderId: string, reason: string): Promise<Order> {
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            // Reverts to pending_payment, allowing user to re-upload
            status: 'pending_payment', 
            proofOfPaymentUrl: null,
            verificationNotes: `Manual Rejection: ${reason || 'The uploaded proof was invalid.'}`
        },
    });

    await createNotification(
        updatedOrder.seekerId,
        'paymentRejectedTitle',
        'paymentRejectedMessage',
        `/dashboard/orders/${orderId}`,
        { userName: updatedOrder.providerName }
    );
    return updatedOrder;
}


export async function markOrderAsCompleted(orderId: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'completed',
            completedAt: new Date()
        },
    });

    await createNotification(
        order.providerId,
        'orderCompletedTitle',
        'orderCompletedMessage',
        `/dashboard/orders/${order.id}`,
        { seekerName: order.seekerName }
    );
    return order;
}

export async function disputeOrder(orderId: string, reason: string, disputerId: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'disputed',
            disputeReason: reason
        },
    });

    const otherPartyId = disputerId === order.seekerId ? order.providerId : order.seekerId;
    const disputer = await getUserProfileById(disputerId);

    await createNotification(
        otherPartyId,
        'orderDisputedTitle',
        'orderDisputedMessage',
        `/dashboard/orders/${order.id}`,
        { userName: disputer?.name || 'A user' }
    );
    return order;
}

export async function acceptOrder(orderId: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'pending_payment',
            approvedByProviderAt: new Date()
        },
    });

    await createNotification(
        order.seekerId,
        'orderAcceptedTitle',
        'orderAcceptedMessage',
        `/dashboard/orders/${order.id}`,
        { providerName: order.providerName }
    );
    return order;
}

export async function declineOrder(orderId: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'declined',
            declinedAt: new Date()
        },
    });

    await createNotification(
        order.seekerId,
        'orderDeclinedTitle',
        'orderDeclinedMessage',
        `/dashboard/orders/${orderId}`,
        { providerName: order.providerName }
    );
    return order;
}

export async function startService(orderId: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: { serviceStartedAt: new Date() },
    });

    await createNotification(
        order.seekerId,
        'serviceStartedTitle',
        'serviceStartedMessage',
        `/dashboard/orders/${order.id}`,
        { providerName: order.providerName }
    );
    return order;
}

export async function grantGracePeriod(orderId: string, days: number): Promise<Order> {
    if (days < 1 || days > 3) throw new Error("Invalid grace period.");
    return prisma.order.update({
        where: { id: orderId },
        data: { gracePeriodInDays: days },
    });
}

export async function markWorkAsFinishedByProvider(orderId: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'pending_completion',
            workFinishedAt: new Date()
        },
    });

    await createNotification(
        order.seekerId,
        'workFinishedTitle',
        'workFinishedMessage',
        `/dashboard/orders/${order.id}`,
        { providerName: order.providerName }
    );
    return order;
}

export async function getDisputedOrders(): Promise<Order[]> {
    return prisma.order.findMany({
        where: { status: 'disputed' },
        orderBy: { createdAt: 'desc' },
    });
}

export async function resolveDispute(orderId: string, resolution: 'seeker' | 'provider', notes: string): Promise<Order> {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'resolved',
            disputeResolution: resolution === 'seeker' ? 'seeker_favor' : 'provider_favor',
            resolutionNotes: notes,
        },
    });

    const resolutionMessageKey: keyof Translations = resolution === 'seeker' ? 'disputeResolvedSeekerFavorMessage' : 'disputeResolvedProviderFavorMessage';
    
    await createNotification(
        order.seekerId,
        'disputeResolvedTitle',
        resolutionMessageKey,
        `/dashboard/orders/${order.id}`
    );
    await createNotification(
        order.providerId,
        'disputeResolvedTitle',
        resolutionMessageKey,
        `/dashboard/orders/${order.id}`
    );
    return order;
}

// --- Ad Request Functions ---
export async function createAdRequest(data: {
    userId: string;
    name: string;
    email: string;
    title: string;
    message: string;
    imageUrl: string;
}): Promise<AdRequest> {
    return prisma.adRequest.create({
        data: {
            ...data,
            status: 'pending_review',
        },
    });
}

export async function getAdRequests(): Promise<AdRequest[]> {
    return prisma.adRequest.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getActiveAds(): Promise<AdRequest[]> {
    return prisma.adRequest.findMany({
        where: { status: 'active' },
        orderBy: { updatedAt: 'desc' },
    });
}

export async function getAdRequestById(id: string): Promise<AdRequest | null> {
    return prisma.adRequest.findUnique({ where: { id } });
}

export async function getAdRequestsForUser(userId: string): Promise<AdRequest[]> {
    return prisma.adRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export async function approveAdRequestAndSetPrice(requestId: string, price: number, currency: string): Promise<void> {
    const adRequest = await prisma.adRequest.update({
        where: { id: requestId },
        data: {
            status: 'pending_payment',
            price,
            currency,
        },
    });

    await createNotification(
        adRequest.userId,
        'adRequestApprovedTitle',
        'adRequestApprovedMessage',
        `/dashboard/provider/ads/edit/${requestId}`,
        { price: `${price} ${currency}` }
    );
}

export async function rejectAdRequest(requestId: string, reason: string): Promise<void> {
    const adRequest = await prisma.adRequest.update({
        where: { id: requestId },
        data: {
            status: 'rejected',
            rejectionReason: reason,
        },
    });

    await createNotification(
        adRequest.userId,
        'adRequestRejectedTitle',
        'adRequestRejectedMessage',
        `/dashboard/provider/ads/edit/${requestId}`,
        { reason }
    );
}

export async function uploadAdPaymentProof(requestId: string, proofUrl: string): Promise<void> {
    // In a real app, you might still want AI verification here.
    // For simplicity, we'll move it to a manual review state.
    const adRequest = await prisma.adRequest.update({
        where: { id: requestId },
        data: {
            status: 'payment_review',
            paymentProofUrl: proofUrl,
            verificationNotes: "Awaiting manual payment review.",
        },
    });

    await createNotification(
        adRequest.userId,
        'statusPaymentReview',
        'adRequestInPaymentReviewMessage',
        `/dashboard/provider/ads/edit/${requestId}`
    );
}

export async function confirmAdPayment(requestId: string): Promise<void> {
    const adRequest = await prisma.adRequest.update({
        where: { id: requestId },
        data: {
            status: 'active',
            verificationNotes: "Manual Approval: Accepted.",
        },
    });

    await createNotification(
        adRequest.userId,
        'adPaymentConfirmedTitle',
        'adPaymentConfirmedMessage',
        `/dashboard/provider/ads/edit/${requestId}`
    );
}

export async function rejectAdPayment(requestId: string, reason: string): Promise<void> {
    const adRequest = await prisma.adRequest.update({
        where: { id: requestId },
        data: {
            status: 'pending_payment',
            rejectionReason: reason,
            paymentProofUrl: null,
            verificationNotes: null,
        },
    });

    await createNotification(
        adRequest.userId,
        'adPaymentRejectedTitle',
        'adPaymentRejectedMessage',
        `/dashboard/provider/ads/edit/${requestId}`,
        { reason }
    );
}

// --- Support Request Functions ---
export async function createSupportRequest(data: {
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    type: SupportRequestType;
}): Promise<SupportRequest> {
    return prisma.supportRequest.create({
        data: {
            ...data,
            status: 'open',
        },
    });
}

export async function getSupportRequests(): Promise<SupportRequest[]> {
    return prisma.supportRequest.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function updateSupportRequestStatus(requestId: string, status: 'in_progress' | 'closed', adminReply?: string): Promise<void> {
    const supportRequest = await prisma.supportRequest.update({
        where: { id: requestId },
        data: {
            status,
            adminReply: adminReply || null,
        },
    });

    let titleKey: keyof Translations = 'supportRequestInProgressTitle';
    let messageKey: keyof Translations = 'supportRequestInProgressMessage';

    if (status === 'closed') {
        titleKey = 'supportRequestClosedTitle';
        messageKey = adminReply ? 'supportRequestClosedWithReplyMessage' : 'supportRequestClosedMessage';
    }

    await createNotification(
        supportRequest.userId,
        titleKey,
        messageKey,
        '/contact'
    );
}
