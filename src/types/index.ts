// ─── Core Types ───────────────────────────────────────────────────────────────

export type Language = 'fr' | 'ar' | 'en';
export type Theme    = 'light' | 'dark';
export type Dir      = 'ltr' | 'rtl';

export type ListingStatus = 'active' | 'paused' | 'sold' | 'deleted' | 'expired' | 'pending' | 'draft';
export type BoostLevel    = 0 | 1 | 2 | 3;
export type UserBadge     = 'verified' | 'pro' | 'top_seller' | 'new';

export interface RankingMeta {
  trustScore:   number;   // 0-100
  qualityScore: number;   // 0-100
  clickRate:    number;   // 0-1
  boostLevel:   BoostLevel;
  freshnessScore?: number;
  totalScore?:    number;
}

export interface Listing {
  id:          string;
  title:       string;
  slug:        string;
  price:       number;
  currency:    'DZD';
  negotiable:  boolean;
  location:    string;
  wilayaId?:   string;
  wilayaName?: string;
  commune?:    string;
  imageUrl:    string;
  images:      string[];
  category:    string;
  categoryId:  string;
  subCategory?: string;
  isUrgent?:   boolean;
  isVerified?: boolean;
  isPremium?:  boolean;
  isPro?:      boolean;
  condition?:  'new' | 'like_new' | 'good' | 'fair' | 'used';
  date:        string;
  timestamp:   number;
  views?:      number;
  contacts?:   number;
  favorites?:  number;
  description?: string;
  attributes?: Record<string, string | number | boolean>;
  ranking:     RankingMeta;
  status:      ListingStatus;
  userId?:     string;
  phone?:      string;
  whatsapp?:   boolean;
}

export interface Category {
  id:      string;
  nameFr:  string;
  nameAr:  string;
  nameEn:  string;
  icon:    string;
  color:   string;
  count?:  number;
  filters?: FilterDefinition[];
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id:     string;
  nameFr: string;
  nameAr: string;
  nameEn: string;
}

export type FilterType = 'range' | 'select' | 'checkbox' | 'radio' | 'number';

export interface FilterOption {
  labelFr: string;
  labelAr: string;
  labelEn: string;
  value:   string | number;
}

export interface FilterDefinition {
  id:       string;
  type:     FilterType;
  labelFr:  string;
  labelAr:  string;
  labelEn:  string;
  options?: FilterOption[];
  min?:     number;
  max?:     number;
  step?:    number;
  unit?:    string;
  placeholder?: string;
}

export interface Wilaya {
  code:   string;  // '01' to '58'
  nameFr: string;
  nameAr: string;
  nameEn: string;
  density: 'high' | 'medium' | 'low';
  count?: number;
  path?:  string;  // SVG path
  cx?:    number;  // label center x
  cy?:    number;  // label center y
}

export interface UserProfile {
  id:                 string;
  name:               string;
  email:              string;
  phone?:             string;
  avatar:             string;
  memberSince:        string;
  isEmailVerified:    boolean;
  isPhoneVerified:    boolean;
  isIdentityVerified: boolean;
  trustScore:         number;
  badges?:            UserBadge[];
  wilayaId?:          string;
  bio?:               string;
  totalListings?:     number;
  responseRate?:      number;
}

export interface Message {
  id:        string;
  from:      string;
  text:      string;
  ts:        number;
  read?:     boolean;
  type?:     'text' | 'offer' | 'system';
}

export interface MessageThread {
  id:           string;
  userId:       string;
  userName:     string;
  userAvatar:   string;
  listingId:    string;
  listingTitle: string;
  listingPrice?: number;
  listingImage?: string;
  messages:     Message[];
  unread:       number;
  lastTs?:      number;
}

export interface SearchFilters {
  q?:         string;
  categoryId?: string;
  wilayaId?:  string;
  priceMin?:  number;
  priceMax?:  number;
  condition?: string;
  sort?:      'relevance' | 'date' | 'price_asc' | 'price_desc' | 'trust';
  isPro?:     boolean;
  withPhoto?: boolean;
  dynamic?:   Record<string, string | number>;
}

export interface StatData {
  name:     string;
  views:    number;
  contacts: number;
}

// ─── Translation Schema ─────────────────────────────────────────────────────

