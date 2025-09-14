import { z } from "zod";
export declare const CreateQuotationSchema: z.ZodObject<{
    engineCodeName: z.ZodString;
    dealershipName: z.ZodString;
    quotationPrice: z.ZodNumber;
    subject: z.ZodString;
    message: z.ZodString;
    dealerId: z.ZodNumber;
}, z.core.$strip>;
export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>;
export declare const UpdateQuotationSchema: z.ZodObject<{
    engineCodeName: z.ZodOptional<z.ZodString>;
    dealershipName: z.ZodOptional<z.ZodString>;
    quotationPrice: z.ZodOptional<z.ZodNumber>;
    subject: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    dealerId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateQuotationDto = z.infer<typeof UpdateQuotationSchema>;
