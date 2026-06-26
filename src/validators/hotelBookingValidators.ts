import { z } from "zod";
import { RoomShift } from "@/types/enums";

function toStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function asDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return null;
}

// Validator for creating a hotel room booking
export const createHotelRoomBookingSchema = z.object({
  hotelId: z.string()
    .uuid({ message: "Hotel ID must be a valid UUID" }),
  
  userId: z.union([
    z.literal("Guest"),
    z.string().uuid({ message: "User ID must be a valid UUID" }),
  ]),
  
  checkInDate: z.union([
    z.string()
      .refine((date) => !Number.isNaN(Date.parse(date)), {
        message: "Check-in date must be a valid date string (ISO 8601)",
      }),
    z.date(),
  ]),
  
  checkOutDate: z.union([
    z.string()
      .refine((date) => !Number.isNaN(Date.parse(date)), {
        message: "Check-out date must be a valid date string (ISO 8601)",
      }),
    z.date(),
  ]),

  shift: z.enum(["ALL_DAY", "MORNING", "AFTERNOON", "NIGHT"])
    .default("ALL_DAY"),
  
  totalPrice: z.number()
    .positive({ message: "Total price must be greater than 0" })
    .finite({ message: "Total price must be a finite number" }),
  
  paymentMethod: z.string()
    .min(1, { message: "Payment method must not be empty" })
    .optional(),
  
  specialRequests: z.string()
    .max(500, { message: "Special requests cannot exceed 500 characters" })
    .optional(),
  
  // Selected rooms map: roomTypeId -> quantity
  selectedRoomsMap: z.record(
    z.string().uuid({ message: "Room type ID must be a valid UUID" }),
    z.number()
      .int({ message: "Quantity must be an integer" })
      .positive({ message: "Quantity must be greater than 0" })
  )
    .refine((map) => Object.keys(map).length > 0, {
      message: "At least one room type must be selected",
    }),
  
  guestName: z.string()
    .min(2, { message: "Guest name must be at least 2 characters" })
    .max(100, { message: "Guest name cannot exceed 100 characters" }),
  
  guestEmail: z.string()
    .email({ message: "Guest email must be a valid email address" }),
  
  guestPhoneNumber: z.string()
    .min(10, { message: "Guest phone number must be at least 10 digits" })
    .max(20, { message: "Guest phone number cannot exceed 20 characters" })
    .regex(/^\d+$/, { message: "Guest phone number must contain only digits" }),
}).superRefine((data, ctx) => {
  const today = toStartOfDay(new Date());
  const checkIn = asDate(data.checkInDate);
  const checkOut = asDate(data.checkOutDate);
  const shift = data.shift || "ALL_DAY";

  if (!checkIn || Number.isNaN(checkIn.getTime())) {
    return;
  }

  if (toStartOfDay(checkIn) < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["checkInDate"],
      message: "Check-in date cannot be in the past",
    });
  }

  if (!checkOut || Number.isNaN(checkOut.getTime())) {
    return;
  }

  if (shift === "ALL_DAY") {
    // For all-day shifts, checkout must be after check-in
    if (toStartOfDay(checkOut) <= toStartOfDay(checkIn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOutDate"],
        message: "Check-out date must be after check-in date",
      });
    }
  } else {
    // For other shifts (MORNING, AFTERNOON, NIGHT), checkout must be the same as check-in
    if (toStartOfDay(checkOut).getTime() !== toStartOfDay(checkIn).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOutDate"],
        message: "For this shift, check-out must be the same as check-in date",
      });
    }
  }
});

export type CreateHotelRoomBookingSchema = z.infer<typeof createHotelRoomBookingSchema>;

// Validator for updating a hotel room booking
export const updateHotelRoomBookingSchema = z.object({
  checkInDate: z.union([
    z.string()
      .refine((date) => !Number.isNaN(Date.parse(date)), {
        message: "Check-in date must be a valid date string (ISO 8601)",
      }),
    z.date(),
  ])
    .refine((value) => {
      const date = asDate(value);
      if (!date || Number.isNaN(date.getTime())) return false;
      return toStartOfDay(date) >= toStartOfDay(new Date());
    }, { message: "Check-in date cannot be in the past" })
    .optional(),
  
  checkOutDate: z.union([
    z.string()
      .refine((date) => !Number.isNaN(Date.parse(date)), {
        message: "Check-out date must be a valid date string (ISO 8601)",
      }),
    z.date(),
  ])
    .optional(),

  shift: z.enum(["ALL_DAY", "MORNING", "AFTERNOON", "NIGHT"])
    .optional(),
  
  totalPrice: z.number()
    .positive({ message: "Total price must be greater than 0" })
    .optional(),
  
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .optional(),
  
  paymentMethod: z.string()
    .min(1, { message: "Payment method must not be empty" })
    .optional(),
  
  specialRequests: z.string()
    .max(500, { message: "Special requests cannot exceed 500 characters" })
    .optional(),
  
  cancellationReason: z.string()
    .max(500, { message: "Cancellation reason cannot exceed 500 characters" })
    .optional(),
}).strict().superRefine((data, ctx) => {
  if (!data.checkInDate || !data.checkOutDate) return;

  const checkIn = asDate(data.checkInDate);
  const checkOut = asDate(data.checkOutDate);
  const shift = data.shift || "ALL_DAY";

  if (!checkIn || !checkOut) return;
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return;

  if (shift === "ALL_DAY") {
    // For all-day shifts, checkout must be after check-in
    if (toStartOfDay(checkOut) <= toStartOfDay(checkIn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOutDate"],
        message: "Check-out date must be after check-in date",
      });
    }
  } else {
    // For other shifts (MORNING, AFTERNOON, NIGHT), checkout must be the same as check-in
    if (toStartOfDay(checkOut).getTime() !== toStartOfDay(checkIn).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOutDate"],
        message: "For this shift, check-out must be the same as check-in date",
      });
    }
  }
});

export type UpdateHotelRoomBookingSchema = z.infer<typeof updateHotelRoomBookingSchema>;
