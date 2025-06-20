
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
  postAd: string;
  adTitle: string;
  adDescription: string;
  category: string;
  plumbing: string;
  electrical: string;
  carpentry: string;
  painting: string;
  homeCleaning: string;
  construction: string;
  plastering: string;
  other: string;
  myAds: string;
  editAd: string;
  newAd: string;
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
  adPostedSuccessfully: string;
  profileUpdatedSuccessfully: string;
  selectCategory: string;
  serviceCategory: string;
  detectedCategoryTitle: string;
  confirmCategory: string;
  searchByAddressOrKeyword: string;
  recentSearches: string;
  clearHistory: string;
  noAdsYet: string;
  noHistoryYet: string;
  requiredField: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
  confirmPassword: string;
  uploadAdImage: string;
  adImage: string;
  imagePreview: string;
  changeImage: string;
  noImageUploaded: string;
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
  notAuthorizedEditAd?: string;
  adNotFound?: string;
  failedLoadAdData?: string;
  couldNotDetectCategory?: string;
  cannotUpdateAdCoreServices?: string;
  failedUploadImage?: string;
  adUpdatedTitle?: string;
  adUpdatedSuccess?: string;
  failedUpdateAd?: string;
  loadingAdDetails?: string;
  errorOrAdNotFound?: string;
  detectCategoryAI?: string;
  orDragAndDrop?: string;
  imageUploadHint?: string; // "PNG, JPG, GIF up to 10MB"
  uploadingImage?: string;
  anonymousProvider?: string;
  userNotIdentified?: string;
  coreServicesUnavailable?: string;
  coreServicesUnavailableDashboard?: string; // Specific for dashboard layout
  cannotPostAdCoreServices?: string;
  providerInfoMissing?: string;
  adLiveShortly?: string;
  failedPostAd?: string;
  newAdDescriptionPage?: string; // "Fill out the form to post your service ad on {appName}."
  postingAdsUnavailable?: string; // For new ad page
  editingAdsUnavailable?: string; // For edit ad page
  failedLoadAds?: string;
  adDeletedTitle?: string;
  adDeletedSuccess?: string;
  failedDeleteAd?: string;
  invalidDate?: string;
  myAdsPageDescription?: string; // "View, edit, or delete your service advertisements."
  noAdsYetDescription?: string; // "Click the button above to create your first service advertisement."
  postedOn?: string; // "Posted:"
  delete?: string;
  confirmDeleteTitleAd?: string; // "Are you sure you want to delete the ad '{adTitle}'?"
  confirmDeleteDescriptionAd?: string; // "This action cannot be undone. This will permanently delete this ad."
  cancel?: string;
  welcome?: string;
  completeYourProfile?: string;
  couldNotFetchProfile?: string;
  authError?: string;
  profileServiceNotReady?: string;
  userNotAuthOrServiceUnavailable?: string;
  profileChangesSaved?: string;
  failedUpdateProfile?: string;
  profilePageDescription?: string; // "Manage your provider profile details for {appName}."
  profilePictureAlt?: string;
  profileEditingUnavailable?: string; // For profile page
  profileHelpTextCategory?: string; // "Select your primary service category. For multiple, manage via separate ads."
  searchHistoryClearedTitle?: string;
  searchHistoryClearedSuccess?: string;
  searchHistoryPageDescription?: string; // "Review your past service searches."
  confirmClearHistoryTitle?: string; // "Are you sure you want to clear your search history?"
  confirmClearHistoryDescription?: string; // "This action cannot be undone. This will permanently delete all your search history entries."
  noHistoryYetDescription?: string; // "Your search history is empty. Start searching for services to see them here."
  searchedOn?: string; // "Searched on:"
  repeatSearch?: string;
  adIdMissing?: string;
  failedLoadServices?: string;
  backButton?: string;
  adNotFoundDescription?: string; // "The service ad you are looking for does not exist or may have been removed."
  backToSearch?: string;
  postedOnFull?: string; // "Posted on:" for full date
  serviceCategoriesTitle?: string; // "Service Categories:"
  servesAreasTitle?: string; // "Serves Areas:"
  inquiryAboutAd?: string; // "Inquiry about your ad: {adTitle}"
  contactProvider?: string; // "Contact {providerName}"
  providerDetailsNotAvailable?: string;
  searchServicesPageDescription?: string; // "Find skilled artisans by searching by address, service type, or keywords."
  tryDifferentKeywords?: string; // "Try searching with different keywords or check your spelling."
  noServicesAvailableYet?: string; // "No Services Available Yet"
  checkBackLater?: string; // "There are currently no service ads posted. Check back later!"
  switchToDarkMode?: string;
  switchToLightMode?: string;
  unauthorized?: string;
  loginAsAdmin?: string;
  accessDenied?: string;
  notAuthorizedViewPage?: string;
  adminDashboardDescription?: string;
  adminDashboardUnavailable?: string; // For admin dashboard if services down
  logoutFailed?: string;
  goToHomepage?: string;
  redirectingToLogin?: string;
  verifyingUserRole?: string;
  verifyEmailPromptTitle?: string;
  verifyEmailPromptMessage?: string; // "A verification link was sent to {email}. Check your inbox (and spam folder)."
  resendVerificationEmail?: string;
  verificationEmailResent?: string;
  checkYourEmail?: string;
  errorResendingVerificationEmail?: string;
  welcomeToDashboardUser?: string; // "Welcome to your Dashboard, {userName}!"
  welcomeToDashboardProvider?: string; // "Welcome to your Provider Dashboard!"
  welcomeToDashboardSeeker?: string; // "Welcome to your Seeker Dashboard!"
  myAdsDescriptionProvider?: string; // "View and manage your service advertisements."
  newAdDescriptionProvider?: string; // "Create a new advertisement to offer your services."
  profileDescriptionProvider?: string; // "Update your personal and service information."
  searchDescriptionSeeker?: string; // "Find skilled artisans for your needs."
  searchHistoryDescriptionSeeker?: string; // "Review your past service searches."
  dashboardTaglineProvider?: string; // "Manage your services and reach more customers."
  dashboardTaglineSeeker?: string; // "Find the best services for your needs easily."
  dashboardBannerAlt?: string; // "Dashboard banner with tools or workspace imagery"
  descriptionTooShortAd?: string; // "Description must be at least 10 characters for an ad."
  invalidImageUrl?: string; // "Invalid image URL."

  // Contact Page Translations
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

  // Image Deletion in Edit Ad
  removeImageTitle?: string;
  removeImageConfirm?: string;
  removeImageButton?: string;
  tryAgain?: string;
  backToDashboard?: string;

  // Homepage Service Card Descriptions
  plumbingDescription?: string;
  electricalDescription?: string;
  carpentryDescription?: string;
  paintingDescription?: string;
  homeCleaningDescription?: string;
  constructionDescription?: string;
  plasteringDescription?: string;
  otherServicesDescription?: string;
};