export interface Translation {
  // Navigation
  home:       string;
  search:     string;
  post:       string;
  messages:   string;
  favorites:  string;
  profile:    string;
  dashboard:  string;
  logout:     string;
  login:      string;
  register:   string;

  // Search
  searchPlaceholder:  string;
  aiSearchPlaceholder:string;
  locationPlaceholder:string;
  searchBtn:          string;
  filters:            string;
  reset:              string;
  results:            string;
  sortBy:             string;
  sortRelevance:      string;
  sortDate:           string;
  sortPriceAsc:       string;
  sortPriceDesc:      string;
  sortTrust:          string;
  noResults:          string;
  viewAll:            string;
  gridView:           string;
  listView:           string;
  mapView:            string;

  // Listing
  price:            string;
  negotiable:       string;
  condition:        string;
  location:         string;
  publishedOn:      string;
  views:            string;
  category:         string;
  description:      string;
  sellerInfo:       string;
  contactSeller:    string;
  callSeller:       string;
  whatsapp:         string;
  saveAd:           string;
  savedAd:          string;
  reportAd:         string;
  similarAds:       string;
  trustedSeller:    string;
  verified:         string;
  pro:              string;
  urgent:           string;
  premium:          string;
  new_condition:    string;
  like_new:         string;
  good:             string;
  fair:             string;
  used:             string;
  memberSince:      string;
  responseRate:     string;

  // Post Ad
  postAd:         string;
  postAdBtn:      string;
  step:           string;
  chooseCategory: string;
  adDetails:      string;
  photos:         string;
  locationStep:   string;
  contactStep:    string;
  review:         string;
  title:          string;
  titlePlaceholder:string;
  adPrice:        string;
  isNegotiable:   string;
  adDescription:  string;
  descPlaceholder:string;
  uploadPhotos:   string;
  photoTip:       string;
  selectWilaya:   string;
  selectCommune:  string;
  phone:          string;
  enableWhatsApp: string;
  publish:        string;
  saveDraft:      string;
  previewAd:      string;
  adQuality:      string;
  excellent:      string;
  poor:           string;
  aiImprove:      string;
  aiPrice:        string;
  aiLoading:      string;
  published:      string;
  publishedMsg:   string;

  // Auth
  welcomeBack:          string;
  joinFennec:           string;
  loginTitle:           string;
  registerTitle:        string;
  emailOrPhone:         string;
  password:             string;
  confirmPassword:      string;
  fullName:             string;
  continueWithGoogle:   string;
  continueWithFacebook: string;
  continueWithWhatsApp: string;
  or:                   string;
  noAccount:            string;
  alreadyAccount:       string;
  forgotPassword:       string;
  continueBtn:          string;
  otpSent:              string;
  enterOtp:             string;
  verifyOtp:            string;

  // Dashboard
  myAds:         string;
  myFavorites:   string;
  myMessages:    string;
  myProfile:     string;
  myStats:       string;
  settings:      string;
  activeAds:     string;
  pausedAds:     string;
  totalViews:    string;
  unreadMsgs:    string;
  edit:          string;
  delete:        string;
  pause:         string;
  reactivate:    string;
  boost:         string;
  deleteConfirm: string;
  cancel:        string;
  confirm:       string;
  save:          string;
  completeProfile: string;
  verifyIdentity:  string;
  verifyPhone:     string;
  emailVerified:   string;
  phoneVerified:   string;
  identityVerified:string;
  verifyNow:       string;
  personalInfo:    string;
  security:        string;
  notifications:   string;
  deleteAccount:   string;

  // Messages
  noMessages:      string;
  typeMessage:     string;
  sendMessage:     string;
  regarding:       string;

  // General
  loading:       string;
  error:         string;
  retry:         string;
  back:          string;
  next:          string;
  close:         string;
  apply:         string;
  seeMore:       string;
  today:         string;
  yesterday:     string;
  currency:      string;
  free:          string;
  trending:      string;
  recent:        string;
  popular:       string;
  darkMode:      string;
  lightMode:     string;
  language:      string;
  searchByRegion:string;
  clickWilaya:   string;
  allAlgeria:    string;
  safetyTip:     string;
  safetyTipText: string;
  sponsoredAds:  string;
  aiPowered:     string;
  aiDescription: string;
  postFree:      string;
  statsTitle:    string;
  activeListings:string;
  wilayasCovered:string;
  totalFree:     string;
}
