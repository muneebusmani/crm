import z from "zod";

// ================
// Lead DTOs
// ================

export const CreateLeadSchema = z.object({
  vehicle_model: z.string().optional(),
  vehicle_reg: z.string().optional(),
  vehicle_brand: z.string().optional(),
  vehicle_title: z.string().optional(),
  vehicle_vrm: z.string().optional(),
  vehicle_series: z.string().optional(),
  vehicle_part: z.string().optional(),
  engin_capacity: z.string().optional(),
  fuelType: z.string().optional(),
  part_supplied: z.string().optional(),
  supply_only: z.boolean().optional(),
  consider_both: z.boolean().optional(),
  reconditioned_condition: z.string().optional(),
  used_condition: z.string().optional(),
  new_condition: z.string().optional(),
  consider_all_condition: z.boolean().optional(),
  postcode: z.string().optional(),
  vehicle_drive: z.string().optional(),
  collection_required: z.boolean().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  name: z.string().optional(),
  number: z.string().optional(),
  description: z.string().optional(),
  engine_code: z.string().optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

// ------------------------------

export const UpdateLeadSchema = CreateLeadSchema.partial();

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;