export const translations: Record<'en' | 'ar', Translations> = {
  en: {
    appName: "KHIDMAP",
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
    searchPlaceholder: "Search by address, service type...",
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
    postAd: "Post Ad",
    adTitle: "Ad Title",
    adDescription: "Ad Description",
    category: "Category",
    plumbing: "Plumbing",
    electrical: "Electrical",
    carpentry: "Carpentry",
    painting: "Painting",
    homeCleaning: "Home Cleaning",
    construction: "Construction",
    plastering: "Plastering",
    other: "Other Services",
    myAds: "My Ads",
    editAd: "Edit Ad",
    newAd: "New Ad",
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
    adPostedSuccessfully: "Ad posted successfully!",
    profileUpdatedSuccessfully: "Profile updated successfully!",
    selectCategory: "Select Category",
    serviceCategory: "Service Category",
    detectedCategoryTitle: "Detected Category",
    confirmCategory: "Confirm Category",
    searchByAddressOrKeyword: "Search by Address or Keyword",
    recentSearches: "Recent Searches",
    clearHistory: "Clear History",
    noAdsYet: "You haven't posted any ads yet.",
    noHistoryYet: "You have no search history yet.",
    requiredField: "This field is required",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    confirmPassword: "Confirm Password",
    uploadAdImage: "Upload Ad Image",
    adImage: "Ad Image",
    imagePreview: "Image Preview",
    changeImage: "Change Image",
    noImageUploaded: "No image uploaded yet.",
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
    notAuthorizedEditAd: "You are not authorized to edit this ad.",
    adNotFound: "Ad not found.",
    failedLoadAdData: "Failed to load ad data for editing.",
    couldNotDetectCategory: "Could not detect category automatically.",
    cannotUpdateAdCoreServices: "Cannot update ad. Core services are not ready or user not authenticated.",
    failedUploadImage: "Failed to upload new image.",
    adUpdatedTitle: "Ad Updated",
    adUpdatedSuccess: "Your ad has been successfully updated.",
    failedUpdateAd: "Failed to update ad.",
    loadingAdDetails: "Loading ad details...",
    errorOrAdNotFound: "Error occurred or ad not found.",
    detectCategoryAI: "Detect Category with AI",
    orDragAndDrop: "or drag and drop",
    imageUploadHint: "PNG, JPG, GIF up to 10MB",
    uploadingImage: "Uploading image",
    anonymousProvider: "Anonymous Provider",
    userNotIdentified: "User not identified. Please log in again.",
    coreServicesUnavailable: "Core services are not ready or unavailable.",
    cannotPostAdCoreServices: "Cannot post ad. Core services are not ready.",
    providerInfoMissing: "Provider information is missing. Please try again.",
    adLiveShortly: "Your ad will be live shortly.",
    failedPostAd: "Failed to post ad.",
    newAdDescriptionPage: "Fill out the form to post your service ad on {appName}.",
    postingAdsUnavailable: "Posting ads is currently unavailable because core services are not configured.",
    editingAdsUnavailable: "Editing ads is currently unavailable because core services are not configured.",
    failedLoadAds: "Failed to load your ads.",
    adDeletedTitle: "Ad Deleted",
    adDeletedSuccess: "The advertisement has been successfully deleted.",
    failedDeleteAd: "Failed to delete ad.",
    invalidDate: "Invalid Date",
    myAdsPageDescription: "View, edit, or delete your service advertisements.",
    noAdsYetDescription: "Click the button above to create your first service advertisement.",
    postedOn: "Posted:",
    delete: "Delete",
    confirmDeleteTitleAd: "Are you sure you want to delete the ad '{adTitle}'?",
    confirmDeleteDescriptionAd: "This action cannot be undone. This will permanently delete this ad.",
    cancel: "Cancel",
    welcome: "Welcome!",
    completeYourProfile: "Please complete your provider profile.",
    couldNotFetchProfile: "Could not fetch profile data.",
    authError: "Authentication Error",
    profileServiceNotReady: "Profile service is not ready.",
    userNotAuthOrServiceUnavailable: "User not authenticated or service unavailable.",
    profileChangesSaved: "Your profile changes have been saved.",
    failedUpdateProfile: "Failed to update profile.",
    profilePageDescription: "Manage your provider profile details for {appName}.",
    profilePictureAlt: "Profile Picture",
    profileEditingUnavailable: "Profile editing is currently unavailable because core services are not configured.",
    profileHelpTextCategory: "Select your primary service category. For multiple, manage via separate ads.",
    searchHistoryClearedTitle: "Search History Cleared",
    searchHistoryClearedSuccess: "Your search history has been successfully cleared.",
    searchHistoryPageDescription: "Review your past service searches.",
    confirmClearHistoryTitle: "Are you sure you want to clear your search history?",
    confirmClearHistoryDescription: "This action cannot be undone. This will permanently delete all your search history entries.",
    noHistoryYetDescription: "Your search history is empty. Start searching for services to see them here.",
    searchedOn: "Searched on:",
    repeatSearch: "Repeat Search",
    adIdMissing: "Ad ID is missing.",
    failedLoadServices: "Failed to load services.",
    backButton: "Back",
    adNotFoundDescription: "The service ad you are looking for does not exist or may have been removed.",
    backToSearch: "Back to Search",
    postedOnFull: "Posted on:",
    serviceCategoriesTitle: "Service Categories:",
    servesAreasTitle: "Serves Areas:",
    inquiryAboutAd: "Inquiry about your ad: {adTitle}",
    contactProvider: "Contact {providerName}",
    providerDetailsNotAvailable: "Provider details are not available.",
    searchServicesPageDescription: "Find skilled artisans by searching by address, service type, or keywords.",
    tryDifferentKeywords: "Try searching with different keywords or check your spelling.",
    noServicesAvailableYet: "No Services Available Yet",
    checkBackLater: "There are currently no service ads posted. Check back later!",
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
    myAdsDescriptionProvider: "View and manage your service advertisements.",
    newAdDescriptionProvider: "Create a new advertisement to offer your services.",
    profileDescriptionProvider: "Update your personal and service information.",
    searchDescriptionSeeker: "Find skilled artisans for your needs.",
    searchHistoryDescriptionSeeker: "Review your past service searches.",
    dashboardTaglineProvider: "Manage your services and reach more customers.",
    dashboardTaglineSeeker: "Find the best services for your needs easily.",
    dashboardBannerAlt: "Dashboard banner with tools or workspace imagery",
    descriptionTooShortAd: "Description must be at least 10 characters for an ad.",
    invalidImageUrl: "Invalid image URL.",
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
    removeImageTitle: "Remove Image?",
    removeImageConfirm: "Are you sure you want to remove the current ad image? This action will permanently delete the image if you save the changes.",
    removeImageButton: "Remove Image",
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
    searchPlaceholder: "ابحث بالعنوان، نوع الخدمة...",
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
    postAd: "نشر إعلان",
    adTitle: "عنوان الإعلان",
    adDescription: "وصف الإعلان",
    category: "الفئة",
    plumbing: "سباكة",
    electrical: "كهرباء",
    carpentry: "نجارة",
    painting: "دهان",
    homeCleaning: "تنظيف منازل",
    construction: "بناء",
    plastering: "محارة",
    other: "خدمات أخرى",
    myAds: "إعلاناتي",
    editAd: "تعديل الإعلان",
    newAd: "إعلان جديد",
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
    adPostedSuccessfully: "تم نشر الإعلان بنجاح!",
    profileUpdatedSuccessfully: "تم تحديث الملف الشخصي بنجاح!",
    selectCategory: "اختر الفئة",
    serviceCategory: "فئة الخدمة",
    detectedCategoryTitle: "الفئة المكتشفة",
    confirmCategory: "تأكيد الفئة",
    searchByAddressOrKeyword: "ابحث بالعنوان أو كلمة مفتاحية",
    recentSearches: "عمليات البحث الأخيرة",
    clearHistory: "مسح السجل",
    noAdsYet: "لم تقم بنشر أي إعلانات بعد.",
    noHistoryYet: "ليس لديك سجل بحث حتى الآن.",
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "عنوان بريد إلكتروني غير صالح",
    passwordTooShort: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين",
    confirmPassword: "تأكيد كلمة المرور",
    uploadAdImage: "رفع صورة الإعلان",
    adImage: "صورة الإعلان",
    imagePreview: "معاينة الصورة",
    changeImage: "تغيير الصورة",
    noImageUploaded: "لم يتم رفع صورة بعد.",
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
    notAuthorizedEditAd: "أنت غير مصرح لك بتعديل هذا الإعلان.",
    adNotFound: "الإعلان غير موجود.",
    failedLoadAdData: "فشل تحميل بيانات الإعلان للتعديل.",
    couldNotDetectCategory: "تعذر اكتشاف الفئة تلقائيًا.",
    cannotUpdateAdCoreServices: "لا يمكن تحديث الإعلان. الخدمات الأساسية غير جاهزة أو المستخدم غير مصادق عليه.",
    failedUploadImage: "فشل تحميل الصورة الجديدة.",
    adUpdatedTitle: "تم تحديث الإعلان",
    adUpdatedSuccess: "تم تحديث إعلانك بنجاح.",
    failedUpdateAd: "فشل تحديث الإعلان.",
    loadingAdDetails: "جاري تحميل تفاصيل الإعلان...",
    errorOrAdNotFound: "حدث خطأ أو الإعلان غير موجود.",
    detectCategoryAI: "اكتشف الفئة بالذكاء الاصطناعي",
    orDragAndDrop: "أو اسحب وأفلت",
    imageUploadHint: "PNG, JPG, GIF حتى 10 ميجابايت",
    uploadingImage: "جاري تحميل الصورة",
    anonymousProvider: "مقدم خدمة مجهول",
    userNotIdentified: "لم يتم التعرف على المستخدم. يرجى تسجيل الدخول مرة أخرى.",
    coreServicesUnavailable: "الخدمات الأساسية غير جاهزة أو غير متاحة.",
    cannotPostAdCoreServices: "لا يمكن نشر الإعلان. الخدمات الأساسية غير جاهزة.",
    providerInfoMissing: "معلومات مقدم الخدمة مفقودة. يرجى المحاولة مرة أخرى.",
    adLiveShortly: "سيكون إعلانك متاحًا قريبًا.",
    failedPostAd: "فشل نشر الإعلان.",
    newAdDescriptionPage: "املأ النموذج لنشر إعلان خدمتك على {appName}.",
    postingAdsUnavailable: "نشر الإعلانات غير متاح حاليًا لأن الخدمات الأساسية غير مهيأة.",
    editingAdsUnavailable: "تعديل الإعلانات غير متاح حاليًا لأن الخدمات الأساسية غير مهيأة.",
    failedLoadAds: "فشل تحميل إعلاناتك.",
    adDeletedTitle: "تم حذف الإعلان",
    adDeletedSuccess: "تم حذف الإعلان بنجاح.",
    failedDeleteAd: "فشل حذف الإعلان.",
    invalidDate: "تاريخ غير صالح",
    myAdsPageDescription: "عرض وتعديل وحذف إعلانات خدماتك.",
    noAdsYetDescription: "انقر على الزر أعلاه لإنشاء أول إعلان خدمة لك.",
    postedOn: "نشر في:",
    delete: "حذف",
    confirmDeleteTitleAd: "هل أنت متأكد أنك تريد حذف الإعلان '{adTitle}'؟",
    confirmDeleteDescriptionAd: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف هذا الإعلان نهائيًا.",
    cancel: "إلغاء",
    welcome: "مرحباً!",
    completeYourProfile: "يرجى إكمال ملف تعريف المزود الخاص بك.",
    couldNotFetchProfile: "تعذر جلب بيانات الملف الشخصي.",
    authError: "خطأ في المصادقة",
    profileServiceNotReady: "خدمة الملف الشخصي غير جاهزة.",
    userNotAuthOrServiceUnavailable: "المستخدم غير مصادق عليه أو الخدمة غير متوفرة.",
    profileChangesSaved: "تم حفظ تغييرات ملفك الشخصي.",
    failedUpdateProfile: "فشل تحديث الملف الشخصي.",
    profilePageDescription: "إدارة تفاصيل ملف تعريف المزود الخاص بك لـ {appName}.",
    profilePictureAlt: "الصورة الشخصية",
    profileEditingUnavailable: "تعديل الملف الشخصي غير متاح حاليًا لأن الخدمات الأساسية غير مهيأة.",
    profileHelpTextCategory: "اختر فئة خدمتك الأساسية. لعدة فئات، قم بإدارتها عبر إعلانات منفصلة.",
    searchHistoryClearedTitle: "تم مسح سجل البحث",
    searchHistoryClearedSuccess: "تم مسح سجل البحث الخاص بك بنجاح.",
    searchHistoryPageDescription: "مراجعة عمليات بحثك السابقة عن الخدمات.",
    confirmClearHistoryTitle: "هل أنت متأكد أنك تريد مسح سجل البحث الخاص بك؟",
    confirmClearHistoryDescription: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف جميع إدخالات سجل البحث الخاصة بك نهائيًا.",
    noHistoryYetDescription: "سجل البحث الخاص بك فارغ. ابدأ البحث عن الخدمات لرؤيتها هنا.",
    searchedOn: "بحث في:",
    repeatSearch: "إعادة البحث",
    adIdMissing: "معرف الإعلان مفقود.",
    failedLoadServices: "فشل تحميل الخدمات.",
    backButton: "رجوع",
    adNotFoundDescription: "إعلان الخدمة الذي تبحث عنه غير موجود أو ربما تم حذفه.",
    backToSearch: "العودة إلى البحث",
    postedOnFull: "نشر في:",
    serviceCategoriesTitle: "فئات الخدمة:",
    servesAreasTitle: "يخدم المناطق:",
    inquiryAboutAd: "استفسار بخصوص إعلانك: {adTitle}",
    contactProvider: "اتصل بـ {providerName}",
    providerDetailsNotAvailable: "تفاصيل المزود غير متوفرة.",
    searchServicesPageDescription: "ابحث عن حرفيين ماهرين من خلال البحث بالعنوان أو نوع الخدمة أو الكلمات المفتاحية.",
    tryDifferentKeywords: "حاول البحث بكلمات مفتاحية مختلفة أو تحقق من التهجئة.",
    noServicesAvailableYet: "لا توجد خدمات متاحة بعد",
    checkBackLater: "لا توجد حاليًا إعلانات خدمات منشورة. تحقق مرة أخرى لاحقًا!",
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
    myAdsDescriptionProvider: "عرض وإدارة إعلانات خدماتك.",
    newAdDescriptionProvider: "إنشاء إعلان جديد لتقديم خدماتك.",
    profileDescriptionProvider: "تحديث معلوماتك الشخصية ومعلومات الخدمة.",
    searchDescriptionSeeker: "العثور على حرفيين ماهرين لاحتياجاتك.",
    searchHistoryDescriptionSeeker: "مراجعة عمليات بحثك السابقة عن الخدمات.",
    dashboardTaglineProvider: "إدارة خدماتك والوصول إلى المزيد من العملاء.",
    dashboardTaglineSeeker: "ابحث عن أفضل الخدمات لاحتياجاتك بسهولة.",
    dashboardBannerAlt: "بانر لوحة التحكم مع أدوات أو صور لمساحة عمل",
    descriptionTooShortAd: "يجب أن يتكون الوصف من 10 أحرف على الأقل للإعلان.",
    invalidImageUrl: "رابط صورة غير صالح.",
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
    removeImageTitle: "إزالة الصورة؟",
    removeImageConfirm: "هل أنت متأكد أنك تريد إزالة صورة الإعلان الحالية؟ سيؤدي هذا الإجراء إلى حذف الصورة نهائيًا إذا قمت بحفظ التغييرات.",
    removeImageButton: "إزالة الصورة",
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
  },
};
