/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { TransportServiceType } from "@/types/enums";
import { withNullsStripped } from "./schemaUtils";

const csvToStringArray = z.preprocess((value) => {
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === "string" && item.trim().length > 0);
    }
    if (typeof value !== "string") return undefined;
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}, z.array(z.string()).optional());

const optionalUrl = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url({ message: "Website must be a valid URL" }).optional()
);

const optionalUuid = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid({ message: "Must be a valid id" }).optional()
);

const sharedTransportFields = {
    description: z.string().max(2000).optional(),
    contactEmail: z.string().email({ message: "Please provide a valid email address" }).optional(),
    phoneNumber: z.string().max(20).optional(),
    extraPhoneNumbers: csvToStringArray,
    website: optionalUrl,
    locationId: optionalUuid,
    vehicleCount: z.coerce.number().int().min(1).optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    licensePlatePrefix: z.string().max(20).optional(),
    operatingRoutes: csvToStringArray,
    amenities: csvToStringArray,
    policies: csvToStringArray,
    imageURLs: z.array(z.string().url()).optional(),
    imageIdsToDelete: z.array(z.string().uuid()).optional(),
};

export const createTransportSchema = withNullsStripped(z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(255),
    description: z.string().min(1, { message: "Description is required" }).max(2000),
    transportType: z.nativeEnum(TransportServiceType),
    contactEmail: z.string().email({ message: "Please provide a valid email address" }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" }).max(20),
    locationId: optionalUuid,
    serviceAdminUserId: optionalUuid,
    extraPhoneNumbers: csvToStringArray,
    website: optionalUrl,
    vehicleCount: z.coerce.number().int().min(1).optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    licensePlatePrefix: z.string().max(20).optional(),
    operatingRoutes: csvToStringArray,
    amenities: csvToStringArray,
    policies: csvToStringArray,
    imageURLs: z.array(z.string().url()).optional(),
}));

export const updateTransportSchema = withNullsStripped(z.object(sharedTransportFields));

export const updateTransportAdminSchema = withNullsStripped(z.object({
    ...sharedTransportFields,
    name: z.string().min(2).max(255).optional(),
    transportType: z.nativeEnum(TransportServiceType).optional(),
    serviceAdminUserId: optionalUuid,
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
}));
