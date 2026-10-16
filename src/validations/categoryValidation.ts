import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name cannot exceed 50 characters").trim(),
  type: z.enum(["income", "expense"], {
    error: "Type must be either 'income' or 'expense'",
  }),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex color code").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name cannot be empty").max(50, "Category name cannot exceed 50 characters").trim().optional(),
  type: z.enum(["income", "expense"], {
    error: "Type must be either 'income' or 'expense'",
  }).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex color code").optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
