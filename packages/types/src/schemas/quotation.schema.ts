import { z } from "zod";

// ========================
// Quotation Item Schema
// ========================
export const QuotationItemSchema = z.object({
  itemDescription: z
    .string()
    .trim()
    .min(1, { message: "Item description is required" }),
  rate: z.number().min(0, { message: "Rate must be >= 0" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  taxPercent: z.number().min(0).max(100).optional().default(0),
});

// ========================
// Create Quotation Schema
// ========================
export const CreateQuotationSchema = z.object({
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200),
  message: z.string().trim().min(1, { message: "Message is required" }),
  leadId: z.number().int().positive({ message: "Lead ID is required" }),
  quotationPrice: z.number().positive({ message: "Lead Quotation Price is required" }),
  items: z.array(QuotationItemSchema).optional(), // ✅ optional items
});

export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>;

// ========================
// Update Quotation Schema
// ========================
export const UpdateQuotationSchema = CreateQuotationSchema.partial();

export type UpdateQuotationDto = z.infer<typeof UpdateQuotationSchema>;
