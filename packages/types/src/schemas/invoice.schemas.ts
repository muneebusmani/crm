import { z } from 'zod';

export const CreateInvoiceItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productDetails: z.string().optional().default(''),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional().default(0),
});

export type CreateInvoiceItemDto = z.infer<typeof CreateInvoiceItemSchema>;

export const CreateInvoiceSchema = z.object({
  leadId: z.number('Invalid lead ID format'),
  sellerNote : z.string(),
  date: z
    .string()
    .datetime('Invalid date format')
    .or(z.date())
    .transform(val => new Date(val)),
  items: z.array(CreateInvoiceItemSchema).min(1, 'At least one item is required'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional().default(0),
  recoveryLocation: z.string().optional().default(''),
  deliveryLocation: z.string().optional().default(''),
});

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'PAID', 'CANCELLED']).refine(
    val => ['PENDING', 'SENT', 'PAID', 'CANCELLED'].includes(val),
    {
      message: 'Status must be one of: PENDING, SENT, PAID, CANCELLED',
    },
  ),
});

export type UpdateInvoiceStatusDto = z.infer<typeof UpdateInvoiceStatusSchema>;
