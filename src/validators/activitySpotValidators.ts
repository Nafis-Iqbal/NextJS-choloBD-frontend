/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { ActivityType } from "@/types/enums";
import { withNullsStripped } from "./schemaUtils";

//UPDATE missing ADDRESS_ID
export const createActivitySpotSchema = withNullsStripped(z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(255, { message: "Name must be at most 255 characters" }),
    description: z.string().optional(),
    locationId: z.string().uuid({ message: "Location is required and must be a valid id" }),
    //addressId: z.string().uuid({ message: "Address must be a valid id" }).optional(),
    phoneNumber: z.string().max(20, { message: "Phone number must be at most 20 characters" }).optional(),
    extraPhoneNumbers: z.array(z.string().max(20)).optional(),
    entryCost: z.number({ invalid_type_error: "Entry cost must be a number" }).nonnegative({ message: "Entry cost must be 0 or greater" }),
    maxBookingsPerDay: z.number({ invalid_type_error: "Max bookings per day must be a number" })
        .int({ message: "Max bookings per day must be an integer" })
        .min(1, { message: "Max bookings per day must be at least 1" })
        .max(1000, { message: "Max bookings per day cannot exceed 1000" })
        .optional(),
    bookingConfirmInstruction: z.string().max(2000, { message: "Booking confirm instruction must be at most 2000 characters" }).optional(),
    openingHours: z.string().optional(),
    closingHours: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    duration: z.string().optional(),
    ageRestriction: z.string().optional(),
    activityType: z.nativeEnum(ActivityType).refine((v) => Object.values(ActivityType).includes(v as any), { message: "Invalid activity type" }),
    isActive: z.boolean().optional().default(true),
    isPopular: z.boolean().optional().default(false),
}));

export const updateActivitySpotSchema = withNullsStripped(z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).
        max(255, { message: "Name must be at most 255 characters" }).optional(),
    description: z.string().optional(),
    locationId: z.string().uuid({ message: "Location must be a valid id" }).optional(),
    //addressId: z.string().uuid({ message: "Address must be a valid id" }).optional(),
    phoneNumber: z.string().max(20, { message: "Phone number must be at most 20 characters" }).optional(),
    extraPhoneNumbers: z.array(z.string().max(20)).optional(),
    entryCost: z.number({ invalid_type_error: "Entry cost must be a number" }).
        nonnegative({ message: "Entry cost must be 0 or greater" }).optional(),
    maxBookingsPerDay: z.number({ invalid_type_error: "Max bookings per day must be a number" })
        .int({ message: "Max bookings per day must be an integer" })
        .min(1, { message: "Max bookings per day must be at least 1" })
        .max(1000, { message: "Max bookings per day cannot exceed 1000" })
        .optional(),
    bookingConfirmInstruction: z.string().max(2000, { message: "Booking confirm instruction must be at most 2000 characters" }).optional(),
    openingHours: z.string().optional(),
    closingHours: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    duration: z.string().optional(),
    ageRestriction: z.string().optional(),
    activityType: z.nativeEnum(ActivityType).optional().refine((v) => v === undefined || 
        Object.values(ActivityType).includes(v as any), { message: "Invalid activity type" }),
    isActive: z.boolean().optional(),
    isPopular: z.boolean().optional(),
}));
