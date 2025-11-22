import { z } from "zod";
import { UserStatus } from "../types/UserStatus";

// ================
// Dealer DTOs
// ================

export const CreateDealerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .trim()
    .min(1, { message: "Name is required" }), // prevents empty after trim

  email: z.email({ message: "Invalid email address" }),

  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .trim()
    .min(1, { message: "Username is required" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim()
    .min(1, { message: "Password is required" }),

  owner: z.string().trim().min(1, { message: "Owner name is required" }),

  location: z.string().trim().min(1, { message: "Location is required" }),

  website: z.url({ message: "Must be a valid URL" }).trim(),

  contactEmail: z.email({ message: "Invalid contact email address" }),

  tierId: z.number().optional(),
});
z.url();
export type CreateDealerDto = z.infer<typeof CreateDealerSchema>;

// ------------------------------

export const UpdateDealerSchema = CreateDealerSchema.partial();

export type UpdateDealerDto = z.infer<typeof UpdateDealerSchema>;

// ------------------------------

export const UpdateDealerStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export type UpdateDealerStatusDto = z.infer<typeof UpdateDealerStatusSchema>;
