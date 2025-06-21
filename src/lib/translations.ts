
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
  profilePictureAlt?: string;
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
  of?: string; // e.g. 4.5 of 5 stars
  viewProfile?: string;

  // Messaging translations
  messages?: string;
  typeYourMessage?: string;
  send?: string;
  noConversations?: string;
  selectAConversation?: string;
  conversationWith?: string; // "Conversation with {name}"
  noMessagesYet?: string;
  startTheConversation?: string;

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
    qualifications: "Qualifications/Skills",
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
    profilePictureAlt: "Profile Picture",
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
    servesAreasTitle: "Serves Areas:",
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
    noReviewsYet: "No reviews yet. Be the first to rate this provider!",
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
    of: "of",
    viewProfile: "View Profile",
    // Messaging translations
    messages: "Messages",
    typeYourMessage: "Type your message...",
    send: "Send",
    noConversations: "No conversations yet.",
    selectAConversation: "Select a conversation",
    conversationWith: "Conversation with {name}",
    noMessagesYet: "No messages yet. Say hello!",
    startTheConversation: "Select a conversation from the list to start chatting.",
    // Location-based search
    location: "Location",
    useCurrentLocation: "Use My Current Location",
    locationSet: "Location has been set.",
    locationError: "Could not get location.",
    findNearMe: "Find Near Me",
    findingLocation: "Finding your location...",
    sortedByDistance: "Results sorted by distance from you.",
    kmAway: "{distance} km",
    locationPermissionDenied: "Location permission denied. Please enable it in your browser settings.",
    locationNotSet: "Location not set",
    locationUnavailable: "Location information is not available in this browser.",
    locationHelpText: "Set your location to appear in proximity searches.",
    // Forgot Password
    forgotPassword: "Forgot Password",
    forgotPasswordDescription: "Enter your email address and we'll send you a link to reset your password.",
    sendResetLink: "Send Reset Link",
    resetLinkSentTitle: "Reset Link Sent",
    resetLinkSentDescription: "Check your email at {email} for a link to reset your password. If it doesn't appear, check your spam folder.",
    resetPasswordErrorTitle: "Error Sending Link",
    userNotFound: "No user found with this email address.",
    backToLogin: "Back to Login",
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
    qualifications: "المؤهلات/المهارات",
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
    profilePictureAlt: "الصورة الشخصية",
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
    servesAreasTitle: "يخدم المناطق:",
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
    profileDescriptionProvider: "تحديث معلوماتك الشخصية ومعلومات الخدمة.",
    searchDescriptionSeeker: "العثور على حرفيين ماهرين لاحتياجاتك.",
    searchHistoryDescriptionSeeker: "مراجعة عمليات بحثك السابقة عن الخدمات.",
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
    noReviewsYet: "لا توجد تقييمات بعد. كن أول من يقيم هذا المزود!",
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
    firestoreIndexError: "قاعدة البيانات قيد التحديث لدعم هذا الاستعلام. يرجى المحاولة مرة أخرى في غضون دقائق قليلة.",
    of: "من",
    viewProfile: "عرض الملف الشخصي",
    // Messaging translations
    messages: "الرسائل",
    typeYourMessage: "اكتب رسالتك...",
    send: "إرسال",
    noConversations: "لا توجد محادثات بعد.",
    selectAConversation: "اختر محادثة",
    conversationWith: "محادثة مع {name}",
    noMessagesYet: "لا توجد رسائل بعد. قل مرحباً!",
    startTheConversation: "اختر محادثة من القائمة لبدء الدردشة.",
    // Location-based search
    location: "الموقع",
    useCurrentLocation: "استخدام موقعي الحالي",
    locationSet: "تم تحديد الموقع.",
    locationError: "تعذر الحصول على الموقع.",
    findNearMe: "البحث بالقرب مني",
    findingLocation: "جاري تحديد موقعك...",
    sortedByDistance: "تم ترتيب النتائج حسب المسافة منك.",
    kmAway: "{distance} كم",
    locationPermissionDenied: "تم رفض إذن تحديد الموقع. يرجى تمكينه في إعدادات المتصفح.",
    locationNotSet: "الموقع غير محدد",
    locationUnavailable: "معلومات الموقع غير متوفرة في هذا المتصفح.",
    locationHelpText: "حدد موقعك للظهور في عمليات البحث القريبة.",
    // Forgot Password
    forgotPassword: "هل نسيت كلمة المرور",
    forgotPasswordDescription: "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.",
    sendResetLink: "إرسال رابط إعادة التعيين",
    resetLinkSentTitle: "تم إرسال رابط إعادة التعيين",
    resetLinkSentDescription: "تحقق من بريدك الإلكتروني على {email} للحصول على رابط لإعادة تعيين كلمة المرور. إذا لم يظهر، تحقق من مجلد الرسائل غير المرغوب فيها.",
    resetPasswordErrorTitle: "خطأ في إرسال الرابط",
    userNotFound: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني.",
    backToLogin: "العودة إلى تسجيل الدخول",
  },
};
