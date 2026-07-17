import { z } from "zod";
import { withNullsStripped } from "./schemaUtils";

export const updateSiteConfigSchema = withNullsStripped(z.object({
    id: z.string().optional(),
    siteStatus: z.string().optional(),
    section: z.enum(["TOP", "MIDDLE", "BOTTOM"]).optional(),
    imageURLs: z.array(z.string().url()).optional()
}).strict());

export const deleteHeroSectionImagesSchema = withNullsStripped(z.object({
    imageIds: z.array(z.string()).min(1, "At least one image ID is required")
}).strict());
