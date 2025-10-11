import { z } from "zod";

export const UpsertBusinessSettingSchema = z.object({
  salesTerms: z
    .string()
    .min(10, { message: "Sales terms must be at least 10 characters" }),
  quotation: z
    .string()
    .min(10, { message: "Quotation must be at least 10 characters" }),
});

export type UpsertBusinessSettingDto = z.infer<typeof UpsertBusinessSettingSchema>;
