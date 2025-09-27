import { z } from 'zod'

export const CreateBankDetailsSchema = z.object({
  accountHolderName:  z.string().min(1, 'Account Holder is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  branchName :  z.string().optional(),
  iban: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
})

// infer type from schema
export type CreateBankDetailsDto = z.infer<typeof CreateBankDetailsSchema>

// Update DTO = same fields but all optional
export const UpdateBankDetailsSchema = CreateBankDetailsSchema.partial()

export type UpdateBankDetailsDto = z.infer<typeof UpdateBankDetailsSchema>
