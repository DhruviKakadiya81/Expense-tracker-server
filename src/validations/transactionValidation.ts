import { z } from "zod";

export const createTransactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters").trim(),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  type: z.enum(["income", "expense"], {
    error: "Type must be either 'income' or 'expense'",
  }),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  date: z.coerce.date().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  videoUrl: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100, "Title cannot exceed 100 characters").trim().optional(),
  amount: z.coerce.number().positive("Amount must be a positive number").optional(),
  type: z.enum(["income", "expense"], {
    error: "Type must be either 'income' or 'expense'",
  }).optional(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID").optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  videoUrl: z.string().optional(),
  removeReceipt: z.coerce.boolean().optional(),
  removeVideo: z.coerce.boolean().optional(),
});

export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
