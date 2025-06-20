
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
  postAd: string;
  adTitle: string;
  adDescription: string;
  category: string;
  plumbing: string;
  electrical: string;
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
  detectedCategory: string;
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
    searchPlaceholder: "Search by address or service type...",
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
    serviceAreas: "Service Areas (comma-separated)",
    postAd: "Post Ad",
    adTitle: "Ad Title",
    adDescription: "Ad Description",
    category: "Category",
    plumbing: "Plumbing",
    electrical: "Electrical",
    myAds: "My Ads",
    editAd: "Edit Ad",
    newAd: "New Ad",
    searchHistory: "Search History",
    noResultsFound: "No results found.",
    loading: "Loading...",
    submit: "Submit",
    viewDetails: "View Details",
    errorOccurred: "An error occurred. Please try again.",
    welcomeTo: "Welcome to",
    findSkilledArtisans: "Find skilled artisans for your plumbing and electrical needs.",
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
    detectedCategory: "Detected Category",
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
    searchPlaceholder: "ابحث بالعنوان أو نوع الخدمة...",
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
    serviceAreas: "مناطق الخدمة (مفصولة بفاصلة)",
    postAd: "نشر إعلان",
    adTitle: "عنوان الإعلان",
    adDescription: "وصف الإعلان",
    category: "الفئة",
    plumbing: "سباكة",
    electrical: "كهرباء",
    myAds: "إعلاناتي",
    editAd: "تعديل الإعلان",
    newAd: "إعلان جديد",
    searchHistory: "سجل البحث",
    noResultsFound: "لم يتم العثور على نتائج.",
    loading: "جاري التحميل...",
    submit: "إرسال",
    viewDetails: "عرض التفاصيل",
    errorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    welcomeTo: "مرحباً بك في",
    findSkilledArtisans: "ابحث عن حرفيين ماهرين لاحتياجات السباكة والكهرباء الخاصة بك.",
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
    detectedCategory: "الفئة المكتشفة",
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
  },
};

    