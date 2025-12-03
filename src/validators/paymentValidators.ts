import { z } from "zod";

// Payment initialization schema - simplified to only require orderId
export const initializePaymentSchema = z.object({
    orderId: z.string().min(1, "Order ID is required")
});

// Payment validation schema
export const validatePaymentSchema = z.object({
    val_id: z.string().min(1, "Validation ID (val_id) is required"),
    orderId: z.string()
});

// Refund payment schema
export const refundPaymentSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    refund_amount: z.number().min(1, "Refund amount must be greater than 0"),
    refund_remarks: z.string().optional().default("Refund requested"),
    bank_tran_id: z.string().min(1, "Bank transaction ID is required"),
    refe_id: z.string().min(1, "Reference ID is required")
});

// Update transaction status schema
export const updateTransactionSchema = z.object({
    status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"], {
        required_error: "Status is required",
        invalid_type_error: "Invalid status value"
    }),
    notes: z.string().optional()
});

// Get transactions query schema
export const getTransactionsQuerySchema = z.object({
    orderId: z.string().optional(),
    transactionId: z.string().optional(),
    status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"]).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    limit: z.number().min(1).max(100).optional().default(10),
    offset: z.number().min(0).optional().default(0)
});

// Transaction ID parameter schema
export const transactionIdParamsSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required")
});

// Refund status query schema
export const refundStatusQuerySchema = z.object({
    refund_ref_id: z.string().min(1, "Refund reference ID is required")
});

// Payment callback schema (for success/fail/cancel)
export const paymentCallbackSchema = z.object({
    val_id: z.string().optional(),
    tran_id: z.string().optional(),
    amount: z.string().optional(),
    card_type: z.string().optional(),
    store_amount: z.string().optional(),
    card_no: z.string().optional(),
    bank_tran_id: z.string().optional(),
    status: z.string().optional(),
    tran_date: z.string().optional(),
    error: z.string().optional(),
    currency: z.string().optional(),
    card_issuer: z.string().optional(),
    card_brand: z.string().optional(),
    card_sub_brand: z.string().optional(),
    card_issuer_country: z.string().optional(),
    card_issuer_country_code: z.string().optional(),
    store_id: z.string().optional(),
    verify_sign: z.string().optional(),
    verify_key: z.string().optional(),
    verify_sign_sha2: z.string().optional(),
    currency_type: z.string().optional(),
    currency_amount: z.string().optional(),
    currency_rate: z.string().optional(),
    base_fair: z.string().optional(),
    value_a: z.string().optional(),
    value_b: z.string().optional(),
    value_c: z.string().optional(),
    value_d: z.string().optional(),
    risk_level: z.string().optional(),
    risk_title: z.string().optional()
});

export {};