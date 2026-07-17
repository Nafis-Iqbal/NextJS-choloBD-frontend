/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { Language, TourType } from "@/types/enums";
import { withNullsStripped } from "./schemaUtils";

const tourTypeSchema = z.nativeEnum(TourType);

const languageSchema = z.nativeEnum(Language);

const languagesSchema = z
    .array(languageSchema)
    .min(1, { message: "Select at least one language" });

const specializationsSchema = z
    .array(tourTypeSchema)
    .min(1, { message: "Select at least one specialization" });

const timeHHMMSchema = z
    .string({ required_error: "Time is required" })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: "Time must be in HH:MM format (24-hour)",
    });

const workingDaysSchema = z
    .array(
        z.number().int().min(0, { message: "Day must be 0 (Sunday) through 6 (Saturday)" })
            .max(6, { message: "Day must be 0 (Sunday) through 6 (Saturday)" })
    )
    .min(1, { message: "Select at least one working day" })
    .max(7, { message: "Working days cannot exceed 7" });

const refineWorkingHoursOrder = <T extends { workingHoursStart?: string; workingHoursEnd?: string }>(
    data: T,
    ctx: z.RefinementCtx
) => {
    if (!data.workingHoursStart || !data.workingHoursEnd) return;

    const [startH, startM] = data.workingHoursStart.split(":").map(Number);
    const [endH, endM] = data.workingHoursEnd.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Working hours end must be after working hours start",
            path: ["workingHoursEnd"],
        });
    }
};

const createGuideObjectSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    pricePerDay: z.number({ invalid_type_error: "Price per day must be a number" })
        .nonnegative({ message: "Price per day must be 0 or greater" }),
    contactEmail: z.string().email({ message: "A valid contact email is required" }),
    phoneNumber: z
        .string()
        .min(1, { message: "Phone number is required" })
        .max(20, { message: "Phone number must not exceed 20 characters" })
        .regex(/^\+?[\d\s\-()]+$/, { message: "Invalid phone number format" }),
    serviceAdminUserId: z.string().uuid({ message: "Service admin user must be a valid id" }).optional(),
    locationId: z.string().uuid({ message: "Location is required" }),
    bio: z.string().min(1, { message: "Bio is required" }),
    specializations: specializationsSchema,
    languages: languagesSchema,
    experienceYears: z.number({ invalid_type_error: "Experience years must be a number" })
        .int({ message: "Experience years must be a whole number" })
        .nonnegative({ message: "Experience years must be 0 or greater" })
        .optional()
        .default(0),
    certificationNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    workingDays: workingDaysSchema,
    workingHoursStart: timeHHMMSchema,
    workingHoursEnd: timeHHMMSchema,
    requiresStartTime: z.boolean().optional().default(true),
});

export const createGuideSchema = withNullsStripped(
    createGuideObjectSchema.superRefine(refineWorkingHoursOrder)
);

const updateGuideObjectSchema = z.object({
    bio: z.string().min(1, { message: "Bio cannot be empty" }).optional(),
    specializations: specializationsSchema.optional(),
    languages: languagesSchema.optional(),
    experienceYears: z.number({ invalid_type_error: "Experience years must be a number" })
        .int({ message: "Experience years must be a whole number" })
        .nonnegative({ message: "Experience years must be 0 or greater" })
        .optional(),
    pricePerDay: z.number({ invalid_type_error: "Price per day must be a number" })
        .nonnegative({ message: "Price per day must be 0 or greater" })
        .optional(),
    contactEmail: z.string().email({ message: "Contact email must be valid" }).optional(),
    phoneNumber: z
        .string()
        .min(1, { message: "Phone number cannot be empty" })
        .max(20, { message: "Phone number must not exceed 20 characters" })
        .regex(/^\+?[\d\s\-()]+$/, { message: "Invalid phone number format" })
        .optional(),
    certificationNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    locationId: z.string().uuid({ message: "Location must be a valid id" }).optional(),
    workingDays: workingDaysSchema.optional(),
    workingHoursStart: timeHHMMSchema.optional(),
    workingHoursEnd: timeHHMMSchema.optional(),
    requiresStartTime: z.boolean().optional(),
});

export const updateGuideSchema = withNullsStripped(
    updateGuideObjectSchema.superRefine(refineWorkingHoursOrder)
);

export const updateGuideAdminSchema = withNullsStripped(
    updateGuideObjectSchema.extend({
        firstName: z.string().min(1, { message: "First name is required" }).optional(),
        lastName: z.string().min(1, { message: "Last name is required" }).optional(),
        serviceAdminUserId: z.string().uuid({ message: "Service admin user must be a valid id" }).optional(),
        isActive: z.boolean().optional(),
        isVerified: z.boolean().optional(),
    }).superRefine(refineWorkingHoursOrder)
);
