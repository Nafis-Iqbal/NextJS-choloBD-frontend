import { z } from "zod";

export const createAddressSchema = z.object({
    addressLine1: z.string().min(1, "Address Line 1 is required").max(255),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(100),
    postalCode: z.string().min(1, "Postal Code is required").max(20),
    country: z.string().min(1, "Country is required").max(100),
    phoneNumber: z.string().min(1, "Phone Number is required").max(20).regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),
    user_id: z.string().min(1, "User ID is required").optional(),
});

export const updateAddressSchema = z.object({
    addressLine1: z.string().min(1, "Address Line 1 is required").max(255).optional(),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().min(1, "City is required").max(100).optional(),
    state: z.string().min(1, "State is required").max(100).optional(),
    postalCode: z.string().min(1, "Postal Code is required").max(20).optional(),
    country: z.string().min(1, "Country is required").max(100).optional(),
    phoneNumber: z.string().min(1, "Phone Number is required").max(20).regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").optional(),
});

export const addressFilterSchema = z.object({
    user_id: z.string().min(1, "User ID is required").optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
});
