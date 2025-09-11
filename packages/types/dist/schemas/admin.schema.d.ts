import z from "zod";
export declare const CreateAdminSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    username: z.ZodString;
    password: z.ZodString;
    role: z.ZodString;
    adminRoleId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
export declare const UpdateAdminSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    adminRoleId: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;
