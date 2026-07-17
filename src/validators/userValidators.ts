import { z } from "zod";
import { withNullsStripped } from "./schemaUtils";

export const registerUserSchema = withNullsStripped(z.object({
    user_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirmation: z.string()
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
}));

export const loginUserSchema = withNullsStripped(z.object({
    email: z.string().email(),
    password: z.string().min(8)
}));

export const updateUserSchema = withNullsStripped(z.object({
    id: z.string().uuid(),
    user_name: z.string().min(3).optional(),
    addressId: z.string().uuid().optional(),
    imageURL: z.string().url().optional(),
}).strict());

export const updateUserRoleStatusSchema = withNullsStripped(z.object({
    role: z.enum(["ADMIN", "MASTER_ADMIN"]).optional(),
    userStatus: z.enum(["ACTIVE", "BANNED", "RESTRICTED"]).optional()
}));

export const filterUsersSchema = withNullsStripped(z.object({
    minimum_spent: z.number().optional(),
    minimum_order_count: z.number().optional(),
    email: z.string().email().optional(),
}));

export const filterVendorsSchema = withNullsStripped(z.object({
    minimum_earned: z.number().optional(),
    minimum_order_count: z.number().optional(),
    email: z.string().email().optional(),
}));
