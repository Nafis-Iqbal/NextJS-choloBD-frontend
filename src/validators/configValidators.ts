import { z } from "zod";

export const updateSiteConfigSchema = z.object({
    id: z.string().optional(),
    siteStatus: z.string().optional(),
    section: z.enum(["TOP", "MIDDLE", "BOTTOM"]).optional(),
    imageURLs: z.array(z.string().url()).optional()
}).strict();

export const deleteHeroSectionImagesSchema = z.object({
    imageIds: z.array(z.string()).min(1, "At least one image ID is required")
}).strict();