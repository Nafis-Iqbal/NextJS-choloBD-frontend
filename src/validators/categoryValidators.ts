/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { CategoryType } from "@/types/enums";

export const createCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.min(2, "Category name must be at least 2 characters")
		.max(100, "Category name must be less than 100 characters"),

	type: z
		.nativeEnum(CategoryType, { errorMap: () => ({ message: "Please select a valid category type" }) }),

	slug: z
		.string()
		.min(1, "Slug is required")
		.min(2, "Slug must be at least 2 characters")
		.max(100, "Slug must be less than 100 characters")
		.regex(/^[a-z0-9-]+$/i, "Slug must be URL friendly"),

	isActive: z
		.boolean()
		.default(true),
});

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(2, "Category name must be at least 2 characters")
		.max(100, "Category name must be less than 100 characters").
        optional(),

	type: z
		.nativeEnum(CategoryType, { errorMap: () => ({ message: "Please select a valid category type" }) }).
        optional(),

	isActive: z
		.boolean()
		.default(true).
        optional(),
});


