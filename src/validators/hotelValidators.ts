/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { HotelType } from "@/types/enums";
import { withNullsStripped } from "./schemaUtils";

export const createHotelSchema = withNullsStripped(z.object({
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
}));

export const updateHotelInfoSchema = withNullsStripped(z.object({
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
}));

export const updateHotelInfoAdminSchema = withNullsStripped(z.object({
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
}));
