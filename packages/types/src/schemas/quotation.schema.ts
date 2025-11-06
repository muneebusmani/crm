import { z } from "zod";

// ========================
// Quotation Item Schema
// ========================
export const CreateQuotationItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productDetails: z.string().optional().default(''),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional().default(0),
});

export type CreateQuotationItemDto = z.infer<typeof CreateQuotationItemSchema>;

// ========================
// Create Quotation Schema
// ========================
export const CreateQuotationSchema = z.object({
  leadId: z.number('Invalid lead ID format'),
  sellerNote : z.string(),
  date: z
    .string()
    .datetime('Invalid date format')
    .or(z.date())
    .transform(val => new Date(val)),
  items: z.array(CreateQuotationItemSchema).min(1, 'At least one item is required'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional().default(0),
  recoveryLocation: z.string().optional().default(''),
  deliveryLocation: z.string().optional().default(''),
  companyUserId: z.number().optional(), // Profile ID who sent the quotation
});

export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>;

// ========================
// Update Quotation Schema
// ========================
export const UpdateQuotationStatusSchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED']).refine(
    val => ['PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED'].includes(val),
    {
      message: 'Status must be one of: PENDING, SENT, ACCEPTED, REJECTED, CANCELLED',
    },
  ),
});

export type UpdateQuotationStatusDto = z.infer<typeof UpdateQuotationStatusSchema>;
