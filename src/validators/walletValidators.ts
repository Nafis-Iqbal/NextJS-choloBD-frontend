import { z } from "zod";

export const createWalletRechargeOptionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
    
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
    
  rechargeAmount: z
    .number()
    .min(1, "Recharge amount must be greater than 0")
    .max(1000000, "Recharge amount cannot exceed 1,000,000"),
    
  rechargeCost: z
    .number()
    .min(0, "Recharge cost cannot be negative")
    .max(1000000, "Recharge cost cannot exceed 1,000,000"),
    
  bonusAmount: z
    .number()
    .min(0, "Bonus amount cannot be negative")
    .max(100000, "Bonus amount cannot exceed 100,000")
    .optional()
    .default(0)
});