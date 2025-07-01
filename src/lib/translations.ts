
export type Translations = {
  appName: string;
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
  username: string;
  usernameTaken: string;
  usernameInvalid: string;
  usernameHelpText: string;
  usernameCantBeChanged: string;
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
  paymentApprovals: string;
  paymentPendingTitle: string;
  paymentPendingDescription: string;
  paymentApprovedTitle: string;
  paymentApprovedDescription: string;
  orderCompletedTitle: string;
  orderCompletedDescription: string;
  orderDisputedTitle: string;
  orderDisputedDescription: string;
  
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
  declined: string;
  orderCreatedAwaitingApprovalDescription: string;
  acceptOrder: string;
  declineOrder: string;
  orderAccepted: string;
  orderDeclined: string;
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
};

export const translations: Record<'en' | 'ar', Translations> = {
  en: {
    appName: "Khidmap",
    tagline: "Find the best local service providers",
    home: "Home",
    services: "Services",
    login: "Login",
    register: "Register",
    logout: "Logout",
    profile: "Profile",
    dashboard: "Dashboard",
    language: "Language",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    searchPlaceholder: "Search providers by name, category...",
    search: "Search",
    serviceProviders: "Service Providers",
    serviceSeekers: "Service Seekers",
    registerAs: "Register as",
    provider: "Service Provider",
    seeker: "Service Seeker",
    email: "Email",
    password: "Password",
    name: "Full Name",
    username: "Username",
    usernameTaken: "This username is already taken.",
    usernameInvalid: "3-20 chars, lowercase, numbers, or _ only.",
    usernameHelpText: "Unique, lowercase, numbers, and underscores.",
    usernameCantBeChanged: "Username cannot be changed after registration.",
    qualifications: "About Me / Bio",
    phoneNumber: "Phone Number",
    address: "Address / Service Location",
    serviceAreas: "Service Areas",
    serviceAreasPlaceholder: "e.g., Downtown, North Suburbs (comma-separated)",
    category: "Category",
    plumbing: "Plumbing",
    electrical: "Electrical",
    carpentry: "Carpentry",
    painting: "Painting",
    homeCleaning: "Home Cleaning",
    construction: "Construction",
    plastering: "Plastering",
    other: "Other Services",
    searchHistory: "Search History",
    noResultsFound: "No results found.",
    loading: "Loading...",
    submit: "Submit",
    viewDetails: "View Details",
    errorOccurred: "An error occurred.",
    welcomeTo: "Welcome to",
    findSkilledArtisans: "Find skilled artisans for your needs.",
    orPostYourServices: "Or post your services and reach new customers.",
    getStarted: "Get Started",
    browseServices: "Browse Services",
    joinAsProvider: "Join as a Provider",
    joinAsSeeker: "Join as a Seeker",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    createAccount: "Create Account",
    fillYourProfile: "Fill your profile details",
    serviceDetails: "Service Details",
    contactInfo: "Contact Information",
    saveChanges: "Save Changes",
    profileUpdatedSuccessfully: "Profile updated successfully!",
    selectCategory: "Select Category",
    serviceCategory: "Service Category",
    searchByAddressOrKeyword: "Search by Address or Keyword",
    recentSearches: "Recent Searches",
    clearHistory: "Clear History",
    noHistoryYet: "You have no search history yet.",
    requiredField: "This field is required",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    confirmPassword: "Confirm Password",
    emailVerificationSent: "Email Verification Sent",
    checkYourEmailForVerification: "A verification link has been sent to your email. Please check your inbox (and spam folder) to activate your account.",
    contactUs: "Contact Us",
    adminDashboard: "Admin Dashboard",
    welcomeAdmin: "Welcome, Admin!",
    adminPlaceholder: "This is the admin dashboard. More features coming soon.",
    selectService: "Select Service",
    hidePassword: "Hide password",
    showPassword: "Show password",
    authServiceUnavailable: "Authentication service is currently unavailable. Please try again later or contact support.",
    serviceUnavailableTitle: "Service Unavailable",
    serviceUnavailableMessage: "A core service (like authentication or database) is currently not configured or unavailable. Please try again later or contact support.",
    coreServicesUnavailableDashboard: "Core services are unavailable. The dashboard cannot be loaded at this time. Please try again later or contact support.",
    loginSuccessful: "Login Successful",
    welcomeBackUser: "Welcome back, {userName}!",
    loginFailedGeneric: "Login Failed. Please check your credentials.",
    invalidCredentials: "Invalid email or password. Please try again.",
    networkError: "Network error. Please check your internet connection.",
    loginFailedTitle: "Login Failed",
    registrationFailedGeneric: "Registration Failed. Please try again.",
    emailAlreadyInUse: "This email is already registered. Please login or use a different email.",
    passwordTooWeak: "Password is too weak. Please choose a stronger password.",
    registrationFailedTitle: "Registration Failed",
    userNotAuthenticated: "User not authenticated. Please log in again.",
    userNotIdentified: "User not identified. Please log in again.",
    coreServicesUnavailable: "Core services are not ready or unavailable.",
    providerInfoMissing: "Provider information is missing. Please try again.",
    invalidDate: "Invalid Date",
    delete: "Delete",
    cancel: "Cancel",
    welcome: "Welcome!",
    completeYourProfile: "Please complete your provider profile.",
    couldNotFetchProfile: "Could not fetch profile data.",
    authError: "Authentication Error",
    userNotAuthOrServiceUnavailable: "User not authenticated or service unavailable.",
    profileChangesSaved: "Your profile changes have been saved.",
    failedUpdateProfile: "Failed to update profile.",
    profilePageDescription: "Manage your provider profile details for {appName}.",
    profileEditingUnavailable: "Profile editing is currently unavailable because core services are not configured.",
    profileHelpTextCategory: "Select your primary service category.",
    searchHistoryClearedTitle: "Search History Cleared",
    searchHistoryClearedSuccess: "Your search history has been successfully cleared.",
    searchHistoryPageDescription: "Review your past service searches.",
    confirmClearHistoryTitle: "Are you sure you want to clear your search history?",
    confirmClearHistoryDescription: "This action cannot be undone. This will permanently delete all your search history entries.",
    noHistoryYetDescription: "Your search history is empty. Start searching for services to see them here.",
    searchedOn: "Searched on:",
    repeatSearch: "Repeat Search",
    failedLoadServices: "Failed to load services.",
    backButton: "Back",
    backToSearch: "Back to Search",
    postedOnFull: "Joined on:",
    serviceCategoriesTitle: "Service Categories:",
    servesAreasTitle: "Service Areas",
    contactProvider: "Contact {providerName}",
    providerDetailsNotAvailable: "Provider details are not available.",
    searchServicesPageDescription: "Find skilled artisans by searching by name, service type, or keywords.",
    tryDifferentKeywords: "Try searching with different keywords or check your spelling.",
    noServicesAvailableYet: "No Service Providers Available Yet",
    checkBackLater: "There are currently no service providers registered. Check back later!",
    switchToDarkMode: "Switch to Dark Mode",
    switchToLightMode: "Switch to Light Mode",
    unauthorized: "Unauthorized",
    loginAsAdmin: "Please log in as admin.",
    accessDenied: "Access Denied",
    notAuthorizedViewPage: "You are not authorized to view this page.",
    adminDashboardDescription: "Manage users, services, and application settings.",
    adminDashboardUnavailable: "Admin Dashboard is currently unavailable because core services are not configured.",
    logoutFailed: "Logout Failed",
    goToHomepage: "Go to Homepage",
    redirectingToLogin: "Redirecting to login...",
    verifyingUserRole: "Verifying user role...",
    verifyEmailPromptTitle: "Please verify your email address.",
    verifyEmailPromptMessage: "A verification link was sent to {email}. Check your inbox (and spam folder).",
    resendVerificationEmail: "Resend verification email",
    verificationEmailResent: "Verification Email Resent",
    checkYourEmail: "Please check your email.",
    errorResendingVerificationEmail: "Could not resend verification email.",
    welcomeToDashboardUser: "Welcome to your Dashboard, {userName}!",
    welcomeToDashboardProvider: "Welcome to your Provider Dashboard!",
    welcomeToDashboardSeeker: "Welcome to your Seeker Dashboard!",
    profileDescriptionProvider: "Update your personal and service information.",
    searchDescriptionSeeker: "Find skilled artisans for your needs.",
    searchHistoryDescriptionSeeker: "Review your past service searches.",
    dashboardTaglineProvider: "Manage your profile and connect with customers.",
    dashboardTaglineSeeker: "Find and rate the best services for your needs.",
    dashboardBannerAlt: "Dashboard banner with tools or workspace imagery",
    contactPageTitle: "Contact Us",
    contactPageDescription: "Have questions or feedback? Reach out to us!",
    yourName: "Your Name",
    yourEmail: "Your Email",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send Message",
    messageSentSuccessTitle: "Message Sent!",
    messageSentSuccessDescription: "Thank you for your message. We'll get back to you soon.",
    messageSentErrorTitle: "Error Sending Message",
    messageSentErrorDescription: "Sorry, there was an issue sending your message. Please try again later.",
    contactFormIntro: "We'd love to hear from you! Please fill out the form below and we'll get in touch as soon as possible.",
    formSubmitActivationNote: "Note: For this form to work, the owner of mobusinessarena@gmail.com needs to activate it once via an email from FormSubmit.co after the first submission attempt.",
    tryAgain: "Try Again",
    backToDashboard: "Back to Dashboard",
    plumbingDescription: "Expert plumbing services for repairs, installations, and maintenance.",
    electricalDescription: "Safe and reliable electrical solutions for your home and business.",
    carpentryDescription: "Skilled carpentry for furniture, repairs, and custom projects.",
    paintingDescription: "Professional painting services for a fresh new look.",
    homeCleaningDescription: "Reliable home cleaning services for a spotless living space.",
    constructionDescription: "Comprehensive construction services from foundation to finish.",
    plasteringDescription: "Quality plastering for smooth and durable walls and ceilings.",
    otherServicesDescription: "Various other services to meet your unique needs.",
    reviews: "Reviews",
    averageRating: "Average Rating",
    noReviewsYet: "No reviews yet",
    rateThisProvider: "Rate this Provider",
    rating: "Your Rating",
    comment: "Your Comment (optional)",
    submitRating: "Submit Rating",
    loginToRate: "You must be logged in to submit a rating.",
    selectRating: "Please select a star rating before submitting.",
    ratingSubmitted: "Rating Submitted",
    thankYouForFeedback: "Thank you for your feedback!",
    failedSubmitRating: "Failed to submit rating.",
    providerNotFound: "Provider not found.",
    providerIdMissing: "Provider ID is missing from the request.",
    failedLoadProviderDetails: "Failed to load provider details.",
    firestoreIndexError: "The database is being updated to support this query. Please try again in a few minutes.",
    permissionDeniedError: "Access Denied. You do not have permission to view this information. This may be due to a misconfiguration of database security rules.",
    of: "of",
    viewProfile: "View Profile",
    location: "Location",
    useCurrentLocation: "Use My Current Location",
    locationSet: "Location has been set.",
    locationError: "Could not get location.",
    findNearMe: "Find Near Me",
    findingLocation: "Finding your location...",
    sortedByDistance: "Results sorted by distance from you.",
    kmAway: "{distance} km away",
    locationPermissionDenied: "Location permission denied. Please enable it in your browser settings.",
    locationNotSet: "Location not set",
    locationUnavailable: "Location information is not available in this browser.",
    locationHelpText: "Set your location to appear in proximity searches.",
    forgotPassword: "Forgot Password",
    forgotPasswordDescription: "Enter your email address and we'll send you a link to reset your password.",
    sendResetLink: "Send Reset Link",
    resetLinkSentTitle: "Reset Link Sent",
    resetLinkSentDescription: "Check your email at {email} for a link to reset your password. If it doesn't appear, check your spam folder.",
    resetPasswordErrorTitle: "Error Sending Link",
    userNotFound: "No user found with this email address.",
    backToLogin: "Back to Login",
    settings: "Settings",
    manageAccountSettings: "Manage your account and site settings.",
    dangerZone: "Danger Zone",
    dangerZoneDescription: "These actions are permanent and cannot be undone.",
    deleteAccount: "Delete Account",
    deleteAccountDescription: "Permanently delete your account and all associated data.",
    confirmDeleteAccountTitle: "Are you absolutely sure?",
    confirmDeleteAccountDescription: "This action cannot be undone. This will permanently delete your account, profile, and all other associated data from our servers.",
    confirmDelete: "Yes, delete my account",
    accountDeletedTitle: "Account Deleted",
    accountDeletedSuccess: "Your account has been permanently deleted.",
    accountDeletionFailed: "Account Deletion Failed",
    accountDeletionError: "An error occurred while deleting your account. Please try again.",
    requiresRecentLoginError: "This is a sensitive operation and requires recent authentication. Please log out and log back in before trying again.",
    callNow: "Call Now",
    contactOnWhatsApp: "WhatsApp",
    aboutProvider: "About {name}",
    specialties: "Specialties",
    portfolioTitle: "Portfolio",
    portfolioDescription: "Manage your work portfolio. Upload up to 5 images or videos.",
    mediaUploadDescription: "Max 10MB per file. Supported: JPG, PNG, WEBP, MP4, MOV.",
    uploadMedia: "Upload Media",
    uploading: "Uploading...",
    portfolioLimitReachedTitle: "Portfolio Limit Reached",
    portfolioLimitReachedDescription: "You can upload a maximum of 5 files.",
    fileTooLargeTitle: "File Too Large",
    fileTooLargeDescription: "File size cannot exceed {size}.",
    unsupportedFileTypeTitle: "Unsupported File Type",
    unsupportedFileTypeDescription: "Please upload a supported image or video file (JPG, PNG, MP4, etc.).",
    fileUploadedSuccessTitle: "File Uploaded",
    fileUploadErrorTitle: "Upload Error",
    fileUploadErrorDescription: "There was an error uploading your file. Please try again.",
    storageUnauthorizedError: "Permission Denied. Please check your Firebase Storage security rules to allow uploads for authenticated users.",
    storageUnauthorizedDeleteError: "Permission Denied. Please ensure your Firebase Storage security rules allow deleting files.",
    fileDeletedSuccessTitle: "File Deleted",
    fileDeleteErrorTitle: "Deletion Error",
    fileDeleteErrorDescription: "Could not delete the file. Please try again.",
    confirmDeleteFileTitle: "Delete File?",
    confirmDeleteFileDescription: "Are you sure you want to delete this file from your portfolio? This action cannot be undone.",
    noPortfolioItems: "No portfolio items have been uploaded yet.",
    fileNotFoundInStorage: "File not found. It may have already been deleted.",
    imageRejectedTitle: "Image Rejected",
    imageRejectedDescription: "This image was rejected for violating our content safety policy. Please upload a different image.",
    videoRejectedTitle: "Video Rejected",
    videoRejectedDescription: "This video was rejected for violating our content safety policy. Please upload a different video.",
    analyzingImageTitle: "Analyzing Image...",
    analyzingImageDescription: "Please wait while we check the image for safety.",
    analyzingVideoTitle: "Analyzing Video...",
    analyzingVideoDescription: "Please wait while we check the video for safety.",
    messages: "Messages",
    messageProvider: "Message {providerName}",
    startChatError: "Error starting chat",
    startConversation: "Start Conversation",
    messageSent: "Message Sent",
    conversations: "Conversations",
    noConversations: "No conversations yet.",
    noConversationsDescription: "Find a service provider to start a new conversation.",
    selectConversation: "Select a conversation",
    selectConversationDescription: "Choose a conversation from the list to see messages.",
    typeYourMessage: "Type your message...",
    loginToMessage: "You must be logged in to send messages.",
    you: "You",
    image: "Image",
    video: "Video",
    audioRecordingNotSupported: "Audio Recording Not Supported",
    audioRecordingNotSupportedDescription: "Your browser does not support audio recording.",
    microphoneAccessDenied: "Microphone Access Denied",
    microphoneAccessDeniedDescription: "Please enable microphone access in your browser settings.",
    changePassword: "Password Management",
    changePasswordDescription: "To change your password, we will send a secure reset link to your email address.",
    sendResetEmail: "Send Password Reset Email",
    resetEmailSent: "Password Reset Email Sent",
    resetEmailSentDescription: "A password reset link has been sent to {email}.",
    roleMissingTitle: "User Role Missing",
    roleMissingDescription: "Your user profile is incomplete. Please contact support or try registering again.",
    profileNotFoundTitle: "Profile Not Found",
    profileNotFoundDescription: "Your user profile could not be found. Logging you out for security.",
    videoCall: "Video Call",
    audioCall: "Audio Call",
    incomingCall: "Incoming Call",
    isCallingYou: "is calling you...",
    accept: "Accept",
    decline: "Decline",
    callFailed: "Call Failed",
    initiatingCall: "Initiating Call...",
    callAccepted: "Call Accepted",
    callEnded: "Call Ended",
    callHasBeenTerminated: "The call has been terminated.",
    connecting: "Connecting...",
    ringing: "Ringing...",
    mediaAccessDeniedTitle: "Media Access Denied",
    mediaAccessDeniedDescription: "Please enable camera and microphone permissions in your browser to make calls.",
    cameraAccessRequired: "Camera access is required to display your video.",
    enableVideoCalls: "Enable Video Calls",
    enableVideoCallsDescription: "Allow other users to start video calls with you.",
    missedCall: "Missed call",
    callDeclined: "Call declined",
    callDuration: "Call duration",
    videoCallLog: "Video call",
    audioCallLog: "Audio call",
    serviceAmount: "Service Amount",
    enterServiceAmount: "Enter the amount agreed upon with the provider.",
    platformCommission: "Platform Commission",
    providerPayout: "Provider Payout",
    myOrders: "My Orders",
    myOrdersDescriptionSeeker: "Track and manage your service orders.",
    myOrdersDescriptionProvider: "View and manage your incoming job orders.",
    noOrdersYet: "No Orders Yet",
    noOrdersYetDescription: "When you request a service, it will appear here.",
    pendingPayment: "Pending Payment",
    paid: "Paid",
    completed: "Completed",
    disputed: "Disputed",
    paymentApprovals: "Payment Approvals",
    paymentPendingTitle: "Payment Pending",
    paymentPendingDescription: "The seeker needs to upload proof of payment.",
    paymentApprovedTitle: "Payment Approved",
    paymentApprovedDescription: "The service provider can now begin the work.",
    orderCompletedTitle: "Order Completed",
    orderCompletedDescription: "This service has been successfully completed.",
    orderDisputedTitle: "Order Disputed",
    orderDisputedDescription: "There is an issue with this order. Admin will investigate.",
    requestService: "Request Service",
    requestingServiceFrom: "Requesting Service from",
    serviceDescription: "Service Description",
    describeJobDetailPlaceholder: "Please describe the job you need done in detail...",
    providerWillSeeDescription: "The provider will see this description. Be as clear as possible.",
    submitRequest: "Submit Request",
    descriptionRequired: "Description Required",
    invalidAmount: "Invalid Amount",
    enterValidServiceAmount: "Please enter a valid service amount.",
    orderCreatedSuccessTitle: "Order Created Successfully!",
    orderCreatedSuccessDescription: "Your request has been sent. You will now be redirected to the order page.",
    failedToCreateOrder: "Failed to Create Order",
    loginToRequestService: "Please log in to request a service.",
    backToProfile: "Back to Profile",
    pendingApproval: "Pending Approval",
    declined: "Declined",
    orderCreatedAwaitingApprovalDescription: "Your request has been sent to the provider. You will be notified when they respond.",
    acceptOrder: "Accept Order",
    declineOrder: "Decline Order",
    orderAccepted: "Order Accepted",
    orderDeclined: "Order Declined",
    orderAcceptedDescription: "The provider has accepted your request. The seeker will now proceed with payment.",
    orderDeclinedDescription: "You have declined this service request.",
    statusPendingApprovalTitle: "Waiting for Provider Approval",
    statusPendingApprovalDescriptionSeeker: "The service provider is reviewing your request. You will be notified once they respond.",
    statusPendingApprovalDescriptionProvider: "A new service has been requested. Review the details and accept or decline.",
    statusDeclinedTitle: "Order Declined",
    statusDeclinedDescription: "This order request was declined.",
    currency: "Currency",
    USD: "US Dollar",
    SAR: "Saudi Riyal",
    EGP: "Egyptian Pound",
    AED: "UAE Dirham",
    QAR: "Qatari Riyal",
    howToUse: "How to Use",
    advertiseWithUs: "Advertise with Us",
    faqTitle: "Frequently Asked Questions",
    faqDescription: "Find answers to common questions about using Khidmap.",
    faqQ1: "How do I find a service provider?",
    faqA1: "Use the search bar on the 'Services' page. You can search by service type (e.g., 'plumbing'), name, or use the 'Find Near Me' button to see providers closest to you.",
    faqQ2: "How do I register as a service provider?",
    faqA2: "Click the 'Register' button on the homepage, choose 'Service Provider' during registration, and then fill out your profile from the dashboard. A complete profile with photos and a good bio attracts more customers.",
    faqQ3: "How does the payment system work?",
    faqA3: "After you request a service and the provider accepts, you'll be prompted to make payment and upload proof. We notify the provider once payment is approved, and they can begin the work.",
    faqQ4: "What if I have a problem with a service?",
    faqA4: "If you are not satisfied with the service, do not mark the order as 'Completed'. Instead, use the 'Report a Problem' button on the order details page. This will mark the order as 'Disputed', and our support team will investigate the issue.",
    advertiseTitle: "Advertise with Us",
    advertiseDescription: "Reach thousands of potential customers. Fill out the form below to inquire about our advertising options.",
    adInquiryPlaceholder: "Tell us about your business and what you'd like to advertise...",
    advertisement: "Advertisement",
    adPlaceholderTitle: "Your Ad Here",
    adPlaceholderDescription: "Promote your service or product to a targeted audience of users looking for solutions.",
  },
  ar: {
    appName: "خدماب",
    tagline: "ابحث عن أفضل مقدمي الخدمات المحليين",
    home: "الرئيسية",
    services: "الخدمات",
    login: "تسجيل الدخول",
    register: "تسجيل",
    logout: "تسجيل الخروج",
    profile: "الملف الشخصي",
    dashboard: "لوحة التحكم",
    language: "اللغة",
    theme: "المظهر",
    lightMode: "الوضع النهاري",
    darkMode: "الوضع الليلي",
    searchPlaceholder: "ابحث عن مقدمي خدمة بالاسم، الفئة...",
    search: "بحث",
    serviceProviders: "مقدمو الخدمات",
    serviceSeekers: "الباحثون عن الخدمات",
    registerAs: "تسجيل كـ",
    provider: "مقدم خدمة",
    seeker: "باحث عن خدمة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم الكامل",
    username: "اسم المستخدم",
    usernameTaken: "اسم المستخدم هذا مأخوذ بالفعل.",
    usernameInvalid: "3-20 حرفًا، أحرف صغيرة، أرقام، أو _ فقط.",
    usernameHelpText: "فريد، أحرف صغيرة، أرقام، وشرطات سفلية.",
    usernameCantBeChanged: "لا يمكن تغيير اسم المستخدم بعد التسجيل.",
    qualifications: "عني / نبذة تعريفية",
    phoneNumber: "رقم الهاتف",
    address: "العنوان / موقع الخدمة",
    serviceAreas: "مناطق الخدمة",
    serviceAreasPlaceholder: "مثال: وسط المدينة، الحي الشمالي (مفصولة بفاصلة)",
    category: "الفئة",
    plumbing: "سباكة",
    electrical: "كهرباء",
    carpentry: "نجارة",
    painting: "دهان",
    homeCleaning: "تنظيف منازل",
    construction: "بناء",
    plastering: "محارة",
    other: "خدمات أخرى",
    searchHistory: "سجل البحث",
    noResultsFound: "لم يتم العثور على نتائج.",
    loading: "جاري التحميل...",
    submit: "إرسال",
    viewDetails: "عرض التفاصيل",
    errorOccurred: "حدث خطأ.",
    welcomeTo: "مرحباً بك في",
    findSkilledArtisans: "ابحث عن حرفيين ماهرين لاحتياجاتك.",
    orPostYourServices: "أو انشر خدماتك وتواصل مع عملاء جدد.",
    getStarted: "ابدأ الآن",
    browseServices: "تصفح الخدمات",
    joinAsProvider: "انضم كمقدم خدمة",
    joinAsSeeker: "انضم كباحث عن خدمة",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    dontHaveAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    fillYourProfile: "املأ بيانات ملفك الشخصي",
    serviceDetails: "تفاصيل الخدمة",
    contactInfo: "معلومات الاتصال",
    saveChanges: "حفظ التغييرات",
    profileUpdatedSuccessfully: "تم تحديث الملف الشخصي بنجاح!",
    selectCategory: "اختر الفئة",
    serviceCategory: "فئة الخدمة",
    searchByAddressOrKeyword: "ابحث بالعنوان أو كلمة مفتاحية",
    recentSearches: "عمليات البحث الأخيرة",
    clearHistory: "مسح السجل",
    noHistoryYet: "ليس لديك سجل بحث حتى الآن.",
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "عنوان بريد إلكتروني غير صالح",
    passwordTooShort: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين",
    confirmPassword: "تأكيد كلمة المرور",
    emailVerificationSent: "تم إرسال رسالة التحقق",
    checkYourEmailForVerification: "تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد (ومجلد الرسائل غير المرغوب فيها) لتفعيل حسابك.",
    contactUs: "اتصل بنا",
    adminDashboard: "لوحة تحكم المسؤول",
    welcomeAdmin: "مرحباً أيها المسؤول!",
    adminPlaceholder: "هذه هي لوحة تحكم المسؤول. المزيد من الميزات قريباً.",
    selectService: "اختر خدمة",
    hidePassword: "إخفاء كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    authServiceUnavailable: "خدمة المصادقة غير متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا أو الاتصال بالدعم.",
    serviceUnavailableTitle: "الخدمة غير متوفرة",
    serviceUnavailableMessage: "إحدى الخدمات الأساسية (مثل المصادقة أو قاعدة البيانات) غير مهيأة حاليًا أو غير متاحة. يرجى المحاولة مرة أخرى لاحقًا أو الاتصال بالدعم.",
    coreServicesUnavailableDashboard: "الخدمات الأساسية غير متوفرة. لا يمكن تحميل لوحة التحكم في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقًا أو الاتصال بالدعم.",
    loginSuccessful: "تم تسجيل الدخول بنجاح",
    welcomeBackUser: "مرحباً بعودتك، {userName}!",
    loginFailedGeneric: "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.",
    invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صالحة. حاول مرة اخرى.",
    networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.",
    loginFailedTitle: "فشل تسجيل الدخول",
    registrationFailedGeneric: "فشل التسجيل. حاول مرة اخرى.",
    emailAlreadyInUse: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد إلكتروني مختلف.",
    passwordTooWeak: "كلمة المرور ضعيفة جدًا. يرجى اختيار كلمة مرور أقوى.",
    registrationFailedTitle: "فشل التسجيل",
    userNotAuthenticated: "المستخدم غير مصادق عليه. يرجى تسجيل الدخول مرة أخرى.",
    userNotIdentified: "لم يتم التعرف على المستخدم. يرجى تسجيل الدخول مرة أخرى.",
    coreServicesUnavailable: "الخدمات الأساسية غير جاهزة أو غير متاحة.",
    providerInfoMissing: "معلومات مقدم الخدمة مفقودة. يرجى المحاولة مرة أخرى.",
    invalidDate: "تاريخ غير صالح",
    delete: "حذف",
    cancel: "إلغاء",
    welcome: "مرحباً!",
    completeYourProfile: "يرجى إكمال ملف تعريف المزود الخاص بك.",
    couldNotFetchProfile: "تعذر جلب بيانات الملف الشخصي.",
    authError: "خطأ في المصادقة",
    userNotAuthOrServiceUnavailable: "المستخدم غير مصادق عليه أو الخدمة غير متوفرة.",
    profileChangesSaved: "تم حفظ تغييرات ملفك الشخصي.",
    failedUpdateProfile: "فشل تحديث الملف الشخصي.",
    profilePageDescription: "إدارة تفاصيل ملف تعريف المزود الخاص بك لـ {appName}.",
    profileEditingUnavailable: "تعديل الملف الشخصي غير متاح حاليًا لأن الخدمات الأساسية غير مهيأة.",
    profileHelpTextCategory: "اختر فئة خدمتك الأساسية.",
    searchHistoryClearedTitle: "تم مسح سجل البحث",
    searchHistoryClearedSuccess: "تم مسح سجل البحث الخاص بك بنجاح.",
    searchHistoryPageDescription: "مراجعة عمليات بحثك السابقة عن الخدمات.",
    confirmClearHistoryTitle: "هل أنت متأكد أنك تريد مسح سجل البحث الخاص بك؟",
    confirmClearHistoryDescription: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف جميع إدخالات سجل البحث الخاصة بك نهائيًا.",
    noHistoryYetDescription: "سجل البحث الخاص بك فارغ. ابدأ البحث عن الخدمات لرؤيتها هنا.",
    searchedOn: "بحث في:",
    repeatSearch: "إعادة البحث",
    failedLoadServices: "فشل تحميل الخدمات.",
    backButton: "رجوع",
    backToSearch: "العودة إلى البحث",
    postedOnFull: "انضم في:",
    serviceCategoriesTitle: "فئات الخدمة:",
    servesAreasTitle: "يخدم في المناطق",
    contactProvider: "اتصل بـ {providerName}",
    providerDetailsNotAvailable: "تفاصيل المزود غير متوفرة.",
    searchServicesPageDescription: "ابحث عن حرفيين ماهرين من خلال البحث بالاسم أو نوع الخدمة أو الكلمات المفتاحية.",
    tryDifferentKeywords: "حاول البحث بكلمات مفتاحية مختلفة أو تحقق من التهجئة.",
    noServicesAvailableYet: "لا يوجد مقدمو خدمات متاحون بعد",
    checkBackLater: "لا يوجد حاليًا مقدمو خدمات مسجلون. تحقق مرة أخرى لاحقًا!",
    switchToDarkMode: "التحول إلى الوضع الداكن",
    switchToLightMode: "التحول إلى الوضع الفاتح",
    unauthorized: "غير مصرح به",
    loginAsAdmin: "يرجى تسجيل الدخول كمسؤول.",
    accessDenied: "تم رفض الوصول",
    notAuthorizedViewPage: "أنت غير مصرح لك بعرض هذه الصفحة.",
    adminDashboardDescription: "إدارة المستخدمين والخدمات وإعدادات التطبيق.",
    adminDashboardUnavailable: "لوحة تحكم المسؤول غير متاحة حاليًا لأن الخدمات الأساسية غير مهيأة.",
    logoutFailed: "فشل تسجيل الخروج",
    goToHomepage: "اذهب إلى الصفحة الرئيسية",
    redirectingToLogin: "جاري التوجيه إلى صفحة تسجيل الدخول...",
    verifyingUserRole: "جاري التحقق من دور المستخدم...",
    verifyEmailPromptTitle: "يرجى التحقق من عنوان بريدك الإلكتروني.",
    verifyEmailPromptMessage: "تم إرسال رابط التحقق إلى {email}. تحقق من بريدك الوارد (ومجلد الرسائل غير المرغوب فيها).",
    resendVerificationEmail: "إعادة إرسال بريد التحقق",
    verificationEmailResent: "تم إعادة إرسال بريد التحقق",
    checkYourEmail: "يرجى التحقق من بريدك الإلكتروني.",
    errorResendingVerificationEmail: "تعذر إعادة إرسال بريد التحقق.",
    welcomeToDashboardUser: "مرحباً بك في لوحة التحكم الخاصة بك، {userName}!",
    welcomeToDashboardProvider: "مرحباً بك في لوحة تحكم مقدم الخدمة!",
    welcomeToDashboardSeeker: "مرحباً بك في لوحة تحكم الباحث عن خدمة!",
    dashboardTaglineProvider: "إدارة ملفك الشخصي والتواصل مع العملاء.",
    dashboardTaglineSeeker: "ابحث عن أفضل الخدمات وقيمها لاحتياجاتك.",
    dashboardBannerAlt: "بانر لوحة التحكم مع أدوات أو صور لمساحة عمل",
    contactPageTitle: "اتصل بنا",
    contactPageDescription: "هل لديك أسئلة أو ملاحظات؟ تواصل معنا!",
    yourName: "اسمك",
    yourEmail: "بريدك الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    messageSentSuccessTitle: "تم إرسال الرسالة!",
    messageSentSuccessDescription: "شكراً لك على رسالتك. سنعود إليك قريباً.",
    messageSentErrorTitle: "خطأ في إرسال الرسالة",
    messageSentErrorDescription: "عذراً، حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى لاحقاً.",
    contactFormIntro: "يسعدنا أن نسمع منك! يرجى ملء النموذج أدناه وسنتواصل معك في أقرب وقت ممكن.",
    formSubmitActivationNote: "ملاحظة: لكي يعمل هذا النموذج، يحتاج مالك mobusinessarena@gmail.com إلى تفعيله مرة واحدة عبر بريد إلكتروني من FormSubmit.co بعد أول محاولة إرسال.",
    tryAgain: "حاول مرة أخرى",
    backToDashboard: "العودة إلى لوحة التحكم",
    plumbingDescription: "خدمات سباكة متخصصة للإصلاحات والتركيبات والصيانة.",
    electricalDescription: "حلول كهربائية آمنة وموثوقة لمنزلك وعملك.",
    carpentryDescription: "أعمال نجارة ماهرة للأثاث والإصلاحات والمشاريع المخصصة.",
    paintingDescription: "خدمات دهان احترافية لمظهر جديد منعش.",
    homeCleaningDescription: "خدمات تنظيف منازل موثوقة لمساحة معيشة نظيفة.",
    constructionDescription: "خدمات بناء شاملة من الأساس وحتى التشطيب.",
    plasteringDescription: "أعمال محارة عالية الجودة لجدران وأسقف ناعمة ومتينة.",
    otherServicesDescription: "خدمات أخرى متنوعة لتلبية احتياجاتك الفريدة.",
    reviews: "التقييمات",
    averageRating: "متوسط التقييم",
    noReviewsYet: "لا توجد تقييمات بعد",
    rateThisProvider: "قيم هذا المزود",
    rating: "تقييمك",
    comment: "تعليقك (اختياري)",
    submitRating: "إرسال التقييم",
    loginToRate: "يجب عليك تسجيل الدخول لتقديم تقييم.",
    selectRating: "يرجى تحديد تقييم بالنجوم قبل الإرسال.",
    ratingSubmitted: "تم إرسال التقييم",
    thankYouForFeedback: "شكرا لك على ملاحظاتك!",
    failedSubmitRating: "فشل إرسال التقييم.",
    providerNotFound: "لم يتم العثور على مقدم الخدمة.",
    providerIdMissing: "معرف مقدم الخدمة مفقود من الطلب.",
    failedLoadProviderDetails: "فشل تحميل تفاصيل مقدم الخدمة.",
    firestoreIndexError: "قاعدة البيانات قيد التحديث لدعم هذا الاستعلام. يرجى المحاولة مرة أخرى خلال بضع دقائق.",
    permissionDeniedError: "تم رفض الوصول. ليس لديك إذن لعرض هذه المعلومات. قد يكون هذا بسبب خطأ في تكوين قواعد أمان قاعدة البيانات.",
    of: "من",
    viewProfile: "عرض الملف الشخصي",
    location: "الموقع",
    useCurrentLocation: "استخدام موقعي الحالي",
    locationSet: "تم تحديد الموقع.",
    locationError: "تعذر الحصول على الموقع.",
    findNearMe: "البحث بالقرب مني",
    findingLocation: "جاري تحديد موقعك...",
    sortedByDistance: "تم ترتيب النتائج حسب المسافة منك.",
    kmAway: "يبعد {distance} كم",
    locationPermissionDenied: "تم رفض إذن تحديد الموقع. يرجى تمكينه في إعدادات المتصفح.",
    locationNotSet: "الموقع غير محدد",
    locationUnavailable: "معلومات الموقع غير متوفرة في هذا المتصفح.",
    locationHelpText: "حدد موقعك للظهور في عمليات البحث القريبة.",
    forgotPassword: "هل نسيت كلمة المرور",
    forgotPasswordDescription: "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.",
    sendResetLink: "إرسال رابط إعادة التعيين",
    resetLinkSentTitle: "تم إرسال رابط إعادة التعيين",
    resetLinkSentDescription: "تحقق من بريدك الإلكتروني على {email} للحصول على رابط لإعادة تعيين كلمة المرور. إذا لم يظهر، تحقق من مجلد الرسائل غير المرغوب فيها.",
    resetPasswordErrorTitle: "خطأ في إرسال الرابط",
    userNotFound: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني.",
    backToLogin: "العودة إلى تسجيل الدخول",
    settings: "الإعدادات",
    manageAccountSettings: "إدارة حسابك وإعدادات الموقع.",
    dangerZone: "منطقة الخطر",
    dangerZoneDescription: "هذه الإجراءات دائمة ولا يمكن التراجع عنها.",
    deleteAccount: "حذف الحساب",
    deleteAccountDescription: "حذف حسابك وجميع البيانات المرتبطة به بشكل دائم.",
    confirmDeleteAccountTitle: "هل أنت متأكد تمامًا؟",
    confirmDeleteAccountDescription: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك وملفك الشخصي وجميع البيانات الأخرى المرتبطة به بشكل دائم من خوادمنا.",
    confirmDelete: "نعم، احذف حسابي",
    accountDeletedTitle: "تم حذف الحساب",
    accountDeletedSuccess: "تم حذف حسابك بشكل دائم.",
    accountDeletionFailed: "فشل حذف الحساب",
    accountDeletionError: "حدث خطأ أثناء حذف حسابك. يرجى المحاولة مرة أخرى.",
    requiresRecentLoginError: "هذه عملية حساسة وتتطلب مصادقة حديثة. يرجى تسجيل الخروج ثم تسجيل الدخول مرة أخرى قبل المحاولة مرة أخرى.",
    callNow: "اتصل الآن",
    contactOnWhatsApp: "واتساب",
    aboutProvider: "عن {name}",
    specialties: "التخصصات",
    portfolioTitle: "معرض الأعمال",
    portfolioDescription: "إدارة معرض أعمالك. يمكنك رفع حتى 5 صور أو مقاطع فيديو.",
    mediaUploadDescription: "الحد الأقصى 10 ميجابايت للملف. الصيغ المدعومة: JPG, PNG, WEBP, MP4, MOV.",
    uploadMedia: "رفع ملف",
    uploading: "جاري الرفع...",
    portfolioLimitReachedTitle: "تم الوصول للحد الأقصى",
    portfolioLimitReachedDescription: "يمكنك رفع 5 ملفات كحد أقصى.",
    fileTooLargeTitle: "الملف كبير جدًا",
    fileTooLargeDescription: "حجم الملف لا يمكن أن يتجاوز {size}.",
    unsupportedFileTypeTitle: "نوع الملف غير مدعوم",
    unsupportedFileTypeDescription: "يرجى رفع ملف صورة أو فيديو مدعوم (JPG, PNG, MP4, etc.).",
    fileUploadedSuccessTitle: "تم رفع الملف",
    fileUploadErrorTitle: "خطأ في الرفع",
    fileUploadErrorDescription: "حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.",
    storageUnauthorizedError: "تم رفض الإذن. يرجى التحقق من قواعد أمان Firebase Storage للسماح بالتحميل للمستخدمين الموثوقين.",
    storageUnauthorizedDeleteError: "تم رفض الإذن. يرجى التأكد من أن قواعد أمان Firebase Storage تسمح بحذف الملفات.",
    fileDeletedSuccessTitle: "تم حذف الملف",
    fileDeleteErrorTitle: "خطأ في الحذف",
    fileDeleteErrorDescription: "تعذر حذف الملف. يرجى المحاولة مرة أخرى.",
    confirmDeleteFileTitle: "حذف الملف؟",
    confirmDeleteFileDescription: "هل أنت متأكد من حذف هذا الملف من معرض أعمالك؟ لا يمكن التراجع عن هذا الإجراء.",
    noPortfolioItems: "لم يتم رفع أي عناصر في معرض الأعمال بعد.",
    fileNotFoundInStorage: "لم يتم العثور على الملف. ربما تم حذفه بالفعل.",
    imageRejectedTitle: "تم رفض الصورة",
    imageRejectedDescription: "تم رفض هذه الصورة لمخالفتها سياسة المحتوى الآمن. يرجى رفع صورة مختلفة.",
    videoRejectedTitle: "تم رفض الفيديو",
    videoRejectedDescription: "تم رفض هذا الفيديو لمخالفته سياسة المحتوى الآمن. يرجى رفع فيديو مختلف.",
    analyzingImageTitle: "جاري تحليل الصورة...",
    analyzingImageDescription: "يرجى الانتظار بينما نتحقق من سلامة الصورة.",
    analyzingVideoTitle: "جاري تحليل الفيديو...",
    analyzingVideoDescription: "يرجى الانتظار بينما نتحقق من سلامة الفيديو.",
    messages: "الرسائل",
    messageProvider: "مراسلة {providerName}",
    startChatError: "خطأ في بدء المحادثة",
    startConversation: "بدء محادثة",
    messageSent: "تم إرسال الرسالة",
    conversations: "المحادثات",
    noConversations: "لا توجد محادثات بعد.",
    noConversationsDescription: "ابحث عن مقدم خدمة لبدء محادثة جديدة.",
    selectConversation: "اختر محادثة",
    selectConversationDescription: "اختر محادثة من القائمة لرؤية الرسائل.",
    typeYourMessage: "اكتب رسالتك...",
    loginToMessage: "يجب عليك تسجيل الدخول لإرسال الرسائل.",
    you: "أنت",
    image: "صورة",
    video: "فيديو",
    audioRecordingNotSupported: "تسجيل الصوت غير مدعوم",
    audioRecordingNotSupportedDescription: "متصفحك لا يدعم تسجيل الصوت.",
    microphoneAccessDenied: "تم رفض الوصول إلى الميكروفون",
    microphoneAccessDeniedDescription: "يرجى تمكين الوصول إلى الميكروفون في إعدادات المتصفح.",
    changePassword: "إدارة كلمة المرور",
    changePasswordDescription: "لتغيير كلمة المرور الخاصة بك، سنرسل رابط إعادة تعيين آمن إلى عنوان بريدك الإلكتروني.",
    sendResetEmail: "إرسال بريد إعادة تعيين كلمة المرور",
    resetEmailSent: "تم إرسال بريد إعادة تعيين كلمة المرور",
    resetEmailSentDescription: "تم إرسال رابط إعادة تعيين كلمة المرور إلى {email}.",
    roleMissingTitle: "دور المستخدم مفقود",
    roleMissingDescription: "ملفك الشخصي غير مكتمل. يرجى الاتصال بالدعم أو محاولة التسجيل مرة أخرى.",
    profileNotFoundTitle: "لم يتم العثور على الملف الشخصي",
    profileNotFoundDescription: "لم يتم العثور على ملفك الشخصي. جاري تسجيل خروجك للأمان.",
    videoCall: "مكالمة فيديو",
    audioCall: "مكالمة صوتية",
    incomingCall: "مكالمة واردة",
    isCallingYou: "يتصل بك...",
    accept: "قبول",
    decline: "رفض",
    callFailed: "فشل الاتصال",
    initiatingCall: "جاري بدء المكالمة...",
    callAccepted: "تم قبول المكالمة",
    callEnded: "انتهت المكالمة",
    callHasBeenTerminated: "تم إنهاء المكالمة.",
    connecting: "جاري الاتصال...",
    ringing: "جاري الرنين...",
    mediaAccessDeniedTitle: "تم رفض الوصول إلى الوسائط",
    mediaAccessDeniedDescription: "يرجى تمكين أذونات الكاميرا والميكروفون في متصفحك لإجراء المكالمات.",
    cameraAccessRequired: "الوصول إلى الكاميرا مطلوب لعرض الفيديو الخاص بك.",
    enableVideoCalls: "تفعيل مكالمات الفيديو",
    enableVideoCallsDescription: "السماح للمستخدمين الآخرين ببدء مكالمات فيديو معك.",
    missedCall: "مكالمة فائتة",
    callDeclined: "تم رفض المكالمة",
    callDuration: "مدة المكالمة",
    videoCallLog: "مكالمة فيديو",
    audioCallLog: "مكالمة صوتية",
    serviceAmount: "مبلغ الخدمة",
    enterServiceAmount: "أدخل المبلغ المتفق عليه مع مقدم الخدمة.",
    platformCommission: "عمولة المنصة",
    providerPayout: "مستحقات مقدم الخدمة",
    myOrders: "طلباتي",
    myOrdersDescriptionSeeker: "تتبع وإدارة طلبات الخدمة الخاصة بك.",
    myOrdersDescriptionProvider: "عرض وإدارة طلبات العمل الواردة الخاصة بك.",
    noOrdersYet: "لا توجد طلبات بعد",
    noOrdersYetDescription: "عندما تطلب خدمة، ستظهر هنا.",
    pendingPayment: "بانتظار الدفع",
    paid: "مدفوع",
    completed: "مكتمل",
    disputed: "متنازع عليه",
    paymentApprovals: "الموافقات المالية",
    paymentPendingTitle: "الدفع معلق",
    paymentPendingDescription: "يحتاج الباحث عن الخدمة إلى تحميل إثبات الدفع.",
    paymentApprovedTitle: "تمت الموافقة على الدفع",
    paymentApprovedDescription: "يمكن لمقدم الخدمة الآن بدء العمل.",
    orderCompletedTitle: "اكتمل الطلب",
    orderCompletedDescription: "تم إكمال هذه الخدمة بنجاح.",
    orderDisputedTitle: "الطلب متنازع عليه",
    orderDisputedDescription: "هناك مشكلة في هذا الطلب. سيقوم المسؤول بالتحقيق.",
    requestService: "اطلب خدمة",
    requestingServiceFrom: "طلب خدمة من",
    serviceDescription: "وصف الخدمة",
    describeJobDetailPlaceholder: "يرجى وصف العمل الذي تحتاجه بالتفصيل...",
    providerWillSeeDescription: "سيطلع مقدم الخدمة على هذا الوصف. كن واضحًا قدر الإمكان.",
    submitRequest: "إرسال الطلب",
    descriptionRequired: "الوصف مطلوب",
    invalidAmount: "مبلغ غير صالح",
    enterValidServiceAmount: "يرجى إدخال مبلغ خدمة صالح.",
    orderCreatedSuccessTitle: "تم إنشاء الطلب بنجاح!",
    orderCreatedSuccessDescription: "تم إرسال طلبك. سيتم الآن توجيهك إلى صفحة الطلب.",
    failedToCreateOrder: "فشل إنشاء الطلب",
    loginToRequestService: "يرجى تسجيل الدخول لطلب خدمة.",
    backToProfile: "العودة إلى الملف الشخصي",
    pendingApproval: "بانتظار الموافقة",
    declined: "مرفوض",
    orderCreatedAwaitingApprovalDescription: "تم إرسال طلبك إلى مقدم الخدمة. سيتم إعلامك عندما يرد.",
    acceptOrder: "قبول الطلب",
    declineOrder: "رفض الطلب",
    orderAccepted: "تم قبول الطلب",
    orderDeclined: "تم رفض الطلب",
    orderAcceptedDescription: "لقد قبل مقدم الخدمة طلبك. سيقوم الباحث عن الخدمة الآن بالدفع.",
    orderDeclinedDescription: "لقد رفضت طلب الخدمة هذا.",
    statusPendingApprovalTitle: "بانتظار موافقة مقدم الخدمة",
    statusPendingApprovalDescriptionSeeker: "يقوم مقدم الخدمة بمراجعة طلبك. سيتم إعلامك بمجرد رده.",
    statusPendingApprovalDescriptionProvider: "تم طلب خدمة جديدة. راجع التفاصيل وقم بالقبول أو الرفض.",
    statusDeclinedTitle: "تم رفض الطلب",
    statusDeclinedDescription: "تم رفض طلب الخدمة هذا.",
    currency: "العملة",
    USD: "دولار أمريكي",
    SAR: "ريال سعودي",
    EGP: "جنيه مصري",
    AED: "درهم إماراتي",
    QAR: "ريال قطري",
    howToUse: "كيفية الاستخدام",
    advertiseWithUs: "أعلن معنا",
    faqTitle: "الأسئلة الشائعة",
    faqDescription: "ابحث عن إجابات للأسئلة الشائعة حول استخدام خدماب.",
    faqQ1: "كيف أجد مقدم خدمة؟",
    faqA1: "استخدم شريط البحث في صفحة 'الخدمات'. يمكنك البحث حسب نوع الخدمة (مثل 'سباكة')، أو الاسم، أو استخدام زر 'البحث بالقرب مني' لرؤية مقدمي الخدمات الأقرب إليك.",
    faqQ2: "كيف أسجل كمقدم خدمة؟",
    faqA2: "انقر على زر 'تسجيل' في الصفحة الرئيسية، واختر 'مقدم خدمة' أثناء التسجيل، ثم املأ تفاصيل ملفك الشخصي من لوحة التحكم. الملف الشخصي المكتمل بالصور والسيرة الذاتية الجيدة يجذب المزيد من العملاء.",
    faqQ3: "كيف يعمل نظام الدفع؟",
    faqA3: "بعد طلب الخدمة وقبول مقدم الخدمة، سيُطلب منك الدفع وتحميل إثبات الدفع. نقوم بإعلام مقدم الخدمة بمجرد الموافقة على الدفع، ويمكنه بعد ذلك بدء العمل.",
    faqQ4: "ماذا لو واجهت مشكلة مع الخدمة؟",
    faqA4: "إذا لم تكن راضيًا عن الخدمة، لا تقم بتأكيد الطلب على أنه 'مكتمل'. بدلاً من ذلك، استخدم زر 'الإبلاغ عن مشكلة' في صفحة تفاصيل الطلب. سيؤدي هذا إلى وضع الطلب في حالة 'متنازع عليه'، وسيقوم فريق الدعم لدينا بالتحقيق في المشكلة.",
    advertiseTitle: "أعلن معنا",
    advertiseDescription: "تواصل مع آلاف العملاء المحتملين. املأ النموذج أدناه للاستفسار عن خياراتنا الإعلانية.",
    adInquiryPlaceholder: "أخبرنا عن عملك وما تود الإعلان عنه...",
    advertisement: "إعلان",
    adPlaceholderTitle: "إعلانك هنا",
    adPlaceholderDescription: "روّج لخدمتك أو منتجك لجمهور مستهدف من المستخدمين الباحثين عن حلول.",
  },
};
