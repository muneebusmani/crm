import { z } from 'zod';
export declare const CreateDealerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    username: z.ZodString;
    password: z.ZodString;
    owner: z.ZodString;
    location: z.ZodString;
    logo: z.ZodString;
    website: z.ZodURL;
    contactEmail: z.ZodEmail;
    tierId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateDealerDto = z.infer<typeof CreateDealerSchema>;
export declare const UpdateDealerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodURL>;
    contactEmail: z.ZodOptional<z.ZodEmail>;
    tierId: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type UpdateDealerDto = z.infer<typeof UpdateDealerSchema>;
