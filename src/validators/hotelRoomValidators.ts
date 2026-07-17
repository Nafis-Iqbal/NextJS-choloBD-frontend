/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { HotelRoomCategory } from "@/types/enums";
import { withNullsStripped } from "./schemaUtils";

export const createHotelRoomTypeSchema = withNullsStripped(z.object({
    roomType: z.nativeEnum(HotelRoomCategory).refine(
        (v) => Object.values(HotelRoomCategory).includes(v as any),
        { message: "Invalid room type" }
    ),
    singleBedCount: z.number({ invalid_type_error: "Single bed count must be a number" })
        .int({ message: "Single bed count must be an integer" })
        .nonnegative({ message: "Single bed count cannot be negative" }),
    doubleBedCount: z.number({ invalid_type_error: "Double bed count must be a number" })
        .int({ message: "Double bed count must be an integer" })
        .nonnegative({ message: "Double bed count cannot be negative" }),
    totalCount: z.number({ invalid_type_error: "Total count must be a number" })
        .int({ message: "Total count must be an integer" })
        .positive({ message: "Total count must be greater than 0" })
        .optional(),
    pricePerNight: z.number({ invalid_type_error: "Price per night must be a number" })
        .positive({ message: "Price per night must be greater than 0" }),
    allowShiftBooking: z.boolean().optional().default(false),
    imageURLs: z.array(z.string()).optional(),
}).refine(
    (data) => data.singleBedCount > 0 || data.doubleBedCount > 0,
    {
        message: "At least one bed (single or double) must be assigned to the room",
        path: ["singleBedCount"]
    }
));

export const updateHotelRoomTypeSchema = withNullsStripped(z.object({
    roomType: z.nativeEnum(HotelRoomCategory).optional().refine(
        (v) => v === undefined || Object.values(HotelRoomCategory).includes(v as any),
        { message: "Invalid room type" }
    ),
    singleBedCount: z.number({ invalid_type_error: "Single bed count must be a number" })
        .int({ message: "Single bed count must be an integer" })
        .nonnegative({ message: "Single bed count cannot be negative" })
        .optional(),
    doubleBedCount: z.number({ invalid_type_error: "Double bed count must be a number" })
        .int({ message: "Double bed count must be an integer" })
        .nonnegative({ message: "Double bed count cannot be negative" })
        .optional(),
    totalCount: z.number({ invalid_type_error: "Total count must be a number" })
        .int({ message: "Total count must be an integer" })
        .positive({ message: "Total count must be greater than 0" })
        .optional(),
    pricePerNight: z.number({ invalid_type_error: "Price per night must be a number" })
        .positive({ message: "Price per night must be greater than 0" })
        .optional(),
    allowShiftBooking: z.boolean().optional(),
    imageURLs: z.array(z.string()).optional(),
}).refine(
    (data) => {
        if (data.singleBedCount === undefined && data.doubleBedCount === undefined) {
            return true;
        }
        const single = data.singleBedCount ?? 0;
        const double = data.doubleBedCount ?? 0;
        return single > 0 || double > 0;
    },
    {
        message: "At least one bed (single or double) must be assigned to the room",
        path: ["singleBedCount"]
    }
));
