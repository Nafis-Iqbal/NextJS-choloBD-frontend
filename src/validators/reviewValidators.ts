import { z } from "zod";

export const createReviewSchema = z.object({
    description: z.string().min(5),
    rating: z.number()
});

export const updateReviewSchema = z.object({
    description: z.string().min(5),
    rating: z.number()
});