import { z } from "zod";

/** Drop top-level null keys so optional fields with null are ignored (not validated / not applied). */
export const stripNullValues = (data: unknown): unknown => {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return data;
    }

    return Object.fromEntries(
        Object.entries(data as Record<string, unknown>).filter(([, value]) => value !== null)
    );
};

export const withNullsStripped = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(stripNullValues, schema);
