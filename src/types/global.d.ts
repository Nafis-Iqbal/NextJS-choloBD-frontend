/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import {
  Role,
  UserStatus,
  UserTripStatus,
  LocationType,
  TourType,
  ActivityType,
  HotelType,
  HotelServiceType,
  TransportServiceType,
  BusServiceType,
  FlightServiceType,
  TrainServiceType,
  PaymentStatus,
  RefundStatus,
  WalletStatus,
  WalletTransactionType,
  TransactionStatus,
  ServiceType,
  BookingStatus,
  ReviewType,
  Priority,
  SiteStatus,
  HeroSection,
  AdminAction,
  EntityType,
  ComplaintStatus
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
    serviceTypeAdmin?: ServiceType;
    serviceAddressId?: string; 

    userStatus: UserStatus;
    paymentStatus: PaymentStatus;
    emailVerified?: Date;
    phoneVerified?: Date;
    createdAt: Date;

    wallet?: Wallet;
    spent: number;
    earned: number;
    
    serviceAddresses?: Address[]
    notifications?: Notification[];
    reviews?: Review[];
    userTripPlans?: UserTripPlan[];
    tripBookings?: TripBooking[];
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
    state?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    parentLocationId?: string;
    timezone?: string;
    popularityScore: number;
    imageUrl?: string;
    features: string[];
    climate?: string;
    bestVisitTime?: string;
    isPopular: boolean;
    createdAt: Date;
    parentLocation?: Location;
    childLocations?: Location[];
    tourPackages?: TourPackage[];
    tourSpots?: TourSpot[];
    activitySpots?: ActivitySpot[];
    hotels?: Hotel[];
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
    transportOption: TransportServiceType;
    hotelOption: HotelServiceType;
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
    customHotel?: HotelServiceType;
    customNotes?: string;
    estimatedCost?: number;
    startTime?: string;
    endTime?: string;
    createdAt: Date;
    updatedAt: Date;
    userTripPlan: UserTripPlan;
    basedOnSegment?: TourDaySegment;
  }

  // Tourism Spots and Activities
  interface TourSpot {
    id: string;
    name: string;
    description?: string;
    locationId: string;
    addressId?: string;
    bestTimeToVisit?: string;
    seasonalInfo?: Record<string, any>;
    spotType: ActivityType;
    rating?: number;
    isPopular: boolean;
    createdAt: Date;
    location: Location;
    reviews?: Review[];
    images?: Image[];
  }

  interface ActivitySpot {
    id: string;
    name: string;
    description?: string;
    locationId: string;
    addressId?: string;
    entryCost: number;
    openingHours?: string;
    bestTimeToVisit?: string;
    duration?: string;
    ageRestriction?: string;
    activityType: ActivityType;
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
    policies?: Record<string, any>;
    nearbyAttractions: string[];
    rating: number;
    hotelType: HotelType;
    amenities: string[];
    checkInTime?: string;
    checkOutTime?: string;
    isActive: boolean;
    createdAt: Date;
    location: Location;
    reviews?: Review[];
    images?: Image[];
  }

  // Reviews and Ratings
  interface Review {
    id: string;
    title?: string;
    description: string;
    rating: number;
    reviewType: ReviewType;
    createdAt?: Date;
    userId: string;
    tourSpotId?: string;
    activitySpotId?: string;
    hotelId?: string;
    user?: User;
    TourSpot?: TourSpot;
    ActivitySpot?: ActivitySpot;
    Hotel?: Hotel;
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

    createdAt: Date;
    updatedAt: Date;
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
    userId: string;
    user: User;
    TourSpot?: TourSpot;
    tourSpotId?: string;
    ActivitySpot?: ActivitySpot;
    activitySpotId?: string;
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
    content: string;
    isRead: boolean;
    notificationPriority: Priority;
    userId: string;
    user: User;
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
}

export {}
