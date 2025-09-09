import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
