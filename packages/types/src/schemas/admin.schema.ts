
import z from "zod";

// ================
// Admin DTOs
// ================

export const CreateAdminSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .trim(),
  email: z.email({ message: "Invalid email address" }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .trim(),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim(),
  role: z.string().trim(),
  adminRoleId: z.number().optional(),
});

export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;

// ------------------------------

export const UpdateAdminSchema = CreateAdminSchema.partial();

export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;
