import { z } from "zod";
import { ActivityType } from "@/types/enums";

export const createTourSpotSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    locationId: z.string().uuid(),
    addressId: z.string().uuid().optional(),
    entryCost: z.number().nonnegative().optional(),
    openingHours: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    contactInfo: z.record(z.any()).optional(),
    facilities: z.array(z.string()).min(1),
    seasonalInfo: z.record(z.any()).optional(),
    spotType: z.nativeEnum(ActivityType),
    isPopular: z.boolean().optional().default(false),
});

export const updateTourSpotSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    locationId: z.string().uuid().optional(),
    addressId: z.string().uuid().optional(),
    entryCost: z.number().nonnegative().optional(),
    openingHours: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    contactInfo: z.record(z.any()).optional(),
    facilities: z.array(z.string()).optional(),
    seasonalInfo: z.record(z.any()).optional(),
    spotType: z.nativeEnum(ActivityType).optional(),
    rating: z.number().min(0).max(5).optional(),
    isPopular: z.boolean().optional(),
});
