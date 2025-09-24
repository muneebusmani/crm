import { z } from "zod";

// ========================
// Quotation DTOs
// ========================

export const CreateQuotationSchema = z.object({
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200),
  message: z.string().trim().min(1, { message: "Message is required" }),
  leadId: z.number().int().positive({ message: "Lead ID is required" }),
  quotationPrice: z.number().positive({ message: "Lead Quotation Price is required" }),
});

export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>;

// ------------------------------

export const UpdateQuotationSchema = CreateQuotationSchema.partial();

export type UpdateQuotationDto = z.infer<typeof UpdateQuotationSchema>;
