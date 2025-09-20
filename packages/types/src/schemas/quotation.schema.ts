import { z } from "zod";

// ========================
// Quotation DTOs
// ========================

export const CreateQuotationSchema = z.object({
  engineCodeName: z.string().trim().min(1, { message: "Engine code name is required" }),
  dealershipName: z.string().trim().min(1, { message: "Dealership name is required" }),
  quotationPrice: z.number().positive({ message: "Quotation price must be positive" }),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200),
  message: z.string().trim().min(1, { message: "Message is required" }),
  dealerId: z.number().int().optional(), // 👈 make optional
  leadId: z.number().int().positive({ message: "Lead ID is required" }),
});

export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>;

// ------------------------------

export const UpdateQuotationSchema = CreateQuotationSchema.partial();

export type UpdateQuotationDto = z.infer<typeof UpdateQuotationSchema>;
