import { z } from 'zod';

export const CreateCompanyUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  position: z.string().optional()
});

export type CreateCompanyUserDto = z.infer<typeof CreateCompanyUserSchema>;

export const UpdateCompanyUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export type UpdateCompanyUserDto = z.infer<typeof UpdateCompanyUserSchema>;
