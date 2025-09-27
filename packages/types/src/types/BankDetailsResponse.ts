export interface BankDetailsResponse {
  id: number
  accountHolderName?: string
  accountNumber: string
  bankName: string
  branchName?: string
  ifscCode?: string
  iban?: string
  swiftCode?: string

  user: {
    id: number
    name: string
    email?: string
  }
}
