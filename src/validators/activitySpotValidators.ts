import { z } from "zod";
import { ActivityType } from "@/types/enums";

export const createActivitySpotSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    locationId: z.string().uuid(),
    addressId: z.string().uuid().optional(),
    entryCost: z.number().nonnegative(),
    openingHours: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    duration: z.string().optional(),
    ageRestriction: z.string().optional(),
    activityType: z.nativeEnum(ActivityType),
    isActive: z.boolean().optional().default(true),
    isPopular: z.boolean().optional().default(false),
});

export const updateActivitySpotSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    locationId: z.string().uuid().optional(),
    addressId: z.string().uuid().optional(),
    entryCost: z.number().nonnegative().optional(),
    openingHours: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    duration: z.string().optional(),
    ageRestriction: z.string().optional(),
    activityType: z.nativeEnum(ActivityType).optional(),
    rating: z.number().min(0).max(5).optional(),
    isActive: z.boolean().optional(),
    isPopular: z.boolean().optional(),
});
