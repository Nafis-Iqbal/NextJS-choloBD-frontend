import { z } from "zod";
import { LocationType } from "@/types/enums";

export const createLocationSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .min(2, "Location name must be at least 2 characters")
    .max(100, "Location name must be less than 100 characters"),
    
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
    
  locationType: z
    .nativeEnum(LocationType, { errorMap: () => ({ message: "Please select a valid location type" }) }),
    
  country: z
    .string()
    .min(1, "Country is required")
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be less than 50 characters"),
    
  state: z
    .string()
    .max(50, "State must be less than 50 characters")
    .optional(),
    
  city: z
    .string()
    .max(50, "City must be less than 50 characters")
    .optional(),
    
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
    
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
    
  parentLocationId: z
    .string()
    .optional(),
    
  timezone: z
    .string()
    .max(50, "Timezone must be less than 50 characters")
    .optional(),
    
  popularityScore: z
    .number()
    .min(0, "Popularity score cannot be negative")
    .max(100, "Popularity score cannot exceed 100")
    .default(0),
    
  imageUrl: z
    .string()
    .url("Please provide a valid image URL")
    .optional(),
    
  features: z
    .array(z.string())
    .default([]),
    
  climate: z
    .string()
    .max(100, "Climate description must be less than 100 characters")
    .optional(),
    
  bestVisitTime: z
    .string()
    .max(200, "Best visit time must be less than 200 characters")
    .optional(),
    
  isPopular: z
    .boolean()
    .default(false)
});

export const updateLocationSchema = createLocationSchema.partial();