import { z } from "zod";
import { withNullsStripped } from "./schemaUtils";

export const createActivityBookingSchema = withNullsStripped(z.object({
    activitySpotId: z.string().uuid({ message: "Activity spot ID must be a valid UUID" }),

    userId: z.string().uuid({ message: "You must be signed in to book an activity" }),

    bookingDate: z.union([
        z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
            message: "Booking date must be a valid date",
        }),
        z.date(),
    ]),

    participantCount: z
        .number({ invalid_type_error: "Participant count must be a number" })
        .int({ message: "Participant count must be a whole number" })
        .min(1, { message: "At least 1 participant is required" })
        .max(100, { message: "Participant count cannot exceed 100" }),

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
}));
