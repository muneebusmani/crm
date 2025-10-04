import { z } from 'zod';
import { UserType } from '../types/User';

// ================
// AUTH DTOs
// ================

export const LoginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// ----------------

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name cannot exceed 50 characters' })
    .trim(),
  email: z.email({ message: 'Invalid email address' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30, { message: 'Username cannot exceed 30 characters' })
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .trim(),
  type: z.enum(UserType).default(UserType.DEALER).optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
