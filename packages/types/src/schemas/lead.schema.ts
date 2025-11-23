import { z } from "zod";

// ================
// Lead DTOs
// ================

export const CreateLeadSchema = z.object({
  vehicle_model: z.string()
    .trim()
    .min(1, { message: "Vehicle model is required" })
    .max(100, { message: "Vehicle model cannot exceed 100 characters" })
    .optional(),

  vehicle_reg: z.string()
    .trim()
    .min(1, { message: "Vehicle registration is required" })
    .max(20, { message: "Vehicle registration cannot exceed 20 characters" })
    .optional(),

  vehicle_brand: z.string().trim().optional(),
  vehicle_title: z.string().trim().optional(),
  vehicle_vrm: z.string().trim().optional(),
  vehicle_series: z.string().trim().optional(),
  vehicle_part: z.string().trim().optional(),
  engin_capacity: z.string().trim().optional(),
  fuelType: z.string().trim().optional(),
  part_supplied: z.string().trim().optional(),

  supply_only: z.string().trim().optional(),
  consider_both: z.string().trim().optional(),

  reconditioned_condition: z.string().trim().optional(),
  used_condition: z.string().trim().optional(),
  new_condition: z.string().trim().optional(),
  consider_all_condition: z.string().trim().optional(),
  createdAt : z.date().optional(),

  postcode: z.string()
    .trim()
    .regex(/^[A-Za-z0-9 ]+$/, { message: "Invalid postcode format" })
    .optional(),

  vehicle_drive: z.string().trim().optional(),
  collection_required: z.string().trim(),

  email: z.email({ message: "Invalid email address" })
    .optional(),

  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .optional(),

  number: z.string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, { message: "Invalid phone number" })
    .optional(),

  description: z.string().trim().optional(),
  engine_code: z.string().trim().optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

// ------------------------------

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  moreInfoFetched: z.boolean().optional(),
});

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;
