import { en } from './en';
import { ar } from './ar';

export type Translations = {
  appName: string;
  toggleNavigationMenu: string;
  dashboardMenu: string;
  dashboardMenuDesc: string;
  tagline: string;
  home: string;
  services: string;
  login: string;
  register: string;
  logout: string;
  profile: string;
  dashboard: string;
  language: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  searchPlaceholder: string;
  search: string;
  serviceProviders: string;
  serviceSeekers: string;
  registerAs: string;
  provider: string;
  seeker: string;
  email: string;
  password: string;
  name: string;
  realNameHelpText: string;
  bankNamePlaceholder: string;
  qualifications: string;
  phoneNumber: string;
  address: string;
  serviceAreas: string;
  serviceAreasPlaceholder: string;
  category: string;
  plumbing: string;
  electrical: string;
  carpentry: string;
  painting: string;
  homeCleaning: string;
  construction: string;
  plastering: string;
  other: string;
  searchHistory: string;
  noResultsFound: string;
  loading: string;
  submit: string;
  viewDetails: string;
  errorOccurred: string;
  welcomeTo: string;
  findSkilledArtisans: string;
  orPostYourServices: string;
  getStarted: string;
  browseServices: string;
  joinAsProvider: string;
  joinAsSeeker: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  createAccount: string;
  fillYourProfile: string;
  serviceDetails: string;
  contactInfo: string;
  saveChanges: string;
  profileUpdatedSuccessfully: string;
  selectCategory: string;
  serviceCategory: string;
  searchByAddressOrKeyword: string;
  recentSearches: string;
  clearHistory: string;
  noHistoryYet: string;
  requiredField: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
  confirmPassword: string;
  emailVerificationSent: string;
  checkYourEmailForVerification: string;
  contactUs: string;
  adminDashboard: string;
  welcomeAdmin: string;
  adminPlaceholder: string;
  selectService: string;
  hidePassword?: string;
  showPassword?: string;
  authServiceUnavailable?: string;
  serviceUnavailableTitle?: string;
  serviceUnavailableMessage?: string;
  coreServicesUnavailableDashboard?: string;
  loginSuccessful?: string;
  welcomeBackUser?: string; // "Welcome back, {userName}!"
  loginFailedGeneric?: string;
  invalidCredentials?: string;
  networkError?: string;
  loginFailedTitle?: string;
  registrationFailedGeneric?: string;
  emailAlreadyInUse?: string;
  passwordTooWeak?: string;
  registrationFailedTitle?: string;
  userNotAuthenticated?: string;
  userNotIdentified?: string;
  coreServicesUnavailable?: string;
  providerInfoMissing?: string;
  invalidDate?: string;
  delete?: string;
  cancel?: string;
  welcome?: string;
  completeYourProfile?: string;
  couldNotFetchProfile?: string;
  authError?: string;
  userNotAuthOrServiceUnavailable?: string;
  profileChangesSaved?: string;
  failedUpdateProfile?: string;
  profilePageDescription?: string;
  profileEditingUnavailable?: string;
  profileHelpTextCategory?: string;
  searchHistoryClearedTitle?: string;
  searchHistoryClearedSuccess?: string;
  searchHistoryPageDescription?: string;
  confirmClearHistoryTitle?: string;
  confirmClearHistoryDescription?: string;
  noHistoryYetDescription?: string;
  searchedOn?: string;
  repeatSearch?: string;
  failedLoadServices?: string;
  backButton?: string;
  backToSearch?: string;
  postedOnFull?: string;
  serviceCategoriesTitle?: string;
  servesAreasTitle?: string;
  contactProvider?: string; // "Contact {providerName}"
  providerDetailsNotAvailable?: string;
  searchServicesPageDescription?: string;
  tryDifferentKeywords?: string;
  noServicesAvailableYet?: string;
  checkBackLater?: string;
  switchToDarkMode?: string;
  switchToLightMode?: string;
  unauthorized?: string;
  loginAsAdmin?: string;
  accessDenied?: string;
  notAuthorizedViewPage?: string;
  adminDashboardDescription?: string;
  paymentApprovalsDescription: string;
  reviewProviderVerifications: string;
  disputeResolutionDescription: string;
  adminDashboardUnavailable?: string;
  logoutFailed?: string;
  goToHomepage?: string;
  redirectingToLogin?: string;
  verifyingUserRole?: string;
  verifyEmailPromptTitle?: string;
  verifyEmailPromptMessage?: string;
  resendVerificationEmail?: string;
  verificationEmailResent?: string;
  checkYourEmail?: string;
  errorResendingVerificationEmail?: string;
  welcomeToDashboardUser?: string;
  welcomeToDashboardProvider?: string;
  welcomeToDashboardSeeker?: string;
  profileDescriptionProvider?: string;
  searchDescriptionSeeker?: string;
  searchHistoryDescriptionSeeker?: string;
  dashboardTaglineProvider?: string;
  dashboardTaglineSeeker?: string;
  dashboardBannerAlt?: string;
  contactPageTitle?: string;
  contactPageDescription?: string;
  yourName?: string;
  yourEmail?: string;
  subject?: string;
  message?: string;
  sendMessage?: string;
  messageSentSuccessTitle?: string;
  messageSentSuccessDescription?: string;
  messageSentErrorTitle?: string;
  messageSentErrorDescription?: string;
  contactFormIntro?: string;
  formSubmitActivationNote?: string;
  tryAgain?: string;
  backToDashboard?: string;
  plumbingDescription?: string;
  electricalDescription?: string;
  carpentryDescription?: string;
  paintingDescription?: string;
  homeCleaningDescription?: string;
  constructionDescription?: string;
  plasteringDescription?: string;
  otherServicesDescription?: string;

  // Rating translations
  reviews?: string;
  averageRating?: string;
  noReviewsYet?: string;
  rateThisProvider?: string;
  rating?: string;
  comment?: string;
  submitRating?: string;
  loginToRate?: string;
  selectRating?: string;
  ratingSubmitted?: string;
  thankYouForFeedback?: string;
  failedSubmitRating?: string;
  providerNotFound?: string;
  providerIdMissing?: string;
  failedLoadProviderDetails?: string;
  firestoreIndexError?: string;
  permissionDeniedError?: string;
  of?: string; // e.g. 4.5 of 5 stars
  viewProfile?: string;

  // Location-based search
  location?: string;
  useCurrentLocation?: string;
  locationSet?: string;
  locationError?: string;
  findNearMe?: string;
  findingLocation?: string;
  sortedByDistance?: string;
  kmAway?: string;
  locationPermissionDenied?: string;
  locationNotSet?: string;
  locationUnavailable?: string;
  locationHelpText?: string;

  // Forgot Password
  forgotPassword?: string;
  forgotPasswordDescription?: string;
  sendResetLink?: string;
  resetLinkSentTitle?: string;
  resetLinkSentDescription?: string; // "Check your email {email} for a link..."
  resetPasswordErrorTitle?: string;
  userNotFound?: string;
  backToLogin?: string;

  // Settings & Account Deletion
  settings: string;
  manageAccountSettings: string;
  dangerZone: string;
  dangerZoneDescription: string;
  deleteAccount: string;
  deleteAccountDescription: string;
  confirmDeleteAccountTitle: string;
  confirmDeleteAccountDescription: string;
  confirmDelete: string;
  accountDeletedTitle: string;
  accountDeletedSuccess: string;
  accountDeletionFailed: string;
  accountDeletionError: string;
  requiresRecentLoginError: string;

  // New Profile Page
  callNow: string;
  contactOnWhatsApp: string;
  aboutProvider: string; // "About {name}"
  specialties: string;

  // Portfolio
  portfolioTitle: string;
  portfolioDescription: string;
  mediaUploadDescription: string;
  uploadMedia: string;
  uploading: string;
  portfolioLimitReachedTitle: string;
  portfolioLimitReachedDescription: string;
  fileTooLargeTitle: string;
  fileTooLargeDescription: string;
  unsupportedFileTypeTitle: string;
  unsupportedFileTypeDescription: string;
  fileUploadedSuccessTitle: string;
  fileUploadErrorTitle: string;
  fileUploadErrorDescription: string;
  storageUnauthorizedError: string;
  storageUnauthorizedDeleteError: string;
  fileDeletedSuccessTitle: string;
  fileDeleteErrorTitle: string;
  fileDeleteErrorDescription: string;
  confirmDeleteFileTitle: string;
  confirmDeleteFileDescription: string;
  noPortfolioItems: string;
  fileNotFoundInStorage?: string;
  imageRejectedTitle?: string;
  imageRejectedDescription?: string;
  videoRejectedTitle?: string;
  videoRejectedDescription?: string;
  analyzingImageTitle?: string;
  analyzingImageDescription?: string;
  analyzingVideoTitle?: string;
  analyzingVideoDescription?: string;
  images: string;
  videos: string;
  portfolioImage: string;
  portfolioVideo: string;
  fullscreenViewOf: string;
  whatsappMessage: string;

  // AI Categorization
  analyzingBioTitle: string;
  analyzingBioDescription: string;
  categoryAutoDetectedTitle: string;
  categoryAutoDetectedDescription: string; // "We've set your primary category to: {category}. You can change it manually if needed."
  aiCategorizationUnavailableTitle: string;
  aiCategorizationUnavailableDescription: string;

  // Messaging
  messages: string;
  messageProvider: string; // "Message {providerName}"
  startChatError: string;
  startConversation: string;
  messageSent: string;
  conversations: string;
  noConversations: string;
  noConversationsDescription: string;
  selectConversation: string;
  selectConversationDescription: string;
  typeYourMessage: string;
  loginToMessage: string;
  you: string;
  image: string;
  video: string;
  audioRecordingNotSupported: string;
  audioRecordingNotSupportedDescription: string;
  microphoneAccessDenied: string;
  microphoneAccessDeniedDescription: string;

  // Settings page > password
  changePassword?: string;
  changePasswordDescription?: string;
  sendResetEmail?: string;
  resetEmailSent?: string;
  resetEmailSentDescription?: string;

  // User Profile Validation
  roleMissingTitle?: string;
  roleMissingDescription?: string;
  profileNotFoundTitle?: string;
  profileNotFoundDescription?: string;

  // Calling
  videoCall?: string;
  audioCall?: string;
  incomingCall?: string;
  isCallingYou?: string; // "{userName} is calling you..."
  accept?: string;
  decline?: string;
  callFailed?: string;
  initiatingCall?: string;
  callAccepted?: string;
  callEnded?: string;
  callHasBeenTerminated?: string;
  connecting?: string;
  ringing?: string;
  mediaAccessDeniedTitle?: string;
  mediaAccessDeniedDescription?: string;
  cameraAccessRequired?: string;
  enableVideoCalls: string;
  enableVideoCallsDescription: string;
  missedCall: string;
  callDeclined: string;
  callDuration: string;
  videoCallLog: string;
  audioCallLog: string;

  // Orders & Payments
  serviceAmount: string;
  enterServiceAmount: string;
  platformCommission: string;
  providerPayout: string;
  myOrders: string;
  myOrdersDescriptionSeeker: string;
  myOrdersDescriptionProvider: string;
  noOrdersYet: string;
  noOrdersYetDescription: string;
  pendingPayment: string;
  paid: string;
  completed: string;
  disputed: string;
  resolved: string;
  paymentApprovals: string;
  paymentRejectedTitle: string;
  paymentRejectedMessage: string;
  paymentPendingTitle: string;
  paymentPendingDescription: string;
  paymentApprovedTitle: string;
  paymentApprovedDescription: string;
  orderCompletedTitle: string; // Renamed from "Service Completed" to avoid conflict
  orderCompletedMessage: string; // "{seekerName} has marked the order as completed. Your funds will be processed."
  orderDisputedTitle: string;
  orderDisputedMessage: string; // "A dispute has been raised for your order with {userName}."
  orderDisputedDescription: string;
  approveManually: string;
  rejectManually: string;
  confirmRejectPaymentTitle: string;
  confirmRejectPaymentDescription: string;
  reject: string;
  rejectionReason: string;
  rejectionReasonPlaceholder: string;
  rejectionFailedTitle: string;
  rejectionSuccessTitle: string;
  rejectionSuccessDescription: string;

  // Request Service Page
  requestService: string;
  requestingServiceFrom: string;
  serviceDescription: string;
  describeJobDetailPlaceholder: string;
  providerWillSeeDescription: string;
  submitRequest: string;
  descriptionRequired: string;
  invalidAmount: string;
  enterValidServiceAmount: string;
  orderCreatedSuccessTitle: string;
  orderCreatedSuccessDescription: string;
  failedToCreateOrder: string;
  loginToRequestService: string;
  backToProfile: string;

  // New keys for order approval flow
  pendingApproval: string;
  orderCreatedAwaitingApprovalDescription: string;
  acceptOrder: string;
  declineOrder: string;
  orderAccepted: string;
  orderDeclined: string;
  orderAcceptedTitle: string;
  orderAcceptedMessage: string;
  orderDeclinedTitle: string;
  orderDeclinedMessage: string;
  orderAcceptedDescription: string;
  orderDeclinedDescription: string;
  statusPendingApprovalTitle: string;
  statusPendingApprovalDescriptionSeeker: string;
  statusPendingApprovalDescriptionProvider: string;
  statusDeclinedTitle: string;
  statusDeclinedDescription: string;

  // Currency
  currency: string;
  USD: string;
  SAR: string;
  EGP: string;
  AED: string;
  QAR: string;

  // FAQ & Ads
  howToUse: string;
  advertiseWithUs: string;
  faqTitle: string;
  faqDescription: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  advertiseTitle: string;
  advertiseDescription: string;
  adInquiryPlaceholder: string;
  advertisement: string;
  adPlaceholderTitle: string;
  adPlaceholderDescription: string;

  // Service Start Date & Grace Period
  proposedStartDate: string;
  selectStartDate: string;
  gracePeriodTitle: string;
  grantGracePeriod: string;
  gracePeriodDescription: string;
  selectGracePeriod: string;
  oneDay: string;
  twoDays: string;
  threeDays: string;
  gracePeriodGranted: string; // "A grace period of {days} day(s) has been granted."
  startService: string;
  serviceStarted: string;
  serviceStartedOn: string; // "Service started on {date}"
  requestRefund: string;
  refundReasonLate: string;
  refundRequested: string;
  refundRequestedDescription: string;
  orderPastDue: string;
  orderPastDueDescription: string;
  serviceStartedTitle: string;
  serviceStartedMessage: string;
  workFinishedTitle: string;
  workFinishedMessage: string;
  statusPendingCompletion: string;
  statusPendingCompletionTitle: string;
  statusPendingCompletionDescriptionSeeker: string;
  statusPendingCompletionDescriptionProvider: string;
  markAsFinished: string;
  confirmCompletion: string;
  reportProblem: string;


  // Notifications
  notifications: string;
  noNotifications: string;
  markAllAsRead: string;
  viewOrder: string;
  newOrderRequestTitle: string;
  newOrderRequestMessage: string; // "{seekerName} has requested your service."
  paymentReceivedTitle: string;
  paymentReceivedMessage: string; // "{seekerName} has paid for the order. You can now start the service."
  allNotifications: string;
  allNotificationsDescription: string;
  noNotificationsYet: string;
  viewAll: string;

  // Proof deletion
  deleteProof: string;
  uploadNewProof: string;
  confirmDeleteProofTitle: string;
  confirmDeleteProofDescription: string;
  proofDeletedSuccessTitle: string;
  proofDeletedSuccessDescription: string;
  deleteFailedTitle: string;
  proofUploaded: string;
  viewProof: string;
  paymentProof: string;
  continue: string;
  contactSupport: string;
  // Ad Requests
  requestSubmittedTitle: string;
  requestSubmittedDescription: string;
  adRequestApprovedTitle: string;
  adRequestApprovedMessage: string;
  adRequestRejectedTitle: string;
  adRequestRejectedMessage: string;
  adRequests: string;
  adRequestsDescription: string;
  pending: string;
  approved: string;
  rejected: string;
  // Support Tickets
  loginToContactSupport: string;
  supportRequestSentTitle: string;
  supportRequestSentDescription: string;
  supportRequestSentSuccess: string;
  requestType: string;
  selectRequestType: string;
  inquiry: string;
  complaint: string;
  paymentIssue: string;
  messageTooShort: string;
  supportRequests: string;
  reviewSupportTickets: string;
  noSupportRequests: string;
  noSupportRequestsDescription: string;
  statusOpen: string;
  statusInProgress: string;
  statusClosed: string;
  markAsInProgress: string;
  markAsClosed: string;
  ticketStatusUpdated: string;
  supportRequestClosedTitle: string;
  supportRequestClosedMessage: string;
  supportRequestClosedWithReplyMessage: string;
  supportRequestInProgressTitle: string;
  supportRequestInProgressMessage: string;
  myAds: string;
  myAdsDescription: string;
  newAdRequest: string;
  noAdRequestsYet: string;
  noAdRequestsYetDescription: string;
  adTitle: string;
  adImage: string;
  uploadImage: string;
  changeImage: string;
  statusPendingReview: string;
  statusPendingPayment: string;
  statusPaymentReview: string;
  statusActive: string;
  statusRejected: string;
  statusPendingReviewDescription: string;
  statusPendingPaymentDescription: string;
  statusPaymentReviewDescription: string;
  statusActiveDescription: string;
  statusRejectedDescription: string;
  uploadPaymentProof: string;
  adPaymentConfirmedTitle: string;
  adPaymentConfirmedMessage: string;
  adPaymentRejectedTitle: string;
  adPaymentRejectedMessage: string;
  adRequestInPaymentReviewMessage: string;

  // Legal
  termsOfService: string;
  privacyPolicy: string;
  termsTitle: string;
  termsDescription: string;
  termsContent: string;
  privacyTitle: string;
  privacyDescription: string;
  privacyContent: string;

  // Verification
  identityVerification: string;
  identityVerificationDescription: string;
  verificationNotSubmitted: string;
  uploadDocuments: string;
  reUploadDocuments: string;
  verificationPendingTitle: string;
  verificationPendingDescription: string;
  verificationVerifiedTitle: string;
  verificationVerifiedDescription: string;
  verificationRejectedTitle: string;
  verificationRejectedDescription: string;
  verificationDocsUploadedTitle: string;
  verificationDocsUploadedDescription: string;
  providerVerifications: string;
  noPendingVerifications: string;
  noPendingVerificationsDescription: string;
  approve: string;
  uploadedDocuments: string;
  confirmRejectVerificationTitle: string;
  confirmRejectVerificationDescription: string;
  verifiedProvider: string;

  // Dispute Management
  disputeResolution: string;
  noDisputes: string;
  noDisputesDescription: string;
  viewDispute: string;
  disputeDetails: string;
  disputeTimeline: string;
  disputeReason: string;
  disputeConversation: string;
  resolution: string;
  adminNotes: string;
  sideWithSeeker: string;
  sideWithProvider: string;
  submitResolution: string;
  confirmResolutionTitle: string;
  confirmResolutionDescription: string;
  resolutionSubmitted: string;
  failedToSubmitResolution: string;
  disputeResolvedTitle: string;
  disputeResolvedSeekerFavorMessage: string;
  disputeResolvedProviderFavorMessage: string;
  orderId: string;
  orderSummary: string;
  amount: string;
  disputedOn: string;
  sendMessageToParties: string;
  explainDecision: string;
  orderCouldNotBeLoaded: string;
  couldNotLoadMessages: string;
  resolutionNotesRequired: string;
  failedToFetchDisputeDetails: string;
  orderIdMissing: string;
  admin: string;
  unknownUser: string;
  partiesInvolved: string;
  messageSeeker: string;

  // AI Ad Generation
  aiAdGenerationTitle: string;
  aiAdGenerationDescription: string;
  primaryService: string;
  primaryServicePlaceholder: string;
  serviceAreasPlaceholderAI: string;
  commaSeparated: string;
  contactInfoOptional: string;
  contactInfoPlaceholder: string;
  keywordsOptional: string;
  keywordsPlaceholder: string;
  generateAd: string;
  reviewAiAd: string;
  reviewAiAdDescription: string;
  adBody: string;
  adImageRequired: string;
  backToEditInfo: string;
  submitForApproval: string;
  aiGenerationFailed: string;
  validationError: string;
  provideServiceType: string;
  provideServiceArea: string;
  profileNameMissing: string;
  imageRequiredForAd: string;
  adImageHint: string;

  // New keys for Ad creation selection
  createNewAd: string;
  chooseAdCreationMethod: string;
  createWithAi: string;
  createWithAiDescription: string;
  createManually: string;
  createManuallyDescription: string;
  startNow: string;
  createAdManually: string;
  loginToSubmitAd: string;
  // New validation messages
  adTitleTooShort: string;
  adTitleTooLong: string;
  adBodyTooShort: string;
};

export const translations: Record<'en' | 'ar', Translations> = {
  en,
  ar,
};
