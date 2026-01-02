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
    .optional()
});

export const updateLocationSchema = createLocationSchema.partial();