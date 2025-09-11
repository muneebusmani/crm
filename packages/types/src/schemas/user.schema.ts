// packages/schemas/src/user.schema.ts
import { UserType } from '../';
import { z } from 'zod';

// Base schema for creating a user (exclude id and relations)
export const CreateUserSchema = z.object({
  email: z.email({ message: 'Invalid email' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  type: z.enum(UserType).default(UserType.DEALER),
});

// Optional: Schema for updating a user (all fields optional)
export const UpdateUserSchema = CreateUserSchema.partial();

// Optional: Infer the TypeScript types
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
