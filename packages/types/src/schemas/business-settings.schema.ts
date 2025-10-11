import { z } from "zod";

// =======================
// BusinessSetting DTOs
// =======================

export const CreateBusinessSettingSchema = z.object({
  id: z.string().uuid().optional(),

  businessName: z
    .string()
    .trim()
    .min(1, { message: "Business name is required" })
    .max(100, { message: "Business name cannot exceed 100 characters" }),

  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")), // allow empty string if sent from form

  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, { message: "Invalid phone number" })
    .optional()
    .or(z.literal("")),

  privacyPolicy: z
    .string()
    .trim()
    .min(10, { message: "Privacy policy must be at least 10 characters" })
    .optional()
    .or(z.literal("")),

  termsAndConditions: z
    .string()
    .trim()
    .min(10, { message: "Terms and Conditions must be at least 10 characters" })
    .optional()
    .or(z.literal("")),

  // handle ISO strings or Date objects gracefully
  createdAt: z
    .union([z.string().datetime().optional(), z.date().optional()])
    .optional(),

  updatedAt: z
    .union([z.string().datetime().optional(), z.date().optional()])
    .optional(),
});

// ✅ Derived TypeScript type from the Zod schema
export type CreateBusinessSettingDto = z.infer<typeof CreateBusinessSettingSchema>;

// ------------------------------
// Update DTO (Partial)
// ------------------------------

export const UpdateBusinessSettingSchema = CreateBusinessSettingSchema.partial();

export type UpdateBusinessSettingDto = z.infer<typeof UpdateBusinessSettingSchema>;
