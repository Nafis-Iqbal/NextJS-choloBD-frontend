import { z } from "zod";
import { withNullsStripped } from "./schemaUtils";

export const createGuideBookingSchema = withNullsStripped(z.object({
    guideId: z.string().uuid({ message: "Guide ID must be a valid UUID" }),

    userId: z.string().uuid({ message: "You must be signed in to request a guide" }),

    bookingDate: z.union([
        z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
            message: "Booking date must be a valid date",
        }),
        z.date(),
    ]),

    startTime: z
        .union([
            z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
                message: "Start time must be a valid datetime",
            }),
            z.date(),
        ])
        .optional(),

    endTime: z.union([
        z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
            message: "End time must be a valid datetime",
        }),
        z.date(),
    ]),

    travelerCount: z
        .number({ invalid_type_error: "Traveler count must be a number" })
        .int({ message: "Traveler count must be a whole number" })
        .min(1, { message: "At least 1 traveler is required" })
        .max(50, { message: "Traveler count cannot exceed 50" }),

    specialRequirements: z
        .string()
        .max(500, { message: "Special requirements cannot exceed 500 characters" })
        .optional(),

    paymentMethod: z.enum(["wallet", "sslcommerz", "cash"]).optional(),

    specialRequests: z
        .string()
        .max(500, { message: "Special requests cannot exceed 500 characters" })
        .optional(),
}).superRefine((data, ctx) => {
    const bookingDate = new Date(data.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Booking date cannot be in the past",
            path: ["bookingDate"],
        });
    }

    if (data.startTime) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        if (end.getTime() <= start.getTime()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End time must be after start time",
                path: ["endTime"],
            });
        }
    }
}));
