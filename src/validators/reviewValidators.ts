import { z } from "zod";
import { withNullsStripped } from "./schemaUtils";

export const createReviewSchema = withNullsStripped(z.object({
    description: z.string().min(5),
    rating: z.number()
}));

export const updateReviewSchema = withNullsStripped(z.object({
    description: z.string().min(5),
    rating: z.number()
}));
