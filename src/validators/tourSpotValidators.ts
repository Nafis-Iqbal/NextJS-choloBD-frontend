/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { TourType } from "@/types/enums";

export const createTourSpotSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).
        max(255, { message: "Name must be at most 255 characters" }),
    description: z.string().optional(),
    locationId: z.string().uuid({ message: "Location is required and must be a valid id" }),
    bestTimeToVisit: z.string().optional(),
    seasonalInfo: z.record(z.any()).optional(),
    tourType: z.nativeEnum(TourType).refine((v) => Object.values(TourType).includes(v as any), { message: "Invalid tour type" }),
    isPopular: z.boolean().optional().default(false),
});

export const updateTourSpotSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).
        max(255, { message: "Name must be at most 255 characters" }).optional(),
    description: z.string().optional(),
    locationId: z.string().uuid({ message: "Location must be a valid id" }).optional(),
    bestTimeToVisit: z.string().optional(),
    seasonalInfo: z.record(z.any()).optional().nullable(),
    tourType: z.nativeEnum(TourType).optional().refine((v) => v === undefined || Object.values(TourType).includes(v as any), { message: "Invalid tour type" }),
    isPopular: z.boolean().optional(),
});
