import { z } from "zod";
import { HotelType } from "@/types/enums";

export const createHotelSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    locationId: z.string().uuid(),
    addressId: z.string().uuid().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    totalRooms: z.number().int().nonnegative().optional(),
    nearbyAttractions: z.array(z.string()).min(1),
    hotelType: z.nativeEnum(HotelType),
    amenities: z.array(z.string()).min(1),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    // System-generated fields like rating, reviews, createdAt are excluded
});

export const updateHotelInfoSchema = z.object({
    // User-facing editable fields only
    description: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    availableRooms: z.number().int().nonnegative().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    policies: z.record(z.any()).optional(),
    nearbyAttractions: z.array(z.string()).optional(),
    addressId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    // Sensitive or system-managed fields like rating, totalRooms, isActive are excluded
});

export const updateHotelInfoAdminSchema = z.object({
    // Admin can edit most fields, except system-managed ones
    name: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    locationId: z.string().uuid().optional(),
    addressId: z.string().uuid().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    totalRooms: z.number().int().nonnegative().optional(),
    availableRooms: z.number().int().nonnegative().optional(),
    nearbyAttractions: z.array(z.string()).optional(),
    hotelType: z.nativeEnum(HotelType).optional(),
    amenities: z.array(z.string()).optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    isActive: z.boolean().optional(),
    policies: z.record(z.any()).optional(),
    // Exclude system-managed fields
    rating: z.never(),
    createdAt: z.never(),
    reviews: z.never(),
});
