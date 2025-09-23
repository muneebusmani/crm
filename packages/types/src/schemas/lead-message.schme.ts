import { z } from "zod";

// ===================
// Create DTO
// ===================
export const CreateLeadMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(500, { message: "Message cannot exceed 500 characters" }),
    leadId: z.number().refine(val => !isNaN(val), {
    message: "Lead ID must be a number",
    }),
});

export type CreateLeadMessageDto = z.infer<typeof CreateLeadMessageSchema>;

// ===================
// Update DTO
// ===================
export const UpdateLeadMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(500, { message: "Message cannot exceed 500 characters" })
    .optional(),
});

export type UpdateLeadMessageDto = z.infer<typeof UpdateLeadMessageSchema>;
