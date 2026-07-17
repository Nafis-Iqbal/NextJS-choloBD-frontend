/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import {
  Role,
  UserStatus,

  LocationType,
  TourType,
  Language,
  ActivityType,
  HotelType,
  ReviewType,

  UserTripStatus,
  BookingStatus,
  
  ServiceType,
  TransportServiceType,
  BusServiceType,
  FlightServiceType,
  TrainServiceType,

  HotelRoomType,
  HotelRoomCategory,
  HotelRoomStatus,

  PaymentStatus,
  RefundStatus,
  WalletStatus,
  WalletTransactionType,
  TransactionStatus,
  
  CategoryType,
  
  Priority,
  NotificationAudience,
  SiteStatus,
  HeroSection,
  AdminAction,
  EntityType,
  ComplaintStatus,
  ComplaintTargetType,
  ComplaintAddressedTo
} from './enums';

declare module '*.css';

declare global {

  interface ApiResponse<T> {
    message: string;
    status: "success" | "failure";
    data: T | null | undefined;
  }

  // Auth and User Types
  type UserData = {
    userName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }

  type LoginData = {
    email: string;
    password: string;
  }

  interface User {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    imageUrl?: string;
    profileImage?: Image;

    role: Role;
    serviceType?: ServiceType;
    serviceEntityId?: string;
    serviceEntityName?: string;
    serviceAddressId?: string; 

    employeeServiceType?: ServiceType;
    employeeServiceEntityId?: string;
    employeeServiceEntityName?: string;
    employeeServiceAddressId?: string;

    userStatus: UserStatus;
    paymentStatus: PaymentStatus;
    emailVerified?: Date;
    phoneVerified?: Date;
    createdAt: string;

    spent: number;
    earned: number;

    wallet?: Wallet;
    serviceAddresses?: Address[]
    notifications?: Notification[];
    reviews?: Review[];
    userTripPlans?: UserTripPlan[];
    tripBookings?: TripBooking[];
    communityPostsCreated?: CommunityPost[];
    communityImagesUploaded?: Image[];
    communityPostTags?: CommunityPostTag[];
    communityPostReactions?: CommunityPostReaction[];
  }

  interface Account {
    id: string;
    userId: string;
    provider: string;
    providerAccountId: string;
    type: string;
    refreshToken?: string;
    accessToken?: string;
    expiresAt?: number;
    idToken?: string;
    scope?: string;
    tokenType?: string;
    sessionState?: string;
  }

  // Location and Geography
  interface Location {
    id: string;
    name: string;
    description?: string;
    locationType: LocationType;
    country: string;
    //state?: string;
    division: string;
    district?: string;
    city?: string;
    island?: string;
    countryside?: string;
    latitude?: number;
    longitude?: number;
    parentLocationId?: string;
    timezone?: string;
    createdAt: Date;
    parentLocation?: Location;
    childLocations?: Location[];
    tourPackages?: TourPackage[];
    tourSpots?: TourSpot[];
    activitySpots?: ActivitySpot[];
    hotels?: Hotel[];
    transports?: Transport[];
    guides?: Guide[];
  }

  interface Category {
    id:       string;
    name:     string;
    type:     CategoryType;
    slug:     string;
    isActive: boolean;

    hotels: Hotel[]
  }

  // Tour and Travel
  interface TourPackage {
    id: string;
    packageName: string;
    shortDescription?: string;
    tourType: TourType;
    duration: number;
    maxGroupSize: number;
    locationId: string;
    totalBudget: number;
    rating: number;
    isActive: boolean;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
    location: Location;
    daySegments?: TourDaySegment[];
    userTripPlans?: UserTripPlan[];
  }

  interface TourDaySegment {
    id: string;
    tourPackageId: string;
    dayNumber: number;
    tourSpotId: string;
    activitySpotId?: string;
    tourSpotName?: string;
    activitySpotName?: string;
    transportOption: TransportServiceType;
    hotelOption: HotelType;
    tourPackage: TourPackage;
    userSegments?: UserTripSegment[];
  }

  interface UserTripPlan {
    id: string;
    userId: string;
    name: string;
    description?: string;
    basedOnPackageId?: string;
    startDate: Date;
    endDate: Date;
    status: UserTripStatus;
    estimatedBudget?: number;
    actualCost?: number;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    basedOnPackage?: TourPackage;
    userSegments?: UserTripSegment[];
    tripBookings?: TripBooking[];
    communityPosts?: CommunityPost[];
  }

  interface UserTripSegment {
    id: string;
    userTripPlanId: string;
    dayNumber: number;
    segmentOrder: number;
    basedOnSegmentId?: string;
    customTourSpotId?: string;
    customActivitySpotId?: string;
    customTransport?: TransportServiceType;
    customHotel?: HotelType;
    customNotes?: string;
    estimatedCost?: number;
    startTime?: string;
    endTime?: string;
    createdAt: Date;
    updatedAt: Date;
    userTripPlan: UserTripPlan;
    basedOnSegment?: TourDaySegment;
  }

  interface HotelRoomBooking {
    id: string;
    hotelId: string;
    userId: string;

    checkInDate: Date;
    checkOutDate: Date;
    shift?: RoomShift;
    totalPrice: number;
    confirmationCode: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string; // "wallet", "sslcommerz", "cash"
    specialRequests?: string;

    guestName?: string;
    guestEmail?: string;
    guestPhoneNumber?: string;

    bookedAt: Date;
    confirmedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;

    hotel: Hotel;
    user: User;
    roomDetails?: HotelRoomBookingDetail[];
    userTripSegments?: UserTripSegment[];
  }

  interface HotelRoomBookingDetail {
    id: string;
    hotelRoomBookingId: string;
    hotelRoomId: string;

    // Snapshot pricing per room at booking time
    pricePerNight: number;
    subtotal: number;

    createdAt: Date;

    hotelRoomBooking: HotelRoomBooking;
    hotelRoom: HotelRoom;
  }

  interface TransportBooking {
    id: string;
    userId: string;
    transportId: string | null;
    transportType: TransportServiceType;
    departureLocation: string;
    arrivalLocation: string;
    departureDateTime: Date;
    arrivalDateTime: Date;
    seatNumber: string | null;
    seatDetails: string | null;
    passengerCount: number;
    passengerDetails: Record<string, any> | null;
    serviceClass: string | null;
    price: number;
    totalPrice: number;
    confirmationCode: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
    specialRequests: string | null;
    bookedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    user: User;
    transport: Transport | null;
    userTripSegments: UserTripSegment[];
  }

  interface ActivityBooking {
    id: string;
    activitySpotId: string;
    userId: string;
    bookingDate: Date;
    participantCount: number;
    specialRequirements: string | null;
    price: number;
    totalPrice: number;
    confirmationCode: string;
    bookingConfirmInstruction: string | null;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
    specialRequests: string | null;
    bookedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    activitySpot: ActivitySpot;
    user: User;
    userTripSegments: UserTripSegment[];
  }

  interface GuideBooking {
    id: string;
    guideId: string;
    userId: string;
    bookingDate: Date | string;
    startTime?: Date | string | null;
    endTime: Date | string;
    travelerCount: number;
    specialRequirements?: string | null;
    price: number;
    totalPrice: number;
    confirmationCode: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string | null;
    paymentExpiresAt?: Date | string | null;
    specialRequests?: string | null;
    bookedAt: Date | string;
    acceptedAt?: Date | string | null;
    confirmedAt?: Date | string | null;
    declinedAt?: Date | string | null;
    cancelledAt?: Date | string | null;
    completedAt?: Date | string | null;
    declinedReason?: string | null;
    cancellationReason?: string | null;
    guide?: Guide;
    user?: User;
  }

  interface GuideAvailability {
    workingDays: number[];
    workingHoursStart: string | null;
    workingHoursEnd: string | null;
    unavailableDates?: string[] | null;
    availabilityStatus: string;
    requiresStartTime: boolean;
  }

  // Tourism Spots and Activities
  interface TourSpot {
    id: string;
    name: string;
    description?: string;
    locationId: string;
    bestTimeToVisit?: string;
    seasonalInfo?: Record<string, any>;
    tourType: TourType;
    rating?: number;
    nearbyHotelsCount?: number;
    nearbyGuidesCount?: number;
    nearbyActivitySpotsCount?: number;
    isPopular: boolean;
    createdAt: Date;
    location: Location;
    reviews?: Review[];
    images?: Image[];
  }

  interface ActivitySpot {
    id: string;
    name: string;
    description: string;
    locationId: string;
    addressId?: string;
    phoneNumber?: string;
    extraPhoneNumbers?: string[];
    entryCost: number;
    maxBookingsPerDay?: number;
    bookingConfirmInstruction?: string | null;
    openingHours?: string;
    closingHours?: string;
    bestTimeToVisit?: string;
    duration?: string;
    ageRestriction?: string;
    activityType: ActivityType;
    nearbyHotelsCount?: number;
    nearbyGuidesCount?: number;
    rating?: number;
    isActive: boolean;
    isPopular: boolean;
    createdAt: Date;
    location: Location;
    reviews?: Review[];
    images?: Image[];
  }

  // Accommodation
  interface Hotel {
    id: string;
    name: string;
    description?: string;
    locationId: string;
    addressId?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    totalRooms?: number;
    availableRooms?: number;
    isRoomAvailableForSelectedShift?: boolean;
    amenities?: Category[];
    policies?: Category[];
    hotelCategories?: HotelCategory[];
    nearbyAttractions: string[];
    rating: number;
    hotelType: HotelType;
    checkInTime?: string;
    checkOutTime?: string;
    nearbyActivitySpotsCount?: number;
    nearbyGuidesCount?: number;
    isActive: boolean;
    createdAt: Date;
    location: Location;
    reviews?: Review[];
    images?: Image[];
    rooms?: HotelRoom[];
    roomTypes?: HotelRoomType[];
  }

  interface HotelRoomType {
    id: string;
    hotelId: string;
    roomType: HotelRoomCategory;
    singleBedCount: number;
    doubleBedCount: number;
    pricePerNight: number;
    nightShiftPrice?: number | null;
    morningShiftPrice?: number | null;
    afternoonShiftPrice?: number | null;
    allowShiftBooking: boolean;
    totalCount: number;
    availableCount: number;
    createdAt: Date;
    hotel: Hotel;
    images?: Image[];
    rooms?: HotelRoom[];
    bookingDetails?: HotelRoomBookingDetail[];
  }

  interface HotelRoom {
    id: string;
    hotelId: string;
    roomNumber: string;
    roomType: HotelRoomCategory;
    roomStatus: HotelRoomStatus;
    createdAt: Date;
    hotel: Hotel;
    hotelRoomType?: HotelRoomType;
    hotelRoomTypeId?: string;
    bookingDetails?: HotelRoomBookingDetail[];
  }

  interface HotelCategory {
    id: string;
    hotelId: string;
    categoryId: string;
    category: Category;
  }

  interface Transport {
    id: string;
    serviceAdminUserId: string;
    name: string;
    description: string;
    transportType: TransportServiceType;
    locationId: string | null;
    contactEmail: string;
    contactPhone: string;
    website: string | null;
    vehicleCount: number;
    capacity: number | null;
    licensePlatePrefix: string | null;
    operatingRoutes: string[];
    amenities: string[];
    policies: string[];
    rating: number;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    isSeeded: boolean;
    location: Location | null;
    addresses: Address[];
    images: Image[];
    reviews: Review[];
  }

  interface Guide {
    id: string;
    serviceAdminUserId: string;
    firstName: string;
    lastName: string;
    bio: string;
    specializations: TourType[];
    languages: Language[];
    toursCompleted: number;
    experienceYears: number;
    rating: number;
    pricePerDay: number;
    contactEmail: string;
    phoneNumber: string;
    certificationNumber: string | null;
    licenseNumber: string | null;
    locationId: string;
    isActive: boolean;
    isVerified: boolean;
    availabilityStatus: string;
    workingDays: number[];
    workingHoursStart: string | null;
    workingHoursEnd: string | null;
    unavailableDates?: string[] | Record<string, unknown> | null;
    requiresStartTime: boolean;
    createdAt: Date;
    updatedAt: Date;
    isSeeded: boolean;
    location?: Location;
    addresses?: Address[];
    images?: Image[];
    reviews?: Review[];
    _count?: {
      reviews: number;
      bookings: number;
    };
  }

  // Reviews and Ratings
  interface Review {
    id: string;
    reviewType: ReviewType;
    reviewAssetId: string;
    title?: string;
    description: string;
    rating: number;
    userId?: string;

    tourSpotId?: string;
    activitySpotId?: string;
    hotelId?: string;
    transportId?: string;
    guideId?: string;
    
    user?: User;
    TourSpot?: TourSpot;
    ActivitySpot?: ActivitySpot;
    Hotel?: Hotel;
    Transport?: Transport;
    Guide?: Guide;

    createdAt?: Date;
  }

  // Payment and Transactions
  interface PaymentTransaction {
    id: string;
    transactionId: string;
    serviceType: ServiceType;
    serviceTypeId: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    val_id?: string;
    bank_tran_id?: string;
    initiatedAt: Date;
    completedAt?: Date;
    failureReason?: string;
    sslcommerzData?: Record<string, any>;
    user: User;
    refunds?: PaymentRefund[];
    logs?: PaymentLog[];
  }

  interface PaymentRefund {
    id: string;
    paymentTransactionId: string;
    amount: number;
    remarks: string;
    status: RefundStatus;
    refund_ref_id?: string;
    requestedAt: Date;
    completedAt?: Date;
    paymentTransaction: PaymentTransaction;
  }

  interface PaymentLog {
    id: string;
    paymentTransactionId: string;
    event: string;
    details?: Record<string, any>;
    createdAt: Date;
    paymentTransaction: PaymentTransaction;
  }

  // Wallet System
  interface Wallet {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    walletStatus: WalletStatus;
    pin?: string;
    lastActivityAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transactions?: WalletTransaction[];
    refunds?: WalletRefund[];
    logs?: WalletLog[];
  }

  interface WalletTransaction {
    id: string;
    walletId: string;
    transactionType: WalletTransactionType;
    amount: number;
    currency: string;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    balanceBefore: number;
    balanceAfter: number;
    status: TransactionStatus;
    metadata?: Record<string, any>;
    createdAt: Date;
    processedAt?: Date;
    wallet: Wallet;
    refunds?: WalletRefund[];
    logs?: WalletLog[];
  }

  interface WalletRefund {
    id: string;
    walletId: string;
    walletTransactionId: string;
    amount: number;
    currency: string;
    reason: string;
    refundStatus: RefundStatus;
    adminNotes?: string;
    requestedAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    wallet: Wallet;
    walletTransaction: WalletTransaction;
  }

  interface WalletLog {
    id: string;
    walletId: string;
    walletTransactionId?: string;
    event: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    wallet: Wallet;
    walletTransaction?: WalletTransaction;
  }

  interface WalletRechargeOption {
    id:         string;
    title:       string;
    description: string;

    rechargeAmount: float;
    rechargeCost:   Float
    bonusAmount:    float;
  }

  // Media and Images
  interface Image {
    id: string;
    url: string;
    altText?: string;
    order?: number;
    width?: number;
    height?: number;
    fileSize?: number;
    uploadedAt?: Date;

    userId: string;
    user: User;
    
    tourSpotId?: string;
    activitySpotId?: string;
    hotelId?: string;
    hotelRoomTypeId?: string;
    transportId?: string;
    guideId?: string;

    TourSpot?: TourSpot;
    ActivitySpot?: ActivitySpot;
    Transport?: Transport;
    Guide?: Guide;
    
    section?: HeroSection;
  }

  interface HeroSectionImage {
    id: string;
    url: string;
    altText?: string;
    order?: number;
    width?: number;
    height?: number;
    fileSize?: number;
    section: HeroSection;
    siteConfigId: string;
    siteConfig: SiteConfig;
  }

  // Address and Location Data
  interface Address {
    id: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
    userId?: string;
  }

  // Notifications
  interface Notification {
    id: string;
    title: string;
    content: string;
    isRead: boolean;
    notificationPriority: Priority;
    notificationAudience: NotificationAudience;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    userId: string;
    createdAt: Date | string;
    readAt?: Date | string | null;
  }

  interface Complaint {
    id: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    addressedTo: ComplaintAddressedTo;
    targetType?: ComplaintTargetType | null;
    targetEntityId?: string | null;
    targetEntityName?: string | null;
    complainantUserId: string;
    complainantName?: string | null;
    adminResponse?: string | null;
    resolvedByUserId?: string | null;
    resolvedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    complainant?: {
      id: string;
      userName?: string | null;
      email?: string;
      imageUrl?: string | null;
    };
    target?: any | null;
  }

  interface ComplaintComment {
    id: string;
    complaintId: string;
    authorUserId: string;
    authorName?: string | null;
    content: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    author?: {
      id: string;
      userName?: string | null;
      imageUrl?: string | null;
      role?: string;
    };
  }

  // Site Configuration
  interface SiteConfig {
    id: string;
    isSingleton: boolean;
    siteStatus?: string;
    updatedAt: Date;
    heroImages: Image[];
    imageURLs?: string[];
    section?: HeroSection;
  }

  // Admin and Logging
  interface AdminLog {
    id: string;
    adminId: string;
    action: AdminAction;
    entityType: EntityType;
    entityId: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    admin: User;
  }

  // Booking System
  interface TripBooking {
    id: string;
    userTripPlanId: string;
    userId: string;
    status: BookingStatus;
    totalAmount: number;
    advanceAmount?: number;
    remainingAmount?: number;
    paymentMethod?: string;
    confirmationCode?: string;
    specialRequests?: string;
    bookedAt: Date;
    confirmeddAt?: Date;
    checkInDate?: Date;
    checkOutDate?: Date;
    userTripPlan: UserTripPlan;
    user: User;
  }

  // Community Posts
  type PostTagStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

  interface CommunityPost {
    id: string;
    creatorUserId: string;
    userTripPlanId?: string;
    userHasReacted?: boolean; // Indicates if the current user has reacted to this post
    caption?: string;
    isActive: boolean;
    wowCount: number;
    createdAt: Date;
    updatedAt: Date;
    creator?: User;
    userTripPlan?: UserTripPlan;
    images?: Image[];
    tags?: CommunityPostTag[];
  }

  interface CommunityPostTag {
    id: string;
    postId: string;
    taggedUserId: string;
    status: PostTagStatus;
    taggedAt: Date;
    post?: CommunityPost;
    taggedUser?: User;
  }

  interface CommunityPostsListResponse {
    results: CommunityPost[];
    total: number;
    page: number;
    limit: number;
  }
}

export {}
