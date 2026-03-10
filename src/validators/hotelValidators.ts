/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { HotelType, HotelRoomCategory } from "@/types/enums";

export const createHotelSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).
        max(255, { message: "Name must be at most 255 characters" }),
    description: z.string().optional(),
    locationId: z.string().uuid({ message: "Location is required and must be a valid id" }),
    addressId: z.string().uuid({ message: "Address must be a valid id" }).optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email({ message: "Email must be a valid email address" }).optional(),
    website: z.string().url({ message: "Website must be a valid URL" }).optional(),
    hotelType: z.nativeEnum(HotelType).refine((v) => Object.values(HotelType).includes(v as any), { message: "Invalid hotel type" }),
    amenities: z.array(z.object({ id: z.string(), name: z.string() })).min(1, { message: "Provide at least one amenity" }),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "Check-in time must be in HH:MM format" }).optional(),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "Check-out time must be in HH:MM format" }).optional(),
    isActive: z.boolean().optional().default(true),
    // System-generated fields like rating, reviews, createdAt are excluded
});

export const updateHotelInfoSchema = z.object({
    // User-facing editable fields only
    description: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email({ message: "Email must be a valid email address" }).optional(),
    website: z.string().url({ message: "Website must be a valid URL" }).optional(),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "Check-in time must be in HH:MM format" }).optional(),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "Check-out time must be in HH:MM format" }).optional(),
    amenities: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    policies: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    addressId: z.string().uuid({ message: "Address must be a valid id" }).optional(),
    locationId: z.string().uuid({ message: "Location must be a valid id" }).optional(),
    // Sensitive or system-managed fields like rating, totalRooms, isActive are excluded
});

export const updateHotelInfoAdminSchema = z.object({
    // Admin can edit most fields, except system-managed ones
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(255, { message: "Name must be at most 255 characters" }).optional(),
    description: z.string().optional(),
    locationId: z.string().uuid({ message: "Location must be a valid id" }).optional(),
    addressId: z.string().uuid({ message: "Address must be a valid id" }).optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email({ message: "Email must be a valid email address" }).optional(),
    website: z.string().url({ message: "Website must be a valid URL" }).optional(),
    hotelType: z.nativeEnum(HotelType).optional().refine((v) => v === undefined || Object.values(HotelType).includes(v as any), { message: "Invalid hotel type" }),
    amenities: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "Check-in time must be in HH:MM format" }).optional(),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "Check-out time must be in HH:MM format" }).optional(),
    isActive: z.boolean().optional(),
    policies: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    // Exclude system-managed fields
    rating: z.never(),
    createdAt: z.never(),
    reviews: z.never(),
});

export const createHotelRoomTypeSchema = z.object({
    roomType: z.nativeEnum(HotelRoomCategory).refine((v) => Object.values(HotelRoomCategory).includes(v as any), { message: "Invalid room type" }),
    singleBedCount: z.number({ invalid_type_error: "Single bed count must be a number" }).int({ message: "Single bed count must be an integer" }).
        nonnegative({ message: "Single bed count cannot be negative" }),
    doubleBedCount: z.number({ invalid_type_error: "Double bed count must be a number" }).int({ message: "Double bed count must be an integer" }).
        nonnegative({ message: "Double bed count cannot be negative" }),
    pricePerNight: z.number({ invalid_type_error: "Price per night must be a number" }).
        positive({ message: "Price per night must be greater than 0" })
}).refine(
    (data) => data.singleBedCount > 0 || data.doubleBedCount > 0,
    {
        message: "At least one bed (single or double) must be assigned to the room",
        path: ["singleBedCount"]
    }
);
